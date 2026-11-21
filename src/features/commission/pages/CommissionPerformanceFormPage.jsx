import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { MonthNavigation } from '../../fingerprintIssues/components/MonthNavigation';

import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useEmployeeCommissionFormQuery } from '../hooks/useEmployeeCommissionFormQuery';
import { useEmployeeCommissionScoresQuery } from '../hooks/useEmployeeCommissionScoresQuery';
import { useSaveEmployeeCommission } from '../hooks/useSaveEmployeeCommission';
import { useCommissionPreviewQuery } from '../hooks/useCommissionPreviewQuery';

function Field({ label, required, children, hint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-800">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </Label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

const inputBase =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-50';

const normalizeStatus = (v) => {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'pending') return 'pending';
  if (s === 'rejected') return 'rejected';
  return 'approved';
};

export default function CommissionPerformanceFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId: employeeIdParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const employeeId = String(employeeIdParam || '');

  // ✅ preview params from URL
  const previewMode = searchParams.get('preview') === '1';
  const baseAmountFromUrl = searchParams.get('base_amount'); // string | null

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
  const monthString = `${year}-${String(month).padStart(2, '0')}-01`;

  // ✅ OUTER department filter (from list page query)
  const outerDepartmentId = useMemo(() => {
    const dep = searchParams.get('department');
    return dep && dep !== 'all' ? String(dep) : null;
  }, [searchParams]);

  // keep URL synced only for month/year (and keep OUTER department)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    params.set('month', String(month));
    params.set('year', String(year));
    params.delete('date');

    if (outerDepartmentId) params.set('department', String(outerDepartmentId));
    else params.delete('department');

    // keep preview params if present
    if (previewMode) params.set('preview', '1');
    else params.delete('preview');

    if (baseAmountFromUrl != null && baseAmountFromUrl !== '') params.set('base_amount', String(baseAmountFromUrl));
    else params.delete('base_amount');

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

    // keep preview params if present
    if (previewMode) params.set('preview', '1');
    else params.delete('preview');

    if (baseAmountFromUrl != null && baseAmountFromUrl !== '') params.set('base_amount', String(baseAmountFromUrl));
    else params.delete('base_amount');

    setSearchParams(params, { replace: true });
  };

  // ✅ employee info to show in UI
  const passedEmployee = location.state?.employee || null;

  // fallback only when opened directly (no state)
  const shouldFetchEmployees = !passedEmployee && !!employeeId;
  const { data: employees = [] } = useAllEmployees(shouldFetchEmployees);

  // ---- GET employee info (for department + commission %)
  const employeeInfo = useMemo(() => {
    const found = employees?.find((emp) => String(emp.id) === employeeId);
    if (!found) return {};

    return {
      employee_name: found.employee_name || found.name || '',
      employee_code: found.employee_code || found.code || '',
      position: found.position || found.employee_position || found.position_name || '',
      department_id: found.department_id || found.department?.id || null,
      commission_percentage: found.commission_percentage ?? found.commission_percent ?? null,
    };
  }, [employees, employeeId]);

  const employeeName = employeeInfo?.employee_name || '';
  const employeeCode = employeeInfo?.employee_code || '';
  const employeePosition = employeeInfo?.position || '';

  // ---- GET form items (and potentially saved base/status/reason)
  const {
    data: formRes,
    isLoading: loadingForm,
    isFetching: fetchingForm,
  } = useEmployeeCommissionFormQuery(employeeId, monthString, !!employeeId);

  const formData = formRes?.data;
  const items = useMemo(() => formData?.items || [], [formData?.items]);

  const [commissions, setCommissions] = useState({});
  const [baseAmount, setBaseAmount] = useState('');
  const [status, setStatus] = useState('approved');
  const [reason, setReason] = useState('');

  // ✅ Prefill top fields from URL/API once (avoid overwriting user typing)
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (loadingForm || fetchingForm) return;
    
    // ✅ 1) hydrate base from URL first (preview navigation)
    const userHasEnteredBase = baseAmount !== '';
    if (!userHasEnteredBase && baseAmountFromUrl != null && String(baseAmountFromUrl) !== '') {
      setBaseAmount(String(baseAmountFromUrl));
      return; // Let the effect re-run with the new base amount
    }

    // Don't proceed if already hydrated and no changes needed
    if (hydrated && userHasEnteredBase) return;

    // ✅ 2) hydrate from API if exists (and still empty)
    if (formData) {
      const userHasEnteredStatus = status !== 'approved';
      const userHasEnteredReason = reason !== '';

      const savedBase =
        formData.base_amount ?? formData.baseAmount ?? formData?.commission?.base_amount ?? null;
      const savedStatus =
        formData.status ?? formData?.commission?.status ?? formData?.commission_status ?? null;
      const savedReason =
        formData.reason ?? formData?.commission?.reason ?? formData?.commission_reason ?? null;

      if (!userHasEnteredBase && savedBase != null && String(savedBase) !== '') {
        setBaseAmount(String(savedBase));
      }
      if (!userHasEnteredStatus && savedStatus != null && String(savedStatus) !== '') {
        setStatus(normalizeStatus(savedStatus));
      }
      if (!userHasEnteredReason && savedReason != null && String(savedReason) !== '') {
        setReason(String(savedReason));
      }
    }

    setHydrated(true);
  }, [
    formData, 
    loadingForm, 
    fetchingForm, 
    hydrated, 
    baseAmount, 
    status, 
    reason, 
    baseAmountFromUrl,
  ]);

  // ✅ Prefill commission items amounts
  useEffect(() => {
    if (loadingForm || fetchingForm) return;

    if (!items?.length) {
      setCommissions({});
      return;
    }

    const next = {};
    items.forEach((it) => {
      next[it.employee_commission_item_id] = it.amount ?? 0;
    });
    setCommissions(next);
  }, [employeeId, monthString, loadingForm, fetchingForm, items]);

  const handleCommissionChange = (itemId, value) => {
    const n = Number(value || 0);
    const safe = Math.max(0, n);
    setCommissions((prev) => ({ ...prev, [itemId]: safe }));
  };

  // ✅ GET totals from /commission-scores (persist when you leave/enter)
  const { data: scoresRes } = useEmployeeCommissionScoresQuery(employeeId, monthString, !!employeeId);

  // ✅ Preview call (ONLY when coming from preview mode)
  const numericBase = Number(baseAmount || 0);
  const { data: previewRes, isFetching: fetchingPreview } = useCommissionPreviewQuery(
    employeeId,
    monthString,
    numericBase,
    previewMode // enabled only in preview mode
  );

  // ✅ fallback commission % calculation
  const commissionPercent = Number(
    employeeInfo?.commission_percentage ??
      passedEmployee?.commission_percentage ??
      passedEmployee?.commission_percent ??
      10
  );

  const calculatedCommission = useMemo(() => {
    const b = Number(baseAmount || 0);
    if (!b || b <= 0) return 0;
    return (b * commissionPercent) / 100;
  }, [baseAmount, commissionPercent]);

  // ✅ Total Commission priority:
  // 1) preview computed_amount (when previewMode and data exists)
  // 2) saved total from formData
  // 3) scores total
  // 4) local fallback
  const totalCommission = Number(
    (previewMode && previewRes?.data?.computed_amount != null ? previewRes.data.computed_amount : null) ??
      formData?.total_commission ??
      scoresRes?.data?.total_commission ??
      calculatedCommission ??
      0
  );

  // ---- POST save
  const saveCommission = useSaveEmployeeCommission();

  const onSave = () => {
    if (!employeeId || !baseAmount) return;

    saveCommission.mutate({
      employeeId,
      month: monthString,
      base_amount: Number(baseAmount),
      status,
      reason: reason || 'Commission processed',
    });
  };

  const disableInputs = !employeeId || loadingForm || fetchingForm;
  const disableSave =
    !employeeId || saveCommission.isPending || loadingForm || fetchingForm || !baseAmount;

  // ✅ Back keeps OUTER department + month/year (return to same filtered list)
  const backUrl = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set('year', String(year));
    qs.set('month', String(month));
    if (outerDepartmentId) qs.set('department', String(outerDepartmentId));
    return `/commission-performance?${qs.toString()}`;
  }, [year, month, outerDepartmentId]);

  return (
    <div className="space-y-6">
      <MonthNavigation date={date} onDateChange={handleDateChange} />

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t('commission.setup')}</h2>
          {previewMode && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {t('commission.previewMode')}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {employeeName ? (
            <>
              <span className="font-medium text-foreground">{employeeName}</span>
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

      <Card className="overflow-hidden">
        <CardContent className="grid gap-5 pt-6">
          {/* Top fields */}
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t('commission.baseAmount')} required hint={t('commission.numbersOnly')}>
              <Input
                type="number"
                min={0}
                step="0.01"
                className={inputBase}
                placeholder={t('commission.baseAmountPlaceholder')}
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                disabled={disableInputs}
              />
            </Field>

            <Field label={t('commission.status')} hint={t('commission.workflow')}>
              <Select value={status} onValueChange={setStatus} disabled={disableInputs}>
                <SelectTrigger className={inputBase}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">{t('commission.approved')}</SelectItem>
                  <SelectItem value="pending">{t('commission.pending')}</SelectItem>
                  <SelectItem value="rejected">{t('commission.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('commission.reason')} hint={t('commission.optional')}>
              <Input
                type="text"
                className={inputBase}
                placeholder={t('commission.reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={disableInputs}
              />
            </Field>
          </div>

          {/* Commission Items */}
          {items.length > 0 && (
            <div className="grid gap-3 pt-2 md:grid-cols-2">
              {items.map((it) => (
                <div
                  key={it.employee_commission_item_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{it.name}</div>
                    <div className="text-xs text-slate-500">{t('commission.item')}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className={[inputBase, 'w-32'].join(' ')}
                      value={commissions[it.employee_commission_item_id] ?? ''}
                      onChange={(e) =>
                        handleCommissionChange(it.employee_commission_item_id, e.target.value)
                      }
                      disabled={disableInputs}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!employeeId && (
            <div className="text-sm text-muted-foreground">{t('kpi.missingEmployeeId')}</div>
          )}

          {loadingForm && (
            <div className="text-sm text-muted-foreground">{t('commission.loadingData')}</div>
          )}
        </CardContent>

        {/* Footer bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-[#7B79E81A] p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t('commission.totalCommission')}
                {previewMode && fetchingPreview ? (
                  <span className="ml-2 text-xs text-slate-500">{t('commission.preview')}</span>
                ) : null}
              </span>
              <span className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-primary">
                ${Number(totalCommission || 0).toFixed(2)}
              </span>
            </div>
            
            {/* Show preview details when in preview mode */}
            {/* {previewMode && previewRes?.data && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  Rate:{' '}
                  <span className="font-semibold text-slate-900">
                    {previewRes.data.commission_percent}%
                  </span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Base:{' '}
                  <span className="font-semibold text-slate-900">
                    ${Number(previewRes.data.base_amount).toLocaleString()}
                  </span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Amount:{' '}
                  <span className="font-semibold text-emerald-600">
                    ${Number(previewRes.data.computed_amount).toLocaleString()}
                  </span>
                </span>
              </div>
            )} */}
            
            
            {/* Show regular calculation when not in preview mode */}
            {!previewMode && numericBase > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>
                  {t('commission.rate')}:{' '}
                  <span className="font-semibold text-slate-900">
                    {commissionPercent}%
                  </span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  {t('commission.base')}:{' '}
                  <span className="font-semibold text-slate-900">
                    ${Number(numericBase).toLocaleString()}
                  </span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  {t('commission.amount')}:{' '}
                  <span className="font-semibold text-emerald-600">
                    ${Number(calculatedCommission).toLocaleString()}
                  </span>
                </span>
              </div>
            )}
            
            {/* Show hint when no base amount */}
            {numericBase <= 0 && (
              <div className="text-xs text-slate-500">{t('commission.enterBaseAmount')}</div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(backUrl)}>
          {t('common.cancel')}
        </Button>

        <Button onClick={onSave} disabled={disableSave}>
          {saveCommission.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </div>
  );
}
