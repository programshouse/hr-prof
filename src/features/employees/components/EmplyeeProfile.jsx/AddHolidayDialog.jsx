import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function AddHolidayDialog({ open, onOpenChange, addMutation }) {
  const { t } = useTranslation();

  const [requestDate, setRequestDate] = useState(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');
  const [days, setDays] = useState('');
  const [annual, setAnnual] = useState('');
  const [casual, setCasual] = useState('');
  const [actionDate, setActionDate] = useState(null);
  const [payrollDate, setPayrollDate] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    {
      value: 'carried-over',
      label: t('employees.profile.details.holidays.balance.reasons.carriedOver'),
    },
    {
      value: 'renewed',
      label: t('employees.profile.details.holidays.balance.reasons.renewedLeave'),
    },
  ];

  const actions = [
    {
      value: 'leave-encashment',
      label: t('employees.profile.details.holidays.encashment.title'),
    },
    {
      value: 'additional-days',
      label: `${t('common.add')} ${t('employees.profile.details.holidays.balance.table.days')}`,
    },
  ];

  const resetForm = () => {
    setRequestDate(null);
    setReason('');
    setAction('');
    setDays('');
    setAnnual('');
    setCasual('');
    setActionDate(null);
    setPayrollDate(null);
    setCashAmount('');
  };

  const handleSave = async () => {
    const isAdditionalDays = action === 'additional-days';
    const annualValue = Number(annual || 0);
    const casualValue = Number(casual || 0);
    const daysValue = Number(days || 0);

    if (!requestDate || !reason || !action || !actionDate) return;

    if (isAdditionalDays && annualValue <= 0 && casualValue <= 0) return;

    if (!isAdditionalDays && (!days || daysValue <= 0 || !payrollDate || !cashAmount)) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('request_date', format(requestDate, 'yyyy-MM-dd'));
      formData.append('action_date', format(actionDate, 'yyyy-MM-dd'));
      formData.append('reason', reason);

      if (isAdditionalDays) {
        formData.append('type', 'add');
        formData.append('annual', annualValue);
        formData.append('casual', casualValue);
      } else {
        formData.append('type', 'settle');
        formData.append('days', daysValue);
        formData.append('payroll_date', format(payrollDate, 'yyyy-MM-dd'));
        formData.append('cash_amount', cashAmount);
      }

      await addMutation.mutateAsync(formData);

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding holiday:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isFormValid =
    action === 'additional-days'
      ? requestDate && reason && action && actionDate && (Number(annual || 0) > 0 || Number(casual || 0) > 0)
      : requestDate && reason && action && actionDate && days && Number(days || 0) > 0 && payrollDate && cashAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-slate-200 bg-white shadow-sm">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-sm font-semibold text-slate-900">
            {t('employees.profile.details.holidays.balance.addHoliday')}
          </DialogTitle>
        </DialogHeader>

        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                {t('employees.profile.details.holidays.balance.table.requestDate')}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-md border border-slate-200 bg-white text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requestDate ? format(requestDate, 'MM/dd/yyyy') : t('common.datePlaceholder')}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={requestDate} onSelect={setRequestDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                {t('requests.table.headers.reason')}
              </Label>

              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-10 rounded-md border border-slate-200 bg-white">
                  <SelectValue placeholder={t('employees.profile.details.holidays.balance.table.reason')} />
                </SelectTrigger>

                <SelectContent>
                  {reasons.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                {t('tables.headers.action')}
              </Label>

              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="h-10 rounded-md border border-slate-200 bg-white">
                  <SelectValue placeholder={t('employees.profile.details.holidays.balance.table.action')} />
                </SelectTrigger>

                <SelectContent>
                  {actions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {action === 'additional-days' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Annual</Label>

                  <Input
                    type="number"
                    min="0"
                    value={annual}
                    onChange={(e) => setAnnual(e.target.value)}
                    placeholder="Annual"
                    className="h-10 rounded-md border border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Casual</Label>

                  <Input
                    type="number"
                    min="0"
                    value={casual}
                    onChange={(e) => setCasual(e.target.value)}
                    placeholder="Casual"
                    className="h-10 rounded-md border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  {t('employees.profile.details.holidays.balance.table.days')}
                </Label>

                <Input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder={t('employees.profile.details.holidays.balance.table.days')}
                  className="h-10 rounded-md border border-slate-200 bg-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                {t('tables.headers.date')}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-md border border-slate-200 bg-white text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actionDate ? format(actionDate, 'MM/dd/yyyy') : t('common.datePlaceholder')}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={actionDate} onSelect={setActionDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {action === 'leave-encashment' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.payrollDate')}
                  </Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 w-full justify-start rounded-md border border-slate-200 bg-white text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {payrollDate ? format(payrollDate, 'MM/dd/yyyy') : t('common.datePlaceholder')}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={payrollDate} onSelect={setPayrollDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    {t('employees.profile.details.holidays.encashment.table.amount')}
                  </Label>

                  <Input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder={t('employees.profile.details.holidays.encashment.table.amount')}
                    className="h-10 rounded-md border border-slate-200 bg-white"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-10 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            {t('common.cancel')}
          </Button>

          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting}
            className="h-10 rounded-md bg-primary text-white hover:bg-primary disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}