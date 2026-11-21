// requestTypes.config.js
//
// Single source of truth for the six request types shown on the employee
// profile (?tab=requests).
//
// Why this file exists
// --------------------
// The profile used to build its create/edit form from one generic field list,
// so every type got the same four inputs (employee / date / type / reason).
// That is not what the API accepts: each endpoint has its OWN required keys.
// A leave POSTed without `from` + `to` comes back as
// "The from field is required." — which is exactly the bug in the screenshot.
//
// So the UI is now uniform (same dialog, same layout, same buttons for every
// type) while the PAYLOAD is per-type and matches the standalone modals in
// src/features/{leaves,loans,remotely,overtime,branch-transfers,resignations}
// field for field. Those modals are the contract; keep this file in sync
// with them, not the other way round.
//
// `employee_id` is never a form field here. On the profile we already know
// who the employee is, so it is injected from the route/profile and only
// displayed as a read-only name.

import * as z from 'zod';

import { leavesApi } from '@/features/leaves/api/leaves.api';
import { loansApi } from '@/features/loans/api/loans.api';
import { remotelyApi } from '@/features/remotely/api/remotely.api';
import { overtimeApi } from '@/features/overtime/api/overtime.api';
import { branchTransfersApi } from '@/features/branch-transfers/api/branch-transfers.api';
import { resignationsApi } from '@/features/resignations/api/resignations.api';
import { holidaysApi } from '@/features/holidays/api/holidays.api';

import { FileText, CreditCard, Home, Clock, GitBranch, LogOut, CalendarDays } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* value normalisers                                                   */
/* ------------------------------------------------------------------ */

/** Anything date-ish -> `YYYY-MM-DD` (what every endpoint wants). */
export const toIsoDate = (value) => {
  if (!value) return '';

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.split('T')[0];

  // dd/mm/yyyy — the display format used by DatePickerInput
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '';
};

