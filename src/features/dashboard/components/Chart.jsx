'use client';

import { CartesianGrid, Line, LineChart, XAxis, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useGraph } from '../hooks/useGraph';

export const description = 'An attendance tracking chart showing actual vs expected attendance';

export function ChartLineMultiple() {
  const { t } = useTranslation();
  const { data: graphData, isLoading, isError, error } = useGraph();

  const chartConfig = {
    actualAttendance: {
      label: t('dashboard.charts.actualAttendance'),
      color: '#4948AB', // Primary blue color
    },
    expectedAttendance: {
      label: t('dashboard.charts.expectedAttendance'),
      color: '#9CA3AF', // Gray color for baseline
    },
  };

  // Transform API data from { day, attend, notAttend } to chart format
  const graphArray = Array.isArray(graphData)
    ? graphData
    : Array.isArray(graphData?.data)
      ? graphData.data
      : [];

  const chartData = graphArray.map((item) => ({
    month: `${item.day}`, // Use day number as label
    actualAttendance: item.attend,
    expectedAttendance: item.attend + item.notAttend, // Total expected = attend + notAttend
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('dashboard.charts.attendance')}</CardTitle>
          <span className="text-muted-foreground text-sm">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('dashboard.charts.attendance')}</CardTitle>
          <span className="text-muted-foreground text-sm">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-red-500">
              Failed to load chart data: {error?.message || 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('dashboard.charts.attendance')}</CardTitle>
          <span className="text-muted-foreground text-sm">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Attendance</CardTitle>
        <span className="text-muted-foreground text-sm">
          {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString(
            'default',
            {
              month: 'long',
              year: 'numeric',
            }
          )}
        </span>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-[280px] max-h-[280px] w-full" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            responsive
            margin={{
              top: 16,
              left: 16,
              right: 16,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            {/* Expected Attendance Line - Dotted gray line (baseline/target) */}
            <Line
              dataKey="expectedAttendance"
              type="linear"
              stroke="#9CA3AF"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name="Expected"
            />

            {/* Actual Attendance Line - Solid blue line with dots */}
            <Line
              dataKey="actualAttendance"
              type="linear"
              stroke="#4948AB"
              strokeWidth={2}
              dot={true}
              name="Actual"
            />

            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
