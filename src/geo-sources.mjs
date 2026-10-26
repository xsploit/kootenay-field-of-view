import {BOUNDS} from './region.mjs';
export function clippedBounds(bounds=BOUNDS){return [Math.max(BOUNDS[0],bounds[0]),Math.max(BOUNDS[1],bounds[1]),Math.min(BOUNDS[2],bounds[2]),Math.min(BOUNDS[3],bounds[3])];}
export async function getJson(url){const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('HTTP '+r.status);const j=await r.json();if(j.error)throw Error(j.error.message||'Source error');return j;}
export async function queryArcgis(d,bounds=BOUNDS,maxPages=12){
 const b=clippedBounds(bounds);if(b[0]>b[2]||b[1]>b[3])return {type:'FeatureCollection',features:[]};
 const features=[];let partial=false;
 for(let page=0;page<maxPages;page++){
  const q=new URLSearchParams({f:'geojson',where:'1=1',geometry:b.join(','),geometryType:'esriGeometryEnvelope',inSR:'4326',outSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'*',returnGeometry:'true',geometryPrecision:'6',maxAllowableOffset:bounds===BOUNDS?'0.0003':'0.00002',resultRecordCount:'1000',resultOffset:String(page*1000)});
  if(d.objectIdField)q.set('orderByFields',d.objectIdField+' ASC');
  const j=await getJson(d.url+'/query?'+q);if(!Array.isArray(j.features))throw Error('Source did not return GeoJSON');
  features.push(...j.features.filter(f=>f.geometry));partial=!!(j.exceededTransferLimit||j.properties?.exceededTransferLimit);
  if(!partial)break;
 }
 return {type:'FeatureCollection',features,partial};
}
export function wmsLayerMetadata(xml,name){
 const encoded=name.replaceAll('&','&amp;');const index=xml.indexOf('<Name>'+encoded+'</Name>');if(index<0)throw Error('Layer not advertised by publisher');
 const start=xml.lastIndexOf('<Layer',index),end=xml.indexOf('</Layer>',index);const leaf=xml.slice(start,end);
 const dimension=leaf.match(/<Dimension\b(?=[^>]*name=["']time["'])[^>]*>/i)?.[0]||'';
 const time=dimension.match(/default=["']([^"']+)/)?.[1];
 const style=leaf.match(/<Style>\s*<Name>([^<]+)/)?.[1]||'';
 const legend=leaf.match(/<LegendURL[\s\S]*?(?:xlink:href|href)=["']([^"']+)/)?.[1]?.replaceAll('&amp;','&');
 return {time,style,legend,title:leaf.match(/<Title>([^<]+)/)?.[1]||name};
}
export function wmsTiles(d){const q=new URLSearchParams({SERVICE:'WMS',VERSION:'1.3.0',REQUEST:'GetMap',LAYERS:d.layer,STYLES:d.style||'',FORMAT:'image/png',TRANSPARENT:'TRUE',CRS:'EPSG:3857',WIDTH:'256',HEIGHT:'256'});if(d.time)q.set('TIME',d.time);return d.url+'?'+q+'&BBOX={bbox-epsg-3857}';}
export function legendUrl(d){if(d.legend)return d.legend;const q=new URLSearchParams({SERVICE:'WMS',VERSION:'1.3.0',REQUEST:'GetLegendGraphic',LAYER:d.layer,FORMAT:'image/png',STYLE:d.style||''});return d.url+'?'+q;}
