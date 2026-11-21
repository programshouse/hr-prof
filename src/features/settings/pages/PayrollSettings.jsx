import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SalaryRules from '../components/Payroll/SalaryRules';
import LateRules from '../components/Payroll/LateRules';
import HolidayRules from '../components/Payroll/HolidayRules';
import {
  SubTab,
  PrimaryButton,
  EditButton,
  TinyPlusButton,
  Checkbox,
} from '../components/Payroll/PayrollUI';
import {
  savePayrollPolicy,
  createPayrollPolicyData,
  getPayrollPolicy,
  normalizeCurrency,
  transformAPIDataToUI,
} from '../components/Payroll/payroll';
import { toast } from 'sonner';

/* --------------------------------- page -------------------------------- */

export default function PayrollSettings() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [payrollTab, setPayrollTab] = useState('salary');

  /* ---------------- Salary Rules state ---------------- */

  const [daysInMonth, setDaysInMonth] = useState(30);
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(8);
  const [breakTime, setBreakTime] = useState(60);

  const [payrollMonthMode, setPayrollMonthMode] =
    useState('fixed_cutoff');

  const [payrollCutoffDay, setPayrollCutoffDay] =
    useState(30);

  const [overtimeMultiplier, setOvertimeMultiplier] =
    useState(1.35);

  const [
    officialHolidayMultiplier,
    setOfficialHolidayMultiplier,
  ] = useState(2);

  const [missionMultiplier, setMissionMultiplier] =
    useState(2);

  // NEW
  const [currency, setCurrency] = useState('egp');

  /* ---------------- Late Rules state ---------------- */

  const [lateRules, setLateRules] = useState([
    {
      id: 1,
      rangeLabel: '0-15',
      multiplierLabel: '0-15',
      deductMode: 'grace',
    },
    {
      id: 2,
      rangeLabel: '16-30',
      multiplierLabel: '2x',
      deductMode: 'per_minute',
    },
    {
      id: 3,
      rangeLabel: '31-60',
      multiplierLabel: '4x',
      deductMode: 'per_minute',
    },
    {
      id: 4,
      rangeLabel: '61+',
      multiplierLabel: '1x',
      deductMode: 'full_hour',
    },
  ]);

  const [maxHoursPerRequest, setMaxHoursPerRequest] =
    useState(2);

  const [maxHoursPerMonth, setMaxHoursPerMonth] =
    useState(4);

  const [deductOverLimitHours, setDeductOverLimitHours] =
    useState(true);

  /* ---------------- Holiday Rules state ---------------- */

  const [holidayRows, setHolidayRows] = useState([
    {
      id: 1,
      fromNumber: 6,
      toNumber: 12,
      annualLeaveDays: 15,
      casualLeaveDays: 5,
    },
    {
      id: 2,
      fromNumber: 12,
      toNumber: 24,
      annualLeaveDays: 15,
      casualLeaveDays: 5,
    },
    {
      id: 3,
      fromNumber: 24,
      toNumber: 36,
      annualLeaveDays: 15,
      casualLeaveDays: 5,
    },
  ]);

  const [applyFullTime, setApplyFullTime] =
    useState(true);

  const [applyPartTime, setApplyPartTime] =
    useState(false);

  const [applyOnsite, setApplyOnsite] =
    useState(true);

  const [applyRemote, setApplyRemote] =
    useState(false);

  // Multi-select employee types state
  const [employeeTypeKeys, setEmployeeTypeKeys] =
    useState(['FT_ON']);

  const [options, setOptions] = useState([]);

  // Handler to receive options from HolidayRules
  const handleOptionsChange = (newOptions) => {
    setOptions(newOptions);
  };

  const [
    insuranceDeductionEnabled,
    setInsuranceDeductionEnabled,
  ] = useState(true);

  const [insurancePercent, setInsurancePercent] =
    useState(11);

  const [companyInsurancePercent, setCompanyInsurancePercent] =
    useState(0);

  const [salaryCap, setSalaryCap] = useState(2700);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [isEnteringEditMode, setIsEnteringEditMode] =
    useState(false);

  // snapshot for Cancel
  const [snapshot, setSnapshot] = useState(null);

  /* ---------------- helpers ---------------- */

  const moneyFmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }),
    [],
  );

  const incInt = (
    setter,
    value,
    step,
    max,
  ) => setter(Math.min(max, value + step));

  const decInt = (
    setter,
    value,
    step,
    min,
  ) => setter(Math.max(min, value - step));

  const incDec = (
    setter,
    value,
    step,
    max,
  ) =>
    setter(
      Number(
        Math.min(max, value + step).toFixed(2),
      ),
    );

  const decDec = (
    setter,
    value,
    step,
    min,
  ) =>
    setter(
      Number(
        Math.max(min, value - step).toFixed(2),
      ),
    );

  const buildSnapshot = () => ({
    daysInMonth,
    workingHoursPerDay,
    breakTime,
    payrollMonthMode,
    payrollCutoffDay,
    overtimeMultiplier,
    officialHolidayMultiplier,
    missionMultiplier,

    // NEW
    currency,

    lateRules,
    maxHoursPerRequest,
    maxHoursPerMonth,
    deductOverLimitHours,

    holidayRows,
    applyFullTime,
    applyPartTime,
    applyOnsite,
    applyRemote,

    employeeTypeKeys,
    options,

    insuranceDeductionEnabled,
    insurancePercent,
    companyInsurancePercent,
    salaryCap,
  });

  const restoreSnapshot = (s) => {
    if (!s) return;

    setDaysInMonth(s.daysInMonth);
    setWorkingHoursPerDay(s.workingHoursPerDay);
    setBreakTime(s.breakTime);

    setPayrollMonthMode(s.payrollMonthMode);
    setPayrollCutoffDay(s.payrollCutoffDay);

    setOvertimeMultiplier(s.overtimeMultiplier);

    setMissionMultiplier(s.missionMultiplier);

    setOfficialHolidayMultiplier(
      s.officialHolidayMultiplier,
    );

    // NEW
    setCurrency(s.currency);

    setLateRules(s.lateRules);

    setMaxHoursPerRequest(s.maxHoursPerRequest);

    setMaxHoursPerMonth(s.maxHoursPerMonth);

    setDeductOverLimitHours(
      s.deductOverLimitHours,
    );

    setHolidayRows(s.holidayRows);

    setApplyFullTime(s.applyFullTime);

    setApplyPartTime(s.applyPartTime);

    setApplyOnsite(s.applyOnsite);

    setApplyRemote(s.applyRemote);

    setEmployeeTypeKeys(s.employeeTypeKeys);

    setOptions(s.options);

    setInsuranceDeductionEnabled(
      s.insuranceDeductionEnabled,
    );

    setInsurancePercent(s.insurancePercent);

    setCompanyInsurancePercent(s.companyInsurancePercent);

    setSalaryCap(s.salaryCap);
  };

  const enterEditMode = async () => {
    setIsEnteringEditMode(true);

    // Simulate a brief loading period for better UX
    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    );

    setSnapshot(buildSnapshot());

    setIsEditing(true);

    setIsEnteringEditMode(false);
  };

  const cancelEditMode = () => {
    restoreSnapshot(snapshot);

    setIsEditing(false);

    toast.message(
      t('settings.payroll.actions.changesDiscarded'),
    );
  };

  // Load payroll policy data on component mount
  useEffect(() => {
    const loadPayrollPolicy = async () => {
      setIsLoading(true);

      try {
        const apiData = await getPayrollPolicy();

        const data = apiData?.data || apiData;

        if (data) {
          const uiData =
            transformAPIDataToUI(data);

          if (uiData) {
            setDaysInMonth(uiData.daysInMonth);

            setWorkingHoursPerDay(
              uiData.workingHoursPerDay,
            );

            setBreakTime(uiData.breakTime);

            setPayrollMonthMode(
              uiData.payrollMonthMode,
            );

            setPayrollCutoffDay(
              uiData.payrollCutoffDay,
            );

            setOvertimeMultiplier(
              uiData.overtimeMultiplier,
            );

            setMissionMultiplier(
              uiData.missionMultiplier,
            );

            setOfficialHolidayMultiplier(
              uiData.officialHolidayMultiplier,
            );

            // NEW
            setCurrency(normalizeCurrency(uiData.currency));

            setMaxHoursPerRequest(
              uiData.maxHoursPerRequest,
            );

            setMaxHoursPerMonth(
              uiData.maxHoursPerMonth,
            );

            setInsuranceDeductionEnabled(
              uiData.insuranceDeductionEnabled,
            );

            setInsurancePercent(
              uiData.insurancePercent,
            );

            setCompanyInsurancePercent(
              uiData.companyInsurancePercent,
            );

            setSalaryCap(uiData.salaryCap);

            setLateRules(uiData.lateRules);

            setHolidayRows(uiData.holidayRows);

            setApplyFullTime(
              uiData.applyFullTime,
            );

            setApplyPartTime(
              uiData.applyPartTime,
            );

            setApplyOnsite(
              uiData.applyOnsite,
            );

            setApplyRemote(
              uiData.applyRemote,
            );

            setEmployeeTypeKeys(
              uiData.employeeTypeKeys,
            );
          }
        }
      } catch (error) {
        console.error(
          'Error loading payroll policy:',
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPayrollPolicy();
  }, []);

  const savePayrollPolicyHandler = async () => {
    setIsSaving(true);

    try {
      const policyData =
        createPayrollPolicyData({
          daysInMonth,
          workingHoursPerDay,
          breakTime,
          payrollMonthMode,
          payrollCutoffDay,

          overtimeMultiplier,
          missionMultiplier,
          officialHolidayMultiplier,

          // NEW
          currency,

          maxHoursPerRequest,
          maxHoursPerMonth,

          insuranceDeductionEnabled,
          insurancePercent,
          companyInsurancePercent,
          salaryCap,

          lateRules,
          holidayRows,

          applyFullTime,
          applyPartTime,

          applyOnsite,
          applyRemote,

          employeeTypeKeys,
          options,
        });

      const result =
        await savePayrollPolicy(policyData);

      toast.success(
        t('settings.payroll.actions.saveSuccess'),
      );

      console.log('Saved policy:', result);

      setIsEditing(false);

      setSnapshot(null);
    } catch (error) {
      console.error(
        'Error saving payroll policy:',
        error,
      );

      toast.error(
        t('settings.payroll.actions.saveError'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="space-y-6"
    >
      {/* Full-page loader overlay when entering edit mode */}

      {isEnteringEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>

            <span className="text-sm font-medium text-slate-700">
              {t(
                'settings.payroll.actions.loadingEditMode',
              )}
            </span>
          </div>
        </div>
      )}

      {/* Save button and message */}

      <div className="flex items-center justify-between">
        <div>
          {isLoading && (
            <div className="text-sm text-blue-600">
              {t(
                'settings.payroll.actions.loadingPolicy',
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={cancelEditMode}
              disabled={isSaving || isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('settings.actions.cancel')}
            </button>
          )}

          <PrimaryButton
            onClick={
              isEditing
                ? savePayrollPolicyHandler
                : enterEditMode
            }
            disabled={
              isSaving ||
              isLoading ||
              isEnteringEditMode
            }
          >
            {isSaving
              ? t(
                  'settings.payroll.actions.saving',
                )
              : isLoading || isEnteringEditMode
                ? t(
                    'settings.payroll.actions.loading',
                  )
                : isEditing
                  ? t(
                      'settings.payroll.actions.savePolicy',
                    )
                  : t(
                      'settings.payroll.actions.editPolicy',
                    )}
          </PrimaryButton>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'salary'}
            onClick={() =>
              setPayrollTab('salary')
            }
          >
            {t(
              'settings.payroll.tabs.salaryRules',
            )}
          </SubTab>
        </div>

        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'late'}
            onClick={() =>
              setPayrollTab('late')
            }
          >
            {t(
              'settings.payroll.tabs.lateRules',
            )}
          </SubTab>
        </div>

        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'holiday'}
            onClick={() =>
              setPayrollTab('holiday')
            }
          >
            {t(
              'settings.payroll.tabs.holidayRules',
            )}
          </SubTab>
        </div>
      </div>

      {/* --------------------------- SALARY RULES TAB --------------------------- */}

      {payrollTab === 'salary' && (
        <SalaryRules
          daysInMonth={daysInMonth}
          setDaysInMonth={setDaysInMonth}
          workingHoursPerDay={workingHoursPerDay}
          setWorkingHoursPerDay={
            setWorkingHoursPerDay
          }
          breakTime={breakTime}
          setBreakTime={setBreakTime}
          payrollMonthMode={payrollMonthMode}
          setPayrollMonthMode={
            setPayrollMonthMode
          }
          payrollCutoffDay={payrollCutoffDay}
          setPayrollCutoffDay={
            setPayrollCutoffDay
          }
          overtimeMultiplier={
            overtimeMultiplier
          }
          setOvertimeMultiplier={
            setOvertimeMultiplier
          }
          officialHolidayMultiplier={
            officialHolidayMultiplier
          }
          setOfficialHolidayMultiplier={
            setOfficialHolidayMultiplier
          }
          missionMultiplier={missionMultiplier}
          setMissionMultiplier={
            setMissionMultiplier
          }

          // NEW
          currency={currency}
          setCurrency={setCurrency}

          moneyFmt={moneyFmt}
          incInt={incInt}
          decInt={decInt}
          incDec={incDec}
          decDec={decDec}
          isEditing={isEditing}
        />
      )}

      {/* ---------------------------- LATE RULES TAB ---------------------------- */}

      {payrollTab === 'late' && (
        <LateRules
          lateRules={lateRules}
          setLateRules={setLateRules}
          maxHoursPerRequest={
            maxHoursPerRequest
          }
          setMaxHoursPerRequest={
            setMaxHoursPerRequest
          }
          maxHoursPerMonth={maxHoursPerMonth}
          setMaxHoursPerMonth={
            setMaxHoursPerMonth
          }
          deductOverLimitHours={
            deductOverLimitHours
          }
          setDeductOverLimitHours={
            setDeductOverLimitHours
          }
          incDec={incDec}
          decDec={decDec}
          PrimaryButton={PrimaryButton}
          isEditing={isEditing}
        />
      )}

      {/* -------------------------- HOLIDAY RULES TAB -------------------------- */}

      {payrollTab === 'holiday' && (
        <HolidayRules
          holidayRows={holidayRows}
          setHolidayRows={setHolidayRows}
          applyFullTime={applyFullTime}
          setApplyFullTime={
            setApplyFullTime
          }
          applyPartTime={applyPartTime}
          setApplyPartTime={
            setApplyPartTime
          }
          applyOnsite={applyOnsite}
          setApplyOnsite={setApplyOnsite}
          applyRemote={applyRemote}
          setApplyRemote={setApplyRemote}
          employeeTypeKeys={
            employeeTypeKeys
          }
          setEmployeeTypeKeys={
            setEmployeeTypeKeys
          }
          onOptionsChange={
            handleOptionsChange
          }
          insuranceDeductionEnabled={
            insuranceDeductionEnabled
          }
          setInsuranceDeductionEnabled={
            setInsuranceDeductionEnabled
          }
          insurancePercent={
            insurancePercent
          }
          setInsurancePercent={
            setInsurancePercent
          }
          companyInsurancePercent={
            companyInsurancePercent
          }
          setCompanyInsurancePercent={
            setCompanyInsurancePercent
          }
          salaryCap={salaryCap}
          setSalaryCap={setSalaryCap}
          incInt={incInt}
          decInt={decInt}
          TinyPlusButton={
            TinyPlusButton
          }
          EditButton={EditButton}
          Checkbox={Checkbox}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}