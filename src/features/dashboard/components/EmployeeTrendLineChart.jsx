'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useEmployeeTrend } from '../hooks/useGraph';

const COLORS = ['#4948AB', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#06B6D4'];

export function EmployeeTrendLineChart() {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { data: apiTrendData, isLoading, isError, error } = useEmployeeTrend(selectedYear);

  // ترتيب بحيث Programs House أول عنصر
  const departmentNames = useMemo(() => {
    if (!apiTrendData?.departments) return [];

    const names = Object.values(apiTrendData.departments).map(
      (d) => d.department_name
    );

    return names.sort((a, b) => {
      if (a.toLowerCase() === 'programs house') return -1;
      if (b.toLowerCase() === 'programs house') return 1;
      return 0;
    });
  }, [apiTrendData]);

  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // ✅ هنا التعديل
  useEffect(() => {
    if (!departmentNames.length) return;

    const researchDepartment = departmentNames.find((d) =>
      d.toLowerCase().includes('research')
    );

    const programsHouse = departmentNames.find(
      (d) => d.toLowerCase() === 'programs house'
    );

    setSelectedDepartments([
      researchDepartment || programsHouse || departmentNames[0],
    ]);
  }, [departmentNames]);

  // Transform API data
  const chartData = useMemo(() => {
    if (!apiTrendData?.departments) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const departments = Object.values(apiTrendData.departments);

    return months.map((monthName, index) => {
      const monthNum = index + 1;
      const point = { month: monthName };

      departments.forEach((dept) => {
        point[dept.department_name] = dept.monthly_active_employees[monthNum] || 0;
      });

      return point;
    });
  }, [apiTrendData]);

  const chartConfig = useMemo(() => {
    return departmentNames.reduce((acc, department, index) => {
      acc[department] = {
        label: department,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {});
  }, [departmentNames]);

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const toggleDepartment = (departmentName) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(departmentName)) {
        if (prev.length === 1) return prev;
        return prev.filter((name) => name !== departmentName);
      }
      return [...prev, departmentName];
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.charts.employeeTrend')}</CardTitle>
          <div className="w-[120px]">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading trend data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.charts.employeeTrend')}</CardTitle>
          <div className="w-[120px]">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center text-center">
            <p className="text-sm text-red-500">
              Failed to load trend data: {error?.message || 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{t('dashboard.charts.employeeTrend')}</CardTitle>
          <div className="w-[120px]">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {departmentNames.map((department, index) => {
            const isActive = selectedDepartments.includes(department);
            const color = COLORS[index % COLORS.length];

            return (
              <Button
                key={department}
                type="button"
                variant="outline"
                onClick={() => toggleDepartment(department)}
                className={cn(
                  'rounded-xl border-slate-200 bg-white px-3 py-2 transition-colors',
                  isActive && 'border-transparent text-white hover:text-white'
                )}
                style={
                  isActive
                    ? { backgroundColor: color }
                    : undefined
                }
              >
                <span className="flex items-center gap-2">
                  <span>{department}</span>
                </span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer
          className="aspect-auto h-[320px] w-full"
          config={chartConfig}
        >
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />

            {departmentNames
              .filter((department) => selectedDepartments.includes(department))
              .map((department) => {
                const color =
                  COLORS[departmentNames.indexOf(department) % COLORS.length];

                return (
                  <Line
                    key={department}
                    type="linear"
                    dataKey={department}
                    name={department}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}