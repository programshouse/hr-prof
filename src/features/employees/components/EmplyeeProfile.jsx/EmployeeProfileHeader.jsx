// src/features/employees/components/EmployeeProfileHeader.jsx
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import {
  PencilLine,
  MoreHorizontal,
  Clock,
  CalendarCheck2,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Fingerprint,
  LogIn,
  LogOut,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/services/auth/auth.store';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import { getDeviceLocation } from '@/features/attendance/utils/getDeviceLocation';
import {
  getEmployeeProfileImageSource,
  getHeaderEmployeeData,
} from '@/features/employees/pages/employeesUtils';
import {
  getAttendanceStats,
  getMeetingStats,
  getPerformanceStats,
  getHolidayStats,
} from '@/features/employees/pages/employeesStats';

function uiAvatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Employee'
  )}&background=d1d5db&color=ffffff&size=256&rounded=true`;
}

function normalizeImageUrl(name, url) {
  if (!url) return uiAvatar(name);

  const raw = String(url).trim();

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const base = 'https://www.programshouse.com/hr';
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = raw.replace(/^\//, '');

  return `${cleanBase}/${cleanPath}`;
}

// Builds a small "why did this fail" debug line out of whatever we have on
// hand: the coordinates/accuracy this device just reported, plus any
// distance/radius info the backend included in its response. Nothing here
// is guessed — fields that aren't present are simply left out.
function buildLocationDebugLine(coords, error) {
  const parts = [];

  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    parts.push(
      `Detected: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
    );

    if (Number.isFinite(coords.accuracy)) {
      parts.push(`±${Math.round(coords.accuracy)}m accuracy`);
    }

    if (Number.isFinite(coords.altitude)) {
      const altitudePart = Number.isFinite(coords.altitudeAccuracy)
        ? `Altitude: ${coords.altitude.toFixed(1)}ft ±${Math.round(coords.altitudeAccuracy)}ft`
        : `Altitude: ${coords.altitude.toFixed(1)}ft`;
      parts.push(altitudePart);
    } else {
      parts.push('Altitude: unavailable');
    }
  }

  // Backend sometimes wraps the real payload as a JSON string in `message`.
  let payload = error?.response?.data?.data || error?.response?.data;
  if (typeof error?.response?.data?.message === 'string') {
    try {
      const nested = JSON.parse(error.response.data.message);
      payload = { ...payload, ...nested, ...(nested?.request || {}) };
    } catch {
      // keep original payload
    }
  }

  const distance = payload?.distance;
  const allowedRadius =
    payload?.allowed_radius ?? payload?.branch?.allowed_radius;

  if (distance !== undefined && distance !== null) {
    parts.push(`Distance from branch: ${distance}m`);
  }
  if (allowedRadius !== undefined && allowedRadius !== null) {
    parts.push(`Allowed radius: ${allowedRadius}m`);
  }

  return parts.length ? parts.join(' · ') : null;
}

