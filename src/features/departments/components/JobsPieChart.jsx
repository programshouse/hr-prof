'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pie, PieChart, ResponsiveContainer, Legend, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const COLORS = ['#6D6CE5', '#4948AB', '#A89AE8', '#8D7BD8', '#C5B5FF'];

export default function JobsPieChart({ data }) {
  const { t } = useTranslation();
  // fallback demo data (remove when you connect API)
  const chartData = data?.length
    ? data
    : [
        { name: 'Front End', value: 93 },
        { name: 'Back End', value: 85 },
        { name: 'Tester', value: 53 },
        { name: 'UI UX', value: 43 },
        { name: 'Flutter', value: 26 },
      ];

  // config for shadcn tooltip/legend mapping
  const config = chartData.reduce((acc, item, idx) => {
    acc[item.name] = { label: item.name, color: COLORS[idx % COLORS.length] };
    return acc;
  }, {});

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t('departments.jobs')}</CardTitle>

        {/* small underline like screenshot */}
        <div className="mt-2 h-0.5 w-8 rounded bg-[#4948AB]" />
      </CardHeader>

      <CardContent className="h-[320px] pt-2">
        <ChartContainer className="h-full w-full" config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={46}
                outerRadius={90}
                paddingAngle={2}
                cx="38%"
                cy="50%"
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>

              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{
                  fontSize: 12,
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  maxHeight: 180,
                  overflowY: 'auto',
                  paddingRight: 8,
                  lineHeight: '18px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
