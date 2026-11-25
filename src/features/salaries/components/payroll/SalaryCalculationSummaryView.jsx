import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValueWithUnitSuffix } from '@/utils/durationLabels';
import {
  CalcCard,
  CalcCardFooter,
  CalcDataTable,
  SummaryMetricsBar,
  displayAmount,
  formatMoney,
  parseMoneyValue,
} from './salaryCalculationUi';

export default function SalaryCalculationSummaryView({ data, penaltiesRows = [], rewardsRows = [] }) {
  const { t } = useTranslation();

  const header = data?.header ?? {};
  const kpi = data?.kpi ?? { payout: 0, target: 0 };
  const additions = data?.additions_breakdown ?? {};
  const deductions = data?.deductions_breakdown ?? {};
  const absence = data?.absence_attendance ?? {};

  const basicSalary =
    parseMoneyValue(data?.basic_salary) ||
    parseMoneyValue(header?.basic_salary) ||
    0;

  const currency = useMemo(() => {
    const val = data?.basic_salary || header?.net_salary || '';
    if (typeof val === 'string') {
      const match = val.match(/[a-zA-Z]+/);
      return match ? match[0].toUpperCase() : t('salaries.salaryCalculationModal.summary.egp');
    }
    return t('salaries.salaryCalculationModal.summary.egp');
  }, [data, header, t]);

const kpiPayout =
  parseMoneyValue(kpi?.payout) ||
  parseMoneyValue(data?.additions_breakdown?.kpi_payout);

const kpiTarget = parseMoneyValue(kpi?.target);

const kpiPercentage =
  kpiTarget > 0
    ? Math.round((kpiPayout / kpiTarget) * 100)
    : 0;
  const insurance = parseMoneyValue(deductions?.insurance);
  const rewardsTotal = parseMoneyValue(additions?.rewards_total) || parseMoneyValue(header?.total_rewards);
  const commissionTotal = parseMoneyValue(additions?.commission_total);
  const freelanceTotal = parseMoneyValue(additions?.freelance_tasks_total);
  const freelanceTasksCount = data?.tasks_count ?? 0;

  const lateDeduction = parseMoneyValue(deductions?.late_deduction);
  const loanInstallments = parseMoneyValue(deductions?.loan_installments);
  const absenceDeduction = parseMoneyValue(deductions?.absence_deduction);
  const sickDeduction = parseMoneyValue(data?.sick_deduction);

  const absenceDays =
    data?.absence_days ??
    absence?.absence?.total ??
    data?.attendance_details?.absent_days_without_request_or_rejected ??
    0;

  const sickDays =
    absence?.sick_days ?? data?.sick_days ?? data?.deductions_breakdown?.sick_days ?? 0;

  const totalEarning =
    basicSalary + kpiPayout + rewardsTotal + commissionTotal + freelanceTotal;

  const totalDeduction =
    parseMoneyValue(header?.total_deductions) ||
    lateDeduction +
      insurance +
      loanInstallments +
      absenceDeduction +
      sickDeduction;

  const totalPenalties = useMemo(() => {
    const rows = penaltiesRows.length > 0 ? penaltiesRows : (data?.tables?.deductions || data?.tables?.penalties || []);
    return rows.reduce(
      (sum, row) => sum + parseMoneyValue(row?.amount),
      0
    );
  }, [penaltiesRows, data]);

  const totalRewardsFromRows = useMemo(() => {
    const rows = rewardsRows.length > 0 ? rewardsRows : (data?.tables?.rewards || []);
    return rows.reduce(
      (sum, row) => sum + parseMoneyValue(row?.amount),
      0
    );
  }, [rewardsRows, data]);

  const formatDays = (count) => formatValueWithUnitSuffix(t, count, 'day');

  const penaltyTableRows = useMemo(() => {
    const rows = penaltiesRows.length > 0 ? penaltiesRows : (data?.tables?.deductions || data?.tables?.penalties || []);
    return rows.map((row, idx) => ({
      id: row.id ?? idx,
      date: row.date ?? '--',
      amount: displayAmount(row.amount, true),
      reason: row.reason ?? row.type ?? '--',
    }));
  }, [penaltiesRows, data]);

  const rewardTableRows = useMemo(() => {
    const rows = rewardsRows.length > 0 ? rewardsRows : (data?.tables?.rewards || []);
    return rows.map((row, idx) => ({
      id: row.id ?? idx,
      date: row.date ?? '--',
      amount: displayAmount(row.amount, true),
      reason: row.reason ?? row.type ?? '--',
    }));
  }, [rewardsRows, data]);

  const earningRows = [
    {
      id: 'salary',
      item: t('salaries.salaryCalculationModal.summary.totalSalary'),
      amount: displayAmount(basicSalary, true),
    },
    {
      id: 'kpi',
      item: t('salaries.salaryCalculationModal.summary.basicKpi'),
      amount: displayAmount(kpiTarget, true),
    },
    {
      id: 'rewards',
      item: t('salaries.salaryCalculationModal.summary.totalRewards'),
      amount: displayAmount(rewardsTotal),
    },
    {
      id: 'commission',
      item: t('salaries.salaryCalculationModal.summary.commission'),
      amount: displayAmount(commissionTotal),
    },
    {
      id: 'freelance',
      item: t('salaries.salaryCalculationModal.summary.freelanceTasks'),
      details: freelanceTasksCount > 0 ? formatValueWithUnitSuffix(t, freelanceTasksCount, 'task') : '--',
      amount: displayAmount(freelanceTotal),
    },
  ];

  const deductionRows = [
    {
      id: 'late',
      item: t('salaries.salaryCalculationModal.summary.lateDeductions'),
      details: '--',
      amount: displayAmount(lateDeduction, true),
    },
    {
      id: 'insurance',
      item: t('salaries.salaryCalculationModal.summary.insurance'),
      details: '--',
      amount: displayAmount(insurance, true),
    },
    {
      id: 'loan',
      item: t('salaries.salaryCalculationModal.summary.loanInstallments'),
      details: '--',
      amount: displayAmount(loanInstallments, true),
    },
    {
      id: 'absence',
      item: t('salaries.salaryCalculationModal.summary.absenceDeduction'),
      details: formatDays(absenceDays),
      amount: displayAmount(absenceDeduction, true),
    },
    {
      id: 'sick',
      item: t('salaries.salaryCalculationModal.summary.sickDeduction'),
      details: formatDays(sickDays),
      amount: displayAmount(sickDeduction, true),
    },
  ];

  const emptyMsg = t('salaries.salaryCalculationModal.summary.noRecords');

  return (
    <div className="space-y-5">
      <SummaryMetricsBar
        items={[
          {
            label: t('salaries.salaryCalculationModal.summary.basicSalary'),
            value: `${currency} ${formatMoney(basicSalary)}`,
          },
       {
  label: t('salaries.salaryCalculationModal.summary.kpi'),
  value: `${kpiPercentage} %`,
},
          {
            label: t('salaries.salaryCalculationModal.summary.insurance'),
            value: formatMoney(insurance),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CalcCard
          title={t('salaries.salaryCalculationModal.summary.earning')}
          footer={
            <CalcCardFooter
              variant="green"
              label={t('salaries.salaryCalculationModal.summary.totalEarning')}
              value={displayAmount(totalEarning, true)}
            />
          }
        >
          <CalcDataTable
            columns={[
              {
                key: 'item',
                label: t('salaries.salaryCalculationModal.summary.item'),
              },

              {
                key: 'amount',
                label: t('salaries.salaryCalculationModal.summary.amount'),
                align: 'end',
              },
            ]}
            rows={earningRows}
            emptyMessage={emptyMsg}
          />
        </CalcCard>

        <CalcCard
          title={t('salaries.salaryCalculationModal.summary.deduction')}
          footer={
            <CalcCardFooter
              variant="red"
              label={t('salaries.salaryCalculationModal.summary.totalDeduction')}
              value={displayAmount(totalDeduction, true)}
            />
          }
        >
          <CalcDataTable
            columns={[
              {
                key: 'item',
                label: t('salaries.salaryCalculationModal.summary.item'),
              },
              {
                key: 'details',
                label: t('salaries.salaryCalculationModal.summary.details'),
              },
              {
                key: 'amount',
                label: t('salaries.salaryCalculationModal.summary.amount'),
                align: 'end',
              },
            ]}
            rows={deductionRows}
            emptyMessage={emptyMsg}
          />
        </CalcCard>

        <CalcCard
          title={t('salaries.salaryCalculationModal.summary.penalties')}
          footer={
            <CalcCardFooter
              variant="red"
              label={t('salaries.salaryCalculationModal.summary.totalPenalties')}
              value={displayAmount(totalPenalties, true)}
            />
          }
        >
          <div className="max-h-48 overflow-y-auto">
            <CalcDataTable
              columns={[
                {
                  key: 'date',
                  label: t('salaries.salaryCalculationModal.summary.date'),
                },
                {
                  key: 'amount',
                  label: t('salaries.salaryCalculationModal.summary.amount'),
                  align: 'end',
                },
                {
                  key: 'reason',
                  label: t('salaries.salaryCalculationModal.summary.reason'),
                },
              ]}
              rows={penaltyTableRows}
              emptyMessage={t('salaries.salaryCalculationModal.summary.noPenaltyData')}
            />
          </div>
        </CalcCard>

        <CalcCard
          title={t('salaries.salaryCalculationModal.summary.rewards')}
          footer={
            <CalcCardFooter
              variant="green"
              label={t('salaries.salaryCalculationModal.summary.totalRewardsFooter')}
              value={displayAmount(totalRewardsFromRows, true)}
            />
          }
        >
          <div className="max-h-48 overflow-y-auto">
            <CalcDataTable
              columns={[
                {
                  key: 'date',
                  label: t('salaries.salaryCalculationModal.summary.date'),
                },
                {
                  key: 'amount',
                  label: t('salaries.salaryCalculationModal.summary.amount'),
                  align: 'end',
                },
                {
                  key: 'reason',
                  label: t('salaries.salaryCalculationModal.summary.reason'),
                },
              ]}
              rows={rewardTableRows}
              emptyMessage={t('salaries.salaryCalculationModal.summary.noRecordsFound')}
            />
          </div>
        </CalcCard>
      </div>
    </div>
  );
}
