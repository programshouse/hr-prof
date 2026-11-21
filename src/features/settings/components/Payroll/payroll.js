/**
 * Payroll API functions and utilities
 */
import { payrollApi } from "../../api/payroll.api";

const SUPPORTED_CURRENCIES = ['egp', 'usd', 'sar', 'aed', 'eur'];

/** Normalize API/UI currency to a supported lowercase code (default: egp). */
export const normalizeCurrency = (value) => {
  const code = String(value ?? 'egp')
    .trim()
    .toLowerCase();

  return SUPPORTED_CURRENCIES.includes(code) ? code : 'egp';
};

/**
 * Save payroll policy data to the backend
 * @param {Object} payrollData - The payroll policy data to save
 * @returns {Promise<Object>} - The API response
 */
export const savePayrollPolicy = async (payrollData) => {
  try {
    const result = await payrollApi.savePayrollPolicy(payrollData);
    return result;
  } catch (error) {
    console.error("Error saving payroll policy:", error);
    throw error;
  }
};

/**
 * Get payroll policy data from the backend
 * @returns {Promise<Object>} - The API response
 */
export const getPayrollPolicy = async () => {
  try {
    const result = await payrollApi.getPayrollPolicy();
    return result;
  } catch (error) {
    console.error("Error getting payroll policy:", error);
    throw error;
  }
};

/**
 * Transform late rules from UI format to API format
 * @param {Array} lateRules - Array of late rule objects from UI state
 * @returns {Array} - Transformed late rules for API
 */
export const transformLateRules = (lateRules) => {
  return (lateRules || []).map((rule) => {
    const rangeLabel = rule?.rangeLabel || "0-0";
    const range = rangeLabel.split("-").map((r) => r.replace("+", "").trim());

    const from = Number.parseInt(range[0], 10) || 0;
    // Handle "61+" case by setting a large number instead of null
    const to = range[1] ? Number.parseInt(range[1], 10) : 999;

    const multiplierLabel = rule?.multiplierLabel || "1x";
    const multiplier = Number.parseFloat(multiplierLabel.replace("x", "")) || 1;

    const deductMode = (rule?.deductMode || "none")
      .toLowerCase()
      .replace(/\s+/g, "_");

    return {
      from,
      to,
      multiplier,
      deduct_mode: deductMode,
    };
  });
};

/**
 * Transform holiday rules from UI format to API format
 * @param {Array} holidayRows
 * @param {boolean} applyFullTime
 * @param {boolean} applyPartTime
 * @param {boolean} applyOnsite
 * @param {boolean} applyRemote
 * @param {Array} employeeTypeKeys - Array of selected option keys
 * @param {Array} options - Available options to determine type
 * @returns {Array}
 */
export const transformHolidayRules = (
  holidayRows,
  applyFullTime,
  applyPartTime,
  applyOnsite,
  applyRemote,
  employeeTypeKeys = [],
  _options = []
) => {
  // Map employee type keys to shift IDs
  // FT_ON -> 1, FT_REMOTE -> 2, PT_ON -> 3 (example mapping)
  const keyToShiftId = {
    'FT_ON': 1,
    'FT_REMOTE': 2, 
    'FT_HYBRID': 3,
    'PT_ON': 4,
    'PT_REMOTE': 5
  };

  // Convert selected keys to shift IDs
  const applicableEmployeeTypeIds = employeeTypeKeys
    .map(key => keyToShiftId[key])
    .filter(id => id !== undefined); // Remove undefined values

  return (holidayRows || []).map((row) => {
    return {
      from_month: Number(row?.fromNumber) || 6,
      to_month: Number(row?.toNumber) || 12,
      annual_days: Number(row?.annualLeaveDays) || 15,
      casual_days: Number(row?.casualLeaveDays) || 5,
      full_time: !!applyFullTime,
      part_time: !!applyPartTime,
      onsite: !!applyOnsite,
      remote: !!applyRemote,
      applicable_employee_type_ids: applicableEmployeeTypeIds.length > 0 ? applicableEmployeeTypeIds : [1, 2, 3], // Use real shift IDs or default
      applicable_work_setups: ["remote", "onsite"], // Always send work setups
    };
  });
};

/**
 * Create complete payroll policy data object from UI state
 * @param {Object} state - The UI state object containing all payroll settings
 * @returns {Object} - Complete payroll policy data ready for API
 */
export const createPayrollPolicyData = (state) => {
  const {
    daysInMonth,
    workingHoursPerDay,
    breakTime,
    payrollMonthMode,
    payrollCutoffDay,
    overtimeMultiplier,
    missionMultiplier,
    officialHolidayMultiplier,
    maxHoursPerRequest,
    maxHoursPerMonth,
    insuranceDeductionEnabled,
    insurancePercent,
    companyInsurancePercent,
    salaryCap,
    currency,
    lateRules,
    holidayRows,
    applyFullTime,
    applyPartTime,
    applyOnsite,
    applyRemote,
    employeeTypeKeys,
    options, // Add options parameter
  } = state || {};

  return {
    name: "Default Policy",
    days_in_month: daysInMonth,
    payroll_month_mode: payrollMonthMode,
    payroll_cutoff_day: payrollMonthMode === 'fixed_cutoff' ? payrollCutoffDay : null,
    working_hours_per_day: workingHoursPerDay,
    break_time: (breakTime || 0) / 60, // Convert minutes to hours
    overtime_multiplier: overtimeMultiplier,
    mission_multiplier: missionMultiplier,
    official_holiday_multiplier: officialHolidayMultiplier,
    permissions_max_hours_per_request: maxHoursPerRequest,
    permissions_max_hours_per_month: maxHoursPerMonth,
    insurance_enabled: insuranceDeductionEnabled,
    insurance_percent: insurancePercent,
    company_insurance_percent: companyInsurancePercent,
    salary_cap: salaryCap,
    currency: normalizeCurrency(currency),
    late_rules: transformLateRules(lateRules),
    annual_leave_rules: transformHolidayRules(
      holidayRows,
      applyFullTime,
      applyPartTime,
      applyOnsite,
      applyRemote,
      employeeTypeKeys,
      options
    ),
  };
};

