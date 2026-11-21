import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReusablePayrollSheetPage from '../components/payroll/ReusablePayrollSheetPage';
import { salariesApi } from '../api/salariesApi';

function MoneyBadge({ value, type = 'normal' }) {
  const isPositive = type === 'positive';
  const isNegative = type === 'negative';

  return (
    <span
      className={[
        'inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold',
        isPositive ? 'border-green-100 bg-green-50 text-green-600' : '',
        isNegative ? 'border-red-100 bg-red-50 text-red-600' : '',
        !isPositive && !isNegative ? 'border-slate-100 bg-slate-50 text-slate-700' : '',
      ].join(' ')}
    >
      {value}
    </span>
  );
}

export default function FreelancePayrollSheetPage() {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'code',
        label: t('salaries.freelancePayroll.columns.id', 'ID'),
      },
      {
        key: 'name',
        label: t('salaries.freelancePayroll.columns.name', 'Name'),
        render: (row) => (
          <div>
            <div className="font-semibold text-slate-900">{row.name || '--'}</div>
            <div className="text-primary text-[11px]">{row.position || '--'}</div>
          </div>
        ),
      },
      {
        key: 'department',
        label: t('salaries.freelancePayroll.columns.department', 'Department'),
      },
      {
        key: 'required_monthly_hours_display',
        exportKey: 'required_monthly_hours_display',
        label: t('salaries.freelancePayroll.columns.requiredHours', 'Required Hours'),
      },
      {
        key: 'worked_hours_display',
        exportKey: 'worked_hours_display',
        label: t('salaries.freelancePayroll.columns.workedHours', 'Worked Hours'),
      },
      {
        key: 'hourly_rate_display',
        exportKey: 'hourly_rate_display',
        label: t('salaries.freelancePayroll.columns.hourCost', 'Hour Cost'),
      },
      {
        key: 'difference_amount_display',
        exportKey: 'difference_amount_display',
        label: t('salaries.freelancePayroll.columns.difference', 'Difference'),
        render: (row) => {
          const difference = Number(row.difference_hours || 0);

          if (difference === 0) {
            return <span className="text-slate-400">--</span>;
          }

          return (
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md border border-slate-100 bg-white px-2 py-1 text-[11px] text-slate-500">
                {Math.abs(difference).toFixed(2)}H
              </span>

              <MoneyBadge
                value={row.difference_amount_display}
                type={difference > 0 ? 'positive' : 'negative'}
              />
            </div>
          );
        },
      },
      {
        key: 'overtime_hours_display',
        exportKey: 'overtime_hours_display',
        label: t('salaries.freelancePayroll.columns.overtimeHours', 'Overtime Hours'),
        render: (row) => {
          const minutes = Number(row.approved_overtime_minutes || 0);

          if (!minutes) return <span className="text-slate-400">--</span>;

          return (
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md border border-slate-100 bg-white px-2 py-1 text-[11px] text-slate-500">
                {row.overtime_hours_display}
              </span>

              <MoneyBadge
                value={row.overtime_amount ? `EGP ${row.overtime_amount}` : 'EGP 0'}
                type="positive"
              />
            </div>
          );
        },
      },
      {
        key: 'kpi_amount_display',
        exportKey: 'kpi_amount_display',
        label: t('salaries.freelancePayroll.columns.kpi', 'Kpi'),
      },
      {
        key: 'net_salary_display',
        exportKey: 'net_salary_display',
        label: t('salaries.freelancePayroll.columns.totalAmount', 'Total Amount'),
      },
    ],
    [t]
  );

  return (
    <ReusablePayrollSheetPage
      queryKey="accountPayrollFreelanceSheet"
      queryFn={salariesApi.getAccountPayrollFreelanceSheet}
      title={t('salaries.freelancePayroll.title', 'Freelance Payroll Sheet')}
      exportTitle={t('salaries.freelancePayroll.exportTitle', 'Freelance Payroll Sheet')}
      fileName="freelance-payroll-sheet"
      columns={columns}
      defaultPageSize={50}
    />
  );
}
