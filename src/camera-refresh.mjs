export const CAMERA_INTERVAL=120000;
export function imageRequestUrl(raw,epoch=Date.now()){
 const u=new URL(raw);if(u.protocol!=='https:')throw Error('HTTPS camera image required');
 u.searchParams.set('refresh',String(epoch));return u.href;
}
export async function cameraCatalogue(previous){
 // DriveBC's catalogue is fetched by the scheduled Node job. Browsers read
 // the same-origin snapshot because the upstream API does not allow CORS.
 try{const r=await fetch('./data/cameras.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error('Camera catalogue unavailable');const j=await r.json();if(!j.ok)throw Error('Camera catalogue unavailable');
 return {...(previous?.ok&&Date.parse(previous.fetchedAt)>Date.parse(j.fetchedAt)?previous:j),catalogueMode:'snapshot'};
 }catch(e){if(previous?.ok)return {...previous,catalogueMode:'snapshot',refreshFailed:true};throw e;}
}
// Keep the displayed frame until its replacement has decoded. Four concurrent
// requests bound refresh traffic; offscreen lazy images are left for scrolling.
export async function refreshCameraImages(root=document,epoch=Date.now()){
 const images=[...root.querySelectorAll('img[data-camera-image]')].filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&!el.closest('[hidden]');});
 let cursor=0,failed=0,loaded=0;
 await Promise.all(Array.from({length:Math.min(4,images.length)},async()=>{while(cursor<images.length){const el=images[cursor++];if(el.dataset.loading==='true')continue;el.dataset.loading='true';
  const next=new Image();next.decoding='async';const original=el.dataset.cameraImage,url=imageRequestUrl(original,epoch);
  try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{next.onload=next.onerror=null;reject(Error('timeout'));},20000);next.onload=()=>{clearTimeout(timer);resolve();};next.onerror=()=>{clearTimeout(timer);reject(Error('image'));};next.src=url;});
   if(el.isConnected&&el.dataset.cameraImage===original){el.src=url;el.style.opacity='';el.dataset.requestEpoch=String(epoch);el.dataset.loadedAt=new Date().toISOString();const status=el.closest('article,dialog,.feature-card')?.querySelector('[data-image-status]');if(status)status.textContent='Image loaded '+new Date().toLocaleTimeString('en-CA',{timeZone:'America/Vancouver',hour:'2-digit',minute:'2-digit'})+' PT';}loaded++;
  }catch{failed++;const status=el.dataset.cameraImage===original?el.closest('article,dialog,.feature-card')?.querySelector('[data-image-status]'):null;if(status)status.textContent='Refresh failed; previous image retained';}
  finally{delete el.dataset.loading;}
 }}));return {loaded,failed};
}
export const captureAge=(t,now=Date.now())=>{const minutes=(now-Date.parse(t))/60000;return !Number.isFinite(minutes)?'Capture time unavailable':minutes<1?'Captured just now':minutes<60?'Captured '+Math.floor(minutes)+'m ago':minutes<1440?'Captured '+Math.floor(minutes/60)+'h '+Math.floor(minutes%60)+'m ago':'Captured '+Math.floor(minutes/1440)+'d ago';};
export const captureStamp=t=>Number.isFinite(Date.parse(t))?new Date(t).toLocaleString('en-CA',{timeZone:'America/Vancouver',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}):'Not published';
export function cameraCondition(c,now=Date.now()){return !c.online?'Offline':c.stale||c.delayed||!Number.isFinite(Date.parse(c.capturedAt))||now-Date.parse(c.capturedAt)>45*60000?'Older / delayed frame':'DriveBC still';}
