# Kootenay / Field of View

A map-first observation console for West Kootenay and Boundary roads. Castlegar, Nelson, Trail, Salmo, Ymir, Grand Forks, **Midway, Greenwood**, Kaslo, Nakusp, New Denver, the passes, and ferry approaches.

**Static HTML, CSS, and JavaScript. No npm installation, build step, API key, or running backend is required for the core map. Google photorealistic 3D is an optional mode requiring your own Google key and billing-enabled Map Tiles API.** MapLibre is vendored in `vendor/`. Node 22 runs only the optional local preview and GitHub's feed-refresh job.

The map opens on **The whole region** each visit. Area selection remains available during the session. Road watch starts in 2D with terrain, weather overlays and detailed GIS off. Use the workspace selector for 3D terrain or GIS / addresses. Town labels zoom to address detail. The small Operational layers section expands when you need its switches. The header links directly between Map and Cameras.

## What works

- Satellite imagery over 3D elevation terrain; tilt, zoom, north reset, 2D and topographic modes.
- DriveBC cameras on the map and a dedicated `cameras.html` wall: area/highway/search filters, saved pins, enlarged images, previous/next and arrow-key browsing. Images refresh every two minutes while visible; Refresh all, map-strip Refresh and individual-image Refresh buttons are included. The previous frame remains visible during refresh.
- Published road conditions, incidents, construction and structured closure classifications, with full source reports.
- Roadside air/pavement temperatures, surface condition, wind and official community/mountain forecasts.
- BCWS reported fires; click a target to inspect it and jump to the nearest camera.
- Sampled regional ADS-B aircraft positions, callsign, altitude, speed and observation time.
- Direct ECCC rain/snow radar and NOAA GOES regional infrared imagery with observation times.
- Direct ECCC air-quality observations, including Castlegar.
- Public RDCK district/electoral boundaries and evacuation-zone feed; RDKB administrative/locality boundaries; provincial evacuation orders/alerts within the region. Each GIS layer has a separate switch in the district panel.
- Source status, fetch times, capture/observation times and stale/failed refresh warnings.

## Put it on GitHub Pages

1. Create a **public GitHub repository** with a `main` branch and push **the contents of this folder**, including `.github/workflows/pages.yml`, `vendor/`, `src/` and `data/`. GitHub Desktop or Git is the practical option for this package's many data/renderer files. Extract the ZIP first; committing only the ZIP does not deploy a website.
2. In **Settings → Pages → Build and deployment**, set **Source: GitHub Actions**.
3. In **Settings → Actions → General**, allow the workflow to read and write repository contents. The workflow commits successful data snapshots so a temporary provider outage can retain the previous data.
4. Under **Actions**, run **Refresh regional feeds and deploy Pages**. It deploys to `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The workflow also runs after pushes to `main` and approximately every 15 minutes. GitHub schedules can be delayed and may be disabled after prolonged repository inactivity. If repository rules prevent automated commits, allow this workflow's data commits or adjust the refresh persistence step. If you use a different default branch, change the workflow's branch filter.

GitHub Pages is available for public repositories on GitHub Free: [official hosting documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). No separate paid host is required. External feed and map availability remains subject to those providers and your network.

All application asset/data URLs are relative, so repository subpaths work. The deployment packages only static website assets, not refresh scripts or this documentation.

## Local preview

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4179/`. This command is only a local static-file preview; GitHub Pages serves the finished files itself. Opening `index.html` as a `file://` URL will not work reliably because browsers restrict module and JSON requests.

Refresh source snapshots manually:

```sh
node scripts/refresh.mjs
node scripts/refresh-catalog.mjs
node --test scripts/region.test.mjs
```

## Freshness and limits

DriveBC images load directly from the official image host. Its camera-list and roadside-weather APIs do not currently permit arbitrary browser origins, so the GitHub Action fetches that metadata. The camera catalogue's capture time may lag the image itself; the camera detail explains that distinction. Camera metadata older than 45 minutes and weather observations older than two hours are flagged.

