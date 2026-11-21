import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation';
import KpiEmployeeCard from './KpiEmployeeCard';
import ResetKpiDialog from './ResetKpiDialog';
import { EmptyState } from '@/components/error/EmptyState';

import { employeesApi } from '@/features/employees/api/employees.api';
import { employeeKpiApi } from '@/features/kpi/api/employeeKpi.api';
import { employeeKpiKeys } from '@/features/kpi/api/employeeKpi.keys';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.employees)) return value.employees;
  if (Array.isArray(value?.data?.employees)) return value.data.employees;
  if (Array.isArray(value?.data?.data?.employees)) return value.data.data.employees;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  if (Array.isArray(value?.data)) return value.data;

  return [];
};

const getEmployeeId = (employee) =>
  String(
    employee?.employee_id ??
      employee?.id ??
      employee?.pivot?.employee_id ??
      employee?.employee?.id ??
      ''
  );

const normalizeEmployee = (employee, hasKpi = false) => {
  const id = getEmployeeId(employee);

  return {
    ...employee,

    employee_id: id,

    employee_name:
      employee?.employee_name ||
      employee?.full_name ||
      employee?.name ||
      employee?.basic?.full_name ||
      employee?.applicant?.full_name ||
      [
        employee?.applicant?.first_name,
        employee?.applicant?.middle_name,
        employee?.applicant?.last_name,
      ]
        .filter(Boolean)
        .join(' ') ||
      '—',

    employee_code:
      employee?.employee_code ||
      employee?.code ||
      employee?.basic?.employeeId ||
      id,

    position:
      employee?.position?.name ||
      employee?.position?.name_en ||
      (typeof employee?.position === 'string'
        ? employee.position
        : '') ||
      employee?.position_name ||
      employee?.employee_position ||
      employee?.work?.positionName ||
      '',

    position_id:
      employee?.position_id ||
      employee?.position?.id ||
      employee?.work?.position_id ||
      null,

    department_id:
      employee?.department_id ||
      employee?.department?.id ||
      employee?.work?.department_id ||
      null,

    avatarUrl:
      employee?.avatarUrl ||
      employee?.avatar ||
      employee?.image ||
      employee?.photo ||
      '',

    has_kpi: hasKpi,
  };
};

const getFormData = (response) =>
  response?.data?.data ??
  response?.data ??
  null;

