// src/features/employees/components/EmplyeeProfile.jsx/EmployeeAttendanceTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Clock5,Calendar } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label"; 

const statusStyles = {
  onTime: {
    labelClass:
      "inline-flex items-center gap-2 rounded-md bg-light-success px-3 py-1 text-xs font-medium text-success",
    dotClass: "h-2 w-2 rounded-full bg-success",
  },
  late: {
    labelClass:
      "inline-flex items-center gap-2 rounded-md bg-light-error px-3 py-1 text-xs font-medium text-error",
    dotClass: "h-2 w-2 rounded-full bg-error",
  },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = statusStyles[status];

  if (!cfg) return null;

  const statusText = status === 'onTime' 
    ? t('employees.profile.details.attendance.status.onTime')
    : t('employees.profile.details.attendance.status.late');

  return (
    <Label className={cfg.labelClass}>
      <span className={cfg.dotClass} />
      {statusText}
    </Label>
  );
}

export default function EmployeeAttendanceTable({ attendances = [] }) {
  const { t, i18n } = useTranslation();

  const formatTimeTo12h = (timeStr) => {
    if (!timeStr) return '--:--';
    const [hours, minutes] = String(timeStr).split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeStr;
    const isAr = i18n.language.startsWith('ar');
    const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
    const h12 = h % 12 || 12;
    return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
  };
  const rows = Array.isArray(attendances) ? attendances : [];
  const hasData = rows.length > 0;

  const mapStatus = (statusArray) => {
    if (!Array.isArray(statusArray) || statusArray.length === 0) return "onTime";

    // use only the arrival status (first element) to determine badge color
    const arrivalStatus = statusArray[0];

    if (arrivalStatus === "lateArrival" || arrivalStatus === "late") {
      return "late";
    }

    // any non-late arrival is treated as on time
    return "onTime";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">{t('employees.profile.details.attendance.title')}</h3>
      </div>
      <Table>
        <TableHeader className="bg-gray-50 hover:bg-gray-50">
          <TableRow className="hover:bg-gray-50">
            <TableHead className="bg-gray-50 hover:bg-gray-50">{t('employees.profile.details.attendance.table.date')}</TableHead>
            <TableHead className="bg-gray-50 hover:bg-gray-50">{t('employees.profile.details.attendance.table.status')}</TableHead>
            <TableHead className="bg-gray-50 hover:bg-gray-50">{t('employees.profile.details.attendance.table.checkin')}</TableHead>
            <TableHead className="bg-gray-50 hover:bg-gray-50">{t('employees.profile.details.attendance.table.checkOut')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasData ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{t('employees.profile.details.attendance.noRecords')}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-slate-700">{row.date}</TableCell>
                <TableCell>
                  <StatusBadge status={mapStatus(row.status)} />
                </TableCell>
                <TableCell className="text-slate-700">{formatTimeTo12h(row.check_in)}</TableCell>
                <TableCell className="text-slate-700">{formatTimeTo12h(row.check_out)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