The GitHub workflow publishes source snapshots approximately 15 minutes apart. The browser rereads those files every three minutes and also fetches road reports and reported fires directly from their official APIs, with the snapshots as fallback. Forecasts, roadside weather, camera metadata, GIS and aircraft use the published snapshots. Aircraft are **sampled observations, not moving live tracks**; positions older than one hour are omitted from the map. The source panel and aircraft list show their times. Air quality and enabled radar/cloud layers fetch directly from their providers. Weather overlays refresh their observation frame every three minutes while enabled.

The satellite basemap is not live. Terrain has 1.35× vertical exaggeration for readability. This is elevation terrain with imagery, not Google's photorealistic 3D building mesh. Radar can have coverage gaps; GOES infrared includes both cloud and surface temperature patterns.

Corridors are geographic/highway filters, not calculated routes. A nearby camera may show a different road. No returned road/fire/evacuation records does not establish safety. Always read current official notices and follow posted signs. No connection to FedEx systems or driver/customer positions is implemented.

See [SOURCES.md](SOURCES.md) for exact endpoints, attribution and GIS semantics, and [REFERENCE-REVIEW.md](REFERENCE-REVIEW.md) for the inspected upstream projects and additional regional feed candidates.
# MapEX reference layers

District GIS includes nine layers imported from your D:/MapEX public GIS exports: RDCK parcels and addresses; RDKB parcels, addresses, road geometry, mountain peaks, community names, neighbouring districts and 20 m contours. These are dated March 31, 2026 and do not refresh with the road feeds. Detailed layers are opt-in. GIS / addresses enables the two address datasets. Hover to preview; click/tap to pin a compact card, inspect attributes and open its publisher. Only intersecting local data tiles load; they are served from this same GitHub Pages site, avoiding ArcGIS CORS dependencies. Contour geometry is reduced for display. Parcel outlines are reference geography, not a survey.

Terrain now uses true vertical scale. Satellite imagery is still draped over ground elevation; this does not reconstruct raised bridges or buildings. BC's open LiDAR index confirms 2018 Kootenay-Columbia point-cloud coverage at the bridge near 49.294 N, 117.642 W. A ground DEM from that survey is now converted into 52 local terrain tiles covering a small Castlegar patch. Enable **Castlegar LiDAR terrain / 2018** in Data explorer. The 1 m source is resampled to the map display grid; global Mapzen elevation fills gaps and the rest of the region. It is bare-earth terrain, not a bridge/building mesh.


## Data explorer

Open the grid icon in the rail or **DATA EXPLORER / ALL SOURCES**. The catalogue adds 37 sources to the existing camera, road, weather, fire, aircraft and district layers. Catalogue sources are opt-in, limited to four vectors and one weather/imagery field at a time. Search by name or category and zoom to the stated level. A selected weather/imagery field starts at 55% opacity; use SOLO FIELD for an isolated catalogue field at 75%, End solo to restore the blend, or adjust the strength slider. Operational radar/clouds remain independently controlled. Reference pack selects four modest datasets; Clear layers releases them; the nine operational switches and district switches remain separate. Click a feature or use Source / update details to browse retrieved records, publisher categories, update information and legends. River gauges request their latest reading when inspected; the timestamp remains visible.

Included: BCWS perimeters, danger ratings, bans and restrictions; flood basin status; current drought levels; snow station locations; reception-facility reference locations; parks; forestry roads; RDCK roads, waterways, waterbodies, contours, buildings, Nelson creek hazards and zoning; LiDAR project coverage, LAZ/DEM/DSM download footprints; Water Survey of Canada gauge inventory/readings; USGS earthquakes; ECCC smoke, hotspots, alerts, temperature, wind, precipitation and snowfall; NASA daily true colour and snow cover; NRCan regional hillshade; highway structures, forestry bridges/culverts and railway crossings. Building footprints have no measured heights.

