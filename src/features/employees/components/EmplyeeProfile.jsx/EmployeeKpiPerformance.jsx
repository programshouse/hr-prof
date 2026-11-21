// src/features/employees/components/EmployeeKpiPerformance.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { employeesApi } from '@/features/employees/api/employees.api';
import { employeeKpiApi } from '@/features/kpi/api/employeeKpi.api';
import kpiApi from '@/features/settings/api/kpi.api';
import { useAuthStore } from '@/services/auth/auth.store';

import { toast } from 'sonner';

import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from 'lucide-react';

import KpiItemForm from './components/KpiItemForm';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/* =========================================================
   MONTH AVATAR
========================================================= */

function MonthAvatar({ year, month, hasKpi }) {
  const label = `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-900">
      {MONTHS[month - 1]}

      <span className="absolute -right-1 -top-1">
        {hasKpi ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-red-500" />
        )}
      </span>

      <span className="sr-only">
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   KPI MONTH CARD
========================================================= */

function KpiMonthCard({
  item,
  onPreview,
  onEnter,
  onReset,
  isEmployeePortal = false,
  loading = false,
}) {
  const hasKpi = !!item?.has_kpi;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-slate-100" />

        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-100" />

        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="mt-5 h-9 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        hasKpi
          ? 'border-success'
          : 'border-red-500'
      }`}
    >
      <MonthAvatar
        year={item.year}
        month={item.month}
        hasKpi={hasKpi}
      />

      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-slate-900">
          {MONTHS[item.month - 1]} {item.year}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {item.ym}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        {hasKpi ? (
          <>
            {/* RESET - NOT FOR EMPLOYEE */}

            {!isEmployeePortal && (
              <Button
                variant="outline"
                className="h-9 w-1/2 rounded-full border-slate-400 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                onClick={onReset}
              >
                Reset
              </Button>
            )}

            {/* PREVIEW - AVAILABLE FOR ALL */}

            <Button
              className={`h-9 rounded-full bg-green-600 text-white hover:bg-green-700 ${
                isEmployeePortal
                  ? 'w-full'
                  : 'w-1/2'
              }`}
              onClick={onPreview}
            >
              Preview
            </Button>
          </>
        ) : (
          <>
            {/* ENTER KPI - NOT FOR EMPLOYEE */}

            {!isEmployeePortal && (
              <Button
                variant="outline"
                className="h-9 w-full rounded-full border-red-500 text-red-600 hover:bg-red-50"
                onClick={onEnter}
              >
                Enter KPI
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EmployeeKpiPerformance({
  employeeId,
  isLoading = false,
  employee,
}) {
  const { t, i18n } = useTranslation();

  const isRTL =
    i18n.language === 'ar';

  const navigate =
    useNavigate();

  const qc =
    useQueryClient();

  /* =======================================================
     EMPLOYEE PORTAL

     SAME METHOD USED IN EmployeeMeetings
  ======================================================= */

  const isEmployeePortal = useAuthStore(
    (state) =>
      state.authSource === 'employee-login'
  );

  const canManageKpi =
    !isEmployeePortal;

  /* =======================================================
     SEARCH PARAMS / TABS
  ======================================================= */

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const subtabFromUrl =
    searchParams.get('subtab');

  const [
    activeTab,
    setActiveTabState,
  ] = useState(
    subtabFromUrl || 'items'
  );

  useEffect(() => {
    if (
      subtabFromUrl &&
      subtabFromUrl !== activeTab
    ) {
      setActiveTabState(
        subtabFromUrl
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtabFromUrl]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);

    setSearchParams(
      (prev) => {
        const next =
          new URLSearchParams(prev);

        next.set(
          'tab',
          'kpiPerformance'
        );

        next.set(
          'subtab',
          tab
        );

        return next;
      },
      {
        replace: true,
      }
    );
  };

  /* =======================================================
     STATE
  ======================================================= */

  const [
    confirmReset,
    setConfirmReset,
  ] = useState(null);

  const [
    isResetting,
    setIsResetting,
  ] = useState(false);

  const [
    isKpiModalOpen,
    setIsKpiModalOpen,
  ] = useState(false);

  const [
    deleteConfirmKpi,
    setDeleteConfirmKpi,
  ] = useState(null);

  const employeeKpiItems =
    employee?.kpi_items || [];

  const kpiLoading = false;

  /* =======================================================
     CREATE KPI ITEM
  ======================================================= */

  const createKpiItem = async (data) => {
    if (isEmployeePortal) {
      return;
    }

    try {
      const positionId =
        employee?.work?.position_id ||
        employee?.position_id;

      const response =
        await kpiApi.create({
          item:
            data.custom_item,

          max_score:
            data.max_score,

          position_id:
            positionId,

          is_custom:
            true,
        });

      toast.success(
        'KPI item created successfully'
      );

      qc.invalidateQueries({
        queryKey: [
          'employee-details',
          employeeId,
        ],
      });

      return (
        response.data?.data ||
        response.data
      );
    } catch (err) {
      console.error(
        'Failed to create employee KPI item:',
        err
      );

      throw err;
    }
  };

  /* =======================================================
     DELETE KPI ITEM
  ======================================================= */

  const deleteKpiItem = async (
    kpiItemId
  ) => {
    if (isEmployeePortal) {
      return;
    }

    try {
      await employeeKpiApi.excludeKpiItem(
        employeeId,
        kpiItemId
      );

      toast.success(
        'KPI item deleted successfully'
      );

      qc.invalidateQueries({
        queryKey: [
          'employee-details',
          employeeId,
        ],
      });
    } catch (err) {
      console.error(
        'Failed to delete employee KPI item:',
        err
      );

      throw err;
    }
  };

  /* =======================================================
     KPI MONTHS
  ======================================================= */

  const {
    data: kpiMonthsData,
    isLoading:
      isKpiMonthsLoading,
  } = useQuery({
    queryKey: [
      'employee-kpi-months',
      employeeId,
    ],

    queryFn: () =>
      employeesApi.getEmployeeKpiMonths(
        employeeId
      ),

    enabled:
      !!employeeId,

    retry: false,
  });

  const isComponentLoading =
    isLoading ||
    isKpiMonthsLoading;

  /* =======================================================
     FORMAT MONTHS
  ======================================================= */

  const kpiMonths =
    useMemo(() => {
      const months =
        kpiMonthsData?.data?.months ||
        [];

      const map =
        months.reduce(
          (acc, cur) => {
            const key =
              `${cur.year}-${cur.month}`;

            if (!acc[key]) {
              acc[key] = cur;
            }

            return acc;
          },
          {}
        );

      return Object.values(
        map
      ).sort(
        (a, b) => {
          if (
            a.year !== b.year
          ) {
            return (
              b.year -
              a.year
            );
          }

          return (
            b.month -
            a.month
          );
        }
      );
    }, [kpiMonthsData]);

  /* =======================================================
     GO TO MONTH
  ======================================================= */

  const goToMonth = (
    year,
    month
  ) => {
    navigate(
      `/kpi-performance/${employeeId}?year=${year}&month=${month}`
    );
  };

  /* =======================================================
     RESET KPI
  ======================================================= */

  const handleResetConfirm =
    async () => {
      if (isEmployeePortal) {
        return;
      }

      if (!confirmReset) {
        return;
      }

      setIsResetting(true);

      try {
        await employeeKpiApi.resetEmployeeKpi(
          {
            employeeId:
              String(
                employeeId
              ),

            year:
              confirmReset.year,

            month:
              confirmReset.month,
          }
        );

        toast.success(
          'KPI reset successfully'
        );

        setConfirmReset(null);

        qc.invalidateQueries({
          queryKey: [
            'employee-kpi-months',
            employeeId,
          ],
        });

        qc.invalidateQueries({
          queryKey: [
            'employee-kpi',
            employeeId,
            confirmReset.year,
            confirmReset.month,
          ],
        });
      } catch {
        toast.error(
          'Failed to reset KPI'
        );
      } finally {
        setIsResetting(
          false
        );
      }
    };

  /* =======================================================
     ADD KPI
  ======================================================= */

  const handleAddKpiItem = () => {
    if (isEmployeePortal) {
      return;
    }

    setIsKpiModalOpen(
      true
    );
  };

  /* =======================================================
     DELETE KPI CLICK
  ======================================================= */

  const handleDeleteKpiItem =
    (item) => {
      if (isEmployeePortal) {
        return;
      }

      setDeleteConfirmKpi(
        item
      );
    };

  /* =======================================================
     KPI SUBMIT
  ======================================================= */

  const handleKpiSubmit =
    async (data) => {
      if (isEmployeePortal) {
        return;
      }

      try {
        await createKpiItem(
          data
        );

        setIsKpiModalOpen(
          false
        );
      } catch (error) {
        toast.error(
          error?.response?.data
            ?.message ||
            'Failed to save KPI item'
        );
      }
    };

  /* =======================================================
     DELETE CONFIRM
  ======================================================= */

  const handleDeleteConfirm =
    async () => {
      if (isEmployeePortal) {
        return;
      }

      if (
        !deleteConfirmKpi
      ) {
        return;
      }

      try {
        await deleteKpiItem(
          deleteConfirmKpi.id
        );

        setDeleteConfirmKpi(
          null
        );
      } catch (error) {
        toast.error(
          error?.response?.data
            ?.message ||
            'Failed to delete KPI item'
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    isComponentLoading
  ) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-slate-100" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-100" />

          <div className="mt-8 space-y-4">
            {Array.from({
              length: 3,
            }).map(
              (_, idx) => (
                <div
                  key={idx}
                  className="h-12 w-full animate-pulse rounded bg-slate-100"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     VIEW
  ======================================================= */

  return (
    <div className="space-y-8">

      {/* ===================================================
          TABS
      =================================================== */}

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              'items'
            )
          }
          className={`rounded-lg px-6 py-3 text-sm font-medium transition ${
            activeTab ===
            'items'
              ? 'border border-primary text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t(
            'employees.profile.details.kpi.tabs.items'
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              'performance'
            )
          }
          className={`rounded-lg px-6 py-3 text-sm font-medium transition ${
            activeTab ===
            'performance'
              ? 'border border-primary text-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {t(
            'employees.profile.details.kpi.tabs.performance'
          )}
        </button>

      </div>

      {/* ===================================================
          KPI ITEMS
      =================================================== */}

      {activeTab ===
        'items' && (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div
            className={`mb-4 flex items-center justify-between ${
              isRTL
                ? 'flex-row-reverse'
                : ''
            }`}
          >

            <h3 className="text-lg font-semibold text-slate-900">

              {t(
                'employees.profile.details.kpi.items.title'
              )}

            </h3>

            {/* ADD KPI - HR ONLY */}

            {!isEmployeePortal && (
              <Button
                onClick={
                  handleAddKpiItem
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >

                <Plus className="h-4 w-4" />

                {t(
                  'employees.profile.details.kpi.items.add'
                )}

              </Button>
            )}

          </div>

          {kpiLoading ? (

            <div className="space-y-3">

              {Array.from({
                length: 3,
              }).map(
                (_, idx) => (
                  <div
                    key={idx}
                    className="h-12 w-full animate-pulse rounded bg-slate-100"
                  />
                )
              )}

            </div>

          ) : employeeKpiItems.length === 0 ? (

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">

              <p className="text-sm text-slate-500">

                {t(
                  'employees.profile.details.kpi.items.noRecords'
                )}

              </p>

            </div>

          ) : (

            <div className="overflow-hidden rounded-lg border border-slate-200">

              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-50">

                  <tr>

                    <th
                      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                        isRTL
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >

                      {t(
                        'employees.profile.details.kpi.items.table.name'
                      )}

                    </th>

                    <th
                      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                        isRTL
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >

                      {t(
                        'employees.profile.details.kpi.items.table.maxScore'
                      )}

                    </th>

                    {/* ACTIONS COLUMN - HR ONLY */}

                    {!isEmployeePortal && (
                      <th
                        className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${
                          isRTL
                            ? 'text-left'
                            : 'text-right'
                        }`}
                      >

                        {t(
                          'employees.profile.details.kpi.items.table.actions'
                        )}

                      </th>
                    )}

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">

                  {employeeKpiItems.map(
                    (item) => (

                      <tr
                        key={
                          item.id
                        }
                        className="hover:bg-slate-50"
                      >

                        <td
                          className={`whitespace-nowrap px-6 py-4 text-sm text-slate-900 ${
                            isRTL
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >

                          {item
                            .kpi_item
                            ?.item ||
                            item.custom_item}

                        </td>

                        <td
                          className={`whitespace-nowrap px-6 py-4 text-sm text-slate-900 ${
                            isRTL
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >

                          {item.max_score}

                        </td>

                        {/* DELETE BUTTON - HR ONLY */}

                        {!isEmployeePortal && (
                          <td
                            className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${
                              isRTL
                                ? 'text-left'
                                : 'text-right'
                            }`}
                          >

                            <div
                              className={`flex items-center gap-2 ${
                                isRTL
                                  ? 'justify-start'
                                  : 'justify-end'
                              }`}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteKpiItem(
                                    item
                                  )
                                }
                                className="inline-flex items-center rounded-md border border-slate-300 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                              >

                                <Trash2 className="h-4 w-4" />

                              </button>

                            </div>

                          </td>
                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* ===================================================
          KPI PERFORMANCE
      =================================================== */}

      {activeTab ===
        'performance' && (

        <>

          {kpiMonths.length === 0 ? (

            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">

              {t(
                'employees.profile.details.kpi.noRecords'
              )}

            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {kpiMonths.map(
                (m) => (

                  <KpiMonthCard
                    key={`${m.year}-${m.month}`}
                    item={m}

                    isEmployeePortal={
                      isEmployeePortal
                    }

                    onPreview={() =>
                      goToMonth(
                        m.year,
                        m.month
                      )
                    }

                    onEnter={() => {
                      if (
                        canManageKpi
                      ) {
                        goToMonth(
                          m.year,
                          m.month
                        );
                      }
                    }}

                    onReset={() => {
                      if (
                        canManageKpi
                      ) {
                        setConfirmReset(
                          m
                        );
                      }
                    }}
                  />

                )
              )}

            </div>

          )}

        </>

      )}

      {/* ===================================================
          ADD KPI MODAL - HR ONLY
      =================================================== */}

      {!isEmployeePortal && (

        <Dialog
          open={
            isKpiModalOpen
          }
          onOpenChange={(
            open
          ) =>
            !open &&
            setIsKpiModalOpen(
              false
            )
          }
        >

          <DialogContent className="sm:max-w-[500px]">

            <DialogHeader>

              <DialogTitle>

                {t(
                  'employees.profile.details.kpi.addItem.title'
                )}

              </DialogTitle>

            </DialogHeader>

            <KpiItemForm
              item={null}

              onSubmit={
                handleKpiSubmit
              }

              onCancel={() =>
                setIsKpiModalOpen(
                  false
                )
              }
            />

          </DialogContent>

        </Dialog>

      )}

      {/* ===================================================
          DELETE KPI MODAL - HR ONLY
      =================================================== */}

      {!isEmployeePortal && (

        <Dialog
          open={
            !!deleteConfirmKpi
          }
          onOpenChange={(
            open
          ) =>
            !open &&
            setDeleteConfirmKpi(
              null
            )
          }
        >

          <DialogContent className="sm:max-w-[420px]">

            <DialogHeader>

              <DialogTitle>

                {t(
                  'employees.profile.details.kpi.delete.title'
                )}

              </DialogTitle>

            </DialogHeader>

            <div className="text-sm text-slate-600">

              {t(
                'employees.profile.details.kpi.delete.message',
                {
                  itemName:
                    deleteConfirmKpi
                      ?.kpi_item
                      ?.item ||
                    deleteConfirmKpi
                      ?.custom_item,
                }
              )}

            </div>

            <DialogFooter className="gap-2 sm:gap-2">

              <Button
                variant="outline"
                onClick={() =>
                  setDeleteConfirmKpi(
                    null
                  )
                }
              >

                {t(
                  'employees.profile.details.kpi.delete.cancel'
                )}

              </Button>

              <Button
                onClick={
                  handleDeleteConfirm
                }
                className="bg-red-600 hover:bg-red-700"
              >

                {t(
                  'employees.profile.details.kpi.delete.confirm'
                )}

              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      )}

    </div>
  );
}