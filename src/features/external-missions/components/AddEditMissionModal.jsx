import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  CalendarIcon,
  MapPin,
  DollarSign,
  FileText,
  Users,
  X,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAllEmployees } from '@/shared/hooks';
import { useAllDepartments } from '@/shared/hooks';
import { useTranslation } from 'react-i18next';
import DatePickerInput from '@/components/ui/date-picker-input';

function getEmployeeId(emp) {
  return String(emp?.employee_id || emp?.id || emp?.employeeId || emp?.applicant_id || '');
}

function getEmployeeName(emp, isArabic = false) {
  if (!emp) return 'Unknown';

  if (isArabic) {
    return (
      emp?.applicant?.full_name_ar ||
      emp?.full_name_ar ||
      emp?.name_ar ||
      emp?.employee_name ||
      emp?.name ||
      'Unknown'
    );
  }

  if (emp.applicant?.name) return emp.applicant.name;
  if (emp.applicant?.employee_name) return emp.applicant.employee_name;

  if (emp.applicant?.first_name && emp.applicant?.last_name) {
    return `${emp.applicant.first_name} ${emp.applicant.last_name}`;
  }

  return (
    emp.employee_name ||
    emp.name ||
    emp.fullName ||
    emp.employeeName ||
    'Unknown'
  );
}

function getEmployeeCode(emp) {
  return (
    emp?.code ||
    emp?.employee_code ||
    emp?.employeeId ||
    emp?.employee_id ||
    emp?.id ||
    ''
  );
}

