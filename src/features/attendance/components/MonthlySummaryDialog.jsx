// src/features/attendance/components/MonthlySummaryDialog.jsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { translateRequestStatus } from '@/utils/requestLabels';

function StatusBadge({ status, subStatus, type, t }) {
  const base = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';

  if (status === 'present') {
    return (
      <Badge className={`${base} bg-green-100 text-green-700`}>
        {t('attendance.overviewTable.present')}
      </Badge>
    );
  }
  if (status === 'absent') {
    return (
      <Badge className={`${base} bg-red-100 text-red-600`}>
        {t('attendance.overviewTable.absent')}
      </Badge>
    );
  }
  if (status === 'weekend') {
    return (
      <Badge className={`${base} bg-yellow-100 text-yellow-700`}>
        {t('attendance.overviewTable.weekend')}
      </Badge>
    );
  }
  if (status === 'leave') {
    return (
      <Badge className={`${base} bg-blue-100 text-blue-700`}>
        {type || t('attendance.overviewTable.leave')}{' '}
        {subStatus === 'approved' && '✓'}
      </Badge>
    );
  }

  return (
    <Badge className={`${base} bg-slate-100 text-slate-600`}>
      {translateRequestStatus(t, status) || status || '--'}
    </Badge>
  );
}

function SummaryCard({ title, value, className = '' }) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{title}</div>
    </Card>
  );
}

export default function MonthlySummaryDialog({ employeeId, month, trigger, data }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            {t('attendance.monthlySummary.trigger')}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('attendance.monthlySummary.title', { month })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard title={t('attendance.monthlySummary.presentDays')} value={data?.summary?.present || 0} className="border-green-200" />
            <SummaryCard title={t('attendance.monthlySummary.absentDays')} value={data?.summary?.absent || 0} className="border-red-200" />
            <SummaryCard title={t('attendance.monthlySummary.leaveApproved')} value={data?.summary?.leave_approved || 0} className="border-blue-200" />
            <SummaryCard title={t('attendance.monthlySummary.weekendDays')} value={data?.summary?.weekend || 0} className="border-yellow-200" />
          </div>

          {/* Additional Summary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard title={t('attendance.monthlySummary.leavePending')} value={data?.summary?.leave_pending || 0} />
            <SummaryCard title={t('attendance.monthlySummary.permissionApproved')} value={data?.summary?.permission_approved || 0} />
            <SummaryCard title={t('attendance.monthlySummary.missingPunch')} value={data?.summary?.missing_punch || 0} />
            <SummaryCard title={t('attendance.monthlySummary.totalDays')} value={data?.total_days || 0} />
          </div>

          {/* Attendance Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">{t('attendance.monthlySummary.dailyDetails')}</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.date')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.day')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.checkIn')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.checkOut')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.overviewTable.status')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.type')}</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">{t('attendance.attendanceSheet.source')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.rows?.map((row, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="text-sm font-medium">{row.date}</TableCell>
                      <TableCell className="text-sm">{row.day_name}</TableCell>
                      <TableCell className="text-sm">{row.check_in || '--'}</TableCell>
                      <TableCell className="text-sm">{row.check_out || '--'}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} subStatus={row.sub_status} type={row.type} t={t} />
                      </TableCell>
                      <TableCell className="text-sm">{row.type || '--'}</TableCell>
                      <TableCell className="text-sm">{row.source}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                        {t('attendance.monthlySummary.noRecords')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
