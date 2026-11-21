import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatMoney = (value) => `EGP ${toNumber(value).toLocaleString('en-US')}`;

const formatHours = (value) => {
  const num = toNumber(value);
  return `${Number.isInteger(num) ? num : num.toFixed(2)} Hours`;
};

const formatOvertimeHours = (minutes) => {
  const hours = toNumber(minutes) / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(2)}H`;
};

function AmountPill({ hours, amount, type = 'positive' }) {
  const isNegative = type === 'negative';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200 bg-white text-[11px] font-medium">
      <span className="border-r border-slate-200 px-2 py-1 text-slate-400">{hours}</span>

      <span className={isNegative ? 'px-2 py-1 text-red-500' : 'px-2 py-1 text-green-500'}>
        {amount}
      </span>
    </div>
  );
}

export default function FreelancePayrollTable({ data = [], loading }) {
  const rows = data || [];

  const columns = [
    'ID',
    'Name',
    'Department',
    'Required Hours',
    'Worked Hours',
    'Hour Cost',
    'Difference',
    'Overtime Hours',
    'Kpi',
    'Total Amount',
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[1150px]">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="h-12 px-5 text-xs font-semibold whitespace-nowrap text-slate-700"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading
              ? Array.from({ length: 9 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={column} className="px-5 py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((row) => {
                  const requiredHours = toNumber(row.required_monthly_hours);
                  const workedHours = toNumber(row.worked_hours);
                  const hourlyRate = toNumber(row.hourly_rate);

                  const diffHours = workedHours - requiredHours;
                  const diffAmount = Math.abs(diffHours * hourlyRate);

                  const hasDifference = diffHours !== 0;
                  const hasOvertime = toNumber(row.approved_overtime_minutes) > 0;

                  return (
                    <TableRow
                      key={row.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <TableCell className="px-5 py-4 text-xs font-semibold text-slate-700">
                        {row.code || row.id || '--'}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {(() => {
                              if (!row.name) return '?';
                              const parts = row.name.trim().split(' ');
                              const firstChar = parts[0]?.charAt(0) || '';
                              const secondChar =
                                parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
                              return (firstChar + secondChar).toUpperCase();
                            })()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {row.name || '--'}
                            </div>
                            <div className="text-primary text-[11px] font-medium">
                              {row.position || '--'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium text-slate-700">
                        {row.department || '--'}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium text-slate-700">
                        {formatHours(requiredHours)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium text-slate-700">
                        {formatHours(workedHours)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium text-slate-700">
                        {formatMoney(hourlyRate)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium">
                        {hasDifference ? (
                          <AmountPill
                            hours={`${Math.abs(diffHours).toFixed(2)}H`}
                            amount={formatMoney(diffAmount)}
                            type={diffHours < 0 ? 'negative' : 'positive'}
                          />
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium">
                        {hasOvertime ? (
                          <AmountPill
                            hours={formatOvertimeHours(row.approved_overtime_minutes)}
                            amount={formatMoney(row.overtime_amount)}
                            type="positive"
                          />
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-medium text-slate-700">
                        {formatMoney(row.kpi_amount)}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-xs font-semibold text-slate-900">
                        {formatMoney(row.net_salary)}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
