import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clippedBounds,queryArcgis,wmsLayerMetadata,wmsTiles} from '../src/geo-sources.mjs';
test('viewport queries stay within the delivery region and detect capped pagination',async()=>{
 const original=globalThis.fetch,requests=[];
 globalThis.fetch=async url=>{requests.push(new URL(url));return new Response(JSON.stringify({type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Point',coordinates:[-117.6,49.3]},properties:{}}],exceededTransferLimit:true}),{headers:{'content-type':'application/json'}});};
 try{const j=await queryArcgis({url:'https://example.test/FeatureServer/0',objectIdField:'OID'},[-180,-80,180,80],2);assert.equal(j.features.length,2);assert.equal(j.partial,true);assert.equal(requests[1].searchParams.get('resultOffset'),'1000');assert.equal(requests[0].searchParams.get('geometry'),'-119.08,48.98,-116.5,50.5');}finally{globalThis.fetch=original;}
});
test('forecasts use advertised valid time, and legends retain decoded query parameters',()=>{
 const meta=wmsLayerMetadata('<Layer><Name>model</Name><Title>Forecast</Title><Dimension name="time" default="2026-10-27T00:00:00Z">2026-10-26/2026-10-27/PT1H</Dimension><Style><Name>temperature</Name><LegendURL><OnlineResource xlink:href="https://example.test/legend?a=1&amp;b=2"/></LegendURL></Style></Layer>','model');
 assert.equal(meta.time,'2026-10-27T00:00:00Z');assert.equal(meta.legend,'https://example.test/legend?a=1&b=2');const url=new URL(wmsTiles({url:'https://example.test/wms',layer:'model',...meta}));assert.equal(url.searchParams.get('TIME'),meta.time);assert.equal(url.searchParams.get('STYLES'),'temperature');assert.equal(url.searchParams.get('BBOX'),'{bbox-epsg-3857}');
});
test('missing layers fail explicitly instead of requesting a nonexistent overlay',()=>{assert.throws(()=>wmsLayerMetadata('<Layer><Name>other</Name></Layer>','model'),/not advertised/);assert.deepEqual(clippedBounds([-117,49,-116,51]),[-117,49,-116.5,50.5]);});
