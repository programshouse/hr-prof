// src/features/setting/components/BranchModal.jsx
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_LAT = 30.7865;
const DEFAULT_LNG = 31.0004;
const MAX_FLOORS = '';
const DEFAULT_TOLERANCE = '';

const isValidNumber = (value) =>
  value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));

const isValidLat = (value) => isValidNumber(value) && Math.abs(Number(value)) <= 90;
const isValidLng = (value) => isValidNumber(value) && Math.abs(Number(value)) <= 180;

const hasValidLocation = (data) => isValidLat(data?.lat) && isValidLng(data?.lng);
const isAltitudeEnabled = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

// getFloorName(index) returns the localized default name, e.g. "Floor 1" / "الدور 1"
const createFloor = (index, getFloorName) => ({
  floor_name: getFloorName(index),
  altitude: '',
  tolerance: DEFAULT_TOLERANCE,
});

const normalizeAltitudes = (list, getFloorName) =>
  Array.isArray(list)
    ? list.map((item, index) => ({
        id: item?.id, // existing floor id (undefined for new floors)
        floor_name: item?.floor_name ?? getFloorName(index),
        // API returns decimals as strings ("35.50"), keep them as-is for the input
        altitude: item?.altitude ?? '',
        tolerance: item?.tolerance ?? DEFAULT_TOLERANCE,
      }))
    : [];

// Accepts a branch object (any common field names) or just a name string.
const normalizeBranch = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return { name_en: data };

  return {
    ...data,
    name_en: data.name_en ?? data.name ?? data.title ?? data.branch_name ?? '',
    name_ar: data.name_ar ?? '',
    lat: data.lat ?? data.latitude,
    lng: data.lng ?? data.longitude,
    allowed_radius: data.allowed_radius ?? data.radius,
    altitude_enabled: data.altitude_enabled,
    altitudes: data.altitudes ?? data.floors,
  };
};

const getInitialForm = (rawData, getFloorName) => {
  const initialData = normalizeBranch(rawData);
  const altitudes = normalizeAltitudes(initialData?.altitudes, getFloorName);

  return {
    name_en: initialData?.name_en || '',
    name_ar: initialData?.name_ar || '',
    lat: hasValidLocation(initialData) ? Number(initialData.lat) : DEFAULT_LAT,
    lng: hasValidLocation(initialData) ? Number(initialData.lng) : DEFAULT_LNG,
    allowed_radius: initialData?.allowed_radius ?? '',
    altitude_enabled:
      initialData?.altitude_enabled == null
        ? altitudes.length > 0
        : isAltitudeEnabled(initialData.altitude_enabled),
    floors_count: altitudes.length > 0 ? String(altitudes.length) : '',
    altitudes,
  };
};

const getEmptyForm = () => ({
  name_en: '',
  name_ar: '',
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  allowed_radius: '',
  altitude_enabled: false,
  floors_count: '',
  altitudes: [],
});

