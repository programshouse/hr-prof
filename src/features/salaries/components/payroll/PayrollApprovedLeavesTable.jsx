import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogOut, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { translateLeaveType, translateRequestStatus } from '@/utils/requestLabels';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="h-5 w-5 text-slate-600" />
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
  </div>
);

export function PayrollApprovedLeavesTable({ approved_leaves, onEdit, onDelete }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={LogOut} title={t('tables.headers.approvedLeaves')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.date')}</TableHead>
              <TableHead>{t('tables.headers.type')}</TableHead>
              <TableHead>{t('tables.headers.from')}</TableHead>
              <TableHead>{t('tables.headers.to')}</TableHead>
              <TableHead>{t('tables.headers.duration')}</TableHead>
              <TableHead>{t('tables.headers.status')}</TableHead>
              <TableHead className="text-right">{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approved_leaves.length > 0 ? (
              approved_leaves.map((row) => (
                <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                  <TableCell className="py-3 text-xs text-slate-500">
                    {row.date}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className="h-5 border-none bg-blue-50 text-[10px] text-blue-600 hover:bg-blue-50"
                    >
                      {translateLeaveType(t, row.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-500">
                    {row.from?.substring(0, 5) || '--'}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-500">
                    {row.to?.substring(0, 5) || '--'}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-900">
                    {row.hours > 0 && `${row.hours}${t('common.hourShort')} `}
                    {row.minutes > 0 && `${row.minutes}${t('common.minuteShort')}`}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className="h-5 border-none bg-emerald-50 text-[10px] text-emerald-600 hover:bg-emerald-50"
                    >
                      {translateRequestStatus(t, row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none border-r"
                        onClick={() => onEdit?.(row)}
                      >
                        <Pencil className="h-3 w-3 text-slate-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDelete?.(row)}
                      >
                        <Trash2 className="h-3 w-3 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                  {t('salaries.emptyStates.noApprovedLeavesFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
