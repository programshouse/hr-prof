import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { salariesApi } from '../api/salariesApi';
import MonthPublishDialog from './MonthPublishDialog';

export default function MonthPublishButton({
  year,
  month,
  date,
  companyId = 1,
  currentDepartmentId,
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [missingMonthRecord, setMissingMonthRecord] = useState(false);
  const [publishError, setPublishError] = useState(null);

  const isMissingMonthRecord = (message = '') =>
    /month record not found/i.test(String(message));

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && (publishMutation.isPending || lockAndPublishMutation.isPending)) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setMissingMonthRecord(false);
      setPublishError(null);
    }
  };

  const formatMonthDisplay = () => {
    if (date instanceof Date && !isNaN(date)) {
      const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-US';
      return date.toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      });
    }
    return `${month}/${year}`;
  };

  const handlePublished = (response) => {
    if (response?.status === false) {
      throw new Error(response.message || t('salaries.publishMonthFailed'));
    }

    toast.success(response?.message || t('salaries.publishMonthSuccess'));
    setMissingMonthRecord(false);
    setPublishError(null);
    setOpen(false);

    queryClient.invalidateQueries({ queryKey: ['salariesTable'] });
    queryClient.invalidateQueries({ queryKey: ['salariesSummary'] });
    queryClient.invalidateQueries({ queryKey: ['salarySummary'] });
  };

  const handlePublishError = (error) => {
    const message = error?.response?.data?.message || error?.message || '';
    setPublishError(message);

    if (isMissingMonthRecord(message)) {
      setMissingMonthRecord(true);
      toast.error(
        t(
          'salaries.monthNotLockedWarning',
          'Month record not found. Please lock the month before publishing.'
        )
      );
      return;
    }

    if (/no employees match/i.test(message)) {
      toast.error(
        t(
          'salaries.noEmployeesMatchPublishCriteria',
          'No employees match the selected publish criteria (salaries may already be published, or check the selected day and department).'
        )
      );
      return;
    }

    toast.error(message || t('salaries.publishMonthFailed'));
  };

  const publishMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await salariesApi.publishMonth({
        year,
        month,
        companyId,
        ...payload,
      });
      if (response?.status === false) {
        throw new Error(response.message || t('salaries.publishMonthFailed'));
      }
      return response;
    },
    onSuccess: handlePublished,
    onError: handlePublishError,
  });

  // Locking is irreversible in the current backend; only call this after the
  // user explicitly confirms the lock in the publication dialog.
  const lockAndPublishMutation = useMutation({
    mutationFn: async (payload) => {
      const lockResponse = await salariesApi.lockMonth({ year, month });
      if (lockResponse?.status === false) {
        throw new Error(lockResponse.message || 'Failed to lock month');
      }

      queryClient.invalidateQueries({ queryKey: ['salariesTable'] });
      queryClient.invalidateQueries({ queryKey: ['salarySummary'] });

      const response = await salariesApi.publishMonth({
        year,
        month,
        companyId,
        ...payload,
      });
      if (response?.status === false) {
        throw new Error(response.message || t('salaries.publishMonthFailed'));
      }
      return response;
    },
    onSuccess: handlePublished,
    onError: handlePublishError,
  });

  const loading = publishMutation.isPending || lockAndPublishMutation.isPending;

  return (
    <>
      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={() => {
          setMissingMonthRecord(false);
          setOpen(true);
        }}
        disabled={loading}
        className="h-9 rounded-md px-4 text-xs font-semibold"
      >
        <Send className="me-1.5 h-4 w-4" />

        {loading
          ? t('salaries.publishingMonth')
          : t('salaries.publishMonth')}
      </Button>

      <MonthPublishDialog
        open={open}
        onOpenChange={handleOpenChange}
        onConfirm={(data) => {
          setMissingMonthRecord(false);
          setPublishError(null);
          publishMutation.mutate(data);
        }}
        onLockAndPublish={(data) => {
          setPublishError(null);
          lockAndPublishMutation.mutate(data);
        }}
        missingMonthRecord={missingMonthRecord}
        publishError={publishError}
        loading={loading}
        year={year}
        month={month}
        date={date}
        companyId={companyId}
        currentDepartmentId={currentDepartmentId}
        monthLabel={formatMonthDisplay()}
      />
    </>
  );
}