export default function ManagerTeamKpiSection({
  managerId,
}) {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const queryClient = useQueryClient();

  const isArabic =
    i18n.language?.startsWith('ar');

  const now = new Date();

  const initialMonth =
    Number(searchParams.get('month')) ||
    now.getMonth() + 1;

  const initialYear =
    Number(searchParams.get('year')) ||
    now.getFullYear();

  const [date, setDate] = useState(
    new Date(
      initialYear,
      initialMonth - 1,
      1
    )
  );

  const [
    confirmResetEmp,
    setConfirmResetEmp,
  ] = useState(null);

  const [
    isResetting,
    setIsResetting,
  ] = useState(false);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  /*
   * =========================================================
   * MANAGER TEAM MEMBERS
   * =========================================================
   *
   * Source:
   *
   * GET /team-members/{managerId}
   */
  const {
    data: teamResponse,
    isLoading: teamLoading,
    isFetching: teamFetching,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: [
      'manager-team-kpi-members',
      String(managerId || ''),
    ],

    queryFn: () =>
      employeesApi.getManagerTeamMembers(
        String(managerId),
        1,
        1000,
        ''
      ),

    enabled: !!managerId,

    retry: false,
  });

  /*
   * =========================================================
   * NORMALIZE TEAM MEMBERS
   * =========================================================
   */
  const members = useMemo(() => {
    const list = toArray(teamResponse);

    const seen = new Set();

    return list.filter((employee) => {
      const id = getEmployeeId(employee);

      if (!id || seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    });
  }, [teamResponse]);

  /*
   * =========================================================
   * CHECK KPI FOR EACH EMPLOYEE
   * =========================================================
   */
  const kpiFormQueries = useQueries({
    queries: members.map(
      (employee) => {
        const employeeId =
          getEmployeeId(employee);

        return {
          queryKey:
            employeeKpiKeys.form(
              employeeId,
              year,
              month
            ),

          queryFn: () =>
            employeeKpiApi.getEmployeeKpiForm({
              employeeId,
              year,
              month,
            }),

          enabled: !!employeeId,

          retry: false,

          staleTime: 30 * 1000,
        };
      }
    ),
  });

  /*
   * =========================================================
   * BUILD EMPLOYEE KPI CARDS
   * =========================================================
   */
  const employees = useMemo(
    () =>
      members.map(
        (employee, index) => {
          const formResponse =
            kpiFormQueries[index]?.data;

          const formData =
            getFormData(formResponse);

          const items =
            Array.isArray(
              formData?.items
            )
              ? formData.items
              : [];

          const hasKpi =
            employee?.has_kpi === true ||
            employee?.has_kpi === 1 ||
            employee?.has_kpi === '1' ||
            items.length > 0;

          return normalizeEmployee(
            employee,
            hasKpi
          );
        }
      ),
    [
      members,
      kpiFormQueries,
    ]
  );

  const isKpiStateLoading =
    kpiFormQueries.some(
      (query) => query.isLoading
    );

  const isBusy =
    teamLoading ||
    teamFetching;

  /*
   * =========================================================
   * OPEN EMPLOYEE KPI
   * =========================================================
   */
  const openEmployeeKpi = (
    employee,
    {
      openAddKpi = false,
    } = {}
  ) => {
    const employeeId =
      getEmployeeId(employee);

    if (!employeeId) {
      return;
    }

    const qs =
      new URLSearchParams();

    qs.set(
      'year',
      String(year)
    );

    qs.set(
      'month',
      String(month)
    );

    navigate(
      `/kpi-performance/${employeeId}?${qs.toString()}`,
      {
        state: {
          fromTeam: true,

          openAddKpi,

          employee:
            normalizeEmployee(
              employee,
              employee?.has_kpi
            ),
        },
      }
    );
  };

  /*
   * =========================================================
   * RESET KPI
   * =========================================================
   */
  const handleReset = async () => {
    if (!confirmResetEmp) {
      return;
    }

    const employeeId =
      getEmployeeId(
        confirmResetEmp
      );

    if (!employeeId) {
      return;
    }

    setIsResetting(true);

    try {
      await employeeKpiApi.resetEmployeeKpi({
        employeeId,
        year,
        month,
      });

      toast.success(
        t(
          'managerTeamKpi.messages.resetSuccess'
        )
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            employeeKpiKeys.form(
              employeeId,
              year,
              month
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            employeeKpiKeys.scores(
              employeeId,
              year,
              month
            ),
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'manager-team-kpi-members',
            String(managerId || ''),
          ],
        }),
      ]);

      await refetchTeam();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          t(
            'managerTeamKpi.messages.resetError'
          )
      );
    } finally {
      setIsResetting(false);

      setConfirmResetEmp(null);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="space-y-6"
    >
      {/* Month navigation */}
      <MonthNavigation
        date={date}
        onDateChange={(
          newDate
        ) => {
          const nextDate =
            new Date(
              newDate.getFullYear(),
              newDate.getMonth(),
              1
            );

          setDate(nextDate);

          setSearchParams(
            (prev) => {
              const next =
                new URLSearchParams(
                  prev
                );

              next.set(
                'tab',
                'teams'
              );

              next.set(
                'subtab',
                'kpi'
              );

              next.set(
                'month',
                String(
                  nextDate.getMonth() +
                    1
                )
              );

              next.set(
                'year',
                String(
                  nextDate.getFullYear()
                )
              );

              return next;
            },
            {
              replace: true,
            }
          );
        }}
      />

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">
          {t(
            'managerTeamKpi.title'
          )}
        </h2>

        <p className="text-muted-foreground text-sm">
          {t(
            'managerTeamKpi.description',
            {
              month,
              year,
            }
          )}
        </p>
      </div>

      {/* Loading */}
      {isBusy ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map(
            (_, index) => (
              <KpiEmployeeCard
                key={index}
                loading
              />
            )
          )}
        </div>
      ) : employees.length === 0 ? (
        /*
         * EMPTY TEAM
         */
        <div className="rounded-xl border bg-white p-6">
          <EmptyState
            title={t(
              'managerTeamKpi.empty.title'
            )}
            description={t(
              'managerTeamKpi.empty.description'
            )}
          />
        </div>
      ) : (
        <>
          {isKpiStateLoading && (
            <p className="text-muted-foreground text-sm">
              {t(
                'managerTeamKpi.loadingKpiStatus'
              )}
            </p>
          )}

          {/* KPI cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {employees.map(
              (employee) => (
                <KpiEmployeeCard
                  key={
                    employee.employee_id
                  }
                  employee={
                    employee
                  }
                  onOpen={() =>
                    openEmployeeKpi(
                      employee,
                      {
                        openAddKpi:
                          !employee.has_kpi,
                      }
                    )
                  }
                  onReset={() =>
                    setConfirmResetEmp(
                      employee
                    )
                  }
                />
              )
            )}
          </div>
        </>
      )}

      {/* Reset KPI */}
      <ResetKpiDialog
        open={
          !!confirmResetEmp
        }
        onOpenChange={(
          open
        ) =>
          !open &&
          setConfirmResetEmp(
            null
          )
        }
        isProcessing={
          isResetting
        }
        onConfirm={
          handleReset
        }
      />
    </div>
  );
}