// readsb-compatible APIs report `now` as Unix seconds; some relays use ms.
export function aircraftObservationTime(providerNow,secondsSincePosition){
 if(!Number.isFinite(providerNow))throw Error('Aircraft source time is missing');
 const milliseconds=providerNow<1e12?providerNow*1000:providerNow;
 return new Date(milliseconds-Math.max(0,Number(secondsSincePosition)||0)*1000).toISOString();
}
