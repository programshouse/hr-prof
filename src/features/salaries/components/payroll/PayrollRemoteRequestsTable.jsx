import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Home, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { translateRequestStatus } from '@/utils/requestLabels';
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

export function PayrollRemoteRequestsTable({ remote_requests, onEdit, onDelete }) {
  const { t } = useTranslation();
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <SectionHeader icon={Home} title={t('tables.headers.remoteRequests')} />
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-none bg-slate-50 hover:bg-slate-50">
              <TableHead>{t('tables.headers.period')}</TableHead>
              <TableHead>{t('tables.headers.status')}</TableHead>
              <TableHead>{t('tables.headers.reason')}</TableHead>
              <TableHead className="text-right">{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remote_requests.length > 0 ? (
              remote_requests.map((row) => (
                <TableRow key={row.id} className="border-b border-slate-50 hover:bg-transparent">
                  <TableCell className="py-3 text-xs text-slate-500">
                    {row.from} to {row.to}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className={`h-5 border-none text-[10px] hover:bg-opacity-80 ${
                        row.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50'
                          : row.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 hover:bg-amber-50'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      {translateRequestStatus(t, row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-500">
                    {row.reason || '--'}
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
                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                  {t('salaries.emptyStates.noRemoteRequestsFound')}
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
