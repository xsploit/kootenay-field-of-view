import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BOUNDS,inBounds,geometryIntersects,eventKind,matchesCorridor,CORRIDORS,hasEnded} from '../src/region.mjs';
import {aircraftObservationTime} from '../src/aircraft.mjs';
test('boundary selection includes Kootenay towns and excludes Vancouver',()=>{assert.equal(inBounds([-117.217,49.28]),true);assert.equal(inBounds([-118.441,49.033]),true);assert.equal(inBounds([-117.802,50.239]),true);assert.equal(inBounds([-123.12,49.28]),false);assert.equal(inBounds([null,49.2]),false);});
test('a closure spanning the region is retained even if endpoints are outside',()=>{assert.equal(geometryIntersects({type:'LineString',coordinates:[[-120,49.3],[-115,49.3]]},BOUNDS),true);assert.equal(geometryIntersects({type:'LineString',coordinates:[[-120,51],[-115,51]]},BOUNDS),false);});
test('closure status uses structured road state, not speculative keywords',()=>{assert.equal(eventKind({event_type:'CONSTRUCTION',description:'Lane closures',roads:[{state:'ALL_LANES_OPEN'}]}),'Roadwork');assert.equal(eventKind({event_type:'INCIDENT',roads:[{state:'CLOSED'}]}),'Closure');});
test('corridor filters combine highway and location',()=>{const west=CORRIDORS.find(c=>c.id==='west');assert.equal(matchesCorridor({coordinates:[-118.2,49.1],highway:'3'},west),true);assert.equal(matchesCorridor({coordinates:[-118.2,49.1],highway:'6'},west),false);assert.equal(matchesCorridor({coordinates:[-117,49.1],highway:'3'},west),false);});
test('expired and open-ended notices are distinguished',()=>{const now=Date.parse('2026-10-25T12:00:00Z');assert.equal(hasEnded({schedule:{intervals:['2026-10-20T00:00:00Z/2026-10-24T00:00:00Z']}},now),true);assert.equal(hasEnded({schedule:{intervals:['2026-10-20T00:00:00Z/']}},now),false);assert.equal(hasEnded({schedule:{intervals:['2026-10-20T00:00:00Z/2026-10-26T00:00:00Z']}},now),false);});
test('ambiguous timezone-free end dates do not silently hide an active notice',()=>{assert.equal(hasEnded({schedule:{intervals:['2026-10-01T08:00/2026-10-24T16:00']}},Date.parse('2026-10-25T12:00:00Z')),false);});
test('Midway and Greenwood belong to the Boundary corridor',()=>{
 for(const p of [[-118.989,49.01],[-118.677,49.091]]){
  assert.equal(inBounds(p),true);
  assert.equal(matchesCorridor({coordinates:p,highway:'3'},CORRIDORS.find(c=>c.id==='west')),true);
 }
});

test('real readsb timestamps are Unix seconds and position age is deducted',()=>{
 assert.equal(aircraftObservationTime(1792984046.001,6),'2026-10-26T03:07:20.001Z');
 assert.equal(aircraftObservationTime(1792984046001,6),'2026-10-26T03:07:20.001Z');
});
