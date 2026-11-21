// src/features/meetings/components/AddMeetingModal.jsx
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/services/auth/auth.store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePickerInput from "@/components/ui/date-picker-input";
import { Form, FormField } from "@/components/forms/Form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllEmployees } from "@/shared/hooks/useAllEmployees";
import { format, isValid, parse } from "date-fns";
import EmployeeMultiSelectCombobox from "@/components/ui/EmployeeMultiSelectCombobox";

function toApiDate(value) {
  if (!value) return "";
  if (value instanceof Date) return isValid(value) ? format(value, "yyyy-MM-dd") : "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  if (typeof value === "string") {
    const parsed1 = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsed1)) return format(parsed1, "yyyy-MM-dd");

    const parsed2 = parse(value, "dd/MM/yy", new Date());
    if (isValid(parsed2)) return format(parsed2, "yyyy-MM-dd");
  }

  return "";
}

const normalizeStatus = (s) => {
  const v = String(s || "").toLowerCase().trim();
  if (v === "canceled") return "cancelled";
  return v;
};

export default function AddMeetingModal({
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
  loading,
  editingMeeting = null,
  defaultEmployeeIds = [],
  employeeName = null,
}) {
  const { t, i18n } = useTranslation();
  const { authSource, user } = useAuthStore?.() ?? {};

  // In employee-login + create mode: show static employee name instead of combobox
  const isEmployeeLogin = authSource === 'employee-login';
  const showStaticEmployee = isEmployeeLogin && !editingMeeting && defaultEmployeeIds.length > 0;
  const resolvedEmployeeName = employeeName || user?.name || user?.full_name || null;

  const isArabic = i18n.language === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const inputClass = isArabic ? "h-9 text-right" : "h-9 text-left";

  const selectItemClass = isArabic
    ? "cursor-pointer pr-8 text-right [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
    : "cursor-pointer text-left";

  const textareaClass = isArabic
    ? "min-h-20 w-full resize-none rounded-md border border-gray-300 p-2 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    : "min-h-20 w-full resize-none rounded-md border border-gray-300 p-2 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const { data: employees = [] } = useAllEmployees(open);

  const form = useForm({
    defaultValues: {
      name: "",
      date: "",
      from: "",
      to: "",
      employees: [],
      status: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (editingMeeting) {
      form.reset({
        name: editingMeeting.name || "",
        date: editingMeeting.date || "",
        from: editingMeeting.from || "",
        to: editingMeeting.to || "",
        employees: Array.isArray(editingMeeting.employees)
          ? editingMeeting.employees.map((emp) => Number(emp.id))
          : [],
        status: normalizeStatus(editingMeeting.status) || "",
        notes: editingMeeting.notes || "",
      });
    } else {
      form.reset({
        name: "",
        date: "",
        from: "",
        to: "",
        employees: [],
        status: "",
        notes: "",
      });
    }
  }, [open, editingMeeting, form]);

  const selectedEmployees = Array.isArray(form.watch("employees"))
    ? form.watch("employees")
    : [];

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      ...emp,
      id: String(emp.employee_id),
      name: emp.employee_name,
      code: emp.employee_code,
    }));
  }, [employees]);

  const handleSave = form.handleSubmit((values) => {
    const payload = {
      name: values.name?.trim(),
      date: toApiDate(values.date),
      from: values.from?.trim() || "",
      to: values.to?.trim() || "",
      status: normalizeStatus(values.status),
      notes: values.notes?.trim() || "",
      employees: selectedEmployees,
    };

    if (editingMeeting?.id) {
      onUpdate?.({ id: editingMeeting.id, payload });
    } else {
      onSubmit?.(payload);
    }
  });

  const canSubmit = Boolean(
    form.watch("name")?.trim() &&
      toApiDate(form.watch("date")) &&
      form.watch("from")?.trim() &&
      form.watch("to")?.trim() &&
      form.watch("status")?.trim()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={`
          overflow-hidden p-0 sm:max-w-[520px]
          ${isArabic
            ? "text-right [&>button]:left-4 [&>button]:right-auto"
            : "text-left"}
        `}
      >
        <div className="border-b px-4 py-3">
          <DialogHeader
            className={`
              p-0
              ${isArabic ? "items-end text-right" : "items-start text-left"}
            `}
          >
            <DialogTitle
              className={`
                w-full text-sm font-semibold
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              {editingMeeting
                ? t("meetings.addMeeting.editMeeting")
                : t("meetings.addMeeting.title")}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className={`p-4 ${isArabic ? "text-right" : "text-left"}`}>
          <div className="space-y-4 rounded-md border p-4 shadow-sm">
            <div
              className={`text-sm font-semibold ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {t("meetings.addMeeting.meetingDetails")}
            </div>

            <Form form={form} onSubmit={handleSave}>
              <div className={`space-y-4 ${isArabic ? "text-right" : "text-left"}`}>
                <FormField name="name" label={t("meetings.addMeeting.meetingTitle")} required>
                  {({ field }) => (
                    <Input
                      dir={dir}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("meetings.addMeeting.meetingTitlePlaceholder")}
                      className={inputClass}
                    />
                  )}
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField name="from" label={t("meetings.addMeeting.startTime")} required>
                    {({ field }) => (
                      <Input
                        dir={dir}
                        lang={i18n.language}
                        type="time"
                        value={field.value}
                        onChange={field.onChange}
                        className={inputClass}
                      />
                    )}
                  </FormField>

                  <FormField name="to" label={t("meetings.addMeeting.endTime")} required>
                    {({ field }) => (
                      <Input
                        dir={dir}
                        lang={i18n.language}
                        type="time"
                        value={field.value}
                        onChange={field.onChange}
                        className={inputClass}
                      />
                    )}
                  </FormField>
                </div>

                <FormField name="date" label={t("meetings.addMeeting.date")} required>
                  {({ field }) => (
                    <DatePickerInput
                      dir={dir}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("meetings.addMeeting.selectDate")}
                      className="w-full"
                      inputClassName={inputClass}
                      buttonClassName="h-9"
                    />
                  )}
                </FormField>

                <FormField name="status" label={t("meetings.addMeeting.status")} required>
                  {({ field }) => (
                    <Select
                      dir={dir}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t("meetings.addMeeting.selectStatus")} />
                      </SelectTrigger>

                      <SelectContent
                        dir={dir}
                        align={isArabic ? "end" : "start"}
                        className={isArabic ? "text-right" : "text-left"}
                      >
                        <SelectItem value="pending" className={selectItemClass}>
                          {t("meetings.addMeeting.pending")}
                        </SelectItem>

                        <SelectItem value="completed" className={selectItemClass}>
                          {t("meetings.addMeeting.completed")}
                        </SelectItem>

                        <SelectItem value="cancelled" className={selectItemClass}>
                          {t("meetings.addMeeting.cancelled")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>

                <FormField
                  name="employees"
                  label={t("meetings.addMeeting.selectParticipants")}
                  required
                >
                  {({ field }) => (
                    <div className={`space-y-3 ${isArabic ? "text-right" : "text-left"}`}>
                      <EmployeeMultiSelectCombobox
                        dir={dir}
                        value={selectedEmployees.map(String)}
                        onChange={(value) => {
                          const normalized = Array.isArray(value)
                            ? value.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
                            : [];

                          form.setValue("employees", normalized, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        employees={employeeOptions}
                        placeholder={t("meetings.addMeeting.selectParticipantsPlaceholder")}
                        searchPlaceholder={t("meetings.addMeeting.searchParticipants")}
                      />

                      <input
                        dir={dir}
                        type="hidden"
                        {...field}
                        value={selectedEmployees.join(",")}
                        readOnly
                      />
                    </div>
                  )}
                </FormField>

                <FormField name="notes" label={t("meetings.addMeeting.notes")}>
                  {({ field }) => (
                    <textarea
                      dir={dir}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("meetings.addMeeting.additionalNotes")}
                      className={textareaClass}
                    />
                  )}
                </FormField>
              </div>

              <div
                className={`flex gap-2 pt-4 ${
                  isArabic ? "justify-start" : "justify-end"
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("meetings.addMeeting.cancel")}
                </Button>

                <Button type="submit" disabled={!canSubmit || loading}>
                  {loading
                    ? t("common.saving")
                    : editingMeeting
                      ? t("common.update")
                      : t("meetings.addMeeting.save")}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}