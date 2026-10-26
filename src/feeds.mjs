import { BOUNDS, geometryIntersects, inBounds, pointOf, eventKind, hasEnded } from './region.mjs';
const cache = new Map();
const bc = 'https://www.drivebc.ca';
async function json(url) { const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(18000) }); if (!r.ok)
    throw new Error(`Provider returned HTTP ${r.status}`); const j = await r.json(); if (j.error)
    throw new Error('Provider reported a data error'); return j; }
function array(j) { if (!Array.isArray(j))
    throw new Error('Unexpected provider response'); return j; }
export async function GET(_req, context) {
    const { kind } = await context.params;
    if (!['cameras', 'events', 'weather', 'forecast', 'fires'].includes(kind))
        return Response.json({ error: 'Unknown feed' }, { status: 404 });
    const old = cache.get(kind);
    if (old && Date.now() - old.at < 90000)
        return Response.json(old.body);
    const fetchedAt = new Date().toISOString();
    try {
        let items = [];
        let source = 'DriveBC', sourceUrl = bc, note = '';
        if (kind === 'cameras') {
            items = array(await json(bc + '/api/webcams/')).filter(c => inBounds(c.location?.coordinates) && c.should_appear !== false).map(c => ({ id: String(c.id), name: c.name_override || c.name, description: c.caption_override || c.caption, coordinates: c.location.coordinates, highway: c.highway_display || c.highway, capturedAt: c.last_update_modified, stale: !!c.marked_stale, delayed: !!c.marked_delayed, online: c.is_on !== false, credit: c.credit || c.dbc_mark || 'DriveBC.ca', elevation: c.elevation, sourceUrl: `https://www.drivebc.ca/?camera=${c.id}`, image: `https://www.drivebc.ca/images/${c.id}.jpg?v=${encodeURIComponent(c.last_update_modified || 'current')}` }));
            sourceUrl = bc + '/api/webcams/';
            note = 'Periodically refreshed still images; capture time comes from DriveBC.';
        }
        else if (kind === 'events') {
            let next = `https://api.open511.gov.bc.ca/events?status=ACTIVE&limit=500&bbox=${BOUNDS.join(',')}`;
            let complete = false;
            const all = [];
            for (let p = 0; p < 10 && next; p++) {
                const j = await json(next);
                all.push(...array(j.events));
                const link = j.pagination?.next_url || j.pagination?.next;
                if (!link) {
                    next = null;
                    complete = true;
                }
                else {
                    const u = new URL(link, next);
                    if (u.origin !== 'https://api.open511.gov.bc.ca')
                        throw new Error('Unexpected pagination origin');
                    next = u.href;
                }
            }
            if (!complete)
                throw new Error('Provider pagination exceeded the supported limit');
            items = all.filter(e => e.status === 'ACTIVE' && geometryIntersects(e.geography) && !hasEnded(e)).map(e => ({ id: e.id, name: e.headline, description: e.description, kind: eventKind(e), severity: e.severity, roads: e.roads || [], geometry: e.geography, coordinates: pointOf(e.geography), updatedAt: e.updated, sourceUrl: e.url, schedule: e.schedule, subtypes: e.event_subtypes || [] }));
            sourceUrl = 'https://api.open511.gov.bc.ca/';
            note = 'Published active reports. No returned report does not establish that a road is clear.';
        }
        else if (kind === 'weather') {
            items = array(await json(bc + '/api/weather/current/')).filter(w => inBounds(w.location?.coordinates)).map(w => ({ id: String(w.code), name: w.weather_station_name, description: w.location_description, coordinates: w.location.coordinates, updatedAt: w.issuedUtc, temperature: w.air_temperature, roadTemperature: w.road_temperature, wind: w.average_wind, gust: w.maximum_wind, windDirection: w.wind_direction, snowDepth: w.snow_depth, precipitation: w.precipitation, pavement: w.pavement_grip || w.pavement_status || w.road_condition, visibility: w.visibility, condition: w.present_weather?.label, elevation: w.elevation, sourceUrl: bc }));
            sourceUrl = bc + '/api/weather/current/';
            note = 'Roadside station observations. Missing measurements are left blank.';
        }
        else if (kind === 'forecast') {
            const [regional, high] = await Promise.all([json(bc + '/api/weather/regional/'), json(bc + '/api/weather/hef/')]);
            items = [...array(regional).filter(w => inBounds(w.location?.coordinates)).map(w => ({ id: w.code, name: w.name, type: 'Community', coordinates: w.location.coordinates, updatedAt: w.forecast_issued, observedAt: w.observed, temperature: w.conditions?.temperature_value, condition: w.conditions?.condition, forecasts: (w.forecast_group || []).slice(0, 3).map((f) => ({ label: f.Period?.TextForecastName || f.Period?.Value, summary: f.TextSummary })), warnings: w.warnings, sourceUrl: `https://weather.gc.ca/en/location/index.html?coords=${w.location.coordinates[1]},${w.location.coordinates[0]}` })), ...array(high).filter(w => inBounds(w.location?.coordinates)).map(w => ({ id: w.code, name: w.name, type: 'Mountain highway', coordinates: w.location.coordinates, updatedAt: w.issued_utc, forecasts: (w.forecasts || []).slice(0, 3), warnings: w.warnings, sourceUrl: 'https://weather.gc.ca/mainmenu/alert_menu_e.html' }))];
            source = 'Environment Canada via DriveBC';
            sourceUrl = bc + '/api/weather/regional/';
            note = 'Official forecast text relayed by DriveBC; issue time is preserved. Mountain forecasts cover a highway segment.';
        }
        else {
            const endpoint = 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query';
            const q = new URLSearchParams({ f: 'json', where: "FIRE_STATUS <> 'Out'", geometry: BOUNDS.join(','), geometryType: 'esriGeometryEnvelope', inSR: '4326', spatialRel: 'esriSpatialRelIntersects', outSR: '4326', outFields: 'FIRE_NUMBER,FIRE_YEAR,INCIDENT_NAME,GEOGRAPHIC_DESCRIPTION,FIRE_STATUS,CURRENT_SIZE,IGNITION_DATE,FIRE_URL,FIRE_OF_NOTE_IND', returnGeometry: 'true', resultRecordCount: '1000' });
            const j = await json(endpoint + '?' + q);
            if (j.exceededTransferLimit)
                throw new Error('Wildfire response was truncated');
            items = array(j.features).map(f => { const a = f.attributes; return { id: a.FIRE_NUMBER, name: a.INCIDENT_NAME || a.GEOGRAPHIC_DESCRIPTION || a.FIRE_NUMBER, description: a.GEOGRAPHIC_DESCRIPTION, status: a.FIRE_STATUS, size: a.CURRENT_SIZE, reportedAt: a.IGNITION_DATE ? new Date(a.IGNITION_DATE).toISOString() : null, coordinates: [f.geometry?.x, f.geometry?.y], ofNote: a.FIRE_OF_NOTE_IND === true || a.FIRE_OF_NOTE_IND === 'Y', sourceUrl: a.FIRE_URL || 'https://wildfiresituation.nrs.gov.bc.ca/' }; }).filter(f => inBounds(f.coordinates));
            source = 'BC Wildfire Service';
            sourceUrl = 'https://catalogue.data.gov.bc.ca/dataset/bc-wildfire-fire-locations-current';
            note = 'Reported fires not marked Out. A nearby fire does not by itself mean the highway is affected. No satellite hotspot inference.';
        }
        const body = { ok: true, kind, source, sourceUrl, fetchedAt, items, note };
        cache.set(kind, { at: Date.now(), body });
        return Response.json(body, { headers: { 'Cache-Control': 'private, max-age=30' } });
    }
    catch (e) {
        return Response.json({ ok: false, kind, source: kind === 'fires' ? 'BC Wildfire Service' : 'DriveBC', fetchedAt, error: e instanceof Error ? e.message : 'Feed unavailable', items: [], note: 'Unavailable: this feed cannot establish current conditions.' }, { status: 502 });
    }
}
