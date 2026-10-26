const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function featureTitle(p={},fallback='Map feature'){
 const address=p.FULL_ADDRESS||p.ADDRESS||p.FULLADDRESS;if(address)return String(address);
 return String(p.GEOGRAPHICAL_NAME||p.DISPLAYNAM||p.STATION_NAME||p.LOCATION_NAME||p.BMIS_STRUCTURE_NAME||p.CROSSING_NAME||p.ADMIN_AREA_NAME||p.ADMIN_NAME||p.NAME||p.name||p.BasinName||p.Major_Basin||fallback);
}
export function featureRows(d,p={}){return Object.entries(p).filter(([k,v])=>v!==null&&v!==''&&!k.startsWith('__')&&!/shape__|globalid|objectid|^fid$/i.test(k)).map(([k,v])=>{
 let value=d.domains?.[k]?.[v]??v;if(d.dateFields?.includes(k)&&typeof v==='number')value=new Date(v).toLocaleString('en-CA',{timeZone:'America/Vancouver'});
 return [d.fieldAliases?.[k]||k.replaceAll('_',' '),String(value)];
 });}
const safeLink=u=>{try{const x=new URL(u,location.href);return ['http:','https:'].includes(x.protocol)?esc(x.href):'#';}catch{return '#';}};
export function publicFeatureCard(d,p={},key){return {key:key||d.id+':'+featureTitle(p,d.name),title:featureTitle(p,d.name),kicker:d.name,description:d.description||d.note||'Public reference geography',rows:featureRows(d,p),sourceUrl:d.sourceUrl||d.url,sourceLabel:d.authority?d.authority+' source':'Publisher data',note:d.fetchedAt?'Snapshot '+new Date(d.fetchedAt).toLocaleDateString('en-CA',{timeZone:'America/Vancouver'}):d.cadence};}
export function installFeatureCards(map){
 const card=document.createElement('aside');card.id='feature-card';card.className='feature-card panel';card.hidden=true;card.setAttribute('aria-label','Map feature details');document.querySelector('#app').append(card);
 const providers=new Map();let current=null,pinned=false,anchor=null,hoverTimer,leaveTimer,candidates=[],index=0,lastHit='';
 function position(point){const r=map.getContainer().getBoundingClientRect();const pt=anchor?map.project(anchor):point||{x:r.width/2,y:r.height/2};const w=card.offsetWidth||320,h=card.offsetHeight||220;
  const left=r.left+pt.x+18+w>innerWidth-12?r.left+pt.x-w-18:r.left+pt.x+18;card.style.left=Math.max(12,Math.min(innerWidth-w-12,left))+'px';card.style.top=Math.max(76,Math.min(innerHeight-h-85,r.top+pt.y-25))+'px';}
 function show(model,{pin=false,lngLat=null,point=null,stack=null}={}){if(!model)return;clearTimeout(leaveTimer);clearTimeout(hoverTimer);current=model;pinned=pin;anchor=lngLat;card.hidden=false;card.classList.toggle('is-pinned',pin);card.setAttribute('role',pin?'region':'tooltip');
  if(stack)candidates=stack;
  const rows=model.rows||[],table=items=>items.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('');
  card.innerHTML=`<header><span>${esc(model.kicker||'MAP FEATURE')}</span><button data-card-close aria-label="Close feature card">×</button></header><div class="feature-card-body"><h2>${esc(model.title)}</h2>${model.image?`<img class="feature-preview" src="${safeLink(model.image)}" data-camera-image="${safeLink(model.image)}" alt="${esc(model.title)}">`:''}${model.description?'<p class="feature-description">'+esc(model.description)+'</p>':''}${rows.length?'<dl>'+table(rows.slice(0,5))+'</dl>':''}${rows.length>5?'<details><summary>All attributes ('+rows.length+')</summary><dl>'+table(rows.slice(5))+'</dl></details>':''}${model.html||''}${model.note?'<p class="feature-note">'+esc(model.note)+'</p>':''}${model.sourceUrl?'<a class="feature-source" href="'+safeLink(model.sourceUrl)+'" target="_blank" rel="noreferrer">'+esc(model.sourceLabel||'Official source')+' ↗</a>':''}${model.actions||''}</div><footer><button data-card-pin>${pin?'Unpin':'Pin card'}</button><span>${pin?'Pinned · Esc closes':'Click a feature to pin'}</span>${candidates.length>1?`<button data-card-prev aria-label="Previous overlapping feature">‹</button><b>${index+1}/${candidates.length}</b><button data-card-next aria-label="Next overlapping feature">›</button>`:''}</footer>`;
  position(point);if(pin)model.onPin?.(card);
 }
 function close(){clearTimeout(hoverTimer);clearTimeout(leaveTimer);card.hidden=true;pinned=false;current=null;lastHit='';candidates=[];index=0;map.getCanvas().style.cursor='';}
 function deferClose(){if(!pinned)leaveTimer=setTimeout(()=>{if(!card.matches(':hover'))close();},220);}
 function hit(e,hover){const ids=[...providers].filter(([id,p])=>map.getLayer(id)&&(!hover||p.hover!==false)).map(([id])=>id);if(!ids.length)return [];
  const raw=map.queryRenderedFeatures([[e.point.x-5,e.point.y-5],[e.point.x+5,e.point.y+5]],{layers:ids}).sort((a,b)=>({Point:0,MultiPoint:0,LineString:1,MultiLineString:1,Polygon:2,MultiPolygon:2}[a.geometry.type]??3)-({Point:0,MultiPoint:0,LineString:1,MultiLineString:1,Polygon:2,MultiPolygon:2}[b.geometry.type]??3));
  const seen=new Set(),found=[];for(const f of raw.slice(0,30)){const model=providers.get(f.layer.id)?.resolve(f);if(!model)continue;const key=model.key||f.source+JSON.stringify(f.geometry.coordinates).slice(0,160);if(seen.has(key))continue;seen.add(key);found.push({...model,key});if(found.length===10)break;}return found;
 }
 map.on('mousemove',e=>{if(pinned||map.isMoving())return;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{const hits=hit(e,true);if(!hits.length){deferClose();return;}map.getCanvas().style.cursor='pointer';clearTimeout(leaveTimer);if(lastHit===hits[0].key&&!card.hidden)return;lastHit=hits[0].key;index=0;show(hits[0],{point:e.point,lngLat:e.lngLat,stack:hits});},160);});
 map.on('click',e=>{const hits=hit(e,false);if(!hits.length){close();return;}index=0;show(hits[0],{pin:true,point:e.point,lngLat:e.lngLat,stack:hits});});
 map.getCanvas().addEventListener('mouseleave',()=>{clearTimeout(hoverTimer);deferClose();});
 map.on('movestart',()=>{clearTimeout(hoverTimer);if(!pinned)close();});map.on('move',()=>{if(pinned&&!card.hidden)position();});
 card.addEventListener('toggle',()=>position(),true);card.onmouseenter=()=>clearTimeout(leaveTimer);card.onmouseleave=deferClose;
 card.onclick=e=>{if(e.target.closest('[data-card-close]')){close();return;}if(e.target.closest('[data-card-pin]')){pinned=!pinned;show(current,{pin:pinned,lngLat:anchor});return;}const step=e.target.closest('[data-card-next]')?1:e.target.closest('[data-card-prev]')?-1:0;if(step&&candidates.length){index=(index+step+candidates.length)%candidates.length;show(candidates[index],{pin:true,lngLat:anchor});}};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!card.hidden)close();});
 return {register(id,resolve,{hover=true}={}){providers.set(id,{resolve,hover});},show(model,options={}){candidates=[];index=0;show(model,{pin:true,...options});},close,isPinned:()=>pinned,element:card};
}
