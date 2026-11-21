import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Paperclip,
  X,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

import DatePickerInput from '@/components/ui/date-picker-input';

import {
  formatEmployeeSelectLabel,
} from '@/lib/utils/employeeDisplayName';

import { cn } from '@/lib/utils';

import axiosClient from '@/services/http/axiosClient';
import { useAuthStore } from '@/services/auth/auth.store';

const getEmployeeId = (employee) =>
  String(
    employee?.employee_id ??
      employee?.employee_id_fk ??
      employee?.employeeId ??
      employee?.staff_id ??
      employee?.employee?.id ??
      employee?.employee?.employee_id ??
      employee?.employee?.employee_id_fk ??
      employee?.id ??
      employee?.pivot?.employee_id ??
      employee?.pivot?.employee_id_fk ??
      ''
  );

const normalizeEmployeesResponse = (response) => {
  const candidates = [
    response?.data?.employees,
    response?.data?.data?.employees,
    response?.data?.data?.data?.employees,
    response?.data?.items,
    response?.data?.data?.items,
    response?.data?.members,
    response?.data?.data?.members,
    response?.data?.data?.data,
    response?.data?.data,
    response?.data,
    response?.employees,
    response?.items,
    response?.members,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const formatDateForInput = (value) => {
  if (!value) return '';

  const raw = String(value).trim();
  const isoDate = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveTaskEmployees = (task) => {
  const arrays = [
    task?.employees,
    task?.assigned_employees,
    task?.assignedEmployees,
    task?.task_employees,
    task?.taskEmployees,
    task?.assignees,
    task?.employee_tasks,
    task?.employeeTasks,
  ];

  for (const list of arrays) {
    if (Array.isArray(list) && list.length > 0) return list;
  }

  if (task?.employee && typeof task.employee === 'object') return [task.employee];
  if (task?.assignee && typeof task.assignee === 'object') return [task.assignee];
  return [];
};

const resolveTaskEmployeeIds = (task) => {
  if (!task) return [];

  if (Array.isArray(task?.employee_ids) && task.employee_ids.length > 0) {
    return task.employee_ids.map(String);
  }

  const employees = resolveTaskEmployees(task);
  if (employees.length > 0) {
    return employees.map(getEmployeeId).filter(Boolean);
  }

  const singleId =
    task?.employee_id ??
    task?.employee_id_fk ??
    task?.employeeId ??
    task?.assigned_employee_id ??
    task?.assignee_id ??
    task?.employee?.employee_id ??
    task?.employee?.employee_id_fk ??
    task?.employee?.id;

  return singleId == null || singleId === '' ? [] : [String(singleId)];
};

const normalizeTaskStatus = (value) => {
  const normalized = String(value || 'pending')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');

  return ['pending', 'in progress', 'review', 'done'].includes(normalized)
    ? normalized
    : 'pending';
};

function getTaskAttachmentUrl(task) {
  const candidates = [
    task?.attachment,
    task?.attachment_url,
    task?.file_url,
  ];

  for (const raw of candidates) {
    if (!raw) continue;

    if (
      typeof raw === 'string' &&
      /^https?:\/\//i.test(raw.trim())
    ) {
      return raw.trim();
    }

    if (
      typeof raw === 'object' &&
      raw?.url &&
      typeof raw.url === 'string'
    ) {
      return raw.url.trim();
    }
  }

  return null;
}

function getAttachmentLinkLabel(task, url) {
  if (task?.attachment_name) {
    return task.attachment_name;
  }

  if (!url) return '';

  try {
    const path = new URL(url).pathname;
    const segment = path
      .split('/')
      .filter(Boolean)
      .pop();

    return segment
      ? decodeURIComponent(segment)
      : url;
  } catch {
    return url;
  }
}

const getEmployeeName = (
  employee,
  preferArabic = false
) => {
  return formatEmployeeSelectLabel(employee, {
    preferArabic,
  });
};

// Resolve task name from both list rows and common nested API responses.
// This fixes edit opening with an empty Task Name when the details endpoint
// wraps the task inside data/task or uses another task-name key.
const resolveTaskName = (task) => {
  if (!task) return '';

  const sources = [
    task,
    task?.task,
    task?.data,
    task?.data?.task,
    task?.employee_task,
    task?.employeeTask,
  ].filter(Boolean);

  const keys = [
    'name',
    'task_name',
    'taskName',
    'task_title',
    'taskTitle',
    'title',
    'subject',
  ];

  for (const source of sources) {
    for (const key of keys) {
      const value = source?.[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return String(value);
      }
    }
  }

  return '';
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
  employees: scopedEmployees = null,
  loadEmployeesFromApi = true,
}) {
  const { t, i18n } = useTranslation();
  const { user: loggedInEmployee, role } = useAuthStore();

  const preferArabic =
    i18n.language?.startsWith('ar');

  // FOR NOW: in employee login, both CREATE and UPDATE are locked
  // to the logged-in employee.
  //
  // IMPORTANT:
  // The old multi-employee picker/API logic is NOT deleted.
  // It remains below for HR/Admin and can be restored for employee login later.
  const isSelfOnlyEmployeeTask = role === 'employee';
  const selfEmployeeId = getEmployeeId(loggedInEmployee);

  /*
   * =========================================================
   * ALL EMPLOYEES
   * =========================================================
   *
   * Employee source:
   * - HR/Admin: employee list endpoint (/list/employees with /list fallback)
   * - Employee-portal manager: scoped team members passed by the page
   *
   * Response:
   *
   * {
   *   status: true,
   *   employees: [...]
   * }
   */
  const [employeesData, setEmployeesData] =
    useState([]);

  const [employeesLoading, setEmployeesLoading] =
    useState(false);

  const [employeeSearch, setEmployeeSearch] =
    useState('');

  const [employeeSelectOpen, setEmployeeSelectOpen] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    // FOR NOW: no /list/employees call on employee-portal CREATE/UPDATE.
    // Keep the old loader below untouched for HR/Admin.
    if (isSelfOnlyEmployeeTask) {
      setEmployeesData(
        loggedInEmployee && selfEmployeeId ? [loggedInEmployee] : []
      );
      setEmployeesLoading(false);
      return;
    }

    let cancelled = false;

    const mergeEmployees = (primary = [], fallback = []) => {
      const result = [];
      const seen = new Set();

      [...primary, ...fallback].forEach((employee) => {
        const id = getEmployeeId(employee);
        if (!id || seen.has(id)) return;
        seen.add(id);
        result.push(employee);
      });

      return result;
    };

    const loadAllEmployees = async () => {
      const scoped = Array.isArray(scopedEmployees) ? scopedEmployees : [];

      if (!loadEmployeesFromApi) {
        setEmployeesData(scoped);
        setEmployeesLoading(false);
        return;
      }

      setEmployeesLoading(true);

      try {
        // This is the assignment source requested for create/edit.
        // Keep /list only as a compatibility fallback for older backends.
        let response;

        try {
          response = await axiosClient.get('/list/employees');
        } catch (error) {
          console.warn('/list/employees failed, trying /list:', error);
          response = await axiosClient.get('/list');
        }

        const apiEmployees = normalizeEmployeesResponse(response);

        if (!cancelled) {
          setEmployeesData(mergeEmployees(apiEmployees, scoped));
        }
      } catch (error) {
        console.error('Failed to load employees for task form:', error);

        if (!cancelled) {
          // Never hide already-known assigned/scoped employees if the lookup
          // endpoint is temporarily unavailable.
          setEmployeesData(scoped);
        }
      } finally {
        if (!cancelled) {
          setEmployeesLoading(false);
        }
      }
    };

    loadAllEmployees();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    scopedEmployees,
    loadEmployeesFromApi,
    isSelfOnlyEmployeeTask,
    loggedInEmployee,
    selfEmployeeId,
  ]);

  const taskSchema = z.object({
    task_number: z.string().optional(),

    name: z
      .string()
      .min(
        1,
        t('employeeTasks.taskNameRequired')
      ),

    description: z.string().optional(),

    employee_ids: z
      .array(z.string())
      .min(
        1,
        t(
          'employeeTasks.atLeastOneEmployeeRequired'
        )
      ),

    start_date: z.string().optional(),

    due_date: z.string().optional(),

    priority: z.enum([
      'low',
      'medium',
      'high',
      'urgent',
      'critical',
    ]),

    status: z.enum([
      'pending',
      'in progress',
      'review',
      'done',
    ]),

    attachment: z.any().optional(),
  });

  const form = useForm({
    resolver: zodResolver(taskSchema),

    defaultValues: {
      task_number: '',
      name: '',
      description: '',
      employee_ids: [],
      start_date: '',
      due_date: '',
      priority: 'medium',
      status: 'pending',
      attachment: null,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      task_number: String(task?.task_number ?? task?.taskNumber ?? ''),

      // Keep the old supported keys, but also handle nested API responses.
      // This prevents Task Name from appearing empty on update.
      name: resolveTaskName(task),

      description:
        task?.description ||
        task?.task_description ||
        task?.details ||
        task?.notes ||
        '',

      // FOR NOW: employee-portal CREATE/UPDATE is locked to self.
      // Original multi-employee behavior is preserved in the fallback below
      // for HR/Admin.
      employee_ids:
        isSelfOnlyEmployeeTask && selfEmployeeId
          ? [selfEmployeeId]
          : resolveTaskEmployeeIds(task),

      start_date: formatDateForInput(
        task?.start_date ??
          task?.startDate ??
          task?.from_date ??
          task?.fromDate ??
          task?.date_from ??
          task?.dateFrom
      ),

      due_date: formatDateForInput(
        task?.due_date ??
          task?.dueDate ??
          task?.end_date ??
          task?.endDate ??
          task?.to_date ??
          task?.toDate ??
          task?.date_to ??
          task?.dateTo
      ),

      priority: ['low', 'medium', 'high', 'urgent', 'critical'].includes(
        String(task?.priority || '').toLowerCase()
      )
        ? String(task.priority).toLowerCase()
        : 'medium',

      status: normalizeTaskStatus(task?.status),

      attachment: null,
    });
  }, [open, task, form, isSelfOnlyEmployeeTask, selfEmployeeId]);

  const selectedEmployeeIds =
    form.watch('employee_ids') || [];


  useEffect(() => {
    if (!open || !task) return;

    const assigned = resolveTaskEmployees(task);
    if (assigned.length === 0) return;

    setEmployeesData((current) => {
      const merged = [...current];
      const seen = new Set(merged.map(getEmployeeId).filter(Boolean));

      assigned.forEach((employee) => {
        const id = getEmployeeId(employee);
        if (id && !seen.has(id)) {
          seen.add(id);
          merged.push(employee);
        }
      });

      return merged;
    });
  }, [open, task]);

  const existingAttachmentUrl = task
    ? getTaskAttachmentUrl(task)
    : null;

  const existingAttachmentLabel =
    task && existingAttachmentUrl
      ? getAttachmentLinkLabel(
          task,
          existingAttachmentUrl
        )
      : '';

  /*
   * =========================================================
   * SEARCH EMPLOYEES
   * =========================================================
   */
  const availableEmployees = useMemo(() => {
    const selectedSet = new Set(
      selectedEmployeeIds.map(String)
    );

    return employeesData.filter(
      (employee) => {
        const employeeId =
          getEmployeeId(employee);

        return (
          employeeId &&
          !selectedSet.has(employeeId)
        );
      }
    );
  }, [
    employeesData,
    selectedEmployeeIds,
  ]);

  const filteredEmployees = useMemo(() => {
    const search =
      employeeSearch
        .toLowerCase()
        .trim();

    if (!search) {
      return availableEmployees;
    }

    return availableEmployees.filter(
      (employee) => {
        const searchText = [
          employee?.employee_id,
          employee?.id,
          employee?.employee_code,
          employee?.code,
          employee?.employee_name,
          employee?.name,
          employee?.full_name,
          employee?.name_ar,
          employee?.name_en,
          employee?.employee?.name,
          employee?.employee?.employee_name,
          employee?.employee?.full_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchText.includes(search);
      }
    );
  }, [
    availableEmployees,
    employeeSearch,
  ]);

  const handleSubmit = (data) => {
    // FOR NOW: enforce self-assignment in the actual request payload too
    // for BOTH create and update in employee login.
    //
    // The original multi-employee mapping is kept below for HR/Admin.
    const employee_ids = isSelfOnlyEmployeeTask
      ? selfEmployeeId
        ? [Number(selfEmployeeId)].filter((id) => !Number.isNaN(id))
        : []
      : (data.employee_ids || [])
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));

    const file =
      data.attachment?.[0];

    const baseFields = {
      task_number:
        data.task_number || undefined,

      name: data.name,

      description:
        data.description || undefined,

      employee_ids,

      start_date:
        data.start_date || undefined,

      due_date:
        data.due_date || undefined,

      priority: data.priority,

      status: data.status,
    };

    if (employee_ids.length > 0) {
      // Keep compatibility with backends that validate a single employee_id
      // while still sending employee_ids[] for multi-assignment.
      baseFields.employee_id = employee_ids[0];
    }

    if (file instanceof File) {
      const formData =
        new FormData();

      Object.entries(
        baseFields
      ).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === ''
        ) {
          return;
        }

        if (
          key === 'employee_ids' &&
          Array.isArray(value)
        ) {
          value.forEach((id) => {
            formData.append(
              'employee_ids[]',
              String(id)
            );
          });
        } else {
          formData.append(
            key,
            typeof value === 'number'
              ? String(value)
              : value
          );
        }
      });

      formData.append(
        'attachment',
        file
      );

      onSubmit(formData);

      return;
    }

    onSubmit(baseFields);
  };

  const handleAddEmployee = (
    employeeId
  ) => {
    if (!employeeId) return;

    const currentIds =
      form.getValues(
        'employee_ids'
      ) || [];

    if (
      !currentIds.includes(
        employeeId
      )
    ) {
      form.setValue(
        'employee_ids',
        [
          ...currentIds,
          employeeId,
        ],
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
    }

    setEmployeeSearch('');
    setEmployeeSelectOpen(false);
  };

  const handleRemoveEmployee = (
    employeeId
  ) => {
    const currentIds =
      form.getValues(
        'employee_ids'
      ) || [];

    form.setValue(
      'employee_ids',
      currentIds.filter(
        (id) =>
          id !== employeeId
      ),
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {task
              ? t(
                  'employeeTasks.editTask'
                )
              : t(
                  'employeeTasks.createTask'
                )}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(
            handleSubmit
          )}
          className="space-y-5"
        >
          <div>
            <Label htmlFor="task_number">
              {t(
                'employeeTasks.taskNumber'
              )}
            </Label>

            <Input
              id="task_number"
              {...form.register(
                'task_number'
              )}
              placeholder="2002"
            />
          </div>

          <div>
            <Label htmlFor="name">
              {t(
                'employeeTasks.taskName'
              )}
            </Label>

            <Input
              id="name"
              {...form.register(
                'name'
              )}
              placeholder={t(
                'employeeTasks.titlePlaceholder'
              )}
            />

            {form.formState.errors
              .name && (
              <p className="mt-1 text-sm text-red-500">
                {
                  form.formState.errors
                    .name.message
                }
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">
              {t(
                'employeeTasks.description'
              )}
            </Label>

            <Textarea
              id="description"
              {...form.register(
                'description'
              )}
              placeholder={t(
                'employeeTasks.descriptionPlaceholder'
              )}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* =====================================================
              EMPLOYEE SEARCH
          ====================================================== */}
          {isSelfOnlyEmployeeTask ? (
            <div>
              <Label>{t('employeeTasks.employees')}</Label>

              <div className="mt-2 flex h-11 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                {loggedInEmployee
                  ? getEmployeeName(loggedInEmployee, preferArabic)
                  : selfEmployeeId
                    ? `Employee ${selfEmployeeId}`
                    : 'Current employee'}
              </div>

              {/*
                FOR NOW ONLY:
                CREATE and UPDATE from employee login are self-only.

                The original searchable employee picker is NOT deleted.
                It remains in the else branch below and is still used for HR/Admin.
                Remove this temporary branch later to restore it.
              */}
            </div>
          ) : (
          <div>
            <Label>
              {t(
                'employeeTasks.employees'
              )}
            </Label>

            <Popover
              open={
                employeeSelectOpen
              }
              onOpenChange={
                setEmployeeSelectOpen
              }
            >
              <PopoverTrigger
                asChild
              >
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="mt-2 h-11 w-full justify-between"
                  disabled={
                    employeesLoading
                  }
                >
                  {employeesLoading
                    ? t(
                        'common.loading'
                      )
                    : t(
                        'employeeTasks.selectEmployee'
                      )}

                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
              >
                <Command
                  shouldFilter={false}
                >
                  <CommandInput
                    placeholder={
                      t(
                        'common.searchEmployees'
                      ) ||
                      'Search employee...'
                    }
                    value={
                      employeeSearch
                    }
                    onValueChange={
                      setEmployeeSearch
                    }
                  />

                  <CommandList>
                    {employeesLoading ? (
                      <CommandEmpty>
                        {t(
                          'common.loading'
                        )}
                      </CommandEmpty>
                    ) : filteredEmployees.length ===
                      0 ? (
                      <CommandEmpty>
                        {employeeSearch
                          ? t(
                              'common.noEmployeeFound'
                            )
                          : 'No employees available'}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredEmployees.map(
                          (employee) => {
                            const employeeId =
                              getEmployeeId(
                                employee
                              );

                            return (
                              <CommandItem
                                key={
                                  employeeId
                                }
                                value={
                                  employeeId
                                }
                                onSelect={() =>
                                  handleAddEmployee(
                                    employeeId
                                  )
                                }
                              >
                                <Check className="mr-2 size-4 opacity-0" />

                                <span className="truncate">
                                  {getEmployeeName(
                                    employee,
                                    preferArabic
                                  )}
                                </span>
                              </CommandItem>
                            );
                          }
                        )}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected employees */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedEmployeeIds.map(
                (employeeId) => {
                  const employee =
                    employeesData.find(
                      (item) =>
                        getEmployeeId(
                          item
                        ) ===
                        employeeId
                    );

                  return (
                    <div
                      key={
                        employeeId
                      }
                      className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700"
                    >
                      <span>
                        {employee
                          ? getEmployeeName(
                              employee,
                              preferArabic
                            )
                          : `Employee ${employeeId}`}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveEmployee(
                            employeeId
                          )
                        }
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            {form.formState.errors
              .employee_ids && (
              <p className="mt-1 text-sm text-red-500">
                {
                  form.formState
                    .errors.employee_ids
                    .message
                }
              </p>
            )}
          </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {t(
                  'employeeTasks.startDate'
                )}
              </Label>

              <DatePickerInput
                value={
                  form.watch(
                    'start_date'
                  ) || ''
                }
                onChange={(v) =>
                  form.setValue(
                    'start_date',
                    v,
                    {
                      shouldValidate:
                        true,
                    }
                  )
                }
              />
            </div>

            <div>
              <Label>
                {t(
                  'employeeTasks.dueDate'
                )}
              </Label>

              <DatePickerInput
                value={
                  form.watch(
                    'due_date'
                  ) || ''
                }
                onChange={(v) =>
                  form.setValue(
                    'due_date',
                    v,
                    {
                      shouldValidate:
                        true,
                    }
                  )
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {t(
                  'employeeTasks.priority'
                )}
              </Label>

              <Select
                value={form.watch(
                  'priority'
                )}
                onValueChange={(
                  value
                ) =>
                  form.setValue(
                    'priority',
                    value,
                    {
                      shouldValidate:
                        true,
                      shouldDirty:
                        true,
                    }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="low">
                    {t(
                      'employeeTasks.priorities.low'
                    )}
                  </SelectItem>

                  <SelectItem value="medium">
                    {t(
                      'employeeTasks.priorities.medium'
                    )}
                  </SelectItem>

                  <SelectItem value="high">
                    {t(
                      'employeeTasks.priorities.high'
                    )}
                  </SelectItem>

                  <SelectItem value="urgent">
                    {t(
                      'employeeTasks.priorities.urgent'
                    )}
                  </SelectItem>

                  <SelectItem value="critical">
                    {t(
                      'employeeTasks.priorities.critical'
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {t(
                  'employeeTasks.status'
                )}
              </Label>

              <Select
                value={form.watch(
                  'status'
                )}
                onValueChange={(
                  value
                ) =>
                  form.setValue(
                    'status',
                    value,
                    {
                      shouldValidate:
                        true,
                      shouldDirty:
                        true,
                    }
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="pending">
                    {t(
                      'employeeTasks.statuses.pending'
                    )}
                  </SelectItem>

                  <SelectItem value="in progress">
                    {t(
                      'employeeTasks.statuses.inProgress'
                    )}
                  </SelectItem>

                  <SelectItem value="review">
                    {t(
                      'employeeTasks.statuses.review'
                    )}
                  </SelectItem>

                  <SelectItem value="done">
                    {t(
                      'employeeTasks.statuses.done'
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="attachment">
              {t(
                'employeeTasks.attachment'
              )}
            </Label>

            {existingAttachmentUrl ? (
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-600">
                      {t(
                        'employeeTasks.currentAttachment'
                      )}
                    </p>

                    <a
                      href={
                        existingAttachmentUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 break-all text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {existingAttachmentLabel ||
                        existingAttachmentUrl}

                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>

                    <p className="mt-1.5 text-xs text-slate-500">
                      {t(
                        'employeeTasks.replaceAttachmentHint'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <Input
              id="attachment"
              type="file"
              {...form.register(
                'attachment'
              )}
              className="file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
            >
              {t(
                'common.cancel'
              )}
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? t(
                    'common.saving'
                  )
                : t(
                    'common.save'
                  )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}