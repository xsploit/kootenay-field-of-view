# Sources and display semantics

Checked against public services on 25 October 2026. Providers can change access, schemas, licensing and availability.

## Implemented feeds

| Source | Endpoint | Display and access |
| --- | --- | --- |
| DriveBC cameras | `https://www.drivebc.ca/api/webcams/` | GitHub Action filters to the regional bounds. Preserves capture time, offline, stale/delayed flags and image credit. |
| DriveBC still images | `https://www.drivebc.ca/images/{numeric-id}.jpg` | Direct browser `<img>` requests; refreshed stills, not streaming video. Catalogue capture time can be older than the image currently returned. |
| DriveBC Open511 | `https://api.open511.gov.bc.ca/events` | Active published road reports, spatial intersection including crossing lines, pagination and schedule checks. Structured `roads[].state=CLOSED` determines closure classification. Descriptions remain as supplied; some provider descriptions use miles. |
| DriveBC road weather | `https://www.drivebc.ca/api/weather/current/` | Station observations. Missing values remain missing; supplied units are preserved. |
| ECCC through DriveBC | `/api/weather/regional/` and `/api/weather/hef/` on `https://www.drivebc.ca` | Community and mountain-highway forecasts, issue times and alert links. |
| BC Wildfire Service | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0` | Reported fires not marked Out. Area, status, identifier, ignition/report date. No inference that a highway is affected. |
| adsb.fi | `https://opendata.adsb.fi/api/v2/lat/49.6/lon/-117.6/dist/100` | Regionally filtered sampled aircraft positions; no invented movement. Source age shown. Positions older than one hour are hidden from the map. Underlying receiver coverage is incomplete. [Provider](https://adsb.fi/). |
| ECCC GeoMet radar | `https://geo.weather.gc.ca/geomet` | WMS `RADAR_1KM_RRAI` (rain rate) and `RADAR_1KM_RSNO` (snow rate), latest advertised observation time. Direct browser tiles; partial coverage is possible. [Official radar documentation](https://eccc-msc.github.io/open-data/msc-data/obs_radar/readme_radar_geomet_en/). |
| NOAA nowCOAST | `https://nowcoast.noaa.gov/geoserver/observations/satellite/ows` | WMS `goes_longwave_imagery`, style `goes-lir`. GOES regional infrared Band 14, not a cloud-only mask. Time read from provider capabilities and included in tile requests. [Provider](https://nowcoast.noaa.gov/). |
| ECCC air quality | `https://api.weather.gc.ca/collections/aqhi-observations-realtime/items` | `latest=true`, regional bbox, station observation time and supplied AQHI value. Castlegar is a reporting location returned by this region query. [Collection](https://api.weather.gc.ca/collections/aqhi-observations-realtime?f=html). |

Bounds: west -119.08, south 48.98, east -116.5, north 50.5. The boundary includes Midway and Greenwood. Corridors restrict geometry and highway identifiers; these are not routing calculations.

## District GIS layers

RDCK services below are linked from the district's [public emergency map](https://rdck.maps.arcgis.com/apps/webappviewer/index.html?id=150771e5b5c34dea8a4474bfaeb005fd), itself embedded in its [official emergency-information page](https://www.rdck.ca/development-community-sustainability-services/emergency/emergencyinformation/). The app's underlying WebMap ID inspected was `5f2f54e565684ac7890e14528bd89670`.

| Authority | Layer | Exact public service |
| --- | --- | --- |
| RDCK | District boundary | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/Administration_Layers/FeatureServer/12` |
| RDCK | Electoral areas | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/Administration_Layers/FeatureServer/11` |
| RDCK | Public evacuation zones | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/EvacuationsActivePublicView/FeatureServer/9` |
| RDKB | Administrative areas | `https://mapping.rdkb.com/server/rest/services/CityView_Basemap/MapServer/805` |
| RDKB | Localities | `https://mapping.rdkb.com/server/rest/services/CityView_Basemap/MapServer/804` |
| BC EMCR | Evacuation orders and alerts | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0` |

GIS layers have separate visibility buttons under the District GIS workspace and a master map-layer switch. Reference boundaries are blue/purple; emergency polygons are coral. The click detail links to the exact source service. Counts describe returned polygon features, not households or incidents. Boundary polygon detail is simplified for map performance.

The RDKB `EmergencyManagement`, `Fire` and `Infrastructure_Data_Public` requests tested returned token-required responses and are not used. Its public service-boundary endpoint returned attribute records without usable geometry in the test, so the implementation uses the verified CityView administrative/locality geometries instead. No authenticated service is accessed.

Zero returned evacuation polygons is not an all-clear. Provincial aggregation can lag an issuing agency; verify current district notices. Historical/planning layers are not relabelled as current emergencies. Per-layer fetch failures preserve prior geometry when available and are labelled.

## Refresh and stale data

GitHub Actions fetches camera metadata, reports, weather, forecasts, fires, GIS and aircraft approximately every 15 minutes. The browser rereads snapshots every three minutes. GitHub schedules are best-effort and can be delayed or disabled. Snapshot fetch timestamps and source observation times stay distinct. Failed refreshes retain a previous successful snapshot with a warning. An unavailable source does not fabricate records or establish zero hazards.

Road reports and BCWS reported fires refresh directly in the browser as well as through the workflow, with static snapshot fallback on failure. Air quality, enabled radar and cloud layers use browser-direct requests. Camera images also load directly. The current DriveBC camera-list and road-weather endpoints did not return an allow-origin header in the cross-origin checks; the scheduled fetch handles those responses without a paid proxy.

## Map and attribution

- MapLibre GL JS 5.6.2, vendored with licence. [Project](https://github.com/maplibre/maplibre-gl-js).
- Esri World Imagery / World Topographic Map, credit displayed on map. Satellite basemap imagery is not live. [World Imagery service](https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer).
- AWS / Mapzen Terrain Tiles, Terrarium encoding, 1.35× vertical exaggeration. [Dataset and source attribution](https://registry.opendata.aws/terrain-tiles/).
- Contains information licensed under the [ECCC Data Servers End-use Licence](https://eccc-msc.github.io/open-data/licence/readme_en/). No endorsement implied.
- BC government information under the [Open Government Licence – British Columbia](https://www2.gov.bc.ca/gov/content/data/policy-standards/open-data/open-government-licence-bc), subject to the provider's dataset-specific terms. DriveBC per-image credits are shown in camera details.
- NOAA weather imagery: NOAA nowCOAST / NESDIS GOES; [NOAA disclaimer](https://oceanservice.noaa.gov/disclaimer.html).
- District GIS remains attributed to RDCK/RDKB and is provided as public reference information, with links to the original service. Public availability alone does not establish unrestricted redistribution rights; retain provider attribution and review terms before broader reuse.

No FedEx integration, customer addresses, driver tracking, automatic crash detection, road-surface inference from camera pixels, or continuous aircraft playback is implemented.
# MapEX imports (October 25, 2026)

Imported public GIS reference exports from D:/MapEX/data/layers, export timestamp 2026-03-31T03:02:37-07:00. Original source URLs are retained in data/mapex/catalog.json. Geometry is filtered to this application's region, divided into viewport tiles, and stripped to relevant map attributes. Property ownership and tax/assessment tables are not included. These archived reference layers are not automatically updated. RDCK's older maps.rdck.bc.ca public-map service returned ArcGIS 499 Token Required during verification; RDCK imagery and RDKB Planning/BaseLayersExternal service catalogs were public, but their metadata responses did not include an Access-Control-Allow-Origin header. Bundled exports remove that browser dependency.


## Expanded catalogue and ground terrain

37 additional sources, verified October 25, 2026. This table records the implemented endpoint, not a claim that every source is continuously current. See the runtime inspector for feature dates, service edit times, categories, availability and forecast times.

| Layer | Endpoint / layer | Access |
| --- | --- | --- |
| Wildfire perimeters | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| Wildfire danger rating | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Danger_Rating_-_View/FeatureServer/7` | GitHub regional GeoJSON snapshot |
| Wildfire area restrictions | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Area_Restrictions_-_View/FeatureServer/13` | GitHub regional GeoJSON snapshot |
| Fire bans & prohibitions | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Bans_and_Prohibition_Areas_-_View/FeatureServer/14` | GitHub regional GeoJSON snapshot |
| Flood advisories & warnings | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BC_Flood_Advisory_and_Warning_Notifications_(Public_View)/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| Drought levels | `https://services1.arcgis.com/xeMpV7tU1t4KD3Ei/arcgis/rest/services/British_Columbia_Drought_Levels_(Edit)_view/FeatureServer/27` | GitHub regional GeoJSON snapshot |
| Automated snow station locations | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/AutomatedSnowStationsPROD/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| Emergency reception facilities | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BC_Emergency_Social_Services_Facilities/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| BC parks & protected areas | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Parks_Ecological_Reserves_and_Protected_Areas/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| Forest tenure road sections | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Forest_Tenure_Road_Section_Lines_-_View/FeatureServer/3` | Public browser viewport queries |
| RDCK Digital Road Atlas | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/RDCK_DRA_Roads/FeatureServer/0` | Public browser viewport queries |
| RDCK creeks & waterways | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/BaseMapping_Layers/FeatureServer/8` | Public browser viewport queries |
| RDCK lakes & rivers | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/BaseMapping_Layers/FeatureServer/10` | GitHub regional GeoJSON snapshot |
| RDCK building footprints | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/BaseMapping_Layers/FeatureServer/5` | Public browser viewport queries |
| RDCK 20 m contours | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/BaseMapping_Layers/FeatureServer/52` | Public browser viewport queries |
| Nelson steep creek hazard areas | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/DATA_Nelson_SteepCreekHazards/FeatureServer/2` | GitHub regional GeoJSON snapshot |
| Nelson zoning | `https://services5.arcgis.com/YrichWXF9aowPgGP/arcgis/rest/services/DATA_NelsonZoning/FeatureServer/5` | Public browser viewport queries |
| LiDAR survey coverage / years | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/LiDAR_BC_S3_Public/FeatureServer/0` | GitHub regional GeoJSON snapshot |
| LiDAR point-cloud download footprints | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/LiDAR_BC_S3_Public/FeatureServer/4` | Public browser viewport queries |
| LiDAR ground DEM download footprints | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/LiDAR_BC_S3_Public/FeatureServer/6` | Public browser viewport queries |
| LiDAR surface DSM download footprints | `https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/LiDAR_BC_S3_Public/FeatureServer/3` | Public browser viewport queries |
| Water Survey of Canada river gauges | `https://api.weather.gc.ca/collections/hydrometric-stations/items` | GitHub regional GeoJSON snapshot |
| Regional earthquakes / last 30 days | `https://earthquake.usgs.gov/fdsnws/event/1/query` | GitHub regional GeoJSON snapshot |
| Wildfire smoke / surface PM2.5 forecast | `https://geo.weather.gc.ca/geomet` · `RAQDPS.Sfc_PM2.5-WildfireSmokePlume` | Direct timed WMS |
| Satellite-detected fire hotspots | `https://geo.weather.gc.ca/geomet` · `WildfireHotspots` | Direct timed WMS |
| ECCC weather alerts | `https://geo.weather.gc.ca/geomet` · `Current-Alerts` | Direct timed WMS |
| Air temperature / model | `https://geo.weather.gc.ca/geomet` · `HRDPS.CONTINENTAL_TT` | Direct timed WMS |
| Wind / model | `https://geo.weather.gc.ca/geomet` · `HRDPS.CONTINENTAL_WSPD` | Direct timed WMS |
| 24 h precipitation / model | `https://geo.weather.gc.ca/geomet` · `HRDPS.CONTINENTAL.DIAG_PR_PT24H` | Direct timed WMS |
| 24 h snowfall / model | `https://geo.weather.gc.ca/geomet` · `HRDPS.CONTINENTAL.DIAG_SN_PT24H` | Direct timed WMS |
| NRCan ground hillshade / regional overview | `https://datacube.services.geo.ca/wrapper/ogc/elevation-hrdem-mosaic` · `dtm-hillshade` | GitHub regional image snapshot |
| NASA daily satellite true colour | `https://gibs.earthdata.nasa.gov/` · `MODIS_Terra_CorrectedReflectance_TrueColor` | Direct NASA WMTS |
| NASA satellite snow cover | `https://gibs.earthdata.nasa.gov/` · `MODIS_Terra_NDSI_Snow_Cover` | Direct NASA WMTS |
| Castlegar LiDAR terrain / 2018 | `https://nrs.objectstore.gov.bc.ca/gdwuts/082/082f/2018/dem/bc_082f022_xli1m_utm11_2018.tif` | 52 bundled hybrid terrain tiles |
| Highway bridges, tunnels & structures | `https://openmaps.gov.bc.ca/geo/pub/wfs` · `pub:WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_STRUCTURE_SP` | GitHub regional GeoJSON snapshot |
| Forestry bridges & major culverts | `https://openmaps.gov.bc.ca/geo/pub/wfs` · `pub:WHSE_FOREST_TENURE.RRI_BRIDGES_MAJOR_CULVERTS_SP` | GitHub regional GeoJSON snapshot |
| Highway railway crossings | `https://openmaps.gov.bc.ca/geo/pub/wfs` · `pub:WHSE_IMAGERY_AND_BASE_MAPS.MOT_RAILROAD_CROSSINGS_SP` | GitHub regional GeoJSON snapshot |

The local Castlegar DEM is `bc_082f022_xli1m_utm11_2018.tif`, EPSG:2955, 1 m grid, 2018 NDMP Kootenay-Columbia survey. Cropped area: -117.675,49.270 to -117.610,49.302. Raw LiDAR uses the BC Open Government Licence; global fallback elevation uses the Mapzen terrain attribution already provided. Three decoded display tile samples agreed with the source survey to 0.69 m or less; display sampling is coarser than the source. Ground terrain does not reconstruct raised decks.

Google 3D is optional and untested with an authenticated key. API setup, billing, coverage and use are controlled by Google. Cesium displays supplied tile credits and the unmodified official Google Maps logo. Free globe and the main operations map use separate non-Google sources. Google tiles are requested only at runtime after the user connects.

### Additional MapEX coverage and camera refresh — October 26, 2026

The local reference catalogue now includes RDKB address points (12,049 within this map region), community names (17) and neighbouring regional-district polygons (5), in addition to the six original cached layers. All nine begin selected. Original per-layer service URLs are read from the export metadata. Address fields describe public civic locations; no owner, tax or assessment tables are imported.

The dedicated camera page requests updated visible stills every two minutes and supports manual refresh. Metadata reads a fresh same-origin snapshot. The GitHub Action fetches the official catalogue outside the browser, avoiding its CORS restriction. Capture timestamps remain publisher timestamps, distinct from successful image loading. Offscreen cards use the current refresh cycle when brought into view.
