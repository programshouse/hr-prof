import {
  formatInsuranceMoney,
  formatInsurancePercent,
} from './insuranceEmployeesUtils';

export function getInsuranceExportColumns(t) {
  return [
    { key: 'code', label: t('insuranceEmployees.export.code') },
    { key: 'name', label: t('insuranceEmployees.export.name') },
    { key: 'insurance_percentage', label: t('insuranceEmployees.table.insuranceRate') },
    { key: 'insurance_amount', label: t('insuranceEmployees.table.insuranceAmount') },
    {
      key: 'company_insurance_percent',
      label: t('insuranceEmployees.table.companyInsuranceRate'),
    },
    { key: 'company_insurance_amount', label: t('insuranceEmployees.table.amount') },
  ];
}

export function mapInsuranceRowsForExport(rows = []) {
  return rows.map((row) => ({
    ...row,
    insurance_percentage: formatInsurancePercent(row.insurance_percentage),
    insurance_amount: formatInsuranceMoney(row.insurance_amount),
    company_insurance_percent: formatInsurancePercent(row.company_insurance_percent),
    company_insurance_amount: formatInsuranceMoney(row.company_insurance_amount),
  }));
}
