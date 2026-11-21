// src/features/interviews/components/AddInterviewModal.jsx
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Form, FormField } from '@/components/forms/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DatePicker } from '@/components/ui/DatePicker';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';
import { useApplicantsQuery } from '../hooks/useApplicantsQuery';
import ApplicantCombobox from '@/components/ui/ApplicantCombobox';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { normalizeEmployeesForSelect } from '@/lib/utils/employeeDisplayName';

const baseControl =
  'h-11 rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0';

const LEVEL_OPTIONS = ['first', 'second', 'third', 'fourth', 'fifth', 'final'];
const TYPE_OPTIONS = ['hr', 'technical'];
const STATUS_OPTIONS = ['pending', 'passed', 'rejected', 'approved'];

function normalizeSelectValue(value) {
  const v = String(value || '').trim().toLowerCase();

  const map = {
    hr: 'hr',
    technical: 'technical',
    first: 'first',
    second: 'second',
    third: 'third',
    fourth: 'fourth',
    fifth: 'fifth',
    final: 'final',
    pending: 'pending',
    passed: 'passed',
    rejected: 'rejected',
    approved: 'approved',
  };

  return map[v] || v;
}

function normalizeArray(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.data)) return input.data.data;
  return [];
}

function normalizeEmployees(raw, isArabic) {
  return normalizeEmployeesForSelect(normalizeArray(raw), { preferArabic: isArabic });
}

function normalizeDepartments(raw, isArabic) {
  const arr = normalizeArray(raw);

  return arr
    .map((d) => {
      const id = d?.id;
      if (!id) return null;

      const label = isArabic
        ? d?.name_ar || d?.name || d?.name_en || 'Unknown Department'
        : d?.name_en || d?.name || d?.name_ar || 'Unknown Department';

      return { id: String(id), label, original: d };
    })
    .filter(Boolean);
}

function resolveDepartmentValue(rawDept, departmentsList = []) {
  if (!rawDept && rawDept !== 0) return '';

  let candidate = '';
  if (typeof rawDept === 'object' && rawDept !== null) {
    candidate =
      rawDept.id ??
      rawDept.department_id ??
      rawDept.name ??
      rawDept.name_en ??
      rawDept.name_ar ??
      '';
  } else {
    candidate = String(rawDept).trim();
  }

  if (!candidate) return '';

  // 1. Direct match by id
  const byId = departmentsList.find((d) => String(d.id) === String(candidate));
  if (byId) return String(byId.id);

  // 2. Case-insensitive / trimmed match by label or name
  const candidateLower = String(candidate).toLowerCase().trim();
  const byName = departmentsList.find((d) => {
    const label = String(d.label || '').toLowerCase().trim();
    const name = String(d.original?.name || '').toLowerCase().trim();
    const nameEn = String(d.original?.name_en || '').toLowerCase().trim();
    const nameAr = String(d.original?.name_ar || '').toLowerCase().trim();
    const deptName = String(d.original?.department_name || '').toLowerCase().trim();

    return (
      label === candidateLower ||
      name === candidateLower ||
      nameEn === candidateLower ||
      nameAr === candidateLower ||
      deptName === candidateLower
    );
  });

  if (byName) return String(byName.id);

  return String(candidate);
}

function normalizeApplicants(raw, isArabic) {
  const arr = normalizeArray(raw);

  return arr
    .map((a) => {
      const id = a?.id;
      if (!id) return null;

      const applicantCode = a?.applicant_code || '';

      const englishName =
        `${a?.first_name || ''} ${a?.middle_name || ''} ${a?.last_name || ''}`.trim() ||
        a?.preferred_name ||
        a?.name;

      const arabicName = a?.full_name_ar || a?.name_ar;

      const applicantName = isArabic
        ? arabicName || englishName || 'Unknown Applicant'
        : englishName || arabicName || 'Unknown Applicant';

      const label = applicantCode ? `${applicantCode} - ${applicantName}` : applicantName;

      return {
        id: String(id),
        label,
        applicant_code: applicantCode,
        applicant_name: applicantName,
        original: a,
      };
    })
    .filter(Boolean);
}

