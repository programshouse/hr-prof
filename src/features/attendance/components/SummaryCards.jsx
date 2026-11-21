import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function buildSummaryDataFromApi(data, t) {
  if (!data) return null;
  const present = data.present_summary || {};
  const away = data.away_summary || {};
  const absent = data.absent_summary || {};

  return [
    {
      title: t('attendance.summaryCards.presentSummary'),
      stats: [
        { label: t('attendance.summaryCards.onTime'), value: String(present.on_time ?? 0), change: '', isPositive: true },
        { label: t('attendance.summaryCards.lateClockIn'), value: String(present.late ?? 0), change: '', isPositive: false },
        { label: t('attendance.summaryCards.earlyClockIn'), value: String(present.early ?? 0), change: '', isPositive: true },
      ],
    },
    {
      title: t('attendance.summaryCards.awaySummary'),
      stats: [
        { label: t('attendance.summaryCards.dayOff'), value: String(away.holiday ?? away.day_off ?? 0), change: '', isPositive: true },
        { label: t('attendance.summaryCards.presentEmployee'), value: String(present.total_present ?? 0), change: '', isPositive: true },
      ],
    },
    {
      title: t('attendance.summaryCards.absentSummary'),
      stats: [
        { label: t('attendance.summaryCards.absentEmployees'), value: String(absent.absent_employees ?? 0), change: '', isPositive: false },
      ],
    },
  ];
}

const fallbackSummaryData = (t) => [
  {
    title: t('attendance.summaryCards.presentSummary'),
    stats: [
      { label: t('attendance.summaryCards.onTime'), value: '0', change: '', isPositive: true },
      { label: t('attendance.summaryCards.lateClockIn'), value: '0', change: '', isPositive: false },
      { label: t('attendance.summaryCards.earlyClockIn'), value: '0', change: '', isPositive: true },
    ],
  },
  {
    title: t('attendance.summaryCards.awaySummary'),
    stats: [
      { label: t('attendance.summaryCards.dayOff'), value: '0', change: '', isPositive: true },
      { label: t('attendance.summaryCards.presentEmployee'), value: '0', change: '', isPositive: true },
    ],
  },
  {
    title: t('attendance.summaryCards.absentSummary'),
    stats: [
      { label: t('attendance.summaryCards.absentEmployees'), value: '0', change: '', isPositive: false },
    ],
  },
];

export function SummaryCards({ data }) {
  const { t } = useTranslation();
  const summaryData = buildSummaryDataFromApi(data, t) || fallbackSummaryData(t);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryData.map((card) => (
        <Card key={card.title} className="p-4!">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <FileText className="text-secondary size-4" />
            <CardTitle className="text-base font-semibold text-slate-900">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between gap-4">
              {card.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                  <div className="mt-1 font-bold text-slate-900">{stat.value}</div>
                  <div
                    className={cn(
                      'mt-1 text-xs',
                      stat.isPositive ? 'text-secondary' : 'text-warning'
                    )}
                  >
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
