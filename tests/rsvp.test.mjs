import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSubmission, rsvpDetailsError } from '../src/lib/rsvp-validation.ts';
import { getParty, saveRSVP } from '../src/lib/airtable.ts';

const payload = {
  partyId: 'rec00000000000001', email: 'guest@example.test', phone: '+61 400 000 000',
  songRequest: '', message: '', flightEmails: false, stayEmails: false,
  members: [{ id: 'rec00000000000002', attending: true,
    events: { welcomeDinner: true, wedding: true, recoveryDay: true }, dietary: [], dietaryNotes: '' }],
};

test('mobile is required and accepts local/international formatting without accepting garbage', () => {
  for (const phone of [undefined, null, '', '   ', 'hello12345678', '123', '+'.repeat(10), '1'.repeat(16)]) {
    assert.equal(parseSubmission({ ...payload, phone }), null);
    assert.ok(rsvpDetailsError({ phone }));
  }
  for (const phone of ['0400 000 000', '+94 77 123 4567', '+1 (202) 555-0123']) {
    assert.equal(parseSubmission({ ...payload, phone }).phone, phone);
  }
});

test('dates are optional, permit one known date and reject impossible or reversed dates', () => {
  assert.ok(parseSubmission(payload));
  for (const dates of [{ baliArrival: '', baliDeparture: '' }, { baliArrival: '2027-05-18' },
    { baliDeparture: '2027-05-23' }, { baliArrival: '2027-05-18', baliDeparture: '2027-05-18' },
    { baliArrival: '2028-02-29', baliDeparture: '2028-03-01' }]) {
    assert.ok(parseSubmission({ ...payload, ...dates }));
  }
  for (const dates of [{ baliArrival: '2027-02-29' }, { baliDeparture: '2027-04-31' },
    { baliArrival: '2027-13-10' }, { baliArrival: '18/05/2027' }, { baliDeparture: 123 },
    { baliArrival: null }, { baliArrival: '2027-05-20', baliDeparture: '2027-05-19' }]) {
    assert.equal(parseSubmission({ ...payload, ...dates }), null);
  }
});

test('Airtable round trip saves, edits, preserves omitted dates and clears explicit blank dates', async (t) => {
  const oldBase = process.env.AIRTABLE_BASE_ID;
  const oldPat = process.env.AIRTABLE_PAT;
  process.env.AIRTABLE_BASE_ID = 'test-base';
  process.env.AIRTABLE_PAT = 'test-token';
  t.after(() => {
    if (oldBase === undefined) delete process.env.AIRTABLE_BASE_ID;
    else process.env.AIRTABLE_BASE_ID = oldBase;
    if (oldPat === undefined) delete process.env.AIRTABLE_PAT;
    else process.env.AIRTABLE_PAT = oldPat;
  });
  const party = { id: payload.partyId, fields: {
    'Party Name': 'Test Party', Code: 'test-code', Guests: [payload.members[0].id],
    'Invited To': ['Wedding Day'],
  } };
  const guest = { id: payload.members[0].id, fields: { 'Full Name': 'Test Guest' } };
  const writes = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(new URL(url).hostname, 'api.airtable.com');
    const table = new URL(url).pathname.split('/')[3];
    if (init?.method === 'PATCH') {
      const records = JSON.parse(init.body).records;
      writes.push({ table, records: structuredClone(records) });
      for (const record of records) {
        const target = table === 'Parties' ? party : guest;
        assert.equal(record.id, target.id, 'must only update linked test records');
        Object.assign(target.fields, record.fields);
      }
      return Response.json({ records });
    }
    return Response.json(table === 'Guests' ? { records: [guest] } : party);
  });
  const initial = await getParty(payload.partyId);
  assert.equal(initial.baliArrival, '');
  assert.equal(initial.baliDeparture, '');
  const first = await saveRSVP({ ...payload, baliArrival: '2027-05-18', baliDeparture: '2027-05-23',
    members: [...payload.members, { ...payload.members[0], id: 'recUNRELATED00000' }] });
  assert.equal(first.baliArrival, '2027-05-18');
  assert.equal(first.baliDeparture, '2027-05-23');
  assert.equal(first.members[0].events.wedding, true);
  assert.equal(first.members[0].events.welcomeDinner, false, 'invitation limits are preserved');
  const submittedAt = first.submittedAt;
  const edited = await saveRSVP({ ...payload, baliArrival: '2027-05-15', baliDeparture: '2027-05-22' });
  assert.equal(edited.baliArrival, '2027-05-15');
  assert.equal(edited.baliDeparture, '2027-05-22');
  assert.equal(edited.submittedAt, submittedAt);
  const legacy = await saveRSVP(payload);
  assert.equal(legacy.baliArrival, '2027-05-15');
  assert.equal(legacy.baliDeparture, '2027-05-22');
  const cleared = await saveRSVP({ ...payload, baliArrival: '', baliDeparture: '' });
  assert.equal(cleared.baliArrival, '');
  assert.equal(cleared.baliDeparture, '');
  const finalPatch = writes.filter((write) => write.table === 'Parties').at(-1).records[0].fields;
  assert.equal(finalPatch['Bali Arrival'], null);
  assert.equal(finalPatch['Bali Departure'], null);
  assert.equal(finalPatch.Phone, payload.phone);
});
