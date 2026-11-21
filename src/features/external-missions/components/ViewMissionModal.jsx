import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  CalendarIcon,
  DollarSign,
  User,
  Building2,
  Users,
} from 'lucide-react';
import { getMissionById } from '../api/missions.api';
import { useAllDepartments } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';
import { getMissionStatusLabel } from '../utils/missionStatus';

function InfoCard({ icon: Icon, title, children, t, isArabic = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex items-center gap-2 ${
          isArabic ? 'flex-row-reverse justify-end' : ''
        }`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
          <Icon className="h-4 w-4" />
        </div>

        <h4 className="text-sm font-semibold text-slate-900">
          {typeof t === 'function' ? t(title) : title}
        </h4>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  badge,
  multiline = false,
  t,
  isArabic = false,
}) {
  const labelText = typeof t === 'function' ? t(label) : label;

  return (
    <div
      className={[
        'rounded-xl border border-slate-100 bg-slate-50 px-4 py-3',
        multiline
          ? `flex flex-col gap-2 ${
              isArabic ? 'items-end text-right' : 'items-start text-left'
            }`
          : `flex items-start justify-between gap-4 ${
              isArabic ? 'text-right' : 'text-left'
            }`,
      ].join(' ')}
    >
      <p className="text-xs font-medium text-slate-500">{labelText}</p>

      <div className={multiline ? 'w-full' : isArabic ? 'text-left' : 'text-right'}>
        {badge || (
          <p
            className={[
              'text-sm font-semibold text-slate-900',
              multiline
                ? `${
                    isArabic ? 'text-right' : 'text-left'
                  } whitespace-pre-wrap break-words leading-6`
                : '',
            ].join(' ')}
          >
            {value || '--'}
          </p>
        )}
      </div>
    </div>
  );
}

function Avatar({ src, name }) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
      {src ? (
        <img
          src={src}
          alt={name || 'avatar'}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-500">
          {initial}
        </div>
      )}
    </div>
  );
}

function EmployeeItem({ employee, isArabic = false, t }) {
  const { data: departments = [] } = useAllDepartments();

  const fullName = isArabic
    ? employee?.applicant?.full_name_ar ||
      employee?.full_name_ar ||
      [
        employee?.applicant?.first_name,
        employee?.applicant?.middle_name,
        employee?.applicant?.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()
    : [
        employee?.applicant?.first_name,
        employee?.applicant?.middle_name,
        employee?.applicant?.last_name,
        employee?.name,
        employee?.employee_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

  const employeeId =
    employee?.employee_id ||
    employee?.id ||
    employee?.pivot?.employee_id ||
    employee?.applicant_id ||
    '--';

  const departmentsList = Array.isArray(departments?.data)
    ? departments.data
    : Array.isArray(departments)
      ? departments
      : [];

  const departmentData = departmentsList.find(
    (d) => String(d.id) === String(employee?.department_id)
  );

  const departmentName = isArabic
    ? departmentData?.name_ar ||
      departmentData?.name_en ||
      t('externalMissions.viewModal.departmentIdFallback', {
        id: employee?.department_id || '—',
      })
    : departmentData?.name_en ||
      departmentData?.name ||
      departmentData?.name_ar ||
      t('externalMissions.viewModal.departmentIdFallback', {
        id: employee?.department_id || '—',
      });

  return (
    <div
      className={`flex items-center gap-3 ${
        isArabic ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <Avatar src={employee?.image} name={fullName} />

      <div className={`min-w-0 ${isArabic ? 'text-right' : 'text-left'}`}>
        <div className="truncate text-sm font-semibold text-slate-900">
          {fullName || '—'}
        </div>

        <div className="text-xs text-slate-500">
          {t('externalMissions.viewModal.employeeId')}: {employeeId}
        </div>

        <div className="text-xs text-slate-400">
          {departmentName}
        </div>
      </div>
    </div>
  );
}

export default function ViewMissionModal({
  open,
  onOpenChange,
  mission,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';

  const [missionDetails, setMissionDetails] = useState(mission);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && mission?.id) {
      const fetchMissionDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await getMissionById(mission.id);
          setMissionDetails(response?.data || mission);
        } catch (err) {
          setError(err?.message || t('externalMissions.viewModal.fetchError'));

          console.error('Error fetching mission details:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMissionDetails();
    } else if (mission) {
      setMissionDetails(mission);
    }
  }, [open, mission, t]);

  if (!mission) return null;

  const currentMission = missionDetails || mission;

  const employeeList = Array.isArray(currentMission?.employees)
    ? currentMission.employees
    : [];

  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();

    switch (s) {
      case 'finished':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';

      case 'ongoing':
      case 'active':
        return 'bg-indigo-100 text-primary border-indigo-200';

      case 'upcoming':
      case 'planning':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      case 'canceled':
      case 'cancelled':
        return 'bg-amber-100 text-amber-700 border-amber-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatMoney = (value) => {
    const amount = value ?? 0;

    if (amount === '--') return '--';

    return Number(amount || 0).toLocaleString();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`
            max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-6
            ${isArabic
              ? 'text-right [&>button]:left-4 [&>button]:right-auto'
              : 'text-left'}
          `}
        >
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />

              <p className="text-sm text-slate-500">
                {t('externalMissions.viewModal.loadingMissionDetails')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir={isArabic ? 'rtl' : 'ltr'}
          className={`
            max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-6
            ${isArabic
              ? 'text-right [&>button]:left-4 [&>button]:right-auto'
              : 'text-left'}
          `}
        >
          <div className="py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-4 rounded-xl border-slate-200"
            >
              {t('externalMissions.viewModal.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isArabic ? 'rtl' : 'ltr'}
        className={`
          max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-0
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={`border-b border-slate-200 bg-white px-6 py-5 ${
            isArabic ? 'items-end text-right' : 'items-start text-left'
          }`}
        >
          <DialogTitle
            className={isArabic ? 'w-full text-right' : 'text-left'}
          >
            {t('externalMissions.viewModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {employeeList.length > 0 && (
            <InfoCard
              icon={Users}
              title="externalMissions.viewModal.assignedEmployees"
              t={t}
              isArabic={isArabic}
            >
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="grid max-h-[360px] grid-cols-1 gap-0 overflow-auto md:grid-cols-2">
                  <div className="space-y-6 p-5">
                    {employeeList
                      .slice(0, Math.ceil(employeeList.length / 2))
                      .map((emp, index) => (
                        <EmployeeItem
                          key={emp.id || emp.employee_id || index}
                          employee={emp}
                          isArabic={isArabic}
                          t={t}
                        />
                      ))}
                  </div>

                  <div
                    className={[
                      'space-y-6 border-t border-slate-200 p-5 md:border-t-0',
                      isArabic ? 'md:border-r' : 'md:border-l',
                    ].join(' ')}
                  >
                    {employeeList
                      .slice(Math.ceil(employeeList.length / 2))
                      .map((emp, index) => (
                        <EmployeeItem
                          key={emp.id || emp.employee_id || index}
                          employee={emp}
                          isArabic={isArabic}
                          t={t}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </InfoCard>
          )}

          {employeeList.length === 0 && (
            <InfoCard
              icon={User}
              title="externalMissions.viewModal.employeeInformation"
              t={t}
              isArabic={isArabic}
            >
              <InfoItem
                label="externalMissions.viewModal.employeeName"
                value={
                  currentMission.employeeName ||
                  currentMission.employee_name
                }
                t={t}
                isArabic={isArabic}
              />

              <InfoItem
                label="externalMissions.viewModal.employeeId"
                value={
                  currentMission.employeeId ||
                  currentMission.employee_id
                }
                t={t}
                isArabic={isArabic}
              />
            </InfoCard>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <InfoCard
              icon={Building2}
              title="externalMissions.viewModal.missionDetails"
              t={t}
              isArabic={isArabic}
            >
              <InfoItem
                label="externalMissions.viewModal.status"
                t={t}
                isArabic={isArabic}
                badge={
                  <Badge
                    className={`rounded-md border px-3 py-1 text-xs font-semibold ${getStatusColor(
                      currentMission.status
                    )}`}
                  >
                    {getMissionStatusLabel(currentMission.status, t)}
                  </Badge>
                }
              />
            </InfoCard>

            <InfoCard
              icon={MapPin}
              title="externalMissions.viewModal.locationAndPurpose"
              t={t}
              isArabic={isArabic}
            >
              <InfoItem
                label="externalMissions.viewModal.destination"
                value={currentMission.destination}
                t={t}
                isArabic={isArabic}
              />

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p
                  className={`mb-2 text-xs font-medium text-slate-500 ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                >
                  {t('externalMissions.viewModal.purpose')}
                </p>

                <div
                  className={`
                    min-h-[96px] whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-900
                    ${isArabic ? 'text-right' : 'text-left'}
                  `}
                >
                  {currentMission.purpose || '--'}
                </div>
              </div>
            </InfoCard>

            <InfoCard
              icon={CalendarIcon}
              title="externalMissions.viewModal.schedule"
              t={t}
              isArabic={isArabic}
            >
              <InfoItem
                label="externalMissions.viewModal.startDate"
                value={
                  currentMission.start_date ||
                  currentMission.startDate
                }
                t={t}
                isArabic={isArabic}
              />

              <InfoItem
                label="externalMissions.viewModal.endDate"
                value={
                  currentMission.end_date ||
                  currentMission.endDate
                }
                t={t}
                isArabic={isArabic}
              />
            </InfoCard>
          </div>

          <InfoCard
            icon={DollarSign}
            title="externalMissions.viewModal.financialInformation"
            t={t}
            isArabic={isArabic}
          >
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div
                className={`flex items-center justify-between gap-4 ${
                  isArabic ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={isArabic ? 'text-right' : 'text-left'}>
                  <p className="text-xs font-medium text-slate-500">
                    {t(
                      'externalMissions.viewModal.estimatedCostDescription'
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {t(
                      'externalMissions.viewModal.totalExpectedMissionExpense'
                    )}
                  </p>
                </div>

                <div className={isArabic ? 'text-left' : 'text-right'}>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatMoney(
                      currentMission.estimated_cost ??
                        currentMission.estimatedCost
                    )}
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          <div
            className={`flex gap-3 border-t border-slate-200 pt-4 ${
              isArabic ? 'justify-start' : 'justify-end'
            }`}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200"
            >
              {t('externalMissions.viewModal.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}