function MapCenterController({ lat, lng, radius }) {
  const map = useMap();

  useEffect(() => {
    if (!isValidLat(lat) || !isValidLng(lng)) return;

    const center = [Number(lat), Number(lng)];
    const meters = Number(radius);

    if (isValidNumber(radius) && meters > 0) {
      // A detached L.circle has no projected point, so calling getBounds()
      // on it throws "Cannot read properties of undefined (reading 'layerPointToLatLng')".
      // Calculate geographic bounds instead; the visible <Circle /> still uses
      // Leaflet's exact meter-based radius.
      const latitude = Number(lat);
      const longitude = Number(lng);
      const angularRadius = meters / 6371008.8; // Mean Earth radius (meters)
      const latOffset = (angularRadius * 180) / Math.PI;
      const cosLatitude = Math.cos((latitude * Math.PI) / 180);
      const lngOffset =
        cosLatitude > 1e-8
          ? Math.min(180, (angularRadius * 180) / (Math.PI * cosLatitude))
          : 180;
      const south = Math.max(-90, latitude - latOffset);
      const north = Math.min(90, latitude + latOffset);
      const west = Math.max(-180, longitude - lngOffset);
      const east = Math.min(180, longitude + lngOffset);

      map.fitBounds([[south, west], [north, east]], {
        padding: [24, 24],
        maxZoom: 17,
        animate: true,
      });
    } else {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [lat, lng, radius, map]);

  return null;
}

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!isValidLat(position?.lat) || !isValidLng(position?.lng)) return null;

  return <Marker position={[Number(position.lat), Number(position.lng)]} />;
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200';

export default function BranchModal({ open, onClose, onSave, initialData }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  // All branch modal texts live under settings.modals.branch.*
  const tb = (key, options) => t(`settings.modals.branch.${key}`, options);

  const getFloorName = (index) =>
    tb('defaultFloorName', { number: index + 1, defaultValue: 'Floor {{number}}' });

  const [form, setForm] = useState(() => getInitialForm(initialData, getFloorName));
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [formError, setFormError] = useState('');

  // If the user edits lat/lng (or clicks the map) before the browser location
  // arrives, we don't overwrite what they typed.
  const userEditedLocation = useRef(false);

  const isEditMode = Boolean(initialData);

  // Content-based key: the form re-initializes only when the data really changes,
  // not every time the parent re-renders and passes a new object.
  const initialSignature = JSON.stringify(initialData ?? null);

  useEffect(() => {
    if (!open) return;

    userEditedLocation.current = false;
    setLocationError('');
    setFormError('');
    setForm(getInitialForm(initialData, getFloorName));

    // In edit mode, keep saved branch location.
    if (initialData) return;

    // In add mode, use current browser location as the starting value (still editable).
    if (!navigator.geolocation) {
      setLocationError(
        tb('validation.locationUnsupported', {
          defaultValue: 'Current location is not supported by this browser.',
        }),
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!userEditedLocation.current) {
          setForm((prev) => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
        }

        setIsGettingLocation(false);
      },
      () => {
        setLocationError(
          tb('validation.locationFailed', {
            defaultValue:
              'Could not get current location. You can still choose location from map.',
          }),
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSignature]);

  if (!open) return null;

  const resetForm = () => {
    setForm(getEmptyForm());
    setLocationError('');
    setFormError('');
  };

  const updateField = (key, value) => {
    if (key === 'lat' || key === 'lng') userEditedLocation.current = true;

    setFormError('');
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(isRTL ? 'المتصفح لا يدعم تحديد الموقع الحالي.' : 'Your browser does not support geolocation.');
      return;
    }

    setLocationError('');
    setIsGettingLocation(true);
    // Explicit button click takes priority over previously entered coordinates.
    userEditedLocation.current = true;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((prev) => ({
          ...prev,
          lat: coords.latitude,
          lng: coords.longitude,
        }));
        setFormError('');
        setIsGettingLocation(false);
      },
      (error) => {
        const denied = error.code === 1;
        setLocationError(isRTL
          ? (denied ? 'يرجى السماح بالوصول إلى الموقع من إعدادات المتصفح.' : 'تعذر تحديد الموقع الحالي. حاول مرة أخرى.')
          : (denied ? 'Please allow location access in your browser settings.' : 'Could not determine your current location. Please try again.'));
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleMapChange = ({ lat, lng }) => {
    userEditedLocation.current = true;

    setFormError('');
    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  // Number of floors: resize the altitudes list, keeping what was already typed.
  const handleFloorsCountChange = (value) => {
    setFormError('');

    // Empty input: hide the floor questions but keep typed data until a number is entered again.
    if (value === '') {
      setForm((prev) => ({ ...prev, floors_count: '' }));
      return;
    }

    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;

    const count = Math.min(Math.max(parsed, 0), MAX_FLOORS);

    setForm((prev) => ({
      ...prev,
      floors_count: String(count),
      altitudes: Array.from(
        { length: count },
        (_, index) => prev.altitudes[index] ?? createFloor(index, getFloorName),
      ),
    }));
  };

  const updateFloor = (index, key, value) => {
    setFormError('');
    setForm((prev) => ({
      ...prev,
      altitudes: prev.altitudes.map((floor, i) => (i === index ? { ...floor, [key]: value } : floor)),
    }));
  };

  const floorsCount = form.floors_count === '' ? 0 : Number(form.floors_count);
  const visibleFloors =
    form.altitude_enabled && floorsCount > 0 ? form.altitudes.slice(0, floorsCount) : [];

  const handleSave = async () => {
    if (!form.name_en.trim()) {
      setFormError(tb('validation.nameRequired', { defaultValue: 'English name is required.' }));
      return;
    }

    if (!isValidLat(form.lat)) {
      setFormError(
        tb('validation.latInvalid', {
          defaultValue: 'Latitude must be a number between -90 and 90.',
        }),
      );
      return;
    }

    if (!isValidLng(form.lng)) {
      setFormError(
        tb('validation.lngInvalid', {
          defaultValue: 'Longitude must be a number between -180 and 180.',
        }),
      );
      return;
    }

    if (form.allowed_radius !== '' && (!isValidNumber(form.allowed_radius) || Number(form.allowed_radius) < 0)) {
      setFormError(
        tb('validation.radiusInvalid', {
          defaultValue: 'Allowed radius must be a number greater than or equal to 0.',
        }),
      );
      return;
    }

    for (let i = 0; i < visibleFloors.length; i += 1) {
      const floor = visibleFloors[i];
      const floorNumber = i + 1;

      if (!String(floor.floor_name).trim()) {
        setFormError(
          tb('validation.floorNameRequired', {
            floor: floorNumber,
            defaultValue: 'Floor {{floor}}: floor name is required.',
          }),
        );
        return;
      }

      if (!isValidNumber(floor.altitude)) {
        setFormError(
          tb('validation.floorAltitudeInvalid', {
            floor: floorNumber,
            defaultValue: 'Floor {{floor}}: altitude must be a number.',
          }),
        );
        return;
      }

      if (!isValidNumber(floor.tolerance) || Number(floor.tolerance) < 0) {
        setFormError(
          tb('validation.floorToleranceInvalid', {
            floor: floorNumber,
            defaultValue: 'Floor {{floor}}: tolerance must be a number greater than or equal to 0.',
          }),
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      await onSave({
        name_en: form.name_en.trim(),
        name_ar: form.name_ar,
        lat: Number(form.lat),
        lng: Number(form.lng),
        allowed_radius: form.allowed_radius === '' ? null : Number(form.allowed_radius),
        altitude_enabled: form.altitude_enabled ? 1 : 0,
        altitudes: visibleFloors.map((floor, index) => ({
          // existing floors keep their id on update; new floors have none
          ...(floor.id ? { id: floor.id } : {}),
          altitude: Number(floor.altitude),
          floor_number: index + 1,
          floor_name: String(floor.floor_name).trim(),
          tolerance: Number(floor.tolerance),
        })),
      });

      resetForm();
    } catch {
      // The store already shows an error toast. Keep the modal open so nothing is lost.
    } finally {
      setIsSaving(false);
    }
  };

  const mapLat = isValidLat(form.lat) ? Number(form.lat) : DEFAULT_LAT;
  const mapLng = isValidLng(form.lng) ? Number(form.lng) : DEFAULT_LNG;

  const meterUnit = tb('meterUnit', { defaultValue: 'm' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-center text-sm font-semibold text-slate-800">
          {isEditMode ? tb('editTitle') : tb('addTitle')}
        </h2>

        <div className="space-y-5">
          {/* English Name */}
          <div className="space-y-1.5">
            <label className="block text-start text-xs font-medium text-slate-600">
              {tb('nameEn')}
            </label>

            <input
              placeholder={tb('nameEnPlaceholder')}
              value={form.name_en}
              onChange={(e) => updateField('name_en', e.target.value)}
              className={`${inputClass} text-start`}
            />
          </div>

          {/* Arabic Name */}
          <div className="space-y-1.5">
            <label className="block text-start text-xs font-medium text-slate-600">
              {tb('nameAr')}
            </label>

            <input
              placeholder={tb('nameArPlaceholder')}
              value={form.name_ar}
              onChange={(e) => updateField('name_ar', e.target.value)}
              className={`${inputClass} text-start`}
            />
          </div>

          {/* Map */}
          <div className="space-y-1.5">
            <label className="block text-start text-xs font-medium text-slate-600">
              {tb('mapLabel', { defaultValue: 'Select Location from Map' })}
            </label>

            {isGettingLocation ? (
              <p className="text-start text-xs text-slate-400">
                {tb('gettingLocation', { defaultValue: 'Getting current location...' })}
              </p>
            ) : locationError ? (
              <p className="text-start text-xs text-amber-600">{locationError}</p>
            ) : (
              <p className="text-start text-xs text-slate-400">
                {tb('mapHint', {
                  defaultValue:
                    'Click on the map or type the coordinates below to set the branch location.',
                })}
              </p>
            )}

<div dir="ltr" className="flex w-full justify-end">
  <button
    type="button"
    onClick={handleGetCurrentLocation}
    disabled={isGettingLocation || isSaving}
    className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isGettingLocation
      ? isRTL
        ? 'جارٍ تحديد الموقع...'
        : 'Getting current location...'
      : isRTL
        ? 'تحديد موقعي الحالي'
        : 'Get Current Location'}
  </button>
</div>

            {/* Leaflet always renders left-to-right */}
            <div dir="ltr" className="overflow-hidden rounded-xl border border-slate-200">
              <MapContainer
                center={[mapLat, mapLng]}
                zoom={15}
                scrollWheelZoom
                className="h-[260px] w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenterController lat={form.lat} lng={form.lng} radius={form.allowed_radius} />

                {isValidLat(form.lat) &&
                  isValidLng(form.lng) &&
                  isValidNumber(form.allowed_radius) &&
                  Number(form.allowed_radius) > 0 && (
                    <Circle
                      center={[Number(form.lat), Number(form.lng)]}
                      radius={Number(form.allowed_radius)}
                      pathOptions={{
                        color: '#4f46e5',
                        weight: 2,
                        opacity: 0.85,
                        fillColor: '#6366f1',
                        fillOpacity: 0.18,
                      }}
                    />
                  )}

                <LocationPicker
                  position={{
                    lat: form.lat,
                    lng: form.lng,
                  }}
                  onChange={handleMapChange}
                />
              </MapContainer>
            </div>
          </div>

          {/* Lat / Lng (editable) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-start text-[11px] text-slate-500">
                {tb('latitude', { defaultValue: 'Latitude' })}
              </label>

              <input
                type="number"
                step="any"
                min={-90}
                max={90}
                value={form.lat}
                onChange={(e) => updateField('lat', e.target.value)}
                className={`${inputClass} text-start text-slate-700`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-start text-[11px] text-slate-500">
                {tb('longitude', { defaultValue: 'Longitude' })}
              </label>

              <input
                type="number"
                step="any"
                min={-180}
                max={180}
                value={form.lng}
                onChange={(e) => updateField('lng', e.target.value)}
                className={`${inputClass} text-start text-slate-700`}
              />
            </div>
          </div>

          {/* Allowed Radius */}
          <div className="space-y-1.5">
            <label className="block text-start text-xs font-medium text-slate-600">
              {tb('allowedRadius')}
            </label>

            <div className="relative">
              <input
                type="number"
                min={0}
                placeholder={tb('allowedRadiusPlaceholder')}
                value={form.allowed_radius}
                onChange={(e) => updateField('allowed_radius', e.target.value)}
                className={`${inputClass} pe-10 text-start`}
              />

              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                {meterUnit}
              </span>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-start text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={form.altitude_enabled}
              onChange={(e) => updateField('altitude_enabled', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {tb('altitudeEnabled', { defaultValue: 'Enable altitude / floors' })}
          </label>

          {form.altitude_enabled ? (
            <>
              {/* Number of floors */}
              <div className="space-y-1.5">
                <label className="block text-start text-xs font-medium text-slate-600">
                  {tb('floorsCount', { defaultValue: 'Number of Floors' })}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={tb('floorsCountPlaceholder', { defaultValue: 'e.g. 2' })}
                  value={form.floors_count}
                  onChange={(e) => handleFloorsCountChange(e.target.value.replace(/\D/g, ''))}
                  className={`${inputClass} text-start`}
                />

                <p className="text-start text-xs text-slate-400">
                  {tb('floorsHint', {
                    defaultValue: 'Enter how many floors this branch has, then fill in each floor below.',
                  })}
                </p>
              </div>

              {/* One block of questions per floor */}
              {visibleFloors.map((floor, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-start text-xs font-semibold text-slate-700">
                    {tb('floor', { defaultValue: 'Floor' })} {index + 1}
                  </p>

                  <div className="space-y-1">
                    <label className="block text-start text-[11px] text-slate-500">
                      {tb('floorName', { defaultValue: 'Floor Name' })}
                    </label>

                    <input
                      value={floor.floor_name}
                      onChange={(e) => updateFloor(index, 'floor_name', e.target.value)}
                      placeholder={tb('floorNamePlaceholder', { defaultValue: 'e.g. First Floor' })}
                      className={`${inputClass} bg-white text-start`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-start text-[11px] text-slate-500">
                        {tb('altitude', { defaultValue: 'Altitude' })}
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={floor.altitude}
                          onChange={(e) => updateFloor(index, 'altitude', e.target.value)}
                          placeholder={tb('altitudePlaceholder', { defaultValue: 'e.g. 35.5' })}
                          className={`${inputClass} bg-white pe-8 text-start`}
                        />

                        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                          {meterUnit}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-start text-[11px] text-slate-500">
                        {tb('tolerance', { defaultValue: 'Tolerance' })}
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          step=".01"
                          min={0}
                          value={floor.tolerance}
                          onChange={(e) => updateFloor(index, 'tolerance', e.target.value)}
                          placeholder={tb('tolerancePlaceholder', { defaultValue: 'e.g. 5' })}
                          className={`${inputClass} bg-white pe-8 text-start`}
                        />

                        <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                          {meterUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {formError ? <p className="text-start text-xs text-red-500">{formError}</p> : null}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('settings.actions.cancel')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? t('common.loading', 'Loading...') : tb('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
