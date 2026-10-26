## Hover cards and performance correction — October 26, 2026

- Supersedes previous all-source-default notes: Road watch starts in 2D with catalogue layers, DEM and detailed GIS off. Browser main-page resource entries: 40 basemap tiles, 0 terrain tiles, 0 weather/satellite overlays, 0 local GIS chunks. Canvas 1166 × 884. Entries include caches and may omit workers; these are not total bandwidth, FPS or memory measurements.
- Nelson address 602 LAKE ST displayed in a 320 px inline card, with source/date/attributes, pin/unpin and overlapping-feature navigation. Zero open dialogs. Source details also use the card. Feature selection does not fly the map.
- Eight identical views using actual cached Nelson geometry: previous module 8 uploads / 55,656 cumulative feature submissions; current module 1 upload / 1,223 submissions. Both fetched one chunk. Mocked map-worker submission benchmark, not a GPU benchmark.
- Camera wall: 12 rendered cards, 77 total cameras, Page 1 / 7; Next page displayed Page 2 / 7. Refresh behavior retained.
- All 19 tests pass: geometry/vertex budgets, unchanged-view reuse and release, address/domain labels, and previous region/time, WMS and camera CORS rules. Modules pass syntax checks. Final browser flows checked without new captured errors after correcting startup memoization.
- At most four catalogue vectors, one catalogue raster, and three detailed district sets are selected. Services remain selectable; heavy layers are no longer all enabled together.
- Same-machine GPU memory/FPS comparison and weaker-machine tests remain unperformed. Optional 3D may still be demanding. No performance-parity claim with God's Eye View.

# Validation record

Validated locally on 25 October 2026. This is a static website preview, not a claim that a GitHub repository or Pages deployment has already been created.

- Eight geographic/classification/time tests passed, including Midway/Greenwood, highway/corridor filtering, lines crossing the regional boundary, structured closure status, ambiguous schedule timezones and real readsb Unix-second aircraft timestamps.
- All source snapshot collectors returned successful responses in the check: 77 cameras, 14 published road reports, 12 roadside stations, 8 community/mountain forecast records, 6 reported fires and sampled regional aircraft. Counts change over time.
- GIS collection returned 1 RDCK district-boundary polygon, 28 electoral-area polygon features, 13 RDKB administrative features and 1 locality feature in the bounded query. RDCK/provincial evacuation layers returned no polygons at check time; no safety inference was made.
- Browser verified the 3D terrain canvas, real satellite tiles, loaded camera images, expanded 800-pixel camera image, catalogue capture-time text and source credit.
- Boundary corridor selection and Midway search returned matching camera views. A pinned Midway camera persisted across page reload; the test pin was then restored to its prior state.
- Direct browser refresh verified new official road-report and BCWS fetch times, separately from snapshot-source fetch times.
- ECCC rain/snow radar and NOAA GOES infrared layer metadata loaded and displayed explicit observation times.
- Mobile checked at 390 × 844: no horizontal page overflow, camera/map view works, and the briefing view hides map controls/camera dock so reports remain unobstructed. Viewport override restored afterward.
- Local preview has no application backend endpoints. The supplied server only serves static files.

GitHub Actions execution, repository permissions, actual Pages publication and reachability through the user's workplace network require the destination repository/network and have not been verified here.
# MapEX integration verification — October 25, 2026

Six cached reference layers imported, 212 spatial data chunks; largest file 6,046,918 bytes. Browser inspection at Midway confirmed 673 nearby road features and 5,301 parcel features loaded after enabling the layers and zooming in; no captured browser console errors. Data status displays its March 31 export date and required zoom. Optional sources stay disabled initially; no bulk download on opening. Syntax checks and all eight existing region/time tests pass. Original MapEX files were read without modification. Terrain exaggeration changed from 1.35 to true scale; raised bridge geometry remains absent.

# Expanded source catalogue — October 25, 2026

