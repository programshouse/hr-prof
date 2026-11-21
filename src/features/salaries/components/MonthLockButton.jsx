import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { salariesApi } from '../api/salariesApi';
import MonthLockDialog from './MonthLockDialog';

export default function MonthLockButton({ year, month, date }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const formatMonthDisplay = (value) => {
    return value.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const lockMutation = useMutation({
    mutationFn: () => salariesApi.lockMonth({ year, month }),

    onSuccess: (res) => {
      toast.success(res?.message || 'Month locked successfully');
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ['salariesTable'] });
      queryClient.invalidateQueries({ queryKey: ['salarySummary'] });
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to lock month'
      );
    },
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 rounded-md px-4 text-xs font-semibold shadow-xs"
        onClick={() => setOpen(true)}
      >
        <Lock className="mr-1.5 h-4 w-4" />
        Lock
      </Button>

      <MonthLockDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => lockMutation.mutate()}
        loading={lockMutation.isPending}
        monthLabel={formatMonthDisplay(date)}
      />
    </>
  );
}