function EmployeeMultiSelect({
  employees = [],
  value = [],
  onChange,
  disabled = false,
  placeholder = 'Choose employees...',
  isArabic = false,
  t,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedIds = useMemo(() => value.map(String), [value]);

  const selectedEmployees = useMemo(() => {
    const map = new Map(employees.map((emp) => [getEmployeeId(emp), emp]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [employees, selectedIds]);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((emp) => {
      const empId = getEmployeeId(emp);
      const name = getEmployeeName(emp, isArabic).toLowerCase();
      const code = String(getEmployeeCode(emp)).toLowerCase();

      if (selectedIds.includes(empId)) return false;
      if (!term) return true;

      return name.includes(term) || code.includes(term) || empId.includes(term);
    });
  }, [employees, search, selectedIds, isArabic]);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);

    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const addEmployee = (employeeId) => {
    if (!employeeId) return;
    if (selectedIds.includes(String(employeeId))) return;

    onChange([...selectedIds, String(employeeId)]);
    setSearch('');
  };

  const removeEmployee = (employeeId) => {
    onChange(selectedIds.filter((id) => id !== String(employeeId)));
  };

  return (
    <div ref={wrapperRef} className="space-y-3">
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`
            flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60
            ${isArabic ? 'text-right' : 'text-left'}
          `}
        >
          <span className={selectedIds.length ? 'text-slate-900' : 'text-slate-500'}>
            {placeholder}
          </span>

          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {open && (
          <div
            className={`
              absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-lg
              ${isArabic ? 'text-right' : 'text-left'}
            `}
          >
            <div className="relative mb-2">
              <Search
                className={`
                  pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400
                  ${isArabic ? 'right-3' : 'left-3'}
                `}
              />

              <Input
                ref={searchInputRef}
                dir={isArabic ? 'rtl' : 'ltr'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('externalMissions.modal.selectEmployees')}
                className={`h-11 ${isArabic ? 'pr-9 text-right' : 'pl-9 text-left'}`}
              />
            </div>

            <div className="max-h-[280px] overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/40 p-1">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
                  const empId = getEmployeeId(employee);
                  const empName = getEmployeeName(employee, isArabic);
                  const empCode = getEmployeeCode(employee);

                  return (
                    <button
                      key={empId}
                      type="button"
                      onClick={() => addEmployee(empId)}
                      className={`
                        flex w-full items-center rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100
                        ${isArabic ? 'text-right justify-end' : 'text-left'}
                      `}
                    >
                      <span className="truncate">
                        {empCode ? `${empCode} - ${empName}` : empName}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div
                  className={`
                    px-3 py-4 text-sm text-slate-500
                    ${isArabic ? 'text-right' : 'text-left'}
                  `}
                >
                  {t('externalMissions.modal.noEmployeesFound')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedEmployees.length > 0 && (
        <div className="max-h-[170px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`}>
            {selectedEmployees.map((employee) => {
              const empId = getEmployeeId(employee);
              const empName = getEmployeeName(employee, isArabic);

              return (
                <div
                  key={empId}
                  className={`
                    inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm
                    ${isArabic ? 'flex-row-reverse' : ''}
                  `}
                >
                  <span className="max-w-[180px] truncate">{empName}</span>

                  <button
                    type="button"
                    onClick={() => removeEmployee(empId)}
                    className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddEditMissionModal({
  open,
  onOpenChange,
  mission = null,
  onSave,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const isEdit = !!mission;

  const { data: employees = [], isLoading: employeesLoading } = useAllEmployees();

  const { data: departments = [], isLoading: departmentsLoading } =
    useAllDepartments();

  const getInitialEmployeeIds = () => {
    if (Array.isArray(mission?.employees) && mission.employees.length > 0) {
      return mission.employees
        .map((emp) =>
          String(emp?.pivot?.employee_id || emp?.employee_id || emp?.id || '')
        )
        .filter(Boolean);
    }

    if (Array.isArray(mission?.employee_ids)) {
      return mission.employee_ids.map(String);
    }

    if (mission?.employee_id) {
      return [String(mission.employee_id)];
    }

    return [];
  };

  const [formData, setFormData] = useState({
    destination: mission?.destination || '',
    purpose: mission?.purpose || '',
    startDate: mission?.start_date || mission?.startDate || '',
    endDate: mission?.end_date || mission?.endDate || '',
    estimatedCost: mission?.estimated_cost || mission?.estimatedCost || '',
    status: mission?.status || 'upcoming',
    company: mission?.company || '',
    employee_ids: getInitialEmployeeIds(),
  });

  useEffect(() => {
    if (!open) return;

    setFormData({
      destination: mission?.destination || '',
      purpose: mission?.purpose || '',
      startDate: mission?.start_date || mission?.startDate || '',
      endDate: mission?.end_date || mission?.endDate || '',
      estimatedCost: mission?.estimated_cost || mission?.estimatedCost || '',
      status: mission?.status || 'upcoming',
      company: mission?.company || '',
      employee_ids: getInitialEmployeeIds(),
    });
  }, [mission, open]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      start_date: formData.startDate
        ? new Date(formData.startDate).toISOString().split('T')[0]
        : '',
      end_date: formData.endDate
        ? new Date(formData.endDate).toISOString().split('T')[0]
        : '',
      estimated_cost: Number(formData.estimatedCost || 0),
      employee_ids: formData.employee_ids.map((id) => Number(id)),
    };

    onSave(formattedData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          max-h-[90vh] max-w-2xl overflow-y-auto
          ${isArabic
            ? 'text-right [&>button]:left-4 [&>button]:right-auto'
            : 'text-left'}
        `}
      >
        <DialogHeader
          className={isArabic ? 'items-end text-right' : 'items-start text-left'}
        >
          <DialogTitle
            className={`text-xl font-semibold ${
              isArabic ? 'w-full text-right' : 'text-left'
            }`}
          >
            {isEdit
              ? t('externalMissions.modal.editTitle')
              : t('externalMissions.modal.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}
        >
          <div>
            <Label
              htmlFor="employee_ids"
              className={`mb-2 flex items-center gap-2 ${
                isArabic ? 'flex-row-reverse justify-end' : ''
              }`}
            >
              <Users className="h-4 w-4" />
              {t('externalMissions.modal.selectEmployees')}
            </Label>

            <EmployeeMultiSelect
              employees={employees}
              value={formData.employee_ids}
              onChange={(ids) => handleChange('employee_ids', ids)}
              disabled={employeesLoading}
              placeholder={t('externalMissions.modal.selectEmployees')}
              isArabic={isArabic}
              t={t}
            />
          </div>

          <div>
            <Label
              htmlFor="company"
              className={isArabic ? 'text-right' : 'text-left'}
            >
              {t('externalMissions.modal.company')}
            </Label>

            <Select
              dir={dir}
              value={formData.company}
              onValueChange={(value) => handleChange('company', value)}
              disabled={departmentsLoading}
            >
              <SelectTrigger
                className={`mt-1 ${isArabic ? 'text-right' : 'text-left'}`}
              >
                <SelectValue
                  placeholder={t('externalMissions.modal.selectDepartment')}
                />
              </SelectTrigger>

              <SelectContent
                dir={dir}
                align={isArabic ? 'end' : 'start'}
                className={isArabic ? 'text-right' : 'text-left'}
              >
                {departments.map((department) => (
                  <SelectItem
                    key={department.id}
                    value={
                      department.name_en ||
                      department.name ||
                      department.name_ar
                    }
                    className={
                      isArabic
                        ? 'pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                        : 'text-left'
                    }
                  >
                    {isArabic
                      ? department.name_ar ||
                        department.name_en ||
                        department.name
                      : department.name_en ||
                        department.name ||
                        department.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="destination"
                className={`flex items-center gap-2 ${
                  isArabic ? 'flex-row-reverse justify-end' : ''
                }`}
              >
                <MapPin className="h-4 w-4" />
                {t('externalMissions.modal.destination')}
              </Label>

              <Input
                dir={dir}
                id="destination"
                value={formData.destination}
                onChange={(e) =>
                  handleChange('destination', e.target.value)
                }
                placeholder={t('externalMissions.modal.enterDestination')}
                className={`mt-1 ${isArabic ? 'text-right' : 'text-left'}`}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="purpose"
                className={`flex items-center gap-2 ${
                  isArabic ? 'flex-row-reverse justify-end' : ''
                }`}
              >
                <FileText className="h-4 w-4" />
                {t('externalMissions.modal.purpose')}
              </Label>

              <Textarea
                dir={dir}
                id="purpose"
                value={formData.purpose}
                onChange={(e) =>
                  handleChange('purpose', e.target.value)
                }
                placeholder={t('externalMissions.modal.enterPurpose')}
                className={`mt-1 min-h-20 resize-none ${
                  isArabic ? 'text-right' : 'text-left'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="startDate"
                className={`flex items-center gap-2 ${
                  isArabic ? 'flex-row-reverse justify-end' : ''
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                {t('externalMissions.modal.startDate')}
              </Label>

              <DatePickerInput
                value={formData.startDate || ''}
                onChange={(v) => handleChange('startDate', v)}
                className="mt-1"
                inputClassName={isArabic ? 'text-right' : 'text-left'}
              />
            </div>

            <div>
              <Label
                htmlFor="endDate"
                className={`flex items-center gap-2 ${
                  isArabic ? 'flex-row-reverse justify-end' : ''
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                {t('externalMissions.modal.endDate')}
              </Label>

              <DatePickerInput
                value={formData.endDate || ''}
                onChange={(v) => handleChange('endDate', v)}
                className="mt-1"
                inputClassName={isArabic ? 'text-right' : 'text-left'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="estimatedCost"
                className={`flex items-center gap-2 ${
                  isArabic ? 'flex-row-reverse justify-end' : ''
                }`}
              >
                <DollarSign className="h-4 w-4" />
                {t('externalMissions.modal.estimatedCost')}
              </Label>

              <Input
                dir={dir}
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) =>
                  handleChange('estimatedCost', e.target.value)
                }
                placeholder={t(
                  'externalMissions.modal.enterEstimatedCost'
                )}
                className={`mt-1 ${isArabic ? 'text-right' : 'text-left'}`}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="status"
                className={isArabic ? 'text-right' : 'text-left'}
              >
                {t('externalMissions.modal.status')}
              </Label>

              <Select
                dir={dir}
                value={formData.status}
                onValueChange={(value) =>
                  handleChange('status', value)
                }
              >
                <SelectTrigger
                  className={`mt-1 ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                >
                  <SelectValue
                    placeholder={t(
                      'externalMissions.modal.selectStatus'
                    )}
                  />
                </SelectTrigger>

                <SelectContent
                  dir={dir}
                  align={isArabic ? 'end' : 'start'}
                  className={isArabic ? 'text-right' : 'text-left'}
                >
                  <SelectItem
                    value="upcoming"
                    className={
                      isArabic
                        ? 'pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                        : 'text-left'
                    }
                  >
                    {t('externalMissions.status.upcoming')}
                  </SelectItem>

                  <SelectItem
                    value="ongoing"
                    className={
                      isArabic
                        ? 'pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                        : 'text-left'
                    }
                  >
                    {t('externalMissions.status.ongoing')}
                  </SelectItem>

                  <SelectItem
                    value="finished"
                    className={
                      isArabic
                        ? 'pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                        : 'text-left'
                    }
                  >
                    {t('externalMissions.status.finished')}
                  </SelectItem>

                  <SelectItem
                    value="canceled"
                    className={
                      isArabic
                        ? 'pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto'
                        : 'text-left'
                    }
                  >
                    {t('externalMissions.status.canceled')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={`flex gap-3 pt-4 ${
              isArabic ? 'justify-start' : 'justify-end'
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('externalMissions.modal.cancel')}
            </Button>

            <Button type="submit">
              {isEdit
                ? t('externalMissions.modal.updateMission')
                : t('externalMissions.modal.createMission')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}