import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarOff, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
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

export function PayrollAbsenceTable({ absence, onEdit, onDelete }) {
  const { t } = useTranslation();
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={CalendarOff} title={t('tables.headers.absence')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.type')}</TableHead>
              <TableHead>{t('tables.headers.amount')}</TableHead>
              <TableHead>{t('tables.headers.date')}</TableHead>
              <TableHead>{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absence.map((row) => (
              <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                <TableCell className="py-3">
                  <Badge
                    variant="secondary"
                    className="h-5 border-none bg-rose-50 text-[10px] text-rose-600 hover:bg-rose-50"
                  >
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-xs font-bold text-rose-600">
                  {row.amount ?? '--'}
                </TableCell>
                <TableCell className="py-3 text-xs text-slate-500">
                  {row.from} to {row.to}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-none border-r"
                      onClick={() => onEdit?.(row)}
                      disabled={row.type === 'absent' && row.reason === 'absent_without_request'}
                    >
                      <Pencil className="h-3 w-3 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onDelete?.(row)}
                      disabled={row.type === 'absent' && row.reason === 'absent_without_request'}
                    >
                      <Trash2 className="h-3 w-3 text-slate-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
