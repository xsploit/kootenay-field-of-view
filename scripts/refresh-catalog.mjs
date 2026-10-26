import {SOURCE_CATALOG} from '../src/source-catalog.mjs';
import {queryArcgis,getJson,wmsLayerMetadata} from '../src/geo-sources.mjs';
import {BOUNDS,geometryIntersects} from '../src/region.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const dir=new URL('../data/explorer/',import.meta.url);await mkdir(dir,{recursive:true});
let old={items:[]};try{old=JSON.parse(await readFile(new URL('catalog.json',dir),'utf8'));}catch{}
const xmlCache=new Map();async function capabilities(url){if(!xmlCache.has(url))xmlCache.set(url,fetch(url+'?service=WMS&request=GetCapabilities&version=1.3.0',{signal:AbortSignal.timeout(30000)}).then(r=>{if(!r.ok)throw Error('Capabilities HTTP '+r.status);return r.text();}));return xmlCache.get(url);}
const items=[];
async function refresh(d){const previous=old.items.find(x=>x.id===d.id),now=Date.now();if(!process.argv.includes('--force')&&previous?.available&&now-Date.parse(previous.checkedAt)<(d.refreshMinutes||15)*60000){return previous;}
 try{
  const row={...d,checkedAt:new Date().toISOString(),available:true};let geo;
  if(d.type==='arcgis'){
   const meta=await getJson(d.url+'?f=json');if(meta.type!=='Feature Layer')throw Error('Not a public feature layer');
   row.objectIdField=meta.objectIdField||meta.fields?.find(f=>f.type==='esriFieldTypeOID')?.name;row.publisherEditedAt=meta.editingInfo?.lastEditDate?new Date(meta.editingInfo.lastEditDate).toISOString():null;
   row.fieldAliases=Object.fromEntries((meta.fields||[]).map(f=>[f.name,f.alias]));row.domains=Object.fromEntries((meta.fields||[]).filter(f=>f.domain?.codedValues).map(f=>[f.name,Object.fromEntries(f.domain.codedValues.map(v=>[v.code,v.name]))]));row.dateFields=(meta.fields||[]).filter(f=>f.type==='esriFieldTypeDate').map(f=>f.name);row.credit=meta.copyrightText||(d.url.includes('services5.arcgis.com')?'RDCK':'Province of British Columbia');row.geometryType=meta.geometryType;
   if(!d.viewport){geo=await queryArcgis(row);if(geo.partial)throw Error('Regional query exceeded page limit');}
  }else if(d.type==='wms'){
   Object.assign(row,wmsLayerMetadata(await capabilities(d.url),d.layer));
   if(d.snapshot){const project=(lon,lat)=>[lon*20037508.342789244/180,Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*20037508.342789244/Math.PI];const lo=project(BOUNDS[0],BOUNDS[1]),hi=project(BOUNDS[2],BOUNDS[3]);const q=new URLSearchParams({SERVICE:'WMS',VERSION:'1.3.0',REQUEST:'GetMap',LAYERS:d.layer,STYLES:row.style||'',CRS:'EPSG:3857',BBOX:[...lo,...hi].join(','),WIDTH:'2048',HEIGHT:'1840',FORMAT:'image/png',TRANSPARENT:'TRUE'});const r=await fetch(d.url+'?'+q,{signal:AbortSignal.timeout(40000)});if(!r.ok||!r.headers.get('content-type')?.includes('image/png'))throw Error('Regional hillshade image unavailable');await writeFile(new URL(d.id+'.png',dir),new Uint8Array(await r.arrayBuffer()));row.imageUrl='./data/explorer/'+d.id+'.png';row.coordinates=[[BOUNDS[0],BOUNDS[3]],[BOUNDS[2],BOUNDS[3]],[BOUNDS[2],BOUNDS[1]],[BOUNDS[0],BOUNDS[1]]];row.fetchedAt=row.checkedAt;}
  }
  else if(d.type==='wfs'){const q=new URLSearchParams({service:'WFS',version:'1.0.0',request:'GetFeature',typeName:d.layer,outputFormat:'application/json',srsName:'EPSG:4326',bbox:BOUNDS.join(',')+',EPSG:4326',maxFeatures:'5000'});geo=await getJson(d.url+'?'+q);if(!Array.isArray(geo.features)||Number(geo.totalFeatures)>geo.features.length)throw Error('Incomplete WFS response');geo.features=geo.features.filter(f=>geometryIntersects(f.geometry));}
  else if(d.type==='ogc'){const q=new URLSearchParams({f:'json',bbox:BOUNDS.join(','),limit:'1000'});geo=await getJson(d.url+'?'+q);if(geo.links?.some(l=>l.rel==='next'))throw Error('Station inventory is incomplete');}
  else if(d.type==='quakes'){const q=new URLSearchParams({format:'geojson',minlatitude:BOUNDS[1],maxlatitude:BOUNDS[3],minlongitude:BOUNDS[0],maxlongitude:BOUNDS[2],starttime:new Date(now-30*864e5).toISOString(),limit:'2000'});geo=await getJson(d.url+'?'+q);}
  else if(d.type==='nasa'){
   const url='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml';
   if(!xmlCache.has(url))xmlCache.set(url,fetch(url).then(r=>r.text()));const xml=await xmlCache.get(url);
   const index=xml.indexOf('<ows:Identifier>'+d.layer+'</ows:Identifier>');if(index<0)throw Error('NASA layer not advertised');const leaf=xml.slice(xml.lastIndexOf('<Layer>',index),xml.indexOf('</Layer>',index));
   const yesterday=new Date(now-864e5).toISOString().slice(0,10),advertised=leaf.match(/<Default>([^<]+)/)?.[1]||yesterday;row.time=advertised<yesterday?advertised:yesterday;row.url='https://gibs.earthdata.nasa.gov/';
  }else if(d.type==='terrain'){const manifest=JSON.parse(await readFile(new URL('../data/lidar-terrain/manifest.json',import.meta.url),'utf8'));row.sourceUrl=manifest.sourceUrl;row.surveyYear=manifest.year;row.bounds=manifest.bounds;}
  if(geo){const dates=geo.features.flatMap(f=>(row.dateFields||[]).map(k=>f.properties?.[k])).filter(n=>typeof n==='number'&&n>1e11&&n<now+864e5);row.latestFeatureDate=dates.length?new Date(Math.max(...dates)).toISOString():null;row.count=geo.features.length;row.dataUrl='./data/explorer/'+d.id+'.geojson';row.fetchedAt=row.checkedAt;await writeFile(new URL(d.id+'.geojson',dir),JSON.stringify(geo));}
  return row;
 }catch(e){console.log(d.id+': '+e.message);return previous?.available?{...previous,refreshFailed:true,error:e.message,attemptedAt:new Date().toISOString()}:{...d,available:false,error:e.message,checkedAt:new Date().toISOString()};}
}
for(let i=0;i<SOURCE_CATALOG.length;i+=4)items.push(...await Promise.all(SOURCE_CATALOG.slice(i,i+4).map(refresh)));
await writeFile(new URL('catalog.json',dir),JSON.stringify({checkedAt:new Date().toISOString(),bounds:BOUNDS,items},null,2));
for(const x of items)console.log(x.id+': '+(x.available?(x.viewport?'viewport query':x.count??x.time??'ready'):'UNAVAILABLE'));
