// src/features/attendanceOverview/components/PartTimeOverviewTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/error/EmptyState";
import WorkedHoursDialogTrigger from "./WorkedHoursDialogTrigger";
import PartTimeOvertimeDialogTrigger from "./PartTimeOvertimeDialogTrigger";
import { Eye } from "lucide-react";
import {
  formatCountWithUnit,
  formatMinutesDurationLong,
} from "@/utils/durationLabels";

// Derive initials from the first two words of a name, fallback to "NA"
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "NA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstTwo = parts.slice(0, 2);
  const initials = firstTwo.map((p) => p[0]).join("").toUpperCase();
  return initials || "NA";
};

export default function PartTimeOverviewTable({ rows = [], isLoading, month }) {
  const { t } = useTranslation();

  const formatMinutes = (value) => formatMinutesDurationLong(t, value);
  const formatMinutesRequired = (value) =>
    formatCountWithUnit(t, Number(value) || 0, "hour");
  const formatOvertimeHours = (value) => {
    const n = Number(value) || 0;
    const rounded = Math.round(n * 100) / 100;
    return `${rounded}${t("common.hourShort")}`;
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-20 text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.id')}
            </TableHead>

            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.employee')}
            </TableHead>

            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.requiredHours')}
            </TableHead>

            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.workedHours')}
            </TableHead>

            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.missingHours')}
            </TableHead>

            <TableHead className="text-xs font-semibold text-slate-500">
              {t('attendance.overviewTable.overtimeWorked')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={`skeleton-${index}`}
                className="border-b border-slate-100"
              >
                {Array.from({ length: 6 }).map((__, i) => (
                  <TableCell key={`skeleton-cell-${i}`}>
                    <div className="h-4 animate-pulse rounded bg-slate-200" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => {
              const overtimeValue = row.overtimeWorked?.value ?? 0;
              const hasOvertime = Number(overtimeValue) > 0;

              const requiredMinutes = Number(row.requiredHours || 0);
              const missingMinutes = Number(row.missingHours || 0);

              return (
                <TableRow
                  key={row.employeeId}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                >
                  {/* ID */}
                  <TableCell className="text-xs text-black">{row.id}</TableCell>

                  {/* Employee */}
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                        {getInitials(row.name)}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {row.name}
                        </span>
                        <span className="truncate text-[11px] font-medium text-indigo-500">
                          {row.role ?? "—"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Required Hours ( hr فقط هنا) */}
                  <TableCell className="tabular-nums">
                    <div className="text-sm font-medium">
                      {formatMinutesRequired(requiredMinutes)}
                    </div>
                  </TableCell>

                  {/* Worked Hours ( fixed long decimals) */}
                  <TableCell>
                    <WorkedHoursDialogTrigger
                      employeeId={row.employeeId}
                      month={month}
                      value={row.workedHours}
                    >
                      <button
                        type="button"
                        className="flex h-8 min-w-[120px] items-center justify-between rounded-md border border-slate-200 px-3 text-sm font-medium text-gray-600 cursor-pointer"
                      >
                        <span className="truncate font-semibold tabular-nums">
                          {formatMinutes(row.workedHours)}
                        </span>
                        <Eye className="h-4 w-4 shrink-0 cursor-pointer text-slate-400" />
                      </button>
                    </WorkedHoursDialogTrigger>
                  </TableCell>

                  {/* Missing Hours */}
                  <TableCell className="tabular-nums">
                    <div className="text-sm font-medium text-error">
                      {formatMinutes(missingMinutes)}
                    </div>
                  </TableCell>

                  {/* Overtime ( add h next to number) */}
                  <TableCell>
                    <PartTimeOvertimeDialogTrigger
                      employeeId={row.employeeId}
                      month={month}
                      value={overtimeValue}
                    >
                      <button
                        type="button"
                        className={`flex h-8 min-w-[120px] items-center justify-between rounded-md border px-3 text-sm font-medium cursor-pointer${
                          hasOvertime
                            ? " border-emerald-300 bg-emerald-50 text-success"
                            : " border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        <span className="truncate font-semibold tabular-nums">
                          {formatOvertimeHours(overtimeValue)}
                        </span>
                        <Eye className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    </PartTimeOvertimeDialogTrigger>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <EmptyState title={t('common.noData')} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
