import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { MonthNavigation } from '../../fingerprintIssues/components/MonthNavigation';
import DepartmentKpiStats from '../components/DepartmentKpiStats';
import KpiItemForm from '@/features/employees/components/EmplyeeProfile.jsx/components/KpiItemForm';

import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useEmployeeKpiFormQuery } from '../hooks/useEmployeeKpiFormQuery';
import { useEmployeeKpiScoresQuery } from '../hooks/useEmployeeKpiScoresQuery';
import { useUpsertEmployeeKpiScores } from '../hooks/useUpsertEmployeeKpiScores';
import { useKpiHeaderStatsQuery } from '../hooks/useKpiHeaderStatsQuery';
import { employeeKpiKeys } from '../api/employeeKpi.keys';
import { employeeKpiApi } from '../api/employeeKpi.api';
import kpiApi from '@/features/settings/api/kpi.api';
import { employeesApi } from '@/features/employees/api/employees.api';
import { useAuthStore } from '@/services/auth/auth.store';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.employees)) return value.employees;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.employees)) return value.data.employees;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const getEmployeeId = (employee) =>
  String(employee?.employee_id ?? employee?.id ?? employee?.pivot?.employee_id ?? '');

const getEmployeeInfo = (employee) => {
  if (!employee) return null;

  return {
    ...employee,
    employee_id: employee?.employee_id ?? employee?.id,
    employee_name:
      employee?.employee_name || employee?.full_name || employee?.name || employee?.basic?.full_name || '',
    employee_code: employee?.employee_code || employee?.code || employee?.basic?.employeeId || '',
    position:
      employee?.position ||
      employee?.employee_position ||
      employee?.position_name ||
      employee?.work?.positionName ||
      '',
    position_id:
      employee?.position_id || employee?.position?.id || employee?.work?.position_id || null,
    department_id:
      employee?.department_id || employee?.department?.id || employee?.work?.department_id || null,
  };
};

