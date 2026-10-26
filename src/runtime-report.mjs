export function runtimeReport(){
 const entries=performance.getEntriesByType('resource'),count=re=>entries.filter(e=>re.test(e.name)).length,canvas=document.querySelector('.maplibregl-canvas');
 const values=[['Canvas pixels',canvas?canvas.width+' × '+canvas.height:'Not ready'],['Basemap tile entries',count(/World_(Imagery|Topo_Map)\/MapServer\/tile/)],['Terrain tile entries',count(/elevation-tiles-prod\/|lidar-terrain\/.*\.png/)],['Weather / satellite overlay entries',count(/request=GetMap|\/wmts\//i)],['Local GIS geometry entries',count(/\/mapex\/.*\.geojson/)]];
 return '<details class="runtime-report"><summary>Performance / load details</summary><dl id="runtime-metrics">'+values.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl><p class="feature-note">Main-page resource entries since navigation, including cached requests. Worker requests may be absent. This is not a total memory or FPS measurement.</p></details>';
}
