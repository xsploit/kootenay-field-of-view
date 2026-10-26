import {publicFeatureCard} from './feature-cards.mjs';
const cache=new Map(),pending=new Map(),views=new Map(),loading=new Map(),versions=new Map(),stats=new WeakMap();
const EMPTY={type:'FeatureCollection',features:[]};
const intersects=(a,b)=>a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];
function geometryStats(f){if(stats.has(f))return stats.get(f);const bounds=[Infinity,Infinity,-Infinity,-Infinity];let vertices=0;function walk(c){if(typeof c?.[0]==='number'){vertices++;bounds[0]=Math.min(bounds[0],c[0]);bounds[1]=Math.min(bounds[1],c[1]);bounds[2]=Math.max(bounds[2],c[0]);bounds[3]=Math.max(bounds[3],c[1]);}else if(Array.isArray(c))for(const x of c)walk(x);}walk(f.geometry?.coordinates);const out={bounds,vertices};stats.set(f,out);return out;}
export function selectFeaturesForView(features,bounds,{maxFeatures=3000,maxVertices=100000}={}){const selected=[];let vertices=0,partial=false;for(const f of features){const s=geometryStats(f);if(!intersects(s.bounds,bounds))continue;if(selected.length>=maxFeatures||vertices+s.vertices>maxVertices){partial=true;continue;}selected.push(f);vertices+=s.vertices;}return {features:selected,vertices,partial};}
async function chunk(url){if(cache.has(url)){const j=cache.get(url);cache.delete(url);cache.set(url,j);return j;}if(pending.has(url))return pending.get(url);const request=fetch(url).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(j=>{cache.set(url,j);while(cache.size>8)cache.delete(cache.keys().next().value);return j;}).finally(()=>pending.delete(url));pending.set(url,request);return request;}
export async function updateLocalGis(map,layers,enabled,hidden,cards){
 for(const d of layers.filter(x=>x.tiles)){
  const id=d.id,show=enabled&&!hidden.has(id),active=show&&map.getZoom()>=d.minzoom,status=document.querySelector('[data-local-status="'+id+'"]');
  if(!active){loading.delete(id);versions.set(id,(versions.get(id)||0)+1);for(const s of ['-line','-point'])if(map.getLayer(id+s))map.setLayoutProperty(id+s,'visibility','none');if(views.has(id)){map.getSource(id)?.setData(EMPTY);views.delete(id);}if(status&&show)status.textContent='Zoom to '+d.minzoom+'+ to inspect';continue;}
  if(!map.getSource(id)){
   map.addSource(id,{type:'geojson',data:EMPTY,maxzoom:16,tolerance:1,buffer:32});
   map.addLayer({id:id+'-line',type:'line',source:id,minzoom:d.minzoom,filter:['!=',['geometry-type'],'Point'],paint:{'line-color':id.includes('contours')?'#b6ad8e':d.authority==='RDCK'?'#d2ace5':'#92c9ed','line-width':id.includes('contours')?.7:1.3,'line-opacity':.7}});
   map.addLayer({id:id+'-point',type:'circle',source:id,minzoom:d.minzoom,filter:['==',['geometry-type'],'Point'],paint:{'circle-color':'#c9e0b3','circle-radius':3,'circle-stroke-color':'#15222c','circle-stroke-width':1}});
   for(const suffix of ['-line','-point'])cards?.register(id+suffix,f=>publicFeatureCard(d,f.properties,id+JSON.stringify(f.geometry.coordinates).slice(0,140)));
  }
  for(const suffix of ['-line','-point'])map.setLayoutProperty(id+suffix,'visibility','visible');
  const b=map.getBounds(),bounds=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()],previous=views.get(id)||loading.get(id),zoom=Math.floor(map.getZoom());
  if(previous&&previous.zoom===zoom&&bounds[0]>=previous.bounds[0]&&bounds[1]>=previous.bounds[1]&&bounds[2]<=previous.bounds[2]&&bounds[3]<=previous.bounds[3]){if(status)status.textContent=previous.count!==undefined?previous.count.toLocaleString()+' visible reference features'+(previous.partial?' · display budget reached; zoom closer':''):'Loading visible reference geometry…';continue;}
  const dx=(bounds[2]-bounds[0])*.2,dy=(bounds[3]-bounds[1])*.2,envelope=[bounds[0]-dx,bounds[1]-dy,bounds[2]+dx,bounds[3]+dy];
  const tiles=d.tiles.filter(t=>intersects(t.bounds,envelope)),version=(versions.get(id)||0)+1;versions.set(id,version);loading.set(id,{bounds:envelope,zoom});if(status)status.textContent='Loading visible reference geometry…';
  try{const features=[];for(let i=0;i<Math.min(tiles.length,8);i+=2){const chunks=await Promise.all(tiles.slice(i,Math.min(i+2,8)).map(t=>chunk(t.url)));if(versions.get(id)!==version)break;for(const j of chunks)features.push(...j.features);}
   if(versions.get(id)!==version)continue;const selected=selectFeaturesForView(features,envelope);map.getSource(id)?.setData({type:'FeatureCollection',features:selected.features});views.set(id,{bounds:envelope,zoom,count:selected.features.length,partial:selected.partial||tiles.length>8});if(status)status.textContent=selected.features.length.toLocaleString()+' visible reference features'+(selected.partial||tiles.length>8?' · display budget reached; zoom closer':'');
  }catch(e){if(status)status.textContent='Local layer failed: '+e.message;}finally{if(versions.get(id)===version)loading.delete(id);}
 }
}