// Turns a thrown error (backend response, a rejected geolocation promise,
// or an unexpected failure) into a localized, human-readable message.
function resolveAttendanceError(error, t, fallbackKey) {
  let backendMessage =
    error?.response?.data?.message || error?.response?.data?.error;

  // Laravel sometimes returns the real body as a JSON string inside `message`.
  if (typeof backendMessage === 'string' && backendMessage.trim().startsWith('{')) {
    try {
      const nested = JSON.parse(backendMessage);
      backendMessage = nested?.message || backendMessage;
      if (nested?.reason === 'location_accuracy') {
        return t(
          'employees.profile.fingerprint.accuracyTooLow',
          'Location accuracy is too low. Please enable precise GPS (outdoors / near a window) and try again.'
        );
      }
    } catch {
      // use raw backendMessage
    }
  }

  if (backendMessage && typeof backendMessage === 'string') return backendMessage;

  if (error?.message) {
    switch (error.message) {
      case 'PERMISSION_DENIED':
        return t(
          'employees.profile.fingerprint.locationPermissionDenied',
          'Please allow location access to check in / check out.'
        );
      case 'LOCATION_UNAVAILABLE':
        return t(
          'employees.profile.fingerprint.locationUnavailable',
          'Unable to detect your current location. Please try again.'
        );
      case 'LOCATION_UNSUPPORTED':
        return t(
          'employees.profile.fingerprint.locationUnsupported',
          'Location is not supported on this device or browser.'
        );
      case 'ALTITUDE_UNAVAILABLE':
        return t(
          'employees.profile.fingerprint.altitudeUnavailable',
          'Unable to detect your altitude. Please move near a window or outdoors and try again.'
        );
      case 'ACCURACY_TOO_LOW':
        return t(
          'employees.profile.fingerprint.accuracyTooLow',
          'Location accuracy is too low. Please enable precise GPS (outdoors / near a window) and try again.'
        );
      default:
        break;
    }
  }

  return t(
    `employees.profile.fingerprint.${fallbackKey}`,
    fallbackKey === 'checkInError'
      ? 'Failed to record check-in'
      : 'Failed to record check-out'
  );
}

function getEmployeeActiveStatus(value) {
  return (
    value === 1 ||
    value === '1' ||
    value === true ||
    value === 'true'
  );
}

