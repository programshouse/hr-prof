'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function EmployeesTypeBarChart({ data }) {
  const { t } = useTranslation();

  const chartConfig = useMemo(
    () => ({
      count: {
        label: t('dashboard.charts.employees'),
        color: 'var(--color-primary)',
      },
    }),
    [t]
  );

  const chartData = useMemo(() => {
    // If array already, reorder it (Full time first)
    if (Array.isArray(data) && data.length) {
      const map = new Map(data.map((d) => [String(d.type || '').toLowerCase(), toNumber(d.count)]));

      return [
        {
          type: t('filters.fullTime'),
          count: toNumber(map.get('full time') ?? map.get('fulltime')),
        },
        {
          type: t('filters.partTime'),
          count: toNumber(map.get('part time') ?? map.get('parttime')),
        },
        {
          type: t('dashboard.summary.freelance'),
          count: toNumber(map.get('freelancer') ?? map.get('freelance')),
        },
      ];
    }

    // If backend object (your header response)
    if (data && typeof data === 'object') {
      return [
        {
          type: t('filters.fullTime'),
          count: toNumber(
            data.active_full_time_count ??
              data.activeFullTimeCount ??
              data.full_time_count ??
              data.fullTime
          ),
        },
        {
          type: t('filters.partTime'),
          count: toNumber(
            data.active_part_time_count ??
              data.activePartTimeCount ??
              data.part_time_count ??
              data.partTime
          ),
        },
        {
          type: t('dashboard.summary.freelance'),
          count: toNumber(
            data.active_freelance_count ??
              data.activeFreelanceCount ??
              data.freelance_count ??
              data.freelancerCount
          ),
        },
      ];
    }

    return [];
  }, [data, t]);

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          {t('dashboard.charts.employees')}
        </CardTitle>
        <div className="mt-2 h-[3px] w-10 rounded bg-primary" />
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
            barCategoryGap="18%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical stroke="#E5E7EB" />

            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />

            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />

            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="count"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              barSize={50}
              maxBarSize={45}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}