function formatDateForApi(dateValue) {
  if (!dateValue) return null;

  const parsed = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatTimeForInput(timeValue) {
  if (!timeValue) return '';

  const match = String(timeValue).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';

  return `${String(match[1]).padStart(2, '0')}:${String(match[2]).padStart(2, '0')}`;
}

function formatTimeForApi(timeValue) {
  if (!timeValue) return '';

  const match = String(timeValue).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';

  return `${String(match[1]).padStart(2, '0')}:${String(match[2]).padStart(2, '0')}`;
}

export default function AddInterviewModal({
  open,
  onOpenChange,
  onSave,
  loading = false,
  isEditMode = false,
  interviewData = null,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const control = `${baseControl} ${isArabic ? 'text-right' : 'text-left'}`;

  const selectContentClass = isArabic ? 'text-right' : 'text-left';

  const selectItemClass = isArabic
    ? 'cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
    : 'cursor-pointer text-left';

  const title = useMemo(
    () => (isEditMode ? t('interviews.form.titleEdit') : t('interviews.form.titleAdd')),
    [isEditMode, t]
  );

  const { data: departmentsRes, isLoading: departmentsLoading } = useAllDepartments();
  const { data: employeesRes, isLoading: employeesLoading } = useAllEmployees(open);
  const { data: applicantsRes, isLoading: applicantsLoading } = useApplicantsQuery(open);

  const departments = useMemo(
    () => normalizeDepartments(departmentsRes, isArabic),
    [departmentsRes, isArabic]
  );

  const employees = useMemo(
    () => normalizeEmployees(employeesRes, isArabic),
    [employeesRes, isArabic]
  );

  const applicants = useMemo(
    () => normalizeApplicants(applicantsRes, isArabic),
    [applicantsRes, isArabic]
  );

  const form = useForm({
    defaultValues: {
      applicant: '',
      department: '',
      interviewDate: null,
      interviewTime: '',
      interviewer: '',
      level: '',
      type: '',
      status: '',
      comment: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEditMode && interviewData) {
      const original = interviewData.originalData || {};

      const rawDate =
        original.interview_date ||
        interviewData.interview_date ||
        interviewData.interviewDate ||
        null;

      const rawTime =
        original.interview_time ||
        interviewData.interview_time ||
        interviewData.interviewTime ||
        '';

      const rawDept =
        original.department_id ??
        original.department?.id ??
        original.department?.name_en ??
        original.department?.name ??
        original.department ??
        interviewData.department_id ??
        interviewData.department;

      const resolvedDepartment = resolveDepartmentValue(rawDept, departments);

      form.reset({
        applicant: String(original.applicant_id ?? interviewData.applicant_id ?? ''),
        department: resolvedDepartment,
        interviewDate: rawDate ? new Date(rawDate) : null,
        interviewTime: formatTimeForInput(rawTime),
        interviewer: String(
          original.interviewer_id ??
            original.employee_id ??
            interviewData.interviewer_id ??
            interviewData.employee_id ??
            ''
        ),
        level: normalizeSelectValue(original.level || interviewData.level || ''),
        type: normalizeSelectValue(original.type || interviewData.type || ''),
        status: normalizeSelectValue(original.status || interviewData.status || ''),
        comment: original.comment || interviewData.comment || '',
      });
    } else {
      form.reset({
        applicant: '',
        department: '',
        interviewDate: null,
        interviewTime: '',
        interviewer: '',
        level: '',
        type: '',
        status: '',
        comment: '',
      });
    }
  }, [open, isEditMode, interviewData, departments, form]);

  const handleSave = form.handleSubmit((values) => {
    const dataToSave = {
      applicant_id: values.applicant,
      department_id: values.department,
      interviewer_id: values.interviewer,
      interview_date: formatDateForApi(values.interviewDate),
      interview_time: formatTimeForApi(values.interviewTime),

      // Backend receives stable English keys only
      level: normalizeSelectValue(values.level),
      type: normalizeSelectValue(values.type),
      status: normalizeSelectValue(values.status),

      comment: values.comment?.trim() || '',
    };

    if (isEditMode && interviewData?.id) {
      dataToSave.id = interviewData.id;
    }

    onSave?.(dataToSave);

    form.reset();
    onOpenChange(false);
  });

  const canSubmit = Boolean(
    form.watch('applicant')?.trim() &&
      form.watch('department')?.trim() &&
      form.watch('interviewDate') &&
      form.watch('interviewTime')?.trim() &&
      form.watch('interviewer')?.trim() &&
      form.watch('level')?.trim() &&
      form.watch('type')?.trim() &&
      form.watch('status')?.trim()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          overflow-hidden p-0 sm:max-w-[720px]
          ${isArabic ? 'text-right [&>button]:left-4 [&>button]:right-auto' : 'text-left'}
        `}
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <DialogHeader
            className={`
              px-0 py-2
              ${isArabic ? 'items-end text-right' : 'items-start text-left'}
            `}
          >
            <DialogTitle
              className={`w-full text-base font-semibold text-slate-900 ${
                isArabic ? 'text-right' : 'text-left'
              }`}
            >
              {title}
            </DialogTitle>

            <p
              className={`w-full text-xs text-slate-500 ${
                isArabic ? 'text-right' : 'text-left'
              }`}
            >
              {t('interviews.form.description')}
            </p>
          </DialogHeader>
        </div>

        <div className={`p-6 ${isArabic ? 'text-right' : 'text-left'}`}>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-left ltr:text-left rtl:text-right">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200">
                <span className="text-xs">✦</span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 text-left ltr:text-left rtl:text-right">
                {t('interviews.form.detailsHeader')}
              </h3>
            </div>

            <div className="mt-4">
              <Form form={form} onSubmit={handleSave}>
                <div className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField name="applicant" label={t('interviews.form.applicant')} required>
                      {({ field }) => (
                        <ApplicantCombobox
                          dir={dir}
                          value={field.value || ''}
                          onChange={field.onChange}
                          applicants={applicants}
                          loading={applicantsLoading}
                          placeholder={t('interviews.form.selectApplicant')}
                          searchPlaceholder={t('interviews.form.searchApplicant')}
                        />
                      )}
                    </FormField>

                    <FormField name="department" label={t('tables.headers.department')} required>
                      {({ field }) => (
                        <Select
                          dir={dir}
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          disabled={departmentsLoading}
                        >
                          <SelectTrigger className={control}>
                            <SelectValue
                              placeholder={
                                departmentsLoading
                                  ? t('common.loading')
                                  : t('interviews.form.selectDepartment')
                              }
                            />
                          </SelectTrigger>

                          <SelectContent
                            dir={dir}
                            align={isArabic ? 'end' : 'start'}
                            className={selectContentClass}
                          >
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={d.id} className={selectItemClass}>
                                {d.label}
                              </SelectItem>
                            ))}
                            {field.value &&
                              !departments.some((d) => String(d.id) === String(field.value)) && (
                                <SelectItem
                                  key={field.value}
                                  value={field.value}
                                  className={selectItemClass}
                                >
                                  {field.value}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      name="interviewDate"
                      label={t('interviews.form.interviewDate')}
                      required
                    >
                      {({ field }) => (
                        <DatePicker
                          dir={dir}
                          placeholder={t('interviews.form.selectDate')}
                          value={field.value}
                          onChange={field.onChange}
                          className={control}
                        />
                      )}
                    </FormField>

                    <FormField
                      name="interviewTime"
                      label={t('interviews.form.interviewTime')}
                      required
                    >
                      {({ field }) => (
                        <Input
                          dir={dir}
                          type="time"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={control}
                        />
                      )}
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField name="interviewer" label={t('interviews.form.interviewer')} required>
                      {({ field }) => (
                        <EmployeeCombobox
                          dir={dir}
                          value={field.value || ''}
                          onChange={field.onChange}
                          employees={employees}
                          loading={employeesLoading}
                          placeholder={t('interviews.form.selectInterviewer')}
                          searchPlaceholder={t('interviews.form.searchInterviewer')}
                        />
                      )}
                    </FormField>

                    <FormField name="level" label={t('interviews.form.level')} required>
                      {({ field }) => (
                        <Select dir={dir} value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className={control}>
                            <SelectValue placeholder={t('interviews.form.selectLevel')} />
                          </SelectTrigger>

                          <SelectContent
                            dir={dir}
                            align={isArabic ? 'end' : 'start'}
                            className={selectContentClass}
                          >
                            {LEVEL_OPTIONS.map((level) => (
                              <SelectItem key={level} value={level} className={selectItemClass}>
                                {t(`interviews.levels.${level}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField name="type" label={t('interviews.form.type')} required>
                      {({ field }) => (
                        <Select dir={dir} value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className={control}>
                            <SelectValue placeholder={t('interviews.form.selectType')} />
                          </SelectTrigger>

                          <SelectContent
                            dir={dir}
                            align={isArabic ? 'end' : 'start'}
                            className={selectContentClass}
                          >
                            {TYPE_OPTIONS.map((type) => (
                              <SelectItem key={type} value={type} className={selectItemClass}>
                                {t(`interviews.types.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>

                    <FormField name="status" label={t('interviews.form.status')} required>
                      {({ field }) => (
                        <Select dir={dir} value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className={control}>
                            <SelectValue placeholder={t('interviews.form.selectStatus')} />
                          </SelectTrigger>

                          <SelectContent
                            dir={dir}
                            align={isArabic ? 'end' : 'start'}
                            className={selectContentClass}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status} value={status} className={selectItemClass}>
                                {t(`interviews.status.${status}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                  </div>

                  <div className={`space-y-1.5 ${isArabic ? 'text-right' : 'text-left'}`}>
                    <Label
                      className={`block text-xs text-slate-700 ${
                        isArabic ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('interviews.form.comment')}
                    </Label>

                    <FormField name="comment">
                      {({ field }) => (
                        <Textarea
                          dir={dir}
                          placeholder={t('interviews.form.commentPlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          className={`min-h-28 rounded-lg border-slate-200 bg-white text-sm text-slate-700 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                            isArabic ? 'text-right' : 'text-left'
                          }`}
                        />
                      )}
                    </FormField>
                  </div>
                </div>

                <div
                  className={`mt-5 flex items-center gap-3 ${
                    isArabic ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="h-11 rounded-lg px-6"
                  >
                    {t('common.cancel')}
                  </Button>

                  <Button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="h-11 rounded-lg bg-indigo-600 px-8 hover:bg-primary"
                  >
                    {loading ? t('interviews.form.saving') : t('common.save')}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}