export default function EmployeeProfileHeader({
  employee,
  stats,
  onImageUpload,
  shifts = [],
  positions = [],
}) {
  const { t, i18n } = useTranslation();
  // `role` here is the auth store's portal-login flag ('employee' vs 'hr') —
  // aliased to `portalRole` so it never collides with the employee's own
  // job-title `role` destructured from `headerEmployee` below.
  const { user, role: portalRole } = useAuthStore();
  const fileInputRef = useRef(null);

  const headerEmployee = getHeaderEmployeeData(
    employee,
    shifts,
    positions
  );

  const {
    name,
    role,
    employeeId: profileEmployeeId,
    join_date,
    employmentType,
  } = headerEmployee;

  const isRTL = i18n.language?.startsWith('ar');
  // Whether the person currently logged in came in through the employee
  // self-service portal — NOT the employee's job title (which can be
  // "Account Manager", "HR Manager", etc. and would otherwise hide this
  // card for every job title except one literally called "employee").
  const isEmployeeRole = portalRole === 'employee';

  const expirySource = employee?.employee ?? employee ?? {};
  const contractEndDate = expirySource?.end_date || employee?.end_date || '';
  const nationalIdExpiryDate =
    expirySource?.national_id_expiry_date || employee?.national_id_expiry_date || '';
  const todayDateOnly = new Date();
  todayDateOnly.setHours(0, 0, 0, 0);
  const expiryFlag = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    const days = Math.ceil((date - todayDateOnly) / 86400000);
    if (days < 0) return 'expired';
    if (days <= 30) return 'soon';
    return null;
  };
  const contractFlag = expiryFlag(contractEndDate);
  const nationalIdFlag = expiryFlag(nationalIdExpiryDate);

  const isEmployeeActive = getEmployeeActiveStatus(
    employee?.is_active ??
      headerEmployee?.is_active ??
      employee?.active
  );

  const hasFingerprint =
    employee?.has_fingerprint === 1 ||
    employee?.has_fingerprint === '1' ||
    employee?.has_fingerprint === true ||
    employee?.has_fingerprint === 'true' ||
    employee?.employee?.has_fingerprint === 1 ||
    employee?.employee?.has_fingerprint === true;

  // Use the same authoritative profile-image resolver as the PDF export so
  // the image visible here can never diverge from the exported CV image.
  const resolvedAvatarUrl =
    getEmployeeProfileImageSource(employee) ||
    headerEmployee?.avatarUrl ||
    '';

  const imgSrc = useMemo(() => {
    const src = normalizeImageUrl(
      name,
      resolvedAvatarUrl
    );

    const cacheKey = `${encodeURIComponent(name || 'employee')}-${encodeURIComponent(
      resolvedAvatarUrl || ''
    )}`;
    const hasQuery = src.includes('?');

    return `${src}${hasQuery ? '&' : '?'}cache=${cacheKey}`;
  }, [name, resolvedAvatarUrl]);

  const attendance = getAttendanceStats(
    stats ?? employee,
    t
  );

  const meetings = getMeetingStats(
    stats ?? employee,
    t
  );

  const performance = getPerformanceStats(
    stats ?? employee,
    t
  );

  const holidays = getHolidayStats(
    stats ?? employee,
    t
  );

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = '';

    onImageUpload?.(file);
  };

  const handlePenIconClick = () => {
    fileInputRef.current?.click();
  };

  const currentEmployeeId = employee?.id || employee?.employee_id || user?.id;

  // null | 'locating' | 'submitting' — lets the button copy reflect exactly
  // what's happening (GPS lookup vs. the actual API call).
  const [checkInPhase, setCheckInPhase] = useState(null);
  const [checkOutPhase, setCheckOutPhase] = useState(null);
  const isBusy = Boolean(checkInPhase || checkOutPhase);

  const handleCheckIn = async () => {
    if (!hasFingerprint || isBusy) return;

    let liveCoords = null;

    try {
      // Live GPS position from the device, read automatically at the
      // moment of check-in.
      setCheckInPhase('locating');
      const { lat, lng, accuracy, reportableAccuracy, altitude, altitudeAccuracy } =
        await getDeviceLocation();
      liveCoords = { lat, lng, accuracy, altitude, altitudeAccuracy };

      // Date/time are computed by the server; do not trust the device clock
      // or depend on an external time API.
      setCheckInPhase('submitting');

      const response = await attendanceApi.checkIn({
        employee_id: currentEmployeeId,
        lat,
        lng,
        // Only send accuracy when GPS-quality; coarse Wi‑Fi/IP values
        // (e.g. ±6853m) trigger backend location_accuracy errors.
        accuracy: reportableAccuracy,
        altitude,
        altitude_accuracy: altitudeAccuracy,
      });

      toast.success(
        response?.message ||
          t(
            'employees.profile.fingerprint.checkInSuccess',
            'Check-in recorded successfully'
          ),
        {
          description: buildLocationDebugLine(liveCoords),
          duration: 8000,
        }
      );
    } catch (error) {
      toast.error(resolveAttendanceError(error, t, 'checkInError'), {
        description: buildLocationDebugLine(liveCoords, error) || undefined,
        duration: 8000,
      });
    } finally {
      setCheckInPhase(null);
    }
  };

  const handleCheckOut = async () => {
    if (!hasFingerprint || isBusy) return;

    let liveCoords = null;

    try {
      // Live GPS position from the device, read automatically at the
      // moment of check-out.
      setCheckOutPhase('locating');
      const { lat, lng, accuracy, reportableAccuracy, altitude, altitudeAccuracy } =
        await getDeviceLocation();
      liveCoords = { lat, lng, accuracy, altitude, altitudeAccuracy };

      // Date/time are computed by the server; do not trust the device clock
      // or depend on an external time API.
      setCheckOutPhase('submitting');

      const response = await attendanceApi.checkOut({
        employee_id: currentEmployeeId,
        lat,
        lng,
        // Only send accuracy when GPS-quality; coarse Wi‑Fi/IP values
        // (e.g. ±6853m) trigger backend location_accuracy errors.
        accuracy: reportableAccuracy,
        altitude,
        altitude_accuracy: altitudeAccuracy,
      });

      toast.success(
        response?.message ||
          t(
            'employees.profile.fingerprint.checkOutSuccess',
            'Check-out recorded successfully'
          ),
        {
          description: buildLocationDebugLine(liveCoords),
          duration: 8000,
        }
      );
    } catch (error) {
      toast.error(resolveAttendanceError(error, t, 'checkOutError'), {
        description: buildLocationDebugLine(liveCoords, error) || undefined,
        duration: 8000,
      });
    } finally {
      setCheckOutPhase(null);
    }
  };

  return (
    <div className="space-y-6 sm:my-6">
      <Card className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
              onClick={() => window.history.back()}
              aria-label="Back"
              title="Back"
            >
              <ChevronLeft
                className={isRTL ? 'rotate-180' : ''}
              />
            </button>

            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative">
                <img
                  key={imgSrc}
                  src={imgSrc}
                  alt={name || 'Employee'}
                  className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = uiAvatar(name);
                  }}
                />

                <span
                  className={`absolute bottom-1 right-1 block size-4 rounded-full border-2 border-white md:size-5 ${
                    isEmployeeActive
                      ? 'bg-emerald-500'
                      : 'bg-slate-400'
                  }`}
                  title={
                    isEmployeeActive
                      ? t('employees.stats.active', {
                          defaultValue: 'Active',
                        })
                      : t('employees.stats.inactive', {
                          defaultValue: 'Inactive',
                        })
                  }
                  aria-hidden="true"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handlePenIconClick}
                  className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary p-2 text-white shadow-md transition-colors hover:bg-primary/90 sm:size-9"
                  title="Upload profile picture"
                >
                  <PencilLine className="size-4 sm:size-5" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-lg font-semibold md:text-2xl">
                    {name}
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      isEmployeeActive
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-slate-100 text-slate-600 ring-slate-200'
                    }`}
                  >
                    <span
                      className={`me-1.5 size-1.5 rounded-full ${
                        isEmployeeActive
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    />

                    {isEmployeeActive
                      ? t('employees.stats.active', {
                          defaultValue: 'Active',
                        })
                      : t('employees.stats.inactive', {
                          defaultValue: 'Inactive',
                        })}
                  </span>
                  {contractFlag && (
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${contractFlag === 'expired' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                      {contractFlag === 'expired'
                        ? t('expiryDates.contractExpired', 'Contract expired')
                        : t('expiryDates.contractExpiring', 'Contract expiring')}
                    </span>
                  )}
                  {nationalIdFlag && (
                    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${nationalIdFlag === 'expired' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                      {nationalIdFlag === 'expired'
                        ? t('expiryDates.nationalIdExpired', 'National ID expired')
                        : t('expiryDates.nationalIdExpiring', 'National ID expiring')}
                    </span>
                  )}
                </div>

                <div className="text-lg font-medium text-muted-foreground">
                  {role}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="grid gap-3 text-sm md:grid-cols-3 md:gap-10">
            <ProfileField
              label={t(
                'employees.profile.details.employeeId'
              )}
              value={profileEmployeeId}
            />

            <ProfileField
              label={t(
                'employees.profile.details.joiningDate'
              )}
              value={join_date}
            />

            <ProfileField
              label={t(
                'employees.profile.details.employmentType'
              )}
              value={employmentType}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t(
            'employees.profile.details.summaryCards.attendance.title'
          )}
          items={attendance}
          icon={Clock}
        />

        <StatsCard
          title={t(
            'employees.profile.details.summaryCards.meeting.title'
          )}
          items={meetings}
          icon={CalendarCheck2}
        />

        <StatsCard
          title={t(
            'employees.profile.details.summaryCards.performance.title'
          )}
          items={performance}
          icon={BarChart3}
        />

        <StatsCard
          title={t(
            'employees.profile.details.summaryCards.holidays.title'
          )}
          items={holidays}
          icon={CalendarDays}
        />
      </div>

{isEmployeeRole && hasFingerprint && (
  <Card className="relative overflow-hidden border border-slate-800 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-md">
    {/* Ambient Glow Accents */}
    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Icon & Description */}
      <div className="flex items-start gap-4 sm:items-center sm:gap-5">
        {/* Static Icon Container (Non-Active Slate Styling) */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 shadow-inner">
          <Fingerprint className="h-7 w-7 text-slate-400" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              {t('employees.profile.fingerprint.title', 'Biometric Verification')}
            </h3>
            {/* Status Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t('employees.profile.fingerprint.verifiedActive', 'Verified Active')}
            </span>
          </div>

          <p className="mt-1 max-w-xl text-xs text-slate-400 sm:text-sm">
            {t(
              'employees.profile.fingerprint.description',
              'Record attendance via encrypted biometric signature, automated GPS position, and direct server timestamping.'
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
        {/* Check In Button */}
        <button
          disabled={isBusy}
          onClick={handleCheckIn}
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-emerald-500/30 cursor-pointer bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex items-center justify-center rounded-lg bg-emerald-500/20 p-1.5 transition-colors group-hover:bg-white/20">
            {checkInPhase ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400 group-hover:text-white" />
            ) : (
              <Fingerprint className="h-4 w-4 text-emerald-400 group-hover:text-white" />
            )}
          </div>
          <span className="tracking-wide">
            {checkInPhase === 'locating'
              ? t('employees.profile.fingerprint.acquiringGps', 'Acquiring GPS...')
              : checkInPhase === 'submitting'
              ? t('employees.profile.fingerprint.verifying', 'Verifying...')
              : t('employees.profile.fingerprint.checkIn', 'Scan & Check In')}
          </span>
        </button>

        {/* Check Out Button */}
        <button
          disabled={isBusy}
          onClick={handleCheckOut}
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/10 cursor-pointer px-6 py-3 text-sm font-semibold text-rose-300 transition-all duration-200 hover:border-rose-400 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex items-center justify-center rounded-lg bg-rose-500/20 p-1.5 transition-colors group-hover:bg-white/20">
            {checkOutPhase ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-400 group-hover:text-white" />
            ) : (
              <Fingerprint className="h-4 w-4 text-rose-400 group-hover:text-white" />
            )}
          </div>
          <span className="tracking-wide">
            {checkOutPhase === 'locating'
              ? t('employees.profile.fingerprint.acquiringGps', 'Acquiring GPS...')
              : checkOutPhase === 'submitting'
              ? t('employees.profile.fingerprint.verifying', 'Verifying...')
              : t('employees.profile.fingerprint.checkOut', 'Scan & Check Out')}
          </span>
        </button>
      </div>
    </div>
  </Card>
)}
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <div className="text-sm font-medium uppercase tracking-wide sm:text-base">
        {label}
      </div>

      <div className="mt-0.5 text-sm font-medium text-gray sm:text-base">
        {value || '—'}
      </div>
    </div>
  );
}

function StatsCard({ title, items, icon: Icon }) {
  const safeItems = Array.isArray(items)
    ? items
    : [];

  const cols =
    safeItems.length >= 3 ? 3 : 2;

  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 py-4">
          {Icon ? (
            <Icon className="size-5 text-primary" />
          ) : null}

          <span className="text-sm font-semibold">
            {title}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
          title="More"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div
        className={[
          'mt-3 grid items-center',
          cols === 3
            ? 'grid-cols-[1fr_auto_1fr_auto_1fr]'
            : 'grid-cols-[1fr_auto_1fr]',
        ].join(' ')}
      >
        {safeItems.map((item, index) => {
          const isLast =
            index === safeItems.length - 1;

          return (
            <React.Fragment
              key={`${item.label}-${index}`}
            >
              <div className="text-center">
                <div className="text-[11px] text-muted-foreground">
                  {item.label}
                </div>

                <div
                  className={`mt-1 text-sm font-semibold ${
                    item.color ||
                    'text-foreground'
                  }`}
                >
                  {item.value}
                </div>
              </div>

              {!isLast ? (
                <div className="mx-2 flex justify-center">
                  <div className="h-8 w-px bg-slate-400" />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