/**
 * Transform late rules from API format to UI format
 * @param {Array} apiLateRules - Array of late rule objects from API
 * @returns {Array} - Transformed late rules for UI
 */
export const transformLateRulesFromAPI = (apiLateRules) => {
  return (apiLateRules || []).map((rule, index) => {
    const from = Number(rule.from) || Number(rule.from_minute) || 0;
    const to = Number(rule.to) || Number(rule.to_minute);
    const rangeLabel = to ? `${from}-${to}` : `${from}+`;
    const multiplier = Number(rule.multiplier) || 1;
    const multiplierLabel = `${multiplier}x`;
    const deductMode = rule.deduct_mode === 'grace' ? 'grace' : 
                     rule.deduct_mode === 'per_minute' ? 'per_minute' : 
                     rule.deduct_mode === 'full_hour' ? 'full_hour' : 'grace';

    return {
      id: rule.id || index + 1,
      rangeLabel,
      multiplierLabel,
      deductMode
    };
  });
};

/**
 * Transform holiday rules from API format to UI format
 * @param {Array} apiHolidayRules - Array of holiday rule objects from API
 * @returns {Array} - Transformed holiday rules for UI
 */
export const transformHolidayRulesFromAPI = (apiHolidayRules) => {
  return (apiHolidayRules || []).map((rule, index) => {
    return {
      id: rule.id || index + 1,
      fromNumber: Number(rule.from_month) || 6,
      toNumber: Number(rule.to_month) || 12,
      annualLeaveDays: Number(rule.annual_days) || 15,
      casualLeaveDays: Number(rule.casual_days) || 5
    };
  });
};

/**
 * Transform complete API payroll policy data to UI state format
 * @param {Object} apiData - API response data
 * @returns {Object} - UI state data
 */
export const transformAPIDataToUI = (apiData) => {
  if (!apiData) return null;

  // Map shift IDs back to employee type keys
  const shiftIdToKey = {
    1: 'FT_ON',
    2: 'FT_REMOTE', 
    3: 'FT_HYBRID',
    4: 'PT_ON',
    5: 'PT_REMOTE'
  };

  // Extract applicable_employee_type_ids and applicable_work_setups from first annual_leave_rule if available
  const applicableEmployeeTypeIds = apiData.annual_leave_rules?.[0]?.applicable_employee_type_ids || [];
  const applicableWorkSetups = apiData.annual_leave_rules?.[0]?.applicable_work_setups || [];
  
  // Convert shift IDs back to keys and combine with work setups
  const employeeTypeKeys = [
    ...applicableEmployeeTypeIds.map(id => shiftIdToKey[id] || `shift_${id}`), // Map IDs back to keys
    ...applicableWorkSetups
  ];

  return {
    daysInMonth: Number(apiData.days_in_month) || 30,
    payrollMonthMode: apiData.payroll_month_mode || 'fixed_cutoff',
    payrollCutoffDay: Number(apiData.payroll_cutoff_day) || 30,
    workingHoursPerDay: Number(apiData.working_hours_per_day) || 8,
    breakTime: Math.round((Number(apiData.break_time) || 1) * 60), // Convert hours to minutes and round
    overtimeMultiplier: Number(apiData.overtime_multiplier) || 1.35,
    missionMultiplier: Number(apiData.mission_multiplier) || 2,
    officialHolidayMultiplier: Number(apiData.official_holiday_multiplier) || 2,
    maxHoursPerRequest: Number(apiData.permissions_max_hours_per_request) || 2,
    maxHoursPerMonth: Number(apiData.permissions_max_hours_per_month) || 4,
    insuranceDeductionEnabled: apiData.insurance_enabled !== false,
    insurancePercent: Number(apiData.insurance_percent) || 11,
    companyInsurancePercent: Number(apiData.company_insurance_percent) || 0,
    salaryCap: Number(apiData.salary_cap) || 2700,
    lateRules: transformLateRulesFromAPI(apiData.late_rules),
    holidayRows: transformHolidayRulesFromAPI(apiData.annual_leave_rules),
    applyFullTime: apiData.annual_leave_rules?.[0]?.full_time !== false,
    applyPartTime: apiData.annual_leave_rules?.[0]?.part_time === true,
    applyOnsite: apiData.annual_leave_rules?.[0]?.onsite !== false,
    applyRemote: apiData.annual_leave_rules?.[0]?.remote === true,
    employeeTypeKeys: employeeTypeKeys, // Use mapped keys,
    currency: normalizeCurrency(apiData.currency),
  };
};
