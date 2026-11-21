import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import StepperField from '@/components/ui/StepperField';
import { TinyPlusButton, TinyMinusButton } from './PayrollUI';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

/**
 * ✅ SalaryRules (COMPLETE)
 * - Added Currency Settings
 * - Multiplier inputs accept "." while typing
 * - Supports comma keyboards "1,5"
 * - Keeps unified input styling
 * - Forces + and - buttons to be same size
 */

function MultiplierField({
  label,
  value,
  onChange,
  onBlur,
  onPlus,
  onMinus,
  helpText,
  disabled,
}) {
  const inputCls =
    'h-11 rounded-lg bg-white text-slate-900 border border-slate-200 ' +
    'placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-200 ' +
    'disabled:opacity-100 disabled:cursor-default disabled:bg-white disabled:text-slate-900';

  const btnWrapCls =
    'h-11 w-11 flex items-center justify-center rounded-lg';

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-900">
        {label}
      </p>

      <div className="flex items-center gap-3">
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputCls}
          placeholder="1.00"
        />

        <div className={btnWrapCls}>
          <TinyPlusButton
            onClick={onPlus}
            disabled={disabled}
            className="h-11 w-11 p-0"
          />
        </div>

        <div className={btnWrapCls}>
          <TinyMinusButton
            onClick={onMinus}
            disabled={disabled}
            className="h-11 w-11 p-0"
          />
        </div>
      </div>

      {helpText ? (
        <p className="text-xs text-slate-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}

function useMultiplierBuffer(
  numberValue,
  setNumberValue,
  { min = 1, max = 10 } = {},
) {
  const num = React.useCallback((v, fallback = 0) => {
    if (typeof v === 'number')
      return Number.isFinite(v) ? v : fallback;

    const s = String(v ?? '')
      .trim()
      .replace(',', '.');

    const n = parseFloat(s);

    return Number.isFinite(n) ? n : fallback;
  }, []);

  const show = React.useCallback(
    (v) => String(Number(num(v, 0).toFixed(2))),
    [num],
  );

  const [text, setText] = React.useState(
    show(numberValue),
  );

  React.useEffect(() => {
    setText(show(numberValue));
  }, [numberValue, show]);

  const onChange = React.useCallback(
    (e) => {
      const raw = e.target.value;

      if (
        !/^[0-9]*([.,][0-9]*)?$/.test(raw)
      )
        return;

      setText(raw);

      const cleaned = raw
        .replace(',', '.')
        .trim();

      if (
        cleaned === '' ||
        cleaned === '.'
      )
        return;

      const n = Number(cleaned);

      if (!Number.isFinite(n)) return;

      if (n >= min && n <= max)
        setNumberValue(n);
    },
    [min, max, setNumberValue],
  );

  const onBlur = React.useCallback(() => {
    const current = num(
      text,
      num(numberValue, min),
    );

    const clamped = Math.min(
      max,
      Math.max(min, current),
    );

    setNumberValue(clamped);

    setText(show(clamped));
  }, [
    max,
    min,
    num,
    numberValue,
    setNumberValue,
    show,
    text,
  ]);

  return {
    text,
    setText,
    onChange,
    onBlur,
    show,
    num,
  };
}

export default function SalaryRules({
  daysInMonth,
  setDaysInMonth,
  workingHoursPerDay,
  setWorkingHoursPerDay,
  breakTime,
  setBreakTime,

  overtimeMultiplier,
  setOvertimeMultiplier,
  officialHolidayMultiplier,
  setOfficialHolidayMultiplier,
  missionMultiplier,
  setMissionMultiplier,

  // NEW
  currency,
  setCurrency,

  payrollMonthMode,
  setPayrollMonthMode,
  payrollCutoffDay,
  setPayrollCutoffDay,

  moneyFmt,
  incInt,
  decInt,
  incDec,
  decDec,
  isEditing,
}) {
  const { t } = useTranslation();

  const disabled = !isEditing;

  const ot = useMultiplierBuffer(
    overtimeMultiplier,
    setOvertimeMultiplier,
    {
      min: 1,
      max: 10,
    },
  );

  const ms = useMultiplierBuffer(
    missionMultiplier,
    setMissionMultiplier,
    {
      min: 1,
      max: 10,
    },
  );

  const oh = useMultiplierBuffer(
    officialHolidayMultiplier,
    setOfficialHolidayMultiplier,
    {
      min: 1,
      max: 10,
    },
  );

  const [cutoffDayBuffer, setCutoffDayBuffer] =
    React.useState(
      String(payrollCutoffDay),
    );

  React.useEffect(() => {
    setCutoffDayBuffer(
      String(payrollCutoffDay),
    );
  }, [payrollCutoffDay]);

  const handleCutoffDayChange =
    React.useCallback(
      (e) => {
        const value = e.target.value;

        setCutoffDayBuffer(value);

        if (value === '') return;

        const val = parseInt(value);

        if (
          !isNaN(val) &&
          val >= 1 &&
          val <= 31
        ) {
          setPayrollCutoffDay(val);
        }
      },
      [setPayrollCutoffDay],
    );

  const handleCutoffDayBlur =
    React.useCallback(() => {
      const val = parseInt(
        cutoffDayBuffer,
      );

      if (isNaN(val) || val < 1) {
        setCutoffDayBuffer(
          String(payrollCutoffDay),
        );
      } else if (val > 31) {
        setCutoffDayBuffer('31');

        setPayrollCutoffDay(31);
      } else {
        setCutoffDayBuffer(String(val));

        setPayrollCutoffDay(val);
      }
    }, [
      cutoffDayBuffer,
      payrollCutoffDay,
      setPayrollCutoffDay,
    ]);

  const num = ot.num;

  return (
    <div className="space-y-6">
      {/* Payroll month settings */}

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {t(
                'settings.payroll.payrollMonthSettings',
              )}
            </p>

            <p className="text-xs text-slate-500">
              {t(
                'settings.payroll.payrollMonthDescription',
              )}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-900">
                    {t(
                      'settings.payroll.payrollMonthMode',
                    )}
                  </Label>

                  {disabled ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                        {payrollMonthMode ===
                        'fixed_cutoff'
                          ? t(
                              'settings.payroll.fixedCutoff',
                            )
                          : t(
                              'settings.payroll.calendar',
                            )}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPayrollMonthMode(
                            'fixed_cutoff',
                          )
                        }
                        className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors text-left ${
                          payrollMonthMode ===
                          'fixed_cutoff'
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:bg-slate-50'
                        } cursor-pointer`}
                      >
                        <div className="flex-1 space-y-1">
                          <div
                            className={`text-sm font-medium ${
                              payrollMonthMode ===
                              'fixed_cutoff'
                                ? 'text-indigo-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {t(
                              'settings.payroll.fixedCutoff',
                            )}
                          </div>

                          <p
                            className={`text-xs ${
                              payrollMonthMode ===
                              'fixed_cutoff'
                                ? 'text-primary'
                                : 'text-slate-500'
                            }`}
                          >
                            {t(
                              'settings.payroll.fixedCutoffDescription',
                            )}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPayrollMonthMode(
                            'calendar',
                          )
                        }
                        className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors text-left ${
                          payrollMonthMode ===
                          'calendar'
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:bg-slate-50'
                        } cursor-pointer`}
                      >
                        <div className="flex-1 space-y-1">
                          <div
                            className={`text-sm font-medium ${
                              payrollMonthMode ===
                              'calendar'
                                ? 'text-indigo-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {t(
                              'settings.payroll.calendar',
                            )}
                          </div>

                          <p
                            className={`text-xs ${
                              payrollMonthMode ===
                              'calendar'
                                ? 'text-primary'
                                : 'text-slate-500'
                            }`}
                          >
                            {t(
                              'settings.payroll.calendarDescription',
                            )}
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {!disabled && (
                  <div className="rounded-md bg-slate-50 p-4">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          {t(
                            'settings.payroll.currentMode',
                          )}
                          :
                          <span className="ml-1 text-indigo-600">
                            {payrollMonthMode ===
                            'fixed_cutoff'
                              ? t(
                                  'settings.payroll.fixedCutoff',
                                )
                              : t(
                                  'settings.payroll.calendar',
                                )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {payrollMonthMode ===
                  'fixed_cutoff' && (
                  <StepperField
                    label={t(
                      'settings.payroll.payrollCutoffDay',
                    )}
                    value={cutoffDayBuffer}
                    onPlus={() =>
                      incInt(
                        setPayrollCutoffDay,
                        num(
                          payrollCutoffDay,
                          1,
                        ),
                        1,
                        31,
                      )
                    }
                    onMinus={() =>
                      decInt(
                        setPayrollCutoffDay,
                        num(
                          payrollCutoffDay,
                          1,
                        ),
                        1,
                        1,
                      )
                    }
                    disabled={disabled}
                    onChange={
                      handleCutoffDayChange
                    }
                    onBlur={
                      handleCutoffDayBlur
                    }
                    min={1}
                    max={31}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base salary calculation settings */}

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {t(
                'settings.payroll.baseSalaryCalculationSettings',
              )}
            </p>

            <p className="text-xs text-slate-500">
              {t(
                'settings.payroll.baseSalaryCalculationDescription',
              )}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-6">
                <StepperField
                  label={t(
                    'settings.payroll.daysInMonth',
                  )}
                  value={daysInMonth}
                  onPlus={() =>
                    incInt(
                      setDaysInMonth,
                      num(daysInMonth, 1),
                      1,
                      31,
                    )
                  }
                  onMinus={() =>
                    decInt(
                      setDaysInMonth,
                      num(daysInMonth, 1),
                      1,
                      1,
                    )
                  }
                  disabled={disabled}
                  helpText={t(
                    'settings.payroll.daysInMonthHelp',
                  )}
                  onChange={(e) => {
                    const val =
                      parseInt(
                        e.target.value,
                      ) || 1;

                    if (
                      val >= 1 &&
                      val <= 31
                    )
                      setDaysInMonth(val);
                  }}
                  min={1}
                  max={31}
                />

                <StepperField
                  label={t(
                    'settings.payroll.breakTime',
                  )}
                  value={breakTime}
                  onPlus={() =>
                    incDec(
                      setBreakTime,
                      num(breakTime, 0),
                      5,
                      120,
                    )
                  }
                  onMinus={() =>
                    decDec(
                      setBreakTime,
                      num(breakTime, 0),
                      5,
                      0,
                    )
                  }
                  disabled={disabled}
                  onChange={(e) => {
                    const val =
                      parseFloat(
                        e.target.value,
                      ) || 0;

                    if (
                      val >= 0 &&
                      val <= 120
                    )
                      setBreakTime(val);
                  }}
                  min={0}
                  max={120}
                />
              </div>

              <div className="md:border-l md:border-slate-200 md:pl-6">
                <StepperField
                  label={t(
                    'settings.payroll.workingHoursPerDay',
                  )}
                  value={workingHoursPerDay}
                  onPlus={() =>
                    incDec(
                      setWorkingHoursPerDay,
                      num(
                        workingHoursPerDay,
                        1,
                      ),
                      0.5,
                      24,
                    )
                  }
                  onMinus={() =>
                    decDec(
                      setWorkingHoursPerDay,
                      num(
                        workingHoursPerDay,
                        1,
                      ),
                      0.5,
                      1,
                    )
                  }
                  disabled={disabled}
                  helpText={t(
                    'settings.payroll.workingHoursPerDayHelp',
                  )}
                  onChange={(e) => {
                    const val =
                      parseFloat(
                        e.target.value,
                      ) || 1;

                    if (
                      val >= 1 &&
                      val <= 24
                    )
                      setWorkingHoursPerDay(
                        val,
                      );
                  }}
                  min={1}
                  max={24}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency settings */}

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {t(
                'settings.payroll.currencySettings',
              )}
            </p>

            <p className="text-xs text-slate-500">
              {t(
                'settings.payroll.currencySettingsDescription',
              )}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  {t(
                    'settings.payroll.currency',
                  )}
                </Label>

                <select
                  value={(currency || 'egp').toLowerCase().trim()}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={disabled}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 disabled:cursor-default disabled:bg-slate-50"
                >
                  {['egp', 'usd', 'sar', 'aed', 'eur'].map((code) => (
                    <option key={code} value={code}>
                      {t(`settings.payroll.currencies.${code}`)}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-slate-500">
                  {t(
                    'settings.payroll.currencyHelp',
                  )}
                </p>
              </div>

              <div className="rounded-lg bg-indigo-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                  <div className="space-y-1 text-xs text-slate-700">
                    <p className="font-medium text-slate-900">
                      {t(
                        'settings.payroll.selectedCurrency',
                      )}
                    </p>

                    <p>
                      {currency?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiplier settings */}

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {t(
                'settings.payroll.multiplierSettings',
              )}
            </p>

            <p className="text-xs text-slate-500">
              {t(
                'settings.payroll.multiplierSettingsDescription',
              )}
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="grid gap-8 p-6 md:grid-cols-2">
              <div className="space-y-10">
                <MultiplierField
                  label={t(
                    'settings.payroll.overtimeMultiplier',
                  )}
                  value={ot.text}
                  disabled={disabled}
                  onChange={ot.onChange}
                  onBlur={ot.onBlur}
                  onPlus={() =>
                    incDec(
                      setOvertimeMultiplier,
                      num(
                        overtimeMultiplier,
                        1,
                      ),
                      0.05,
                      10,
                    )
                  }
                  onMinus={() =>
                    decDec(
                      setOvertimeMultiplier,
                      num(
                        overtimeMultiplier,
                        1,
                      ),
                      0.05,
                      1,
                    )
                  }
                  helpText={t(
                    'settings.payroll.overtimeMultiplierHelp',
                  )}
                />

                <MultiplierField
                  label={t(
                    'settings.payroll.missionMultiplier',
                  )}
                  value={ms.text}
                  disabled={disabled}
                  onChange={ms.onChange}
                  onBlur={ms.onBlur}
                  onPlus={() =>
                    incDec(
                      setMissionMultiplier,
                      num(
                        missionMultiplier,
                        1,
                      ),
                      0.05,
                      10,
                    )
                  }
                  onMinus={() =>
                    decDec(
                      setMissionMultiplier,
                      num(
                        missionMultiplier,
                        1,
                      ),
                      0.05,
                      1,
                    )
                  }
                  helpText={t(
                    'settings.payroll.missionMultiplierHelp',
                  )}
                />
              </div>

              <div className="md:border-l md:border-slate-200 md:pl-8">
                <div className="space-y-4">
                  <MultiplierField
                    label={t(
                      'settings.payroll.officialHolidayMultiplier',
                    )}
                    value={oh.text}
                    disabled={disabled}
                    onChange={oh.onChange}
                    onBlur={oh.onBlur}
                    onPlus={() =>
                      incDec(
                        setOfficialHolidayMultiplier,
                        num(
                          officialHolidayMultiplier,
                          1,
                        ),
                        0.05,
                        10,
                      )
                    }
                    onMinus={() =>
                      decDec(
                        setOfficialHolidayMultiplier,
                        num(
                          officialHolidayMultiplier,
                          1,
                        ),
                        0.05,
                        1,
                      )
                    }
                    helpText={t(
                      'settings.payroll.officialHolidayMultiplierHelp',
                    )}
                  />

                  <div className="flex items-start gap-2 rounded-md bg-indigo-50 p-3 text-xs text-slate-700">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                    <span>
                      <b>
                        {t(
                          'settings.payroll.overtimeRateFormula',
                        )}
                      </b>{' '}
                      {t(
                        'settings.payroll.hourlyRate',
                      )}{' '}
                      *
                      <b>
                        {' '}
                        {t(
                          'settings.payroll.overtimeMultiplier',
                        )}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}