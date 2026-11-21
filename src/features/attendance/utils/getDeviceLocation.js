// src/features/attendance/utils/getDeviceLocation.js
//
// FREE + STABLE fingerprint location strategy
// -------------------------------------------
// 1) latitude / longitude / horizontal accuracy come from the browser's
//    high-accuracy Geolocation API. On Chrome/Android this can use the same
//    underlying Google Location Services that Google Maps uses, without
//    requiring a Google Maps API key from this app.
// 2) Device GPS altitude is intentionally NOT used because it can jump by
//    many meters between readings even while the employee is standing still.
// 3) Ground elevation is resolved from Open-Meteo's free elevation endpoint.
// 4) The elevation lookup coordinates are normalized to about an 11 m grid so
//    tiny GPS drift does not produce a different DEM cell/value every refresh.
// 5) Elevation is cached in localStorage by normalized coordinates so the same
//    place keeps the same value across refreshes/days on that browser/device.
// 6) Backend expects altitude in FEET, so meters are converted before return.
//
// NOTE: terrain elevation represents ground level. It cannot reliably detect
// a building floor. No map/elevation service can infer floor number from only
// latitude/longitude.

const METERS_TO_FEET = 3.280839895;

export const GOOD_ACCURACY_M = 35;
export const MAX_REPORTABLE_ACCURACY_M = 150;

const DEFAULT_MAX_WAIT_MS = 7000;
const GEOLOCATION_SAMPLE_MAX_AGE_MS = 0;
const ELEVATION_TIMEOUT_MS = 5000;
const NORMALIZE_DECIMALS = 4;
const ELEVATION_CACHE_PREFIX = "fingerprint_elevation_v2:";
const ELEVATION_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const isNum = (value) =>
  value !== null &&
  value !== undefined &&
  Number.isFinite(Number(value));

const metersToFeet = (meters) => Number(meters) * METERS_TO_FEET;

const normalizeCoordinate = (value) =>
  Number(Number(value).toFixed(NORMALIZE_DECIMALS));

const getElevationCacheKey = (lat, lng) =>
  `${ELEVATION_CACHE_PREFIX}${normalizeCoordinate(lat)},${normalizeCoordinate(lng)}`;

const readElevationCache = (lat, lng) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getElevationCacheKey(lat, lng));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!isNum(parsed?.elevationMeters) || !isNum(parsed?.savedAt)) {
      return null;
    }

    if (Date.now() - Number(parsed.savedAt) > ELEVATION_CACHE_TTL_MS) {
      window.localStorage.removeItem(getElevationCacheKey(lat, lng));
      return null;
    }

    return Number(parsed.elevationMeters);
  } catch (error) {
    console.warn("Unable to read elevation cache:", error);
    return null;
  }
};

const writeElevationCache = (lat, lng, elevationMeters) => {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    !isNum(elevationMeters)
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      getElevationCacheKey(lat, lng),
      JSON.stringify({
        elevationMeters: Number(elevationMeters),
        savedAt: Date.now(),
      })
    );
  } catch (error) {
    console.warn("Unable to save elevation cache:", error);
  }
};

