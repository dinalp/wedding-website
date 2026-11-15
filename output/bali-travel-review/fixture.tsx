import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { FlightCard } from '../../src/components/flight-card';
Object.assign(globalThis, { React });
writeFileSync('output/bali-travel-review/flight-fixture.html', renderToStaticMarkup(<FlightCard option={{ date: '2026-11-14', airline: 'Virgin Australia', from: 'SYD', depart: '2027-05-18', return: '2027-05-23', price: 567, stops: 0, details: 'TEST FIXTURE ONLY · Google Flights', link: 'https://www.google.com/travel/flights', itinerary: {version:1, outbound:{from:'SYD',to:'DPS',departure:'2027-05-18T10:00',arrival:'2027-05-18T14:45',duration:405,stops:0,flights:['VA TEST']},inbound:{from:'DPS',to:'SYD',departure:'2027-05-23T23:00',arrival:'2027-05-24T07:00',duration:360,stops:0,flights:['VA TEST']},baggage:['1 free carry-on','No checked bags'],seller:'Test fixture'} }} />));
