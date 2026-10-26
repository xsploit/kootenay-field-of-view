export async function installLidarTerrain(map,lib){
 const r=await fetch('./data/lidar-terrain/manifest.json');if(!r.ok)throw Error('Local terrain manifest is unavailable');const manifest=await r.json(),tiles=new Set(manifest.tiles);
 lib.addProtocol('local-lidar',async(params,abortController)=>{const key=params.url.replace('local-lidar://','').replace('.png','');const url=tiles.has(key)?new URL('./data/lidar-terrain/'+key+'.png',document.baseURI).href:'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+key+'.png';const r=await fetch(url,{signal:abortController.signal});if(!r.ok)throw Error('Elevation tile HTTP '+r.status);return {data:await r.arrayBuffer()};});
 map.addSource('local-survey-dem',{type:'raster-dem',tiles:['local-lidar://{z}/{x}/{y}.png'],tileSize:256,encoding:'terrarium',maxzoom:15,attribution:'Ground elevation: LidarBC / Province of BC (2018), Mapzen terrain outside survey patch'});
 return manifest;
}
