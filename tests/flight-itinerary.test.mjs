import test from 'node:test';
import assert from 'node:assert/strict';
import { toFlightLeg, encodeFlightDetails, decodeFlightDetails, arrivalDayOffset, buildFlightData, flightDetailBudget } from '../src/lib/flight-data.ts';

const outbound = [{ airline: 'Test Air', flight_number: 'TA1', departure_airport: { id: 'SYD', time: '2027-05-18 10:00' }, arrival_airport: { id: 'DPS', time: '2027-05-18 14:45' } }];
const inbound = [{ airline: 'Test Air', flight_number: 'TA2', departure_airport: { id: 'DPS', time: '2027-05-23 23:00' }, arrival_airport: { id: 'SYD', time: '2027-05-24 07:00' } }];
const detail = () => ({ version: 1, outbound: toFlightLeg(outbound, 405), inbound: toFlightLeg(inbound, 360), baggage: ['1 free carry-on', 'No checked bags'], seller: 'Test Air' });

test('optional lookups cannot spend the daily baseline reserve, including a manual refresh', () => {
  const now = Date.parse('2026-11-01T00:00:00Z');
  assert.equal(flightDetailBudget(100, '2026-12-02T00:00:00Z', now), 7);
  assert.equal(flightDetailBudget(93, '2026-12-02T00:00:00Z', now), 0);
  assert.equal(flightDetailBudget(100, undefined, now), 7);
  assert.equal(flightDetailBudget(200, '2026-12-02T00:00:00Z', now), 24);
  assert.equal(flightDetailBudget(NaN, undefined, now), 0);
});

test('airport-local times survive storage without timezone conversion, including next-day returns', () => {
  const encoded = encodeFlightDetails('Direct · Google Flights', detail());
  const decoded = decodeFlightDetails(encoded, '2027-05-18', '2027-05-23');
  assert.equal(decoded.details, 'Direct · Google Flights');
  assert.deepEqual(decoded.itinerary, detail());
  assert.equal(decoded.itinerary.outbound.departure, '2027-05-18T10:00');
  assert.equal(arrivalDayOffset(decoded.itinerary.outbound), 0);
  assert.equal(arrivalDayOffset(decoded.itinerary.inbound), 1);
});
test('connecting itinerary uses first departure and final arrival and retains both flight identities', () => {
  const leg = toFlightLeg([
    { flight_number: 'TA1', departure_airport: { id: 'SYD', time: '2027-05-18 10:00' }, arrival_airport: { id: 'SIN', time: '2027-05-18 16:00' } },
    { flight_number: 'TA2', departure_airport: { id: 'SIN', time: '2027-05-18 18:00' }, arrival_airport: { id: 'DPS', time: '2027-05-18 20:30' } },
  ], 750);
  assert.equal(leg.from, 'SYD'); assert.equal(leg.to, 'DPS'); assert.equal(leg.stops, 1);
  assert.equal(leg.departure, '2027-05-18T10:00'); assert.equal(leg.arrival, '2027-05-18T20:30');
  assert.deepEqual(leg.flights, ['TA1', 'TA2']);
});
test('rejects missing, impossible and disconnected schedules instead of inventing times', () => {
  assert.equal(toFlightLeg([], 400), undefined);
  for (const time of [undefined, '10:00', '2027-02-30 10:00', '2027-05-18 25:00']) {
    assert.equal(toFlightLeg([{ ...outbound[0], departure_airport: { id: 'SYD', time } }], 400), undefined);
  }
  assert.equal(toFlightLeg([...outbound, ...outbound], 800), undefined);
  assert.equal(toFlightLeg(outbound, NaN), undefined);
});
test('does not attach an unrelated return schedule or its baggage to a dated quote', () => {
  const wrongDate = decodeFlightDetails(encodeFlightDetails('Google Flights', detail()), '2027-05-18', '2027-05-22');
  assert.ok(wrongDate.itinerary.outbound);
  assert.equal(wrongDate.itinerary.inbound, undefined);
  assert.equal(wrongDate.itinerary.baggage, undefined);
  const wrongOutbound = decodeFlightDetails(encodeFlightDetails('Google Flights', detail()), '2027-05-19', '2027-05-23');
  assert.equal(wrongOutbound.itinerary.outbound, undefined);
  assert.equal(wrongOutbound.itinerary.inbound, undefined);
});
test('legacy or malformed data remains readable without leaking JSON into the card', () => {
  assert.deepEqual(decodeFlightDetails('Legacy quote', '', ''), { details: 'Legacy quote' });
  assert.deepEqual(decodeFlightDetails('Quote\n\n[flight-details:v1]\n{broken', '', ''), { details: 'Quote' });
  assert.deepEqual(decodeFlightDetails('Quote\n\n[flight-details:v1]\n{"version":2}', '', ''), { details: 'Quote' });
});
test('keeps different schedules at the same airline and price', () => {
  const q = { date: '2026-11-14', airline: 'Test Air', from: 'SYD', depart: '2027-05-18', return: '2027-05-23', price: 600, stops: 0, details: 'Google Flights', link: 'https://www.google.com/travel/flights', itinerary: detail() };
  const other = structuredClone(q); other.itinerary.outbound.departure = '2027-05-18T11:00';
  assert.equal(buildFlightData([q, q, other], '2026-11-14').options.length, 2);
});
