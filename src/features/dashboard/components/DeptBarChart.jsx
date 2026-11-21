'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useDeptCounts } from '../hooks/useGraph';

export function DeptBarChart() {
  const { t, i18n } = useTranslation();
  const { data: apiData, isLoading, isError, error } = useDeptCounts();

  const departmentNameKey = i18n.language?.startsWith('ar') ? 'name_ar' : 'name_en';

  const chartConfig = {
    employees_count: {
      label: t('dashboard.charts.employees'),
      color: '#4948AB',
    },
  };

  const chartData = apiData?.data?.map((item) => ({
    ...item,
    name: item[departmentNameKey] ?? item.name_en ?? item.name_ar ?? item.name,
  })) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.charts.departmentsEmployeeCount')}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.charts.departmentsEmployeeCount')}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-sm text-red-500">
              Failed to load chart data: {error?.message || 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.charts.departmentsEmployeeCount')}</CardTitle>
      </CardHeader>

      <CardContent>
        <div dir="ltr">
          <ChartContainer className="h-80 w-full" config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 15,
                bottom: 20,
                left: 15,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={67}
                tick={{
                  fontSize: 12,
                  direction: 'ltr',
                }}
              />

              <YAxis tickLine={false} axisLine={false} />

              <ChartTooltip content={<ChartTooltipContent />} />

              <Bar dataKey="employees_count" fill="#4948AB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}