ArcGIS does not impose a single update schedule. Each publisher controls its data. The inspector separates retrieval time, advertised forecast time, service edit time and dated feature attributes. Fire danger is published daily in its stated season; many survey/planning layers are archival. Flood basins include **No Advisory** categories and are drawn grey in that state. Old drought layer with retired code 99 was replaced with the current BC catalogue item.

The GitHub workflow checks dynamic snapshots about every 15 minutes, stable reference snapshots daily, and LiDAR project coverage weekly. Browser catalogue files refresh every three minutes while visible. Dense hosted ArcGIS layers query only the current regional viewport after zooming in and require the provider to allow browser access. Capped queries display PARTIAL instead of silently implying complete coverage. NRCan hillshade is a cached 2048-pixel regional overview to avoid its browser CORS limitation. NASA dates are UTC composite dates; they are not live views.

A public ArcGIS layer URL can be added for the current session using the expandable section at the bottom. This requires public GeoJSON query support and browser CORS access. Added sources are not saved or automatically endorsed.

## Optional 3D scene

**GOOGLE PHOTOREALISTIC 3D** opens a separate static CesiumJS scene at the map centre. **Open free satellite globe** uses Esri imagery and Esri elevation with no API key. Cameras, road reports, reported fires and recent sampled aircraft can be overlaid. The full GIS and weather catalogue remains on the operations map.

To use Google, enable Map Tiles API in your billing-enabled Google Cloud project and enter a browser API key authorized for your deployed website. [Google setup](https://developers.google.com/maps/documentation/tile/cloud-setup). The key is kept in page memory and used directly with Google; it is not stored in the repository or browser storage. No Google tile requests occur before Connect. Coverage and mesh quality vary; local photorealistic detail is not guaranteed. Google logo and tile credits remain visible, and no Google tiles are bundled in this project. CesiumJS 1.127 is vendored for GitHub Pages compatibility.

## Camera refresh behaviour

The wall refreshes the catalogue and visible images every 120 seconds. Refresh all requests another cycle immediately; offscreen cards request the latest cycle when scrolled into view. Auto refresh can be paused and stops while the tab is hidden, resuming when overdue on return. Four concurrent replacement-image requests keep refresh traffic bounded. An image request failure preserves the displayed frame and reports the failure.

Image URLs get a new request version on refresh. Capture time is never changed to the request time: it comes from DriveBC metadata and is displayed separately from image-load status. The browser reads the same-origin published camera snapshot; it never calls the CORS-blocked DriveBC catalogue API. The scheduled GitHub Action fetches that API outside the browser. If the published snapshot cannot be loaded, a previously loaded catalogue remains available. GitHub schedules and upstream cameras determine actual currency; refreshing cannot create a new upstream frame.

## Performance and compact feature cards

The previous all-source startup is replaced by Road watch: 2D satellite imagery, cameras, road reports, weather stations, reported fires and air quality. Terrain, district detail and weather rasters are opt-in. Selecting another raster replaces the previous one. Backdrop blur is removed. Canvas pixel ratio is capped at 1, tile cache at 48 per source, map workers at 2, and image-request concurrency at 6 where supported. Camera strip has at most 6 images; wall renders 12 cards per page.

GIS reuses an expanded viewport window, caches at most 8 local chunks, reads at most 8 chunks per layer view, and displays at most 3,000 features / 100,000 vertices per local layer. Partial display is identified. Unchanged feeds no longer resend geometry; hidden detailed layers clear worker data. Catalogue queries run two at a time with at most two ArcGIS result pages per view. Up to three detailed district datasets can be selected. These limits are not a guarantee of smooth 3D on every GPU.

Hover lookup waits for pointer settling and pauses during map movement. Points/outlines support hover; broad polygon interiors support click. Map/list feature selection uses a 320 px nonblocking card with pin/unpin, overlapping-feature navigation, attributes and source links. It no longer opens a modal or automatically flies the map. Camera-wall enlargement remains on its dedicated page. Source details also use the inline card.
