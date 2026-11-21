// EmployeePayrollSetting.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import SalaryRules from '@/features/settings/components/Payroll/SalaryRules';
import LateRules from '@/features/settings/components/Payroll/LateRules';
import HolidayRules from '@/features/settings/components/Payroll/HolidayRules';

import {
  SubTab,
  PrimaryButton,
  EditButton,
  TinyPlusButton,
  Checkbox,
} from '@/features/settings/components/Payroll/PayrollUI';

import {
  saveEmployeePayrollPolicy,
  createPayrollPolicyData,
  getEmployeePayrollPolicy,
  normalizeCurrency,
  transformAPIDataToUI,
  resetEmployeePayrollPolicy,
} from '@/features/settings/components/Payroll/employeePayroll';

import { useAuthStore } from '@/services/auth/auth.store';

/* --------------------------------- component -------------------------------- */

export default function EmployeePayrollSetting({ employeeId }) {
  const { t } = useTranslation();

  /* =========================================================
     EMPLOYEE PORTAL
  ========================================================= */

  const isEmployeePortal = useAuthStore(
    (state) => state.authSource === 'employee-login'
  );

  const canManagePayroll = !isEmployeePortal;

  const [payrollTab, setPayrollTab] = useState('salary');

  /* ---------------- Salary Rules state ---------------- */

  const [daysInMonth, setDaysInMonth] = useState(30);
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(8);
  const [breakTime, setBreakTime] = useState(60);
  const [payrollMonthMode, setPayrollMonthMode] = useState('fixed_cutoff');
  const [payrollCutoffDay, setPayrollCutoffDay] = useState(25);
  const [currency, setCurrency] = useState('egp');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.35);
  const [officialHolidayMultiplier, setOfficialHolidayMultiplier] = useState(2);
  const [missionMultiplier, setMissionMultiplier] = useState(2);

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
      deductMode: 'Per Minute',
    },
    {
      id: 3,
      rangeLabel: '31-60',
      multiplierLabel: '4x',
      deductMode: 'Per Minute',
    },
    {
      id: 4,
      rangeLabel: '61+',
      multiplierLabel: '1x',
      deductMode: 'Full Hour',
    },
  ]);

  const [maxHoursPerRequest, setMaxHoursPerRequest] = useState(2);
  const [maxHoursPerMonth, setMaxHoursPerMonth] = useState(4);
  const [deductOverLimitHours, setDeductOverLimitHours] = useState(true);

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
      annualLeaveDays: 21,
      casualLeaveDays: 5,
    },
    {
      id: 3,
      fromNumber: 24,
      toNumber: 36,
      annualLeaveDays: 30,
      casualLeaveDays: 5,
    },
  ]);

  const [applyFullTime, setApplyFullTime] = useState(true);
  const [applyPartTime, setApplyPartTime] = useState(false);
  const [applyOnsite, setApplyOnsite] = useState(true);
  const [applyRemote, setApplyRemote] = useState(false);

  // Multi-select employee types state
  const [employeeTypeKeys, setEmployeeTypeKeys] = useState(['FT_ON']);
  const [options, setOptions] = useState([]);

  // Handler to receive options from HolidayRules
  const handleOptionsChange = (newOptions) => {
    if (!canManagePayroll) {
      return;
    }
    setOptions(newOptions);
  };

  const [insuranceDeductionEnabled, setInsuranceDeductionEnabled] = useState(true);
  const [insurancePercent, setInsurancePercent] = useState(11);
  const [companyInsurancePercent, setCompanyInsurancePercent] = useState(0);
  const [salaryCap, setSalaryCap] = useState(2700);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEnteringEditMode, setIsEnteringEditMode] = useState(false);

  // snapshot for Cancel
  const [snapshot, setSnapshot] = useState(null);

  // Store current payroll policy ID for updates
  const [currentPolicyId, setCurrentPolicyId] = useState(null);

  /* ---------------- helpers ---------------- */

  const moneyFmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }),
    []
  );

  const incInt = (setter, value, step, max) => {
    if (!canManagePayroll) {
      return;
    }
    setter(Math.min(max, value + step));
  };

  const decInt = (setter, value, step, min) => {
    if (!canManagePayroll) {
      return;
    }
    setter(Math.max(min, value - step));
  };

  const incDec = (setter, value, step, max) => {
    if (!canManagePayroll) {
      return;
    }
    setter(Number(Math.min(max, value + step).toFixed(2)));
  };

  const decDec = (setter, value, step, min) => {
    if (!canManagePayroll) {
      return;
    }
    setter(Number(Math.max(min, value - step).toFixed(2)));
  };

  /* =========================================================
     APPLY API DATA
  ========================================================= */

  const applyUiData = (uiData) => {
    if (!uiData) {
      return;
    }

    setDaysInMonth(uiData.daysInMonth);
    setWorkingHoursPerDay(uiData.workingHoursPerDay);
    setBreakTime(uiData.breakTime);
    setPayrollMonthMode(uiData.payrollMonthMode);
    setPayrollCutoffDay(uiData.payrollCutoffDay);
    setCurrency(normalizeCurrency(uiData.currency));
    setOvertimeMultiplier(uiData.overtimeMultiplier);
    setMissionMultiplier(uiData.missionMultiplier);
    setOfficialHolidayMultiplier(uiData.officialHolidayMultiplier);
    setMaxHoursPerRequest(uiData.maxHoursPerRequest);
    setMaxHoursPerMonth(uiData.maxHoursPerMonth);
    setInsuranceDeductionEnabled(uiData.insuranceDeductionEnabled);
    setInsurancePercent(uiData.insurancePercent);
    setCompanyInsurancePercent(uiData.companyInsurancePercent);
    setSalaryCap(uiData.salaryCap);
    setLateRules(uiData.lateRules);
    setHolidayRows(uiData.holidayRows);
    setApplyFullTime(uiData.applyFullTime);
    setApplyPartTime(uiData.applyPartTime);
    setApplyOnsite(uiData.applyOnsite);
    setApplyRemote(uiData.applyRemote);
    setEmployeeTypeKeys(uiData.employeeTypeKeys);
  };

  /* =========================================================
     SNAPSHOT
  ========================================================= */

  const buildSnapshot = () => ({
    daysInMonth,
    workingHoursPerDay,
    breakTime,
    payrollMonthMode,
    payrollCutoffDay,
    currency,
    overtimeMultiplier,
    officialHolidayMultiplier,
    missionMultiplier,
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
    if (!s) {
      return;
    }

    setDaysInMonth(s.daysInMonth);
    setWorkingHoursPerDay(s.workingHoursPerDay);
    setBreakTime(s.breakTime);
    setPayrollMonthMode(s.payrollMonthMode);
    setPayrollCutoffDay(s.payrollCutoffDay);
    setCurrency(normalizeCurrency(s.currency));
    setOvertimeMultiplier(s.overtimeMultiplier);
    setMissionMultiplier(s.missionMultiplier);
    setOfficialHolidayMultiplier(s.officialHolidayMultiplier);
    setLateRules(s.lateRules);
    setMaxHoursPerRequest(s.maxHoursPerRequest);
    setMaxHoursPerMonth(s.maxHoursPerMonth);
    setDeductOverLimitHours(s.deductOverLimitHours);
    setHolidayRows(s.holidayRows);
    setApplyFullTime(s.applyFullTime);
    setApplyPartTime(s.applyPartTime);
    setApplyOnsite(s.applyOnsite);
    setApplyRemote(s.applyRemote);
    setEmployeeTypeKeys(s.employeeTypeKeys);
    setOptions(s.options);
    setInsuranceDeductionEnabled(s.insuranceDeductionEnabled);
    setInsurancePercent(s.insurancePercent);
    setCompanyInsurancePercent(s.companyInsurancePercent);
    setSalaryCap(s.salaryCap);
  };

  /* =========================================================
     ENTER EDIT MODE
  ========================================================= */

  const enterEditMode = async () => {
    if (!canManagePayroll) {
      return;
    }

    setIsEnteringEditMode(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSnapshot(buildSnapshot());
    setIsEditing(true);
    setIsEnteringEditMode(false);
  };

  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const cancelEditMode = () => {
    if (!canManagePayroll) {
      return;
    }

    restoreSnapshot(snapshot);
    setIsEditing(false);
    toast.message('Changes discarded');
  };

  /* =========================================================
     LOAD EMPLOYEE PAYROLL POLICY
  ========================================================= */

  useEffect(() => {
    const loadPayrollPolicy = async () => {
      if (!employeeId) {
        return;
      }

      setIsLoading(true);

      try {
        const apiData = await getEmployeePayrollPolicy(employeeId);
        const data = apiData?.data || apiData;

        if (data) {
          setCurrentPolicyId(data.id);
          applyUiData(transformAPIDataToUI(data));
        }
      } catch (error) {
        console.error('Error loading employee payroll policy:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayrollPolicy();
  }, [employeeId]);

  /* =========================================================
     SAVE PAYROLL POLICY
  ========================================================= */

  const savePayrollPolicyHandler = async () => {
    if (!canManagePayroll) {
      return;
    }

    if (!employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    setIsSaving(true);

    try {
      const policyData = createPayrollPolicyData({
        daysInMonth,
        workingHoursPerDay,
        breakTime,
        payrollMonthMode,
        payrollCutoffDay,
        currency,
        overtimeMultiplier,
        missionMultiplier,
        officialHolidayMultiplier,
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

      if (currentPolicyId) {
        policyData.payroll_policy_id = currentPolicyId;
      }

      const result = await saveEmployeePayrollPolicy(employeeId, policyData);
      const saved = result?.data || result?.policy || result;

      if (saved?.id) {
        setCurrentPolicyId(saved.id);
      }

      if (saved) {
        applyUiData(transformAPIDataToUI(saved));
      }

      toast.success('Employee payroll policy saved successfully!');
      setIsEditing(false);
      setSnapshot(null);
    } catch (error) {
      console.error('Error saving employee payroll policy:', error);
      toast.error('Error saving payroll policy. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     DELETE / RESET POLICY
  ========================================================= */

  const deletePayrollPolicyHandler = async () => {
    if (!canManagePayroll) {
      return;
    }

    if (!employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reset this employee's payroll policy to default? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await resetEmployeePayrollPolicy(employeeId);

      toast.success('Employee payroll policy reset to default successfully!');
      console.log('Reset employee policy:', result);

      setIsLoading(true);

      try {
        const apiData = await getEmployeePayrollPolicy(employeeId);
        const data = apiData?.data || apiData;

        if (data) {
          setCurrentPolicyId(data.id);
          applyUiData(transformAPIDataToUI(data));
        }
      } catch (error) {
        console.error('Error loading default payroll policy:', error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error resetting employee payroll policy:', error);
      toast.error('Error resetting payroll policy. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* =========================================================
     VIEW
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          EDIT MODE LOADER
          HR / ADMIN ONLY
      ===================================================== */}
      {canManagePayroll && isEnteringEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-4 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium text-slate-700">
              Loading edit mode...
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          ACTION BAR
      ===================================================== */}
      <div className="flex items-center justify-between">
        <div>
          {isLoading && (
            <div className="text-sm text-blue-600">
              Loading payroll policy...
            </div>
          )}
        </div>

        {/* HR / ADMIN ONLY */}
        {canManagePayroll && (
          <div className="flex items-center gap-2">
            {/* CANCEL */}
            {isEditing && (
              <button
                type="button"
                onClick={cancelEditMode}
                disabled={isSaving || isLoading}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            )}

            {/* DELETE POLICY */}
            {!isEditing && (
              <button
                type="button"
                onClick={deletePayrollPolicyHandler}
                disabled={isDeleting || isLoading || isEnteringEditMode}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Policy'}
              </button>
            )}

            {/* EDIT / SAVE */}
            <PrimaryButton
              onClick={
                isEditing ? savePayrollPolicyHandler : enterEditMode
              }
              disabled={
                isSaving || isLoading || isEnteringEditMode || isDeleting
              }
            >
              {isSaving
                ? 'Saving...'
                : isLoading
                  ? 'Loading...'
                  : isEnteringEditMode
                    ? 'Loading...'
                    : isEditing
                      ? 'Save Policy'
                      : 'Edit Policy'}
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* =====================================================
          PAYROLL TABS
      ===================================================== */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'salary'}
            onClick={() => setPayrollTab('salary')}
          >
            {t('settings.payroll.tabs.salaryRules')}
          </SubTab>
        </div>

        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'late'}
            onClick={() => setPayrollTab('late')}
          >
            {t('settings.payroll.tabs.lateRules')}
          </SubTab>
        </div>

        <div className="cursor-pointer">
          <SubTab
            active={payrollTab === 'holiday'}
            onClick={() => setPayrollTab('holiday')}
          >
            {t('settings.payroll.tabs.holidayRules')}
          </SubTab>
        </div>
      </div>

      {/* =====================================================
          SALARY RULES TAB
      ===================================================== */}
      {payrollTab === 'salary' && (
        <SalaryRules
          daysInMonth={daysInMonth}
          setDaysInMonth={setDaysInMonth}
          workingHoursPerDay={workingHoursPerDay}
          setWorkingHoursPerDay={setWorkingHoursPerDay}
          breakTime={breakTime}
          setBreakTime={setBreakTime}
          payrollMonthMode={payrollMonthMode}
          setPayrollMonthMode={setPayrollMonthMode}
          payrollCutoffDay={payrollCutoffDay}
          setPayrollCutoffDay={setPayrollCutoffDay}
          currency={currency}
          setCurrency={setCurrency}
          overtimeMultiplier={overtimeMultiplier}
          setOvertimeMultiplier={setOvertimeMultiplier}
          officialHolidayMultiplier={officialHolidayMultiplier}
          setOfficialHolidayMultiplier={setOfficialHolidayMultiplier}
          missionMultiplier={missionMultiplier}
          setMissionMultiplier={setMissionMultiplier}
          moneyFmt={moneyFmt}
          incInt={incInt}
          decInt={decInt}
          incDec={incDec}
          decDec={decDec}
          isEditing={canManagePayroll && isEditing}
        />
      )}

      {/* =====================================================
          LATE RULES TAB
      ===================================================== */}
      {payrollTab === 'late' && (
        <LateRules
          lateRules={lateRules}
          setLateRules={setLateRules}
          maxHoursPerRequest={maxHoursPerRequest}
          setMaxHoursPerRequest={setMaxHoursPerRequest}
          maxHoursPerMonth={maxHoursPerMonth}
          setMaxHoursPerMonth={setMaxHoursPerMonth}
          deductOverLimitHours={deductOverLimitHours}
          setDeductOverLimitHours={setDeductOverLimitHours}
          incInt={incInt}
          decInt={decInt}
          PrimaryButton={PrimaryButton}
          isEditing={canManagePayroll && isEditing}
        />
      )}

      {/* =====================================================
          HOLIDAY RULES TAB
      ===================================================== */}
      {payrollTab === 'holiday' && (
        <HolidayRules
          holidayRows={holidayRows}
          setHolidayRows={setHolidayRows}
          applyFullTime={applyFullTime}
          setApplyFullTime={setApplyFullTime}
          applyPartTime={applyPartTime}
          setApplyPartTime={setApplyPartTime}
          applyOnsite={applyOnsite}
          setApplyOnsite={setApplyOnsite}
          applyRemote={applyRemote}
          setApplyRemote={setApplyRemote}
          employeeTypeKeys={employeeTypeKeys}
          setEmployeeTypeKeys={setEmployeeTypeKeys}
          onOptionsChange={handleOptionsChange}
          insuranceDeductionEnabled={insuranceDeductionEnabled}
          setInsuranceDeductionEnabled={setInsuranceDeductionEnabled}
          insurancePercent={insurancePercent}
          setInsurancePercent={setInsurancePercent}
          companyInsurancePercent={companyInsurancePercent}
          setCompanyInsurancePercent={setCompanyInsurancePercent}
          salaryCap={salaryCap}
          setSalaryCap={setSalaryCap}
          incInt={incInt}
          decInt={decInt}
          TinyPlusButton={TinyPlusButton}
          EditButton={EditButton}
          Checkbox={Checkbox}
          isEditing={canManagePayroll && isEditing}
        />
      )}
    </div>
  );
}