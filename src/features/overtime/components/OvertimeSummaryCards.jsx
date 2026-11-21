import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCountWithUnit } from '@/utils/durationLabels';

function Item({ labelKey, value, index, t }) {
  return (
    <div
      className={[
        'min-w-0',
        index % 2 !== 0 ? 'xl:border-s xl:border-slate-200 xl:ps-4' : '',
      ].join(' ')}
    >
      <div
        className="truncate text-[11px] font-medium text-black"
        title={t(`overtime.summaryCards.${labelKey}`)}
      >
        {t(`overtime.summaryCards.${labelKey}`)}
      </div>

      <div
        className="mt-1 truncate text-sm font-semibold text-slate-500"
        title={value ?? '--'}
      >
        {value ?? '--'}
      </div>
    </div>
  );
}

function SummaryCard({ title, items }) {
  const { t } = useTranslation();

  return (
    <Card className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-4 pb-3 pt-4">
        <FileText className="h-6 w-6 shrink-0 text-primary" />
        <CardTitle className="text-base font-semibold ">
          {t(`overtime.summaryCards.${title}`)}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 xl:grid-cols-2">
          {items.map((item, index) => (
            <Item
              key={`${item.labelKey}-${index}`}
              labelKey={item.labelKey}
              value={item.value}
              index={index}
              t={t}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OvertimeSummaryCards({ data }) {
  const { t } = useTranslation();
  const s = data?.data?.summary_cards || data?.summary_cards || {};
  const policy = data?.data?.payroll_policy || data?.payroll_policy || {};

  return ( <>
    {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="presentSummary"
        items={[
          {
            labelKey: 'workingDays',
            value: formatCountWithUnit(t, s.working_days_count ?? 0, 'day'),
          },
       
          {
            labelKey: 'annualLeave',
            value: formatCountWithUnit(t, s.annual_leave_days ?? 0, 'day'),
          },
          {
            labelKey: 'sickLeave',
            value: formatCountWithUnit(t, s.sick_leave_days ?? 0, 'day'),
          },
        ]}
      />

      <SummaryCard
        title="presentSummary"
        items={[
          {
            labelKey: 'totalOvertimeHours',
            value: s.total_overtime_hours_formatted || `0 ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'expectedWorkingHours',
            value: s.total_expected_working_hours_formatted
              ? s.total_expected_working_hours_formatted
              : `${s.total_expected_working_hours ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'actualWorkingHours',
            value: s.total_actual_working_hours_formatted
              ? s.total_actual_working_hours_formatted
              : `${s.total_actual_working_hours ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'gracePeriod',
            value: `${s.grace_period ?? 0} ${t('overtime.summaryCards.minutes')}`,
          },
        ]}
      />

      <SummaryCard
        title="presentSummary"
        items={[
          {
            labelKey: 'delayWithinGracePeriod',
            value: `${s.total_delay_within_grace_period ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'earlyLeave',
            value: `${s.total_early_leave ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'totalDelay',
            value: `${s.total_delay ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'otMultiplier',
            value: `${s.overtime_multiplier ?? 0}x`,
          },
        ]}
      />

      <SummaryCard
        title="presentSummary"
        items={[
          {
            labelKey: 'officialHolidays',
            value: formatCountWithUnit(t, data?.official_holidays ?? 0, 'day'),
          },
          {
            labelKey: 'absenceDays',
            value: formatCountWithUnit(t, s.absence_days_count ?? 0, 'day'),
          },
          {
            labelKey: 'paidLeaves',
            value: formatCountWithUnit(t, s.paid_leaves_count ?? 0, 'day'),
          },
          {
            labelKey: 'unpaidLeaves',
            value: formatCountWithUnit(t, s.unpaid_leaves_count ?? 0, 'day'),
          },
        ]}
      />

      <SummaryCard
        title="payrollPolicy"
        items={[
          {
            labelKey: 'policyName',
            value: policy.name || t('overtime.summaryCards.defaultPolicy'),
          },
          {
            labelKey: 'gracePeriod',
            value: `${policy.grace_period ?? 0} ${t('overtime.summaryCards.minutes')}`,
          },
          {
            labelKey: 'breakTime',
            value: `${policy.break_time ?? 0} ${t('overtime.summaryCards.hours')}`,
          },
          {
            labelKey: 'otMultiplier',
            value: `${policy.overtime_multiplier ?? 0}x`,
          },
        ]}
      />
    </div> */}


    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <SummaryCard
    title="presentSummary"
    items={[
      {
        labelKey: 'workingDays',
        value: formatCountWithUnit(
          t,
          s.working_days_count ?? 0,
          'day'
        ),
      },
    ]}
  />

  <SummaryCard
    title="presentSummary"
    items={[
      {
        labelKey: 'absenceDays',
        value: formatCountWithUnit(
          t,
          s.absence_days_count ?? 0,
          'day'
        ),
      },
    ]}
  />
</div>
    </>
  );
}

export default OvertimeSummaryCards;