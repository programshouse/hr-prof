import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, Users, Award, UserMinus, Pencil, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { salariesApi } from '../api/salariesApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

function SalarySummaryCard({ title, value, icon: Icon, editable = false, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');

  const handleSave = async () => {
    if (amount === '' || Number.isNaN(Number(amount))) return;

    try {
      await onSave(Number(amount));
      setAmount('');
      setIsEditing(false);
    } catch {
      // Keep editor open on error
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          <span>{title}</span>
        </div>

        {editable && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 opacity-0 shadow-sm transition-all duration-200 hover:border-primary hover:text-primary group-hover:opacity-100"
            title="Edit total payroll"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>

      {editable && isEditing && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="relative">
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              ±
            </span>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="+500 or -500"
              autoFocus
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 ps-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              size="icon"
              disabled={isSaving || amount === ''}
              onClick={handleSave}
              className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setAmount('');
              }}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function SalariesSummaryCards({ year, month, departmentId }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const queryKey = ['salarySummary', year, month, departmentId];

  const { data: summaryData, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      salariesApi.getSalarySummary({
        year,
        month,
        department_id: departmentId,
      }),
    enabled: !!year && !!month,
  });

  const adjustMutation = useMutation({
    mutationFn: (amount) =>
      salariesApi.adjustTotalPayroll({
        year,
        month,
        amount,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });

      toast.success(response?.message || 'Total payroll updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update total payroll');
    },
  });

  const formatNumber = (value) => (value ?? 0).toLocaleString();

  const stats = [
    {
      title: t('salaries.summaryCards.totalPayroll'),
      value: `${formatNumber(summaryData?.total_payroll)} EGP`,
      icon: Wallet,
      editable: true,
      onSave: (amount) => adjustMutation.mutateAsync(amount),
      isSaving: adjustMutation.isPending,
    },
    {
      title: t('salaries.summaryCards.totalEmployees'),
      value: formatNumber(summaryData?.total_employees),
      icon: Users,
    },
    {
      title: t('salaries.summaryCards.totalRewards'),
      value: formatNumber(summaryData?.total_rewards),
      icon: Award,
    },
    {
      title: t('salaries.summaryCards.totalDeductions'),
      value: formatNumber(summaryData?.total_deductions),
      icon: UserMinus,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
          >
            <div className="mb-3 h-6 rounded bg-gray-200" />
            <div className="h-8 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">Error loading salary summary data</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <SalarySummaryCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}