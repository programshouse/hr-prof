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

export function PayrollKpiItemsTable({ kpi_items, onEdit, onDelete }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={BarChart3} title={t('tables.headers.kpiItems')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.name')}</TableHead>
              <TableHead>{t('tables.headers.maxScore')}</TableHead>
              <TableHead className="text-right">{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpi_items.map((row) => (
              <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                <TableCell className="py-3 text-xs font-medium text-slate-900">
                  {row.name}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600">
                      {row.score}
                    </div>
                    <span className="text-xs font-bold text-slate-400">/{row.max_score}</span>
                  </div>
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
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