/** Anything time-ish (incl. `2026-09-15T14:30:00` and `2:30 PM`) -> `HH:mm`. */
export const toHHmm = (value) => {
  if (!value) return '';

  const raw = String(value).trim();

  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp])[Mm]$/);
  if (ampm) {
    let hours = Number(ampm[1]);
    const isPm = ampm[3].toLowerCase() === 'p';

    if (isPm && hours !== 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${ampm[2]}`;
  }

  const match = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return '';

  return `${String(match[1]).padStart(2, '0')}:${match[2]}`;
};

const firstOf = (...values) =>
  values.find((v) => v !== undefined && v !== null && v !== '') ?? '';

const asString = (value) => (value === undefined || value === null ? '' : String(value));

/* ------------------------------------------------------------------ */
/* shared field fragments                                              */
/* ------------------------------------------------------------------ */

const STATUS_VALUES = ['pending', 'approved', 'rejected'];

const statusField = {
  name: 'status',
  labelKey: 'requests.form.status',
  labelFallback: 'Status',
  type: 'select',
  options: STATUS_VALUES.map((value) => ({
    value,
    labelKey: `requests.status.${value}`,
    labelFallback: value.charAt(0).toUpperCase() + value.slice(1),
  })),
};

const dateField = {
  name: 'date',
  labelKey: 'requests.form.date',
  labelFallback: 'Date',
  type: 'date',
  required: true,
};

const reasonField = (required = false) => ({
  name: 'reason',
  labelKey: 'requests.form.reason',
  labelFallback: 'Reason',
  type: 'textarea',
  required,
  fullWidth: true,
});

/** Common tail so every dialog ends the same way: status, then reason. */
const tail = (reasonRequired = false) => [statusField, reasonField(reasonRequired)];

const statusSchema = z.enum(STATUS_VALUES).optional();

/* ------------------------------------------------------------------ */
/* per-type configuration                                              */
/* ------------------------------------------------------------------ */

export const REQUEST_TYPES = {
  /* ---------------------------------------------------------------- */
  leaves: {
    id: 'leaves',
    icon: FileText,
    tabLabelKey: 'requests.table.types.leaves',
    tabLabelFallback: 'Leaves',
    singularKey: 'requests.singular.leave',
    singularFallback: 'leave request',
    queryKey: (employeeId) => ['employee-leaves', employeeId],

    // POST/PATCH /leaves
    // employee_id, date, from (HH:mm), to (HH:mm), type, reason,
    // has_replacement, replaced_employee_id, status
    schema: z
      .object({
        date: z.string().min(1, 'Date is required'),
        type: z.string().min(1, 'Type is required'),
        from: z.string().min(1, 'Start time is required'),
        to: z.string().min(1, 'End time is required'),
        has_replacement: z.enum(['0', '1']).optional(),
        replaced_employee_id: z.string().optional(),
        status: statusSchema,
        manager_status: statusSchema,
        reason: z.string().optional(),
      })
      .refine(
        (data) => !(data.has_replacement === '1' && !data.replaced_employee_id),
        {
          message: 'Replacement employee is required',
          path: ['replaced_employee_id'],
        }
      ),

    fields: [
      dateField,
      {
        name: 'type',
        labelKey: 'requests.form.leaveType',
        labelFallback: 'Leave Type',
        type: 'select',
        required: true,
        // These three strings are the only values the backend accepts.
        // "sick" (as typed in the old dialog) is not one of them.
        options: [
          { value: 'Early Leave', labelKey: 'leaves.modal.earlyLeave', labelFallback: 'Early Leave' },
          { value: 'Late Attendance', labelKey: 'leaves.modal.lateAttendance', labelFallback: 'Late Attendance' },
          { value: 'Within Day', labelKey: 'leaves.modal.withinDay', labelFallback: 'Within Day' },
        ],
      },
      { name: 'from', labelKey: 'requests.form.from', labelFallback: 'From', type: 'time', required: true },
      { name: 'to', labelKey: 'requests.form.to', labelFallback: 'To', type: 'time', required: true },
      {
        name: 'has_replacement',
        labelKey: 'requests.form.hasReplacement',
        labelFallback: 'Has Replacement',
        type: 'select',
        options: [
          { value: '0', labelKey: 'leaves.modal.no', labelFallback: 'No' },
          { value: '1', labelKey: 'leaves.modal.yes', labelFallback: 'Yes' },
        ],
      },
      {
        name: 'replaced_employee_id',
        labelKey: 'requests.form.replacementEmployee',
        labelFallback: 'Replacement Employee',
        type: 'employee',
        required: true,
        // only rendered when has_replacement === '1'
        showWhen: (values) => values.has_replacement === '1',
      },
      ...tail(false),
    ],

    emptyValues: {
      date: '',
      type: '',
      from: '',
      to: '',
      has_replacement: '0',
      replaced_employee_id: '',
      status: 'pending',
      manager_status: 'pending',
      reason: '',
    },

    toFormValues: (record) => ({
      date: toIsoDate(firstOf(record.date, record.request_date)),
      type: asString(firstOf(record.type, record.leave_type)),
      from: toHHmm(firstOf(record.from, record.from_time, record.start_time)),
      to: toHHmm(firstOf(record.to, record.to_time, record.end_time)),
      has_replacement:
        record.has_replacement ||
        record.replaced_employee_id ||
        record.replaced_employee ||
        record.replacement_employee
          ? '1'
          : '0',
      replaced_employee_id: asString(
        firstOf(
          record.replaced_employee_id,
          record.replacement_employee_id,
          record.replaced_employee?.employee_id,
          record.replaced_employee?.id
        )
      ),
      status: asString(record.status) || 'pending',
      manager_status: asString(record.manager_status) || 'pending',
      reason: asString(record.reason),
    }),

    toPayload: (values, employeeId) => ({
      employee_id: Number(employeeId),
      date: toIsoDate(values.date),
      type: values.type,
      from: toHHmm(values.from),
      to: toHHmm(values.to),
      reason: values.reason || '',
      has_replacement: values.has_replacement === '1' ? 1 : 0,
      replaced_employee_id:
        values.has_replacement === '1' ? Number(values.replaced_employee_id) : null,
      status: values.status || 'pending',
      manager_status: values.manager_status || 'pending',
    }),

    api: {
      create: (values) => leavesApi.createLeave(values),
      update: ({ id, values }) => leavesApi.updateLeave({ id, values }),
      remove: (id) => leavesApi.deleteLeave(id),
    },
  },


  /* ---------------------------------------------------------------- */
  'days-off': {
    id: 'days-off',
    icon: CalendarDays,
    tabLabelKey: 'requests.table.types.daysOff',
    tabLabelFallback: 'Days Off',
    singularKey: 'requests.singular.daysOff',
    singularFallback: 'day off request',
    queryKey: (employeeId) => ['employee-days-off', employeeId],

    // Same contract used by the standalone /holidays (Days Off) module.
    // Keep the employee fixed to the profile being viewed.
    isMultipart: true,

    schema: z
      .object({
        date: z.string().min(1, 'Date is required'),
        from: z.string().min(1, 'Start date is required'),
        to: z.string().min(1, 'End date is required'),
        type: z.string().min(1, 'Type is required'),
        has_replacement: z.enum(['0', '1']).optional(),
        replaced_employee_id: z.string().optional(),
        status: statusSchema,
        manager_status: statusSchema,
        reason: z.string().optional(),
        attachments: z.any().optional(),
      })
      .refine(
        (data) => !(data.has_replacement === '1' && !data.replaced_employee_id),
        {
          message: 'Replacement employee is required',
          path: ['replaced_employee_id'],
        }
      ),

    fields: [
      dateField,
      {
        name: 'from',
        labelKey: 'requests.form.fromDate',
        labelFallback: 'From Date',
        type: 'date',
        required: true,
      },
      {
        name: 'to',
        labelKey: 'requests.form.toDate',
        labelFallback: 'To Date',
        type: 'date',
        required: true,
      },
      {
        name: 'type',
        labelKey: 'requests.form.dayOffType',
        labelFallback: 'Day Off Type',
        type: 'select',
        required: true,
        options: [
          {
            value: 'Annual Leave',
            labelKey: 'holidays.modal.annualLeave',
            labelFallback: 'Annual Leave',
          },
          {
            value: 'Sick Leave',
            labelKey: 'holidays.modal.sickLeave',
            labelFallback: 'Sick Leave',
          },
          {
            value: 'Casual Leave',
            labelKey: 'holidays.modal.casualLeave',
            labelFallback: 'Casual Leave',
          },
          {
            value: 'Weekend',
            labelKey: 'holidays.modal.weekend',
            labelFallback: 'Weekend',
          },
          {
            value: 'Official',
            labelKey: 'holidays.modal.official',
            labelFallback: 'Official',
          },
        ],
      },
      {
        name: 'has_replacement',
        labelKey: 'requests.form.hasReplacement',
        labelFallback: 'Has Replacement',
        type: 'select',
        options: [
          { value: '0', labelKey: 'holidays.modal.no', labelFallback: 'No' },
          { value: '1', labelKey: 'holidays.modal.yes', labelFallback: 'Yes' },
        ],
      },
      {
        name: 'replaced_employee_id',
        labelKey: 'requests.form.replacementEmployee',
        labelFallback: 'Replacement Employee',
        type: 'employee',
        required: true,
        showWhen: (values) => values.has_replacement === '1',
      },
      ...tail(false),
      {
        name: 'attachments',
        labelKey: 'requests.form.attachments',
        labelFallback: 'Attachments',
        type: 'file',
        accept: 'image/*,application/pdf',
        multiple: true,
        fullWidth: true,
      },
    ],

    emptyValues: {
      date: '',
      from: '',
      to: '',
      type: '',
      has_replacement: '0',
      replaced_employee_id: '',
      status: 'pending',
      manager_status: 'pending',
      reason: '',
      attachments: undefined,
    },

    toFormValues: (record) => ({
      date: toIsoDate(firstOf(record.date, record.request_date)),
      from: toIsoDate(firstOf(record.from, record.from_date)),
      to: toIsoDate(firstOf(record.to, record.to_date)),
      type: asString(firstOf(record.type, record.holiday_type)),
      has_replacement:
        record.has_replacement ||
        record.replaced_employee_id ||
        record.replaced_employee ||
        record.replacement_employee
          ? '1'
          : '0',
      replaced_employee_id: asString(
        firstOf(
          record.replaced_employee_id,
          record.replacement_employee_id,
          record.replaced_employee?.employee_id,
          record.replaced_employee?.id
        )
      ),
      status: asString(record.status) || 'pending',
      manager_status: asString(record.manager_status) || 'pending',
      reason: asString(record.reason),
      attachments: undefined,
    }),

    toPayload: (values, employeeId) => {
      const formData = new FormData();

      formData.append('employee_id', String(Number(employeeId)));
      formData.append('date', toIsoDate(values.date));
      formData.append('from', toIsoDate(values.from));
      formData.append('to', toIsoDate(values.to));
      formData.append('type', values.type || '');
      formData.append('has_replacement', values.has_replacement === '1' ? '1' : '0');
      formData.append('status', values.status || 'pending');
      formData.append('manager_status', values.manager_status || 'pending');
      formData.append('reason', values.reason || '');

      if (values.has_replacement === '1' && values.replaced_employee_id) {
        formData.append('replaced_employee_id', String(values.replaced_employee_id));
      }

      const attachments = Array.from(values.attachments || []);

      attachments.forEach((file) => {
        const isPdf =
          file?.type === 'application/pdf' ||
          String(file?.name || '').toLowerCase().endsWith('.pdf');

        if (isPdf) {
          formData.append('pdf[]', file);
        } else if (file?.type?.startsWith('image/')) {
          formData.append('images[]', file);
        }
      });

      return formData;
    },

    api: {
      create: (values) => holidaysApi.createHoliday(values),
      update: ({ id, values }) => {
        if (values instanceof FormData && !values.has('_method')) {
          values.append('_method', 'PATCH');
        }

        return holidaysApi.updateHoliday({ id, values });
      },
      remove: (id) => holidaysApi.deleteHoliday(id),
    },

    // The standalone Days Off module uses holidaysKeys.all = ['holidays'].
    invalidateQueryKeys: [['holidays']],
  },

  /* ---------------------------------------------------------------- */
  loans: {
    id: 'loans',
    icon: CreditCard,
    tabLabelKey: 'requests.table.types.loans',
    tabLabelFallback: 'Loans',
    singularKey: 'requests.singular.loan',
    singularFallback: 'loan request',
    queryKey: (employeeId) => ['employee-loans', employeeId],

    // POST/PATCH /loans — employee_id, date, amount, months, status, reason
    // `monthly_amount` is derived server-side; never send it.
    schema: z.object({
      date: z.string().min(1, 'Date is required'),
      amount: z.string().min(1, 'Amount is required'),
      months: z.string().min(1, 'Payment period is required'),
      status: statusSchema,
      reason: z.string().optional(),
    }),

    fields: [
      dateField,
      {
        name: 'amount',
        labelKey: 'requests.form.amount',
        labelFallback: 'Amount',
        type: 'number',
        required: true,
        min: 0,
      },
      {
        name: 'months',
        labelKey: 'requests.form.months',
        labelFallback: 'Payment Period (months)',
        type: 'number',
        required: true,
        min: 1,
      },
      ...tail(false),
    ],

    emptyValues: { date: '', amount: '', months: '', status: 'pending', reason: '' },

    toFormValues: (record) => ({
      date: toIsoDate(record.date),
      amount: asString(record.amount),
      months: asString(record.months),
      status: asString(record.status) || 'pending',
      reason: asString(record.reason),
    }),

    toPayload: (values, employeeId) => ({
      employee_id: Number(employeeId),
      date: toIsoDate(values.date),
      amount: values.amount,
      months: values.months,
      status: values.status || 'pending',
      reason: values.reason || '',
    }),

    api: {
      create: (values) => loansApi.createLoan(values),
      update: ({ id, values }) => loansApi.updateLoan({ id, values }),
      remove: (id) => loansApi.deleteLoan(id),
    },
  },

  /* ---------------------------------------------------------------- */
  remotely: {
    id: 'remotely',
    icon: Home,
    tabLabelKey: 'requests.table.types.remotely',
    tabLabelFallback: 'Remote Work',
    singularKey: 'requests.singular.remotely',
    singularFallback: 'remote work request',
    queryKey: (employeeId) => ['employee-remotely', employeeId],

    // POST/PATCH /remotely — employee_id, date, from (DATE), to (DATE),
    // status, reason. Note `from`/`to` are dates here, not times.
    schema: z
      .object({
        date: z.string().min(1, 'Date is required'),
        from: z.string().min(1, 'From date is required'),
        to: z.string().min(1, 'To date is required'),
        status: statusSchema,
        reason: z.string().optional(),
      })
      .refine((data) => !data.from || !data.to || data.from <= data.to, {
        message: 'To date cannot be before From date',
        path: ['to'],
      }),

    fields: [
      dateField,
      { name: 'from', labelKey: 'requests.form.fromDate', labelFallback: 'From Date', type: 'date', required: true },
      { name: 'to', labelKey: 'requests.form.toDate', labelFallback: 'To Date', type: 'date', required: true },
      ...tail(false),
    ],

    emptyValues: { date: '', from: '', to: '', status: 'pending', reason: '' },

    toFormValues: (record) => ({
      date: toIsoDate(record.date),
      from: toIsoDate(firstOf(record.from, record.from_date, record.date_from)),
      to: toIsoDate(firstOf(record.to, record.to_date, record.date_to)),
      status: asString(record.status) || 'pending',
      reason: asString(record.reason),
    }),

    toPayload: (values, employeeId) => ({
      employee_id: Number(employeeId),
      date: toIsoDate(values.date),
      from: toIsoDate(values.from),
      to: toIsoDate(values.to),
      status: values.status || 'pending',
      reason: values.reason || '',
    }),

    api: {
      create: (values) => remotelyApi.createRemotely(values),
      update: ({ id, values }) => remotelyApi.updateRemotely({ id, values }),
      remove: (id) => remotelyApi.deleteRemotely(id),
    },
  },

  /* ---------------------------------------------------------------- */
  overtimes: {
    id: 'overtimes',
    icon: Clock,
    tabLabelKey: 'requests.table.types.overtimes',
    tabLabelFallback: 'Overtimes',
    singularKey: 'requests.singular.overtime',
    singularFallback: 'overtime request',
    queryKey: (employeeId) => ['employee-overtimes', employeeId],

    // POST/PATCH /overtime — employee_id, date, from (HH:mm), to (HH:mm),
    // reason (REQUIRED here), status
    schema: z.object({
      date: z.string().min(1, 'Date is required'),
      from: z.string().min(1, 'Start time is required'),
      to: z.string().min(1, 'End time is required'),
      status: statusSchema,
      reason: z.string().min(1, 'Reason is required'),
    }),

    fields: [
      dateField,
      { name: 'from', labelKey: 'requests.form.from', labelFallback: 'From', type: 'time', required: true },
      { name: 'to', labelKey: 'requests.form.to', labelFallback: 'To', type: 'time', required: true },
      ...tail(true),
    ],

    emptyValues: { date: '', from: '', to: '', status: 'pending', reason: '' },

    toFormValues: (record) => ({
      date: toIsoDate(record.date),
      from: toHHmm(firstOf(record.from, record.from_time, record.start_time)),
      to: toHHmm(firstOf(record.to, record.to_time, record.end_time)),
      status: asString(record.status) || 'pending',
      reason: asString(record.reason),
    }),

    toPayload: (values, employeeId) => ({
      employee_id: Number(employeeId),
      date: toIsoDate(values.date),
      from: toHHmm(values.from),
      to: toHHmm(values.to),
      status: values.status || 'pending',
      reason: values.reason,
    }),

    api: {
      create: (values) => overtimeApi.createOvertimeRequest(values),
      update: ({ id, values }) => overtimeApi.updateOvertimeRequest({ id, values }),
      remove: (id) => overtimeApi.deleteOvertimeRequest(id),
    },
  },

  /* ---------------------------------------------------------------- */
  'branch-transfers': {
    id: 'branch-transfers',
    icon: GitBranch,
    tabLabelKey: 'requests.table.types.branchTransfers',
    tabLabelFallback: 'Branch Transfers',
    singularKey: 'requests.singular.branchTransfer',
    singularFallback: 'branch transfer request',
    queryKey: (employeeId) => ['employee-branch-transfers', employeeId],

    // POST/PATCH /branch-transfers — employee_id, date,
    // current_branch_id, requested_branch_id, status, reason
    schema: z
      .object({
        date: z.string().min(1, 'Date is required'),
        current_branch_id: z.string().min(1, 'Current branch is required'),
        requested_branch_id: z.string().min(1, 'Requested branch is required'),
        status: statusSchema,
        reason: z.string().optional(),
      })
      .refine(
        (data) =>
          !data.current_branch_id ||
          !data.requested_branch_id ||
          String(data.current_branch_id) !== String(data.requested_branch_id),
        {
          message: 'Requested branch cannot be the same as current branch',
          path: ['requested_branch_id'],
        }
      ),

    fields: [
      dateField,
      {
        name: 'current_branch_id',
        labelKey: 'requests.form.currentBranch',
        labelFallback: 'Current Branch',
        type: 'branch',
        required: true,
      },
      {
        name: 'requested_branch_id',
        labelKey: 'requests.form.requestedBranch',
        labelFallback: 'Requested Branch',
        type: 'branch',
        required: true,
      },
      ...tail(false),
    ],

    emptyValues: {
      date: '',
      current_branch_id: '',
      requested_branch_id: '',
      status: 'pending',
      reason: '',
    },

    toFormValues: (record) => ({
      date: toIsoDate(record.date),
      current_branch_id: asString(
        firstOf(record.current_branch_id, record.current_branch?.id, record.from_branch_id)
      ),
      requested_branch_id: asString(
        firstOf(record.requested_branch_id, record.requested_branch?.id, record.to_branch_id)
      ),
      status: asString(record.status) || 'pending',
      reason: asString(record.reason),
    }),

    toPayload: (values, employeeId) => ({
      employee_id: Number(employeeId),
      date: toIsoDate(values.date),
      current_branch_id: values.current_branch_id,
      requested_branch_id: values.requested_branch_id,
      status: values.status || 'pending',
      reason: values.reason || '',
    }),

    api: {
      create: (values) => branchTransfersApi.createBranchTransfer(values),
      update: ({ id, values }) => branchTransfersApi.updateBranchTransfer({ id, values }),
      remove: (id) => branchTransfersApi.deleteBranchTransfer(id),
    },
  },

  /* ---------------------------------------------------------------- */
  resignations: {
    id: 'resignations',
    icon: LogOut,
    tabLabelKey: 'requests.table.types.resignations',
    tabLabelFallback: 'Resignations',
    singularKey: 'requests.singular.resignation',
    singularFallback: 'resignation request',
    queryKey: (employeeId) => ['employee-resignations', employeeId],

    // POST /resignations and POST /resignations/:id — BOTH multipart,
    // because of the optional `pdf` upload. Hence isMultipart below.
    isMultipart: true,

    schema: z.object({
      date: z.string().min(1, 'Date is required'),
      status: statusSchema,
      reason: z.string().min(1, 'Reason is required'),
      pdf: z.any().optional(),
    }),

    fields: [
      dateField,
      ...tail(true),
      {
        name: 'pdf',
        labelKey: 'requests.form.pdf',
        labelFallback: 'Resignation Letter (PDF)',
        type: 'file',
        accept: 'application/pdf',
        fullWidth: true,
      },
    ],

    emptyValues: { date: '', status: 'pending', reason: '', pdf: undefined },

    toFormValues: (record) => ({
      date: toIsoDate(record.date),
      status: asString(record.status) || 'pending',
      reason: asString(record.reason),
      pdf: undefined,
    }),

    toPayload: (values, employeeId) => {
      const formData = new FormData();

      formData.append('employee_id', String(Number(employeeId)));
      formData.append('date', toIsoDate(values.date));
      formData.append('status', values.status || 'pending');
      formData.append('reason', values.reason || '');

      // Only send the file when the user picked a new one, otherwise the
      // existing attachment would be wiped on update.
      if (values.pdf && values.pdf.length > 0) {
        formData.append('pdf', values.pdf[0]);
      }

      return formData;
    },

    api: {
      create: (values) => resignationsApi.createResignation(values),
      update: ({ id, values }) => resignationsApi.updateResignation({ id, values }),
      remove: (id) => resignationsApi.deleteResignation(id),
    },
  },
};

/** Tab order shown on the profile. */
export const REQUEST_TYPE_IDS = [
  'leaves',
  'days-off',
  'loans',
  'remotely',
  'overtimes',
  'branch-transfers',
  'resignations',
];

export const getRequestTypeConfig = (typeId) => REQUEST_TYPES[typeId] || null;

/**
 * Records come back from different endpoints with different id keys.
 * Resolve whichever one this row actually carries.
 */
export const getRecordId = (record) =>
  record?.id ??
  record?.leave_id ??
  record?.holiday_id ??
  record?.day_off_id ??
  record?.loan_id ??
  record?.remotely_id ??
  record?.remote_day_id ??
  record?.overtime_id ??
  record?.branch_transfer_id ??
  record?.resignation_id ??
  null;
