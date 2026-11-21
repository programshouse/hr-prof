import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function PayrollDeductionsTable({
  deductions = [],
  onEdit,
  onDelete,
  employeeId,
  month,
}) {
  const { t } = useTranslation();
  const rows = Array.isArray(deductions) ? deductions : [];
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={AlertCircle} title={t('tables.headers.deductions')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('salaries.headers.reason')}</TableHead>
              <TableHead>{t('salaries.headers.amount')}</TableHead>
              <TableHead>{t('salaries.headers.date')}</TableHead>
              <TableHead className="text-right">{t('salaries.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isLateRow =
                row?.__type === 'late_deduction' ||
                row?.id === 'late-deduction' ||
                row?.id === 'late-deduction-row';

              return (
                <TableRow
                  key={row?.id ?? `${row?.reason}-${row?.date ?? 'na'}`}
                  className="border-b border-slate-50 hover:bg-transparent"
                >
                  <TableCell className="py-3 text-xs font-medium text-slate-900">
                    {row?.reason ?? '--'}
                  </TableCell>

                  <TableCell className="py-3 text-xs font-bold text-orange-600">
                    {row?.amount ?? '--'}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-500">
                    {isLateRow ? '--' : row?.date ?? '--'}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {isLateRow ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit?.(row)}
                          title="View deductions sheet"
                        >
                          <Eye className="h-3 w-3 text-slate-400" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none border-r"
                            onClick={() => onEdit?.(row)}
                            title="Edit deduction"
                          >
                            <Pencil className="h-3 w-3 text-slate-400" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onDelete?.(row)}
                            title="Delete deduction"
                          >
                            <Trash2 className="h-3 w-3 text-slate-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
