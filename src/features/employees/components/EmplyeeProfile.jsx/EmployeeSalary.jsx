// EmployeeSalary.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

function formatMonth(month) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return monthNames[month - 1] || month;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function EmployeeSalary({ employeeId: _employeeId, salaryData, isLoading = false }) {
  const { t } = useTranslation();
  
  const salaryColumns = [
    { key: 'period', label: t('tables.headers.period') },
    { key: 'rewards', label: t('tables.headers.rewards') },
    { key: 'deductions', label: t('tables.headers.deductions') },
    { key: 'commission', label: t('tables.headers.commission') },
    { key: 'total_salary', label: t('tables.headers.totalSalary') },
  ];
  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">{t('employees.profile.details.salary.title')}</p>
          </div>
          <div className="border-t border-slate-100">
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const salaryMonths = salaryData?.months || [];

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">

        <div className="border-t border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                {salaryColumns.map((col) => (
                  <TableHead key={col.key} className="h-10 px-4 text-xs font-medium text-slate-700">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryMonths.length > 0 ? (
                salaryMonths.map((salary, index) => (
                  <TableRow key={index} className="border-slate-100">
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {salary.year} - {formatMonth(salary.month)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {formatCurrency(salary.rewards)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {formatCurrency(salary.deductions)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm text-slate-900">
                      {formatCurrency(salary.commission)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm font-medium text-slate-900">
                      {formatCurrency(salary.total_salary)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={salaryColumns.length} className="py-8 text-center text-sm text-slate-500">
                    {t('employees.profile.details.salary.noSalaryHistory')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
