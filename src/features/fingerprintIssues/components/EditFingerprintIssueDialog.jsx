import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField } from '@/components/forms/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const fingerprintIssueSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  issueType: z.enum(['not_recognized', 'device_error', 'quality_poor']),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'in_progress', 'resolved']),
  reportedDate: z.date(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

export function EditFingerprintIssueDialog({ open, onOpenChange, fingerprintIssue, onSubmit }) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(fingerprintIssueSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      issueType: 'not_recognized',
      description: '',
      status: 'pending',
      reportedDate: new Date(),
      checkIn: '',
      checkOut: '',
    },
  });

  // Pre-fill form when fingerprint issue data changes
  useEffect(() => {
    if (fingerprintIssue && open) {
      form.reset({
        employeeId: fingerprintIssue.employee_id?.toString() || '',
        employeeName: fingerprintIssue.employee_name || '',
        issueType: fingerprintIssue.issue_type || 'not_recognized',
        description: fingerprintIssue.description || '',
        status: fingerprintIssue.status || 'pending',
        reportedDate: new Date(fingerprintIssue.reported_date),
        checkIn: fingerprintIssue.check_in || '',
        checkOut: fingerprintIssue.check_out || '',
      });
    }
  }, [fingerprintIssue, open, form]);

  const handleSubmit = (data) => {
    const formattedData = {
      id: fingerprintIssue?.id,
      employee_id: parseInt(data.employeeId),
      employee_name: data.employeeName,
      issue_type: data.issueType,
      description: data.description,
      status: data.status,
      reported_date: format(data.reportedDate, 'yyyy-MM-dd'),
      check_in: data.checkIn,
      check_out: data.checkOut,
    };

    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Fingerprint Issue</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Update fingerprint issue information
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg border p-6">
          <div className="mb-6 flex items-center gap-2">
            <User className="size-5" />
            <h3 className="text-lg font-semibold">Edit fingerprint issue</h3>
          </div>

          <Form form={form} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Employee ID */}
              <FormField name="employeeId" label="Employee ID" required>
                {({ field }) => (
                  <Input
                    {...field}
                    disabled
                    className="bg-slate-50"
                  />
                )}
              </FormField>

              {/* Employee Name */}
              <FormField name="employeeName" label="Employee Name" required>
                {({ field }) => (
                  <Input
                    {...field}
                    disabled
                    className="bg-slate-50"
                  />
                )}
              </FormField>

              {/* Issue Type */}
              <FormField name="issueType" label="Issue Type" required>
                {({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_recognized">Not Recognized</SelectItem>
                      <SelectItem value="device_error">Device Error</SelectItem>
                      <SelectItem value="quality_poor">Quality Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              {/* Status */}
              <FormField name="status" label="Status" required>
                {({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              {/* Reported Date */}
              <FormField name="reportedDate" label="Reported Date" required>
                {({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="input" className="w-full justify-start font-normal">
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? format(field.value, 'PP') : <span>{t('common.datePlaceholder')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              {/* Check In */}
              <FormField name="checkIn" label="Check In">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., 10:30 AM"
                  />
                )}
              </FormField>

              {/* Check Out */}
              <FormField name="checkOut" label="Check Out">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g., --:-- PM"
                  />
                )}
              </FormField>
            </div>

            {/* Description */}
            <FormField name="description" label="Description" required>
              {({ field }) => (
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Describe the fingerprint issue..."
                />
              )}
            </FormField>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
