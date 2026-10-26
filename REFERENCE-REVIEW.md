# Upstream review and regional choices

This was not just a README comparison. The following repositories were cloned locally and selected runtime/UI/source modules inspected on 25 October 2026. No dependency installation or execution of the upstream servers was required for this source review. ULTOR's included application screenshot was visually inspected. This project is an original regional implementation rather than a claim to merge every upstream feature.

| Project | Reviewed commit | Material inspected | What carries over |
| --- | --- | --- | --- |
| [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view) | `a7fcb3c2322fbffdbc24b81f98b45ef9fafe8339` | `package.json`, Docker/Compose, source register, scene/layer HTML templates, cyber/panel styles, DriveBC camera loader/tests, weather provider, ECCC air-quality source | Map as primary workspace, compact collapsible HUD panels, tilt/reset controls, camera inspection, nearest-camera handoff, provider timestamps, Canadian AQHI and observed weather sources. Its current source already supports DriveBC. |
| [ULTOR](https://github.com/Sequoiabm/ULTOR) | `94c10ea0a7be83da3fb5bf851b9e9e924bc5c9ba` | `src/globe.js`, flight renderer, shader modes, README, bundled demo screenshot | Oblique 3D view, selectable map objects, distinct toggleable layers and a camera inspector. The impressive city mesh uses Google Photorealistic 3D Tiles and requires its key/billing. |
| [Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) | `ecca90b1bc2950faa99d67071f5f8938bb217783` | MapLibre frontend structure, CCTV/fullscreen components, backend flight and Earth-observation fetchers/source references | Regional filtering and the separation of different data-layer meanings. Most of its backend/network services cannot simply be copied into GitHub Pages. |
| [WorldWideView](https://worldwideview.dev/) | Public site reviewed; repository not cloned | Product capabilities and public demo entry | Full-screen geospatial workspace and modular layers as design references; no claim that its plugin/backend stack is included. |

The truncated Gemini/Claude Earth, Polymarket and X links in the original list did not provide complete source targets. They were not treated as verified code sources.

## Why the regional build differs

God's Eye View currently uses Cesium, Vite and Node middleware. The frontend can be bundled, but its API proxies and streaming features still need a server. GitHub Pages only serves static files. The regional build therefore uses MapLibre 3D elevation terrain, direct public imagery/weather tiles, and a scheduled GitHub Action for source snapshots. It has no runtime backend or required keys.

This retains useful spatial relationships without representing infrequently sampled aircraft as a real-time stream. It avoids importing world-scale vessel, military, finance and other unrelated layers just to make the UI look populated. No simulated road traffic is displayed as real traffic.

## Additional regional feeds worth implementing next

| Feed | Local value | Status / scope |
| --- | --- | --- |
| [Avalanche Canada products API](https://docs.avalanche.ca/) | Forecast areas, current bulletins and danger information for surrounding mountain terrain | Public API documented at `api.avalanche.ca/forecasts/en/areas` and `/metadata`. Not implemented. Keep official bulletin wording/validity; backcountry danger is not a highway closure. |
| [ECCC hydrometric observations](https://api.weather.gc.ca/collections/hydrometric-realtime?f=html) | River/lake levels around Columbia, Kootenay, Slocan and Boundary watersheds | Not implemented. Match reporting stations, measurement units and timestamps before displaying trends. |
| [BC Hydro outages](https://www.bchydro.com/power-outages/app/outage-map.html) | Local disruptions and customer-facing situational awareness | Not implemented. Verify a documented/reusable source before relying on application-internal endpoints. |
| [FireSmoke](https://firesmoke.ca/data/) | Modeled smoke movement into valleys | Not implemented. Distinguish forecast concentration from measured AQHI, already present. |
| [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/) | Dated regional satellite imagery / burn-area context | GOES-West GeoColor endpoint tested; current build uses the more recent NOAA infrared layer instead. Historical imagery is not live fire detection. |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) | Satellite thermal detections | Found in upstream source references; not implemented. Official BCWS incident information is the operational fire layer. Hotspots are not confirmed fires or reported strikes. |

Implemented additional feeds from this review: ECCC rain/snow radar, timed NOAA GOES infrared, ECCC AQHI, sampled aircraft and the verified district GIS services listed in `SOURCES.md`.

## Second UI/source review — October 26, 2026

Revisited actual upstream implementations at the commits above: God's Eye View `src/ui/templates/layer-panels.html`, `src/ui/cctvPresentation.js`, and its application shell; ULTOR `src/hud.js`; Shadowbroker `frontend/src/components/FilterPanel.tsx` and `MaplibreViewer/CctvFullscreenModal.tsx`. These were source reviews, not claims to run all three upstream applications.

The useful gaps were distinct workspaces for map versus camera inspection, collapsible controls, explicit loading/error states, avoiding cancellation of slow same-camera images, and meaningful filtering. The regional build now has a separate camera wall, a compact operational control group, all-source defaults with zoom-based detail, bounded image replacement, visible capture ages, pause/manual refresh and keyboard camera browsing. Catalogue weather fields have strength/solo controls because stacking opaque forecast surfaces prevents interpretation.

Features still outside this static regional build: recorded historical playback, HLS/video streams where the agency only publishes stills, inferred road conditions from pixels, AI/voice briefs, and backend-driven tracking/streaming. No animated timeline or moving vehicle animation is presented as observed history. The optional Google/Esri Cesium page remains separate from the MapLibre GIS workspace; this is not a unified Cesium conversion.

## Performance follow-up — October 26, 2026

Inspected God's Eye View src/data/cctvLod.js: bounded ambient card counts, in-view candidate selection, stability across small moves and provider-paced refresh. This build now uses viewport reuse and display budgets, opt-in terrain/GIS/rasters and bounded cameras. A controlled same-machine FPS/memory comparison with God's Eye View has not been performed; no performance-parity claim is made.
