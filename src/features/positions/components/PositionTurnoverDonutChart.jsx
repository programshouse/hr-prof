// src/features/positions/components/PositionTurnoverDonutChart.jsx
'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pie, PieChart, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function PositionTurnoverDonutChart({ data, loading }) {
  const { t } = useTranslation();
  // ✅ accept both shapes
  const payload = data?.data ? data.data : data;

  const donut = payload?.donut || {};
  const active = toNumber(donut?.active?.value);
  const inactive = toNumber(donut?.inactive?.value);
  const turnover = toNumber(payload?.turnover?.value);

  const activeLabel = t('positions.active');
  const inactiveLabel = t('positions.inactive');

  const chartData = useMemo(
    () => [
      { name: activeLabel, value: active },
      { name: inactiveLabel, value: inactive },
    ],
    [active, inactive, activeLabel, inactiveLabel]
  );

  const total = active + inactive;
  const activePct = total ? Math.round((active / total) * 100) : 0;
  const inactivePct = total ? 100 - activePct : 0;

  const chartConfig = {
    value: { label: t('positions.employees') },
  };

  return (
    <Card className="border-border rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t('positions.turnover')}</CardTitle>
        <div className="bg-primary mt-2 h-[3px] w-10 rounded" />
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <div className="flex h-full items-center justify-between gap-6">
              {/* Donut */}
              <div className="relative">
                <PieChart width={240} height={240}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={76}
                    outerRadius={104}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    <Cell fill="var(--color-primary)" />
                    <Cell fill="rgba(46, 91, 255, 0.35)" />
                  </Pie>
                </PieChart>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-semibold text-slate-600">
                    {t('positions.turnoverLabel')}
                  </div>
                  <div className="text-lg font-bold text-slate-900">{turnover}%</div>
                </div>
              </div>

              {/* Legend */}
              <div className="min-w-[120px] space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary h-2.5 w-2.5 rounded-full" />
                    <span className="text-slate-600">{t('positions.active')}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{activePct}%</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/35 h-2.5 w-2.5 rounded-full" />
                    <span className="text-slate-600">{t('positions.inactive')}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{inactivePct}%</span>
                </div>
              </div>
            </div>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
