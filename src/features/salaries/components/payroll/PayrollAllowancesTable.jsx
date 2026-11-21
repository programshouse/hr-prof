import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Wallet, Pencil, Trash2 } from 'lucide-react';
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

export function PayrollAllowancesTable({ allowances, onEdit, onDelete }) {
  const { t } = useTranslation();
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={Wallet} title={t('tables.headers.allowance')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.type')}</TableHead>
              <TableHead>{t('tables.headers.amount')}</TableHead>
              <TableHead>{t('tables.headers.fromDate')}</TableHead>
              <TableHead>{t('tables.headers.toDate')}</TableHead>
              <TableHead>{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowances.length > 0 ? (
              allowances.map((row) => (
              <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-slate-900">
                  {row.type}
                </TableCell>
                <TableCell className="py-3 text-xs font-bold text-blue-600">
                  {row.amount}
                </TableCell>
                <TableCell className="py-3 text-xs text-slate-500">{row.from_date}</TableCell>
                <TableCell className="py-3 text-xs text-slate-500">{row.to_date}</TableCell>
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
                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  {t('salaries.emptyStates.noAllowanceDataFound')}
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
