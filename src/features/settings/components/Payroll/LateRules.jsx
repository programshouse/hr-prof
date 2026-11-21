import React from 'react';
import { Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import StepperField from '@/components/ui/StepperField';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function LateRules({
  lateRules,
  setLateRules,
  maxHoursPerRequest,
  setMaxHoursPerRequest,
  maxHoursPerMonth,
  setMaxHoursPerMonth,
  deductOverLimitHours,
  setDeductOverLimitHours,
  incDec,
  decDec,
  PrimaryButton,
  isEditing,
}) {
  const { t } = useTranslation();
  const addLateRuleRow = () => {
    const nextId =
      lateRules?.length > 0 ? Math.max(...lateRules.map((r) => r.id)) + 1 : 1;

    setLateRules((prev) => [
      ...prev,
      { id: nextId, rangeLabel: '0-15', multiplierLabel: '1x', deductMode: 'grace' },
    ]);
  };

  const deleteLateRuleRow = (id) => {
    setLateRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setLateRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const keepDigitsPlusDotDash = (val) => String(val ?? '').replace(/[^\d+.-]/g, '');

  const parseRange = (rangeLabel) => {
    const v = String(rangeLabel ?? '').trim();

    const open = v.match(/^(\d+(?:\.\d+)?)\+$/);
    if (open) return { from: open[1], to: '' };

    const dash = v.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?\+?)$/);
    if (dash) return { from: dash[1], to: dash[2] };

    return { from: v, to: '' };
  };

  const normalizeFrom = (val) => {
    const s = keepDigitsPlusDotDash(val).trim();
    if (!s) return '';

    const noPlusDash = s.replace(/\+/g, '').replace(/-/g, '');
    return noPlusDash.replace(/\.(?=.*\.)/g, '').replace(/[^\d.]/g, '');
  };

  const normalizeTo = (val) => {
    const s = keepDigitsPlusDotDash(val).trim();
    if (!s) return '';

    const hasPlus = s.endsWith('+');
    const core = s.replace(/\+/g, '');
    const coreOneDot = core.replace(/\.(?=.*\.)/g, '');
    const cleaned = coreOneDot.replace(/[^\d.]/g, '');

    return hasPlus ? `${cleaned}+` : cleaned;
  };

  const setRangeFrom = (rule, nextFromRaw) => {
    const nextFrom = normalizeFrom(nextFromRaw);
    const { to } = parseRange(rule.rangeLabel);

    if (!to) {
      updateRow(rule.id, 'rangeLabel', `${nextFrom}+`);
      return;
    }

    updateRow(rule.id, 'rangeLabel', `${nextFrom}-${to}`);
  };

  const setRangeTo = (rule, nextToRaw) => {
    const nextTo = normalizeTo(nextToRaw);
    const { from } = parseRange(rule.rangeLabel);
    const fromClean = String(from ?? '').replace(/\+/g, '');

    if (!nextTo) {
      updateRow(rule.id, 'rangeLabel', `${fromClean}+`);
      return;
    }

    updateRow(rule.id, 'rangeLabel', `${fromClean}-${nextTo}`);
  };

  const formatRangeForView = (rangeLabel) => {
    const v = String(rangeLabel ?? '').trim();
    if (!v) return '';

    const bad = v.match(/^(\d+(?:\.\d+)?)-$/);
    if (bad) return `${bad[1]}+`;

    if (/^\d+(?:\.\d+)?\+$/.test(v)) return v;
    if (/^\d+(?:\.\d+)?-\d+(?:\.\d+)?\+?$/.test(v)) return v;

    return v;
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{t('settings.payroll.lateRules.title')}</p>
              <p className="text-xs text-slate-500">{t('settings.payroll.lateRules.description')}</p>
            </div>

            {isEditing && <PrimaryButton onClick={addLateRuleRow}>{t('settings.payroll.lateRules.addRule')}</PrimaryButton>}
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div
              className="
                grid items-center bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600
                grid-cols-[minmax(320px,1.6fr)_minmax(220px,1fr)_minmax(180px,1fr)_minmax(140px,0.6fr)]
              "
            >
              <div>{t('settings.payroll.lateRules.range')}</div>
              <div>{t('settings.payroll.lateRules.multiplier')}</div>
              <div>{t('settings.payroll.lateRules.deductMode')}</div>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {lateRules.map((r) => {
                const { from, to } = parseRange(r.rangeLabel);

                return (
                  <div
                    key={r.id}
                    className="
                      grid items-center px-4 py-3 gap-6
                      grid-cols-[minmax(320px,1.6fr)_minmax(220px,1fr)_minmax(180px,1fr)_minmax(140px,0.6fr)]
                    "
                  >
                    <div className="flex items-center gap-3">
                      {!isEditing ? (
                        <span className="text-sm text-slate-700">
                          {formatRangeForView(r.rangeLabel)}
                        </span>
                      ) : (
                        <>
                          <Input
                            type="text"
                            inputMode="decimal"
                            className={cn(
                              'h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700',
                              'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                              'disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-500 text-center',
                            )}
                            value={from}
                            onChange={(e) => setRangeFrom(r, e.target.value)}
                            readOnly={!isEditing}
                          />

                          <span className="w-6 text-center text-sm font-medium text-slate-600">
                            -
                          </span>

                          <Input
                            type="text"
                            inputMode="decimal"
                            className={cn(
                              'h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700',
                              'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                              'disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-500 text-center',
                            )}
                            value={to}
                            onChange={(e) => setRangeTo(r, e.target.value)}
                            readOnly={!isEditing}
                            placeholder=""
                          />
                        </>
                      )}
                    </div>

                    <div className="max-w-[220px]">
                      <select
                        className={cn(
                          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                          'disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-500',
                        )}
                        value={r.multiplierLabel}
                        onChange={(e) => updateRow(r.id, 'multiplierLabel', e.target.value)}
                        disabled={!isEditing}
                      >
                        <option>1x</option>
                        <option>2x</option>
                        <option>4x</option>
                        <option>7x</option>
                      </select>
                    </div>

                    <div className="max-w-[220px]">
                      <select
                        className={cn(
                          'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                          'disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-500',
                        )}
                        value={r.deductMode}
                        onChange={(e) => updateRow(r.id, 'deductMode', e.target.value)}
                        disabled={!isEditing}
                      >
                        <option value="grace">{t('settings.payroll.lateRules.forgiven')}</option>
                        <option value="per_minute">{t('settings.payroll.lateRules.perMinute')}</option>
                        <option value="full_hour">{t('settings.payroll.lateRules.fullHour')}</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => deleteLateRuleRow(r.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={t('settings.payroll.lateRules.deleteRule')}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 space-y-1">
            <p className="text-sm font-semibold text-slate-900">{t('settings.payroll.lateRules.permissionLimit')}</p>
            <p className="text-xs text-slate-500">{t('settings.payroll.lateRules.permissionLimitDescription')}</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <StepperField
                label={t('settings.payroll.lateRules.minimumHoursPerRequest')}
                value={maxHoursPerRequest}
                onPlus={() => incDec(setMaxHoursPerRequest, Number(maxHoursPerRequest || 0), 0.5, 24)}
                onMinus={() => decDec(setMaxHoursPerRequest, Number(maxHoursPerRequest || 0), 0.5, 0)}
                disabled={!isEditing}
                step={0.5}
                onChange={(e) => {
                  const raw = String(e.target.value ?? '').replace(',', '.');

                  if (raw === '' || raw === '.') {
                    setMaxHoursPerRequest(raw);
                    return;
                  }

                  if (!/^\d+(\.\d*)?$/.test(raw)) return;

                  const n = parseFloat(raw);
                  if (Number.isFinite(n) && n >= 0 && n <= 24) {
                    setMaxHoursPerRequest(n);
                  }
                }}
                min={0}
                max={24}
              />

              <div className="md:border-l md:border-slate-200 md:pl-6">
                <StepperField
                  label={t('settings.payroll.lateRules.maximumHoursPerMonth')}
                  value={maxHoursPerMonth}
                  onPlus={() => incDec(setMaxHoursPerMonth, Number(maxHoursPerMonth || 0), 0.5, 400)}
                  onMinus={() => decDec(setMaxHoursPerMonth, Number(maxHoursPerMonth || 0), 0.5, 0)}
                  disabled={!isEditing}
                  step={0.5}
                  onChange={(e) => {
                    const raw = String(e.target.value ?? '').replace(',', '.');

                    if (raw === '' || raw === '.') {
                      setMaxHoursPerMonth(raw);
                      return;
                    }

                    if (!/^\d+(\.\d*)?$/.test(raw)) return;

                    const n = parseFloat(raw);
                    if (Number.isFinite(n) && n >= 0 && n <= 400) {
                      setMaxHoursPerMonth(n);
                    }
                  }}
                  min={0}
                  max={400}
                />

                <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{t('settings.payroll.lateRules.deductOverLimitHours')}</p>
                  <Switch
                    checked={deductOverLimitHours}
                    onCheckedChange={setDeductOverLimitHours}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}