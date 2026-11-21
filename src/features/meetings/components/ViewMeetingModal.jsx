import { X, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAllPositions, useAllDepartments } from "@/shared/hooks";
import { useMeetingQuery } from "../hooks/useMeetingQuery";
import { formatDateTimeWithLanguage } from "@/lib/formatTime";

// ---------- Helpers ----------
const STATUS_BADGE = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-800",
  canceled: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  scheduled: "bg-slate-100 text-slate-700",
};

function prettyStatus(s) {
  const key = String(s || "scheduled").toLowerCase();
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function getStatusClass(s) {
  const key = String(s || "scheduled").toLowerCase();
  return STATUS_BADGE[key] || STATUS_BADGE.scheduled;
}

// ---------- Avatar ----------
function Avatar({ src, name }) {
  const initial = (name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
      {src ? (
        <img
          src={src}
          alt={name || "avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-500">
          {initial}
        </div>
      )}
    </div>
  );
}

// ---------- Employee Item ----------
function EmployeeItem({ employee }) {
  const { data: positions = [] } = useAllPositions();
  const { data: departments = [] } = useAllDepartments();

  const fullName = employee?.name || "—";

  const departmentName =
    departments?.data?.find?.(
      (d) => d.id === employee?.department_id
    )?.name_en ||
    departments?.find?.(
      (d) => d.id === employee?.department_id
    )?.name_en ||
    `Department ID: ${employee?.department_id || "—"}`;

  return (
    <div className="flex items-center gap-3">
      <Avatar src={employee?.image} name={fullName} />

      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">
          {fullName}
        </div>

        <div className="text-xs text-slate-400">
          {departmentName}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Modal ----------
export default function MeetingDetailsModal({
  open,
  onOpenChange,
  meeting,
}) {
  const { t, i18n } = useTranslation();
  const { data: fullMeetingData } = useMeetingQuery(meeting?.id);

  if (!open) return null;

  const meetingData = fullMeetingData || meeting;

  const title =
    meetingData?.name ||
    t("meetings.showMeeting.title");

  const date = meetingData?.date || "—";

  const time =
    meetingData?.from && meetingData?.to
      ? `${meetingData.from} - ${meetingData.to}`
      : meetingData?.from || "—";

  const status = meetingData?.status || "scheduled";
  const notes = meetingData?.notes || "—";
  const employees = meetingData?.employees || [];

  return (
    <div className="fixed inset-0 z-50">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onOpenChange?.(false)}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2">

        <div className="rounded-2xl bg-white shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-5 w-5 text-slate-600" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">

            <div className="rounded-xl border border-slate-200">

              {/* Section Header */}
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
                <div className="text-base font-semibold text-slate-900">
                  {t("meetings.showMeeting.meetingDetails")}
                </div>
              </div>

              {/* Info */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-[180px_1fr] gap-x-10 gap-y-6">

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.meetingName")} :
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {title}
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.date")} :
                  </div>
                  <div>{date}</div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.time")} :
                  </div>
                  <div>{time}</div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.status")} :
                  </div>
                  <div>
                    <span
                      className={[
                        "inline-flex rounded-xl px-5 py-2 text-xs font-semibold",
                        getStatusClass(status),
                      ].join(" ")}
                    >
                      {prettyStatus(status)}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.notes")} :
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {notes}
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.created")} :
                  </div>
                  <div>
                    {meetingData?.created_at
                      ? formatDateTimeWithLanguage(new Date(meetingData.created_at), i18n.language)
                      : "—"}
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {t("meetings.showMeeting.updated")} :
                  </div>
                  <div>
                    {meetingData?.updated_at
                      ? formatDateTimeWithLanguage(new Date(meetingData.updated_at), i18n.language)
                      : "—"}
                  </div>

                </div>
              </div>

              {/* Employees */}
              <div className="border-t border-slate-200" />

              <div className="bg-slate-50 px-5 py-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <div className="text-base font-semibold text-slate-900">
                  {t("meetings.showMeeting.attendanceEmployees")} ({employees.length})
                </div>
              </div>

              <div className="px-6 py-5">

                {employees.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="grid max-h-[360px] grid-cols-1 md:grid-cols-2 overflow-auto">

                      <div className="space-y-6 p-5">
                        {employees
                          .slice(0, Math.ceil(employees.length / 2))
                          .map((emp) => (
                            <EmployeeItem key={emp.id} employee={emp} />
                          ))}
                      </div>

                      <div className="space-y-6 border-t border-slate-200 p-5 md:border-l md:border-t-0">
                        {employees
                          .slice(Math.ceil(employees.length / 2))
                          .map((emp) => (
                            <EmployeeItem key={emp.id} employee={emp} />
                          ))}
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-slate-500">
                    {t("meetings.showMeeting.noAttendanceEmployees")}
                  </div>
                )}

              </div>

            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}