export default function KpiPerformanceFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId: employeeIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { user, role, isManager, authSource } = useAuthStore();
  const isEmployeePortal = role === 'employee' || authSource === 'employee-login';

  const employeeId = String(employeeIdParam || '');
  const ownEmployeeId = String(user?.id ?? user?.employee_id ?? '');
  // Team membership is checked with the logged-in manager employee id
  // (for example /team-members/196), not user.manager_id.
  const managerScopeId = ownEmployeeId;
  const isOwnEmployee = !!employeeId && employeeId === ownEmployeeId;

  const [addItemOpen, setAddItemOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [managementBusy, setManagementBusy] = useState(false);
  const autoAddHandledRef = useRef(false);

  // ---- month/year
  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const dateParam = searchParams.get('date');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);
      const d = new Date(y, m - 1, 1);
      return { month: m, year: y, date: d };
    }

    const d = dateParam ? new Date(dateParam) : new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear(), date: d };
  };

  const { month, year, date } = getCurrentMonthYear();

  const outerDepartmentId = useMemo(() => {
    const dep = searchParams.get('department');
    return dep && dep !== 'all' ? String(dep) : null;
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(month));
    params.set('year', String(year));
    params.delete('date');

    if (outerDepartmentId) params.set('department', String(outerDepartmentId));
    else params.delete('department');

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, outerDepartmentId]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('date');

    if (outerDepartmentId) params.set('department', String(outerDepartmentId));
    else params.delete('department');

    setSearchParams(params, { replace: true });
  };

  const passedEmployee = location.state?.employee || null;

  // HR can use the normal all-employees lookup. Employee portal tokens must
  // never call that HR-only endpoint because a 401 would log the employee out.
  const shouldFetchEmployees = !isEmployeePortal && !passedEmployee && !!employeeId;
  const { data: employees = [] } = useAllEmployees(shouldFetchEmployees);

  // Manager refresh fallback: rebuild the selected employee from the manager's
  // own team endpoint instead of the HR-only /list endpoint.
  const shouldFetchManagerTeam =
    isEmployeePortal && isManager && !isOwnEmployee && !!managerScopeId;

  const { data: managerTeamResponse, isLoading: isManagerTeamLoading } = useQuery({
    queryKey: ['manager-team-members-for-kpi', managerScopeId],
    queryFn: () => employeesApi.getManagerTeamMembers(managerScopeId, 1, 1000, ''),
    enabled: shouldFetchManagerTeam,
    retry: false,
  });

  const managerTeamMembers = useMemo(
    () => toArray(managerTeamResponse),
    [managerTeamResponse]
  );

  const isTargetTeamMember = useMemo(
    () => managerTeamMembers.some((member) => getEmployeeId(member) === employeeId),
    [managerTeamMembers, employeeId]
  );

  // HR can manage any employee. In the employee portal, a manager can manage
  // KPI only for an employee returned by /team-members/:managerId. This keeps
  // the UI scoped to the manager's actual team even after a page refresh.
  const canManageKpi =
    !isEmployeePortal || (isManager && !isOwnEmployee && isTargetTeamMember);
  const canEditScores = canManageKpi;

  const canLoadKpiForm =
    !!employeeId &&
    (!isEmployeePortal ||
      isOwnEmployee ||
      (isManager && !isManagerTeamLoading && isTargetTeamMember));

  const employeeInfo = useMemo(() => {
    if (isEmployeePortal) {
      if (isOwnEmployee) return getEmployeeInfo(user);

      const teamMember = managerTeamMembers.find(
        (member) => getEmployeeId(member) === employeeId
      );
      return getEmployeeInfo(teamMember);
    }

    if (passedEmployee) return getEmployeeInfo(passedEmployee);

    const found = employees.find((e) => getEmployeeId(e) === employeeId) || null;
    return getEmployeeInfo(found);
  }, [passedEmployee, isEmployeePortal, isOwnEmployee, user, managerTeamMembers, employees, employeeId]);

  // When a manager clicks “Add KPI” from Team > Members, open the exact
  // same Add KPI dialog used by the HR KPI setup page. The route still goes
  // through the normal team-members authorization check above.
  useEffect(() => {
    const shouldAutoOpen =
      isEmployeePortal &&
      isManager &&
      !isOwnEmployee &&
      location.state?.openAddKpi === true;

    if (!shouldAutoOpen) {
      autoAddHandledRef.current = false;
      return;
    }

    if (
      !autoAddHandledRef.current &&
      !isManagerTeamLoading &&
      canManageKpi &&
      employeeInfo
    ) {
      autoAddHandledRef.current = true;
      setAddItemOpen(true);
    }
  }, [
    location.state,
    isEmployeePortal,
    isManager,
    isOwnEmployee,
    isManagerTeamLoading,
    canManageKpi,
    employeeInfo,
  ]);

  const employeeName = employeeInfo?.employee_name || '';
  const employeeCode = employeeInfo?.employee_code || '';
  const employeePosition = employeeInfo?.position || '';

  const employeeDepartmentId = useMemo(() => {
    const dep =
      employeeInfo?.department_id ||
      employeeInfo?.department?.id ||
      passedEmployee?.department_id ||
      passedEmployee?.department?.id ||
      null;

    return dep ? String(dep) : null;
  }, [employeeInfo, passedEmployee]);

  const departmentIdForHeader = employeeDepartmentId || outerDepartmentId || 'all';

  // The department KPI summary is an HR endpoint. Do not call it from the
  // employee portal; the employee/manager still gets the KPI form itself.
  const {
    data: headerStats,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useKpiHeaderStatsQuery(
    departmentIdForHeader,
    year,
    month,
    !isEmployeePortal
  );

  const summaryData = {
    totalEmployees: headerStats?.total_employees ?? 0,
    targetedEmployees: headerStats?.targeted_employees ?? 0,
    highPerformers: headerStats?.high_performers ?? 0,
    lowPerformers: headerStats?.low_performers ?? 0,
  };

  const {
    data: formRes,
    isLoading: loadingForm,
    isFetching: fetchingForm,
  } = useEmployeeKpiFormQuery(employeeId, year, month, canLoadKpiForm);

  const formData = formRes?.data;
  const items = useMemo(() => formData?.items || [], [formData?.items]);

  const [scores, setScores] = useState({});

  useEffect(() => {
    if (loadingForm || fetchingForm) return;

    if (!items?.length) {
      setScores({});
      return;
    }

    const next = {};
    items.forEach((it) => {
      const itemId = it.employee_kpi_item_id ?? it.kpi_item_id ?? it.id;
      next[itemId] = it.score ?? 0;
    });
    setScores(next);
  }, [employeeId, year, month, formRes, loadingForm, fetchingForm, items]);

  const handleScoreChange = (itemId, value, maxScore) => {
    if (!canEditScores) return;

    const n = Number(value || 0);
    const safe = Math.max(0, Math.min(Number(maxScore ?? 0), n));
    setScores((prev) => ({ ...prev, [itemId]: safe }));
  };

  const { data: scoresRes } = useEmployeeKpiScoresQuery(
    employeeId,
    year,
    month,
    canLoadKpiForm
  );

  const totalScore = Number(formData?.total_score ?? scoresRes?.data?.total_score ?? 0);
  const maxTotalScore = Number(formData?.max_total_score ?? scoresRes?.data?.max_total_score ?? 0);
  const percentage = Number(formData?.percentage ?? scoresRes?.data?.percentage ?? 0);

  const upsert = useUpsertEmployeeKpiScores();

  const onSave = () => {
    if (!employeeId || !canEditScores) return;

    const payloadItems = items.map((it) => {
      const employeeKpiItemId = it.employee_kpi_item_id;
      const hasEmployeeItemId = employeeKpiItemId != null && employeeKpiItemId !== undefined;
      const idObj = hasEmployeeItemId
        ? { employee_kpi_item_id: employeeKpiItemId }
        : { kpi_item_id: it.kpi_item_id };

      const scoreKey = employeeKpiItemId ?? it.kpi_item_id ?? it.id;
      return {
        ...idObj,
        score: scores[scoreKey] ?? 0,
      };
    });

    upsert.mutate({ employeeId, year, month, items: payloadItems });
  };

  const refreshKpi = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeKpiKeys.form(employeeId, year, month) }),
      queryClient.invalidateQueries({ queryKey: employeeKpiKeys.scores(employeeId, year, month) }),
      queryClient.invalidateQueries({ queryKey: ['employee-kpi-months', employeeId] }),
      queryClient.invalidateQueries({ queryKey: ['employee-details', employeeId] }),
    ]);
  };

  const handleAddKpiItem = async (data) => {
    if (!canManageKpi) return;

    const positionId =
      employeeInfo?.position_id ||
      employeeInfo?.position?.id ||
      employeeInfo?.work?.position_id ||
      formData?.position_id ||
      formData?.position?.id ||
      null;

    if (!positionId) {
      toast.error('Employee position is required to add a KPI item');
      return;
    }

    try {
      setManagementBusy(true);
      await kpiApi.create({
        item: data.custom_item,
        max_score: data.max_score,
        position_id: positionId,
        is_custom: true,
      });
      toast.success('KPI item created successfully');
      setAddItemOpen(false);
      await refreshKpi();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create KPI item');
    } finally {
      setManagementBusy(false);
    }
  };

  const handleDeleteKpiItem = async () => {
    if (!canManageKpi || !deleteItem) return;

    // The existing employee KPI screen deletes by the KPI item's own `id`.
    // Keep that API contract here; only fall back to the alternate ids when
    // an endpoint response does not expose `id`.
    const kpiItemId =
      deleteItem?.id ?? deleteItem?.kpi_item_id ?? deleteItem?.employee_kpi_item_id;

    if (!kpiItemId) {
      toast.error('KPI item id is missing');
      return;
    }

    try {
      setManagementBusy(true);
      await employeeKpiApi.excludeKpiItem(employeeId, kpiItemId);
      toast.success('KPI item deleted successfully');
      setDeleteItem(null);
      await refreshKpi();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete KPI item');
    } finally {
      setManagementBusy(false);
    }
  };

  const handleResetKpi = async () => {
    if (!canManageKpi) return;

    try {
      setManagementBusy(true);
      await employeeKpiApi.resetEmployeeKpi({ employeeId, year, month });
      toast.success('KPI reset successfully');
      setResetOpen(false);
      await refreshKpi();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset KPI');
    } finally {
      setManagementBusy(false);
    }
  };

  const disableInputs =
    !employeeId || !canEditScores || loadingForm || fetchingForm || managementBusy;
  const disableSave =
    !employeeId ||
    !canEditScores ||
    upsert.isPending ||
    loadingForm ||
    fetchingForm ||
    managementBusy ||
    items.length === 0;

  const backUrl = useMemo(() => {
    if (isEmployeePortal) {
      if (isManager && !isOwnEmployee) {
        return `/employees/${ownEmployeeId}?tab=teams&subtab=kpi&year=${year}&month=${month}`;
      }
      return `/employees/${ownEmployeeId}?tab=kpiPerformance&subtab=performance`;
    }

    const qs = new URLSearchParams();
    qs.set('year', String(year));
    qs.set('month', String(month));
    if (outerDepartmentId) qs.set('department', String(outerDepartmentId));
    return `/kpi-performance?${qs.toString()}`;
  }, [isEmployeePortal, isManager, isOwnEmployee, ownEmployeeId, year, month, outerDepartmentId]);

  return (
    <div className="space-y-6">
      <MonthNavigation date={date} onDateChange={handleDateChange} />

      {!isEmployeePortal &&
        (isHeaderError ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {t('kpi.failedToLoadSummary')}
          </div>
        ) : (
          <DepartmentKpiStats data={summaryData} isLoading={isHeaderLoading} />
        ))}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t('kpi.setup')}</h2>
          <p className="text-muted-foreground text-sm">
            {employeeName ? (
              <>
                <span className="text-foreground font-medium">{employeeName}</span>
                {employeeCode ? ` • ${employeeCode}` : ''}
                {employeePosition ? ` • ${employeePosition}` : ''}
                {` — ${month}/${year}`}
              </>
            ) : (
              <>
                {t('common.employee')} #{employeeId} — {month}/{year}
              </>
            )}
          </p>
        </div>

        {canManageKpi && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setResetOpen(true)} disabled={managementBusy}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={() => setAddItemOpen(true)} disabled={managementBusy}>
              <Plus className="mr-2 h-4 w-4" />
              Add KPI
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          {!employeeId ? (
            <div className="text-muted-foreground col-span-full text-sm">
              {t('kpi.missingEmployeeId')}
            </div>
          ) : isEmployeePortal && isManager && !isOwnEmployee && isManagerTeamLoading ? (
            <div className="text-muted-foreground col-span-full text-sm">
              {t('common.loading')}
            </div>
          ) : isEmployeePortal && isManager && !isOwnEmployee && !isTargetTeamMember ? (
            <div className="col-span-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              This employee is not a member of your team.
            </div>
          ) : loadingForm ? (
            <div className="text-muted-foreground col-span-full text-sm">
              {t('kpi.loadingItems')}
            </div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground col-span-full text-sm">
              {t('kpi.noItemsFound')}
            </div>
          ) : (
            items.map((it) => {
              const itemId = it.employee_kpi_item_id ?? it.kpi_item_id ?? it.id;

              return (
                <div
                  key={itemId}
                  className="flex items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0 text-sm font-medium">{it.name}</div>

                  <div className="flex shrink-0 items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={it.max_score}
                      className="w-24 rounded-md border px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      value={scores[itemId] ?? ''}
                      onChange={(e) => handleScoreChange(itemId, e.target.value, it.max_score)}
                      disabled={disableInputs}
                    />
                    <span className="text-muted-foreground text-xs">/ {it.max_score}</span>

                    {canManageKpi && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteItem(it)}
                        disabled={managementBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-[#7B79E81A] p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('kpi.percentage')}</span>
            <span className="rounded-md bg-white px-3 py-1 text-sm">{percentage}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('kpi.totalScore')}</span>
            <span className="rounded-md bg-white px-3 py-1 text-sm">{totalScore}</span>
            <span className="text-muted-foreground text-xs">/ {maxTotalScore || 0}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(backUrl)}>
          {t('common.cancel')}
        </Button>

        {canEditScores && (
          <Button onClick={onSave} disabled={disableSave}>
            {upsert.isPending ? t('common.loading') : t('common.save')}
          </Button>
        )}
      </div>

      {canManageKpi && (
        <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add KPI Item</DialogTitle>
            </DialogHeader>
            <KpiItemForm
              item={null}
              onSubmit={handleAddKpiItem}
              onCancel={() => setAddItemOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {canManageKpi && (
        <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Delete KPI Item</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete “{deleteItem?.name || 'this KPI item'}”?
            </p>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={managementBusy}>
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteKpiItem}
                disabled={managementBusy}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canManageKpi && (
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Reset KPI</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              Reset KPI scores for {month}/{year}? The KPI items stay available and the month scores are cleared.
            </p>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setResetOpen(false)} disabled={managementBusy}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleResetKpi} disabled={managementBusy}>
                Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