- 37 additional configured sources: 21 ArcGIS layers, 3 BC WFS inventories, 8 WMS layers, 2 NASA WMTS layers, Water Survey gauge inventory/readings, USGS events, and local LiDAR terrain. All 37 catalogue checks succeeded. This verifies service availability at check time, not completeness or continuous currency of every observation.
- Static snapshots include 498 highway structures, 600 forestry bridges/culverts, 61 railway crossings, 403 gauge inventory records, 9 current drought basins and 8 LiDAR survey coverage records. Larger hosted layers query by viewport only.
- Retired drought endpoint was discovered through its coded domain (99: retired) and replaced using the official BC catalogue item's service URL. Replacement feature dates include October 22, 2026.
- Browser: enabled Castlegar LiDAR ground terrain and DEM download footprints together (12 footprints in that view); direct smoke overlay and cached NRCan regional hillshade loaded without captured console errors.
- Browser: gauge record picker requested Birchbank realtime data and displayed level 2.871 m, discharge 1000 m³/s, observation October 25 at 21:15 Pacific. This is one observed test reading, not a standing current value.
- NASA regional sample tile requests returned HTTP 200 JPEG/PNG. Daily images use the most recent advertised date no later than the preceding UTC day to allow for processing delay.
- Converted 52 hybrid elevation tiles from a cropped 2018 1 m survey. Three decoded tile samples differed from the source survey by 0.69, 0.03 and 0.06 m. This checks encoding/reprojection at sample locations, not survey-wide accuracy. Display sampling is coarser than 1 m.
- Free Cesium satellite globe rendered Esri elevation and regional overlays in-browser without a key or captured console errors. Google key entry/setup UI was checked; authenticated Google tile rendering and local mesh quality remain unverified because no key was provided.
- Responsive check: 390×780 viewport, 390 px document and data drawer width, close control visible. Override reset afterward.
- All 11 region/time, viewport pagination and WMS metadata tests pass. Modules pass syntax checks. GitHub workflow includes both test files and the expanded catalogue refresh. Deployment itself has not been performed because no target repository was selected.

## October 26, 2026 — all-source defaults and camera wall

- Refreshed regional snapshots: 77 DriveBC cameras, 14 road notices, 12 road-weather stations, 8 forecasts, 6 reported fires and 2 sampled aircraft at refresh time. These are dated test counts, not standing live counts.
- Browser confirmed The whole region on startup, all 37 catalogue sources selected, all 9 operational switches selected, and all 15 district/reference switches selected (6 feeds plus 9 MapEX layers). Zoom gates remain active for detailed reference layers.
- Added 12,049 regional RDKB civic address points, 17 community-name records and 5 neighbouring district polygons from the March 31 MapEX archive. No owner/assessment/tax tables included.
- Browser verified the dedicated camera page: 77 cards; Nelson text search; Highway 31A filter; pinned list; previous/next and ArrowRight navigation; pause/resume; enlarged images and direct official links.
- Manual map-strip refresh reported 4 visible image replacements. Wall refresh reported 6 visible image replacements. Images had nonzero natural widths and refreshed request URLs. Direct catalogue access was blocked in this browser; the published-snapshot fallback loaded current snapshot metadata.
- Two-minute foreground refresh, hidden-tab pause and overdue return refresh are implemented. Long-duration background/foreground cycling was not separately exercised for a full interval. Individual image refresh was exercised in the browser. Request and capture times remain distinct.
- Catalogue weather solo/end-solo controls restored all 37 selections. Dense inventories now have zoom gates and graduated point sizes. Catalogue loads are queued with at most four concurrent requests.
- Camera page and data drawer checked at 390x780; no horizontal overflow, drawer width 390 px and close button remained visible. Desktop viewport restored afterward. Mobile map navigation moved away from the display panel.
- All 15 automated checks pass: regional geometry/time rules, viewport clipping/pagination, WMS metadata, image request versioning, stale/offline capture status and camera snapshot fallback/retention. New modules pass syntax checks. No captured console errors during the checked map and camera flows.
- Pages assembly includes cameras.html, cameras.mjs and cameras.css. Hosted deployment and authenticated Google 3D remain unperformed.

## Camera catalogue CORS correction — October 26, 2026

Removed the browser-direct DriveBC catalogue attempt from the shared camera refresh module. Both map and wall now read only same-origin data/cameras.json; the scheduled Node/GitHub Action job remains responsible for fetching the upstream catalogue. Images still refresh directly from DriveBC. The regression test asserts the exact snapshot URL and ensures no upstream API request occurs. All 15 checks pass. A fresh Node snapshot returned 77 cameras; browser wall refresh showed 6 visible image replacements, 18 loaded image elements, and no new captured console errors. Earlier direct-API fallback notes above describe the superseded implementation.