async function fetchJson(url, timeoutMs = ELEVATION_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Elevation HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchElevationOpenMeteo(lat, lng) {
  const lookupLat = normalizeCoordinate(lat);
  const lookupLng = normalizeCoordinate(lng);

  const cachedElevation = readElevationCache(lookupLat, lookupLng);

  if (isNum(cachedElevation)) {
    return {
      elevationMeters: Number(cachedElevation),
      source: "open_meteo_cache",
      lookupLat,
      lookupLng,
    };
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/elevation" +
      `?latitude=${encodeURIComponent(lookupLat)}` +
      `&longitude=${encodeURIComponent(lookupLng)}`;

    const data = await fetchJson(url);
    const elevation = Array.isArray(data?.elevation)
      ? data.elevation[0]
      : data?.elevation;

    if (!isNum(elevation)) {
      return null;
    }

    const elevationMeters = Number(elevation);
    writeElevationCache(lookupLat, lookupLng, elevationMeters);

    return {
      elevationMeters,
      source: "open_meteo",
      lookupLat,
      lookupLng,
    };
  } catch (error) {
    console.warn("Open-Meteo elevation unavailable:", error);
    return null;
  }
}

export function getReportableAccuracy(accuracy) {
  if (!isNum(accuracy)) {
    return null;
  }

  const value = Number(accuracy);
  return value <= MAX_REPORTABLE_ACCURACY_M ? value : null;
}

function getHorizontalPosition({
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
  goodAccuracyM = GOOD_ACCURACY_M,
} = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("LOCATION_UNSUPPORTED"));
      return;
    }

    let watchId = null;
    let timer = null;
    let finished = false;
    let bestPosition = null;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (timer) {
        clearTimeout(timer);
      }
    };

    const succeed = (position) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      resolve(position);
    };

    const fail = (code) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      reject(new Error(code));
    };

    const saveIfBetter = (position) => {
      if (!bestPosition) {
        bestPosition = position;
        return;
      }

      const currentAccuracy = isNum(bestPosition.coords.accuracy)
        ? Number(bestPosition.coords.accuracy)
        : Infinity;

      const newAccuracy = isNum(position.coords.accuracy)
        ? Number(position.coords.accuracy)
        : Infinity;

      if (newAccuracy < currentAccuracy) {
        bestPosition = position;
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        saveIfBetter(position);

        const accuracy = isNum(position.coords.accuracy)
          ? Number(position.coords.accuracy)
          : null;

        console.log("Fingerprint GPS sample:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy,
          deviceAltitudeIgnored: position.coords.altitude,
          deviceAltitudeAccuracyIgnored: position.coords.altitudeAccuracy,
        });

        if (isNum(accuracy) && accuracy <= goodAccuracyM) {
          succeed(position);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          fail("PERMISSION_DENIED");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: GEOLOCATION_SAMPLE_MAX_AGE_MS,
        timeout: maxWaitMs,
      }
    );

    timer = setTimeout(() => {
      if (bestPosition) {
        succeed(bestPosition);
        return;
      }

      fail("LOCATION_UNAVAILABLE");
    }, maxWaitMs);
  });
}

async function resolveStableGroundAltitude(lat, lng) {
  const result = await fetchElevationOpenMeteo(lat, lng);

  if (!result || !isNum(result.elevationMeters)) {
    return {
      altitude: null,
      altitudeAccuracy: null,
      altitudeSource: null,
      elevationLookupLat: normalizeCoordinate(lat),
      elevationLookupLng: normalizeCoordinate(lng),
    };
  }

  return {
    altitude: Number(metersToFeet(result.elevationMeters).toFixed(2)),
    altitudeAccuracy: null,
    altitudeSource: result.source,
    elevationLookupLat: result.lookupLat,
    elevationLookupLng: result.lookupLng,
  };
}

export async function getDeviceLocation(options = {}) {
  const startedAt = performance.now();

  const position = await getHorizontalPosition({
    maxWaitMs: options.maxWaitMs ?? DEFAULT_MAX_WAIT_MS,
    goodAccuracyM: options.goodAccuracyM ?? GOOD_ACCURACY_M,
  });

  const coords = position.coords;
  const lat = Number(coords.latitude);
  const lng = Number(coords.longitude);
  const accuracy = isNum(coords.accuracy) ? Number(coords.accuracy) : null;

  const {
    altitude,
    altitudeAccuracy,
    altitudeSource,
    elevationLookupLat,
    elevationLookupLng,
  } = await resolveStableGroundAltitude(lat, lng);

  const result = {
    lat,
    lng,
    accuracy,
    reportableAccuracy: getReportableAccuracy(accuracy),
    altitude,
    altitudeAccuracy,
    altitudeSource,
  };

  console.log("Fingerprint location selected:", {
    ...result,
    elevationLookupLat,
    elevationLookupLng,
    deviceAltitudeIgnored: coords.altitude,
    deviceAltitudeAccuracyIgnored: coords.altitudeAccuracy,
    durationMs: Math.round(performance.now() - startedAt),
  });

  return result;
}

export default getDeviceLocation;
