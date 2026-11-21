import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TasksTable({ tasks = [], onEdit, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="h-16 bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-[140px] px-6 text-xs font-bold text-slate-900">{t('tables.headers.id')}</TableHead>
            <TableHead className="px-6 text-xs font-bold text-slate-900">{t('tables.headers.name')}</TableHead>
            <TableHead className="px-6 text-xs font-bold text-slate-900">{t('tables.headers.month')}</TableHead>
            <TableHead className="px-6 text-xs font-bold text-slate-900">{t('tables.headers.taskName')}</TableHead>
            <TableHead className="px-6 text-xs font-bold text-slate-900">{t('tables.headers.cost')}</TableHead>
            <TableHead className="w-[120px] px-6 text-center text-xs font-bold text-slate-900">
              {t('tables.headers.action')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.map((item, index) => (
            <TableRow key={`${item.id}-${index}`} className="h-[78px] border-slate-100 hover:bg-slate-50/50">
              <TableCell className="px-6 text-xs font-semibold text-slate-900">
                {item.employee.code}
              </TableCell>

              <TableCell className="px-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.employee?.avatar} />
                    <AvatarFallback >
                      {item.employee?.name?.charAt(0,1)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.employee?.name}</p>
                    <p className="text-xs font-semibold text-indigo-600">{item.employee?.title}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 text-xs font-bold text-slate-900">
                {item.month_label ? `${item.month_label} ${item.year}` : `${item.month} ${item.year}`}
              </TableCell>

              <TableCell className="px-6 text-xs font-bold text-slate-900">
                {item.task_name || item.task}
              </TableCell>

              <TableCell className="px-6 text-xs font-bold text-slate-900">
                {item.cost}
              </TableCell>

              <TableCell className="px-6">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit?.(item)}
                    className="h-8 w-8 rounded-md border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete?.(item)}
                    className="h-8 w-8 rounded-md border-slate-300 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}