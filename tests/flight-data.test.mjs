import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFlightData, withHistoricalTrend } from '../src/lib/flight-data.ts';

const quote = (overrides = {}) => ({
  date: '2026-11-03', airline: 'Jetstar', from: 'SYD',
  depart: '2027-05-18', return: '2027-05-23', price: 605, stops: 0,
  details: 'Nonstop outbound · Google Flights', link: 'https://www.google.com/travel/flights',
  ...overrides,
});

test('graph and list use the same minimum across sources, preserving seller alternatives', () => {
  const data = buildFlightData([
    quote(), quote(), quote({price: 590, details: 'Return economy', link: 'https://iwantthatflight.com.au/flight.ashx'}),
    quote({details: 'Return economy', link: 'https://www.jetstar.com/au/en/home'}),
  ], '2026-11-03');
  assert.equal(data.checks[0].cheapest, 590);
  assert.equal(data.options[0].price, 590);
  assert.equal(data.options.length, 3);
  assert.equal(data.checks[0].sources.length, 3);
});

test('rejects unrelated dates, route averages, one-way, invalid and future observations', () => {
  const variants = [{price: 0}, {price: NaN}, {price: Infinity}, {price: -1},
    {from:'MEL'}, {depart:'2027-05-14'}, {return:'2027-05-25'},
    {details:'From A$400 return'}, {details:'One-way economy'}, {details:'Estimated fare'},
    {date:'2026-02-30'}, {date:'2026-11-04'}, {airline:''}];
  const data = buildFlightData([quote(), ...variants.map(quote)], '2026-11-03');
  assert.equal(data.options.length, 1);
});

test('missing summary rows recover from observations; missing quote days remain gaps', () => {
  const data = buildFlightData([quote({date:'2026-11-01',price:600}), quote()], '2026-11-04');
  assert.deepEqual(data.checks.map(d=>d.cheapest), [600,null,605,null]);
  assert.equal(data.options[0].date,'2026-11-03');
  assert.equal(data.checks[1].quoteCount,0);
});

test('an empty dataset has no synthetic price history', () => {
  assert.deepEqual(buildFlightData([], '2026-11-04'), {checks:[],options:[]});
});


test('restores older trend while current observations win and current gaps stay gaps', () => {
  const current = [{date:'2026-10-23',cheapest:608},{date:'2026-10-24',cheapest:null}];
  const history = [{date:'2026-10-21',cheapest:570},{date:'2026-10-23',cheapest:400},
    {date:'2026-10-24',cheapest:410},{date:'2026-10-25',cheapest:420}];
  assert.deepEqual(withHistoricalTrend(current, history), [
    {date:'2026-10-21',cheapest:570},{date:'2026-10-22',cheapest:null},...current,
  ]);
  assert.deepEqual(withHistoricalTrend(current, []), current);
});
