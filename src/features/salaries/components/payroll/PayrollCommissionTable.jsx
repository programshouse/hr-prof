import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, Pencil, Trash2 } from 'lucide-react';
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

export function PayrollCommissionTable({ commission_rows, onEdit, onDelete }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border shadow-sm lg:col-span-1">
      <CardHeader className="pb-2">
        <SectionHeader icon={BarChart3} title={t('tables.headers.commission')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.source')}</TableHead>
              <TableHead>{t('tables.headers.amount')}</TableHead>
              <TableHead className="text-right">{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commission_rows.length > 0 ? (
              commission_rows.map((row) => (
                <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                  <TableCell className="py-3 text-xs font-medium text-slate-900">
                    {row.source}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">
                    {row.amount}
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
                <TableCell colSpan={3} className="py-4 text-center text-xs text-slate-400">
                  {t('salaries.emptyStates.noCommissionData')}
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
