import { Edit2, Eye, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/error/EmptyState';

/* ------------------------------ UI bits ------------------------------ */

function MoneyCell({ value, locale = 'en-US' }) {
  const formattedValue =
    value !== null && value !== undefined && value !== ''
      ? Number(value).toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '--';

  return <div className="text-center text-sm font-medium text-slate-700">{formattedValue}</div>;
}

function CommissionCell({ value, locale = 'en-US' }) {
  const display =
    value !== null && value !== undefined && value !== ''
      ? `${Number(value).toLocaleString(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}%`
      : '--';

  return <div className="text-center text-sm font-medium text-slate-700">{display}</div>;
}

function getInitials(name = '') {
  const cleaned = String(name).trim().replace(/\s+/g, ' ');
  if (!cleaned) return '--';

  const parts = cleaned.split(' ').filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? '') || '';

  return (first + second).toUpperCase();
}

function NameCell({ name, subtitle }) {
  const initials = getInitials(name);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm">
        {initials}
      </div>

      <div className="flex min-w-0 flex-col leading-5">
        <span className="truncate text-sm font-semibold text-slate-900">{name ?? '--'}</span>
        {subtitle ? <span className="truncate text-xs font-semibold text-blue-600">{subtitle}</span> : null}
      </div>
    </div>
  );
}

function TypePill({ value, t }) {
  const label =
    value === 'single'
      ? t('common.single')
      : value === 'multi'
        ? t('common.multi')
        : value || '--';

  return (
    <div className="flex justify-center">
      <span className="inline-flex min-w-[74px] items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        {label}
      </span>
    </div>
  );
}

function ChangeTypePill({ value, t }) {
  const normalized = String(value || '').trim();

  const labelMap = {
    annual_increase: t('salaries.changeTypes.annualIncrease'),
    annualIncrease: t('salaries.changeTypes.annualIncrease'),
    decrease: t('salaries.changeTypes.decrease'),
    promotion: t('salaries.changeTypes.promotion'),
  };

  const styleMap = {
    annual_increase: 'border-blue-100 bg-blue-50 text-blue-700',
    annualIncrease: 'border-blue-100 bg-blue-50 text-blue-700',
    decrease: 'border-pink-100 bg-pink-50 text-pink-600',
    promotion: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  };

  const label = labelMap[normalized] || normalized || '--';
  const style = styleMap[normalized] || 'border-slate-100 bg-slate-50 text-slate-600';

  return (
    <div className="flex justify-center">
      <span className={`inline-flex min-w-[105px] items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${style}`}>
        {label}
      </span>
    </div>
  );
}

function ActionCell({ row, onView, onEdit, onDelete }) {
  return (
    <div className="flex justify-end">
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onView?.(row)}
          className="h-9 w-9 rounded-none p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-200" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(row)}
          className="h-9 w-9 rounded-none p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Edit2 className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-slate-200" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(row)}
          className="h-9 w-9 rounded-none p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ShowHideToggle({ checked, onCheckedChange, labelLeft, labelRight }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">{checked ? labelRight : labelLeft}</span>

      <button
        type="button"
        onClick={() => onCheckedChange?.(!checked)}
        className={[
          'relative h-6 w-11 rounded-full border transition-colors duration-200 ease-in-out',
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-gray-200',
        ].join(' ')}
        aria-pressed={checked}
      >
        <span
          className={[
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ease-in-out',
            checked ? 'left-[calc(100%-1.5rem)]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

/* ------------------------------ Component ------------------------------ */

export default function SalaryUpdatesTable({
  title,
  data = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  defaultShowExtras = false,
  showToggle = true,
}) {
  const { t, i18n } = useTranslation();
  const [showExtras, setShowExtras] = useState(!!defaultShowExtras);

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const tableTitle = title || t('salaries.allSalaries');

  const salaryDetailsColumns = useMemo(() => {
    if (!showExtras) return [];

    const allDepartments = new Set();

    data.forEach((row) => {
      if (Array.isArray(row.salary_details)) {
        row.salary_details.forEach((detail) => {
          if (detail.department_name) allDepartments.add(detail.department_name);
        });
      }
    });

    return Array.from(allDepartments).map((deptName) => ({
      id: `dept_${deptName.toLowerCase().replace(/\s+/g, '_')}`,
      header: () => <div className="text-center">{deptName.toUpperCase()}</div>,
      cell: ({ row }) => {
        const salaryDetails = row.original.salary_details;
        if (!Array.isArray(salaryDetails)) return <MoneyCell value={null} locale={locale} />;

        const deptDetail = salaryDetails.find((detail) => detail.department_name === deptName);
        return <MoneyCell value={deptDetail?.amount || null} locale={locale} />;
      },
    }));
  }, [showExtras, data, locale]);

  const columns = useMemo(() => {
    const base = [
      {
        id: 'id',
        header: () => <span>{t('salaries.headers.id')}</span>,
        cell: ({ row }) => {
          const employee = row.original.employee;
          const code = employee?.employee_code || employee?.code || row.original.employee_code || row.original.code;

          return <div className="text-sm font-semibold text-slate-900">{code ?? '--'}</div>;
        },
      },
      {
        id: 'name',
        header: t('salaries.headers.name'),
        cell: ({ row }) => {
          const employee = row.original.employee;
          const applicant = employee?.applicant;
          const position = employee?.position;

          const name =
            applicant?.first_name && applicant?.last_name
              ? `${applicant.first_name} ${applicant.last_name}`
              : row.original.applicant?.first_name && row.original.applicant?.last_name
                ? `${row.original.applicant.first_name} ${row.original.applicant.last_name}`
                : row.original.employee?.name ||
                  row.original.name ||
                  `${t('salaries.history.employee')} ID: ${row.original.employee_id || row.original.id || '--'}`;

          const subtitle =
            (isArabic ? position?.title_ar : position?.title_en) ||
            position?.title_en ||
            row.original.position?.title_en ||
            row.original.employee?.position ||
            row.original.jobTitle ||
            row.original.position ||
            row.original.role;

          return <NameCell name={name} subtitle={subtitle} />;
        },
      },
      {
        id: 'startDate',
        header: t('salaries.headers.startDate'),
        cell: ({ row }) => {
          const date = row.original.effective_from || row.original.startDate;

          if (!date) return <div className="text-sm font-medium text-slate-700">--</div>;

          try {
            const formattedDate = new Date(date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return <div className="text-sm font-medium text-slate-700">{formattedDate}</div>;
          } catch {
            return <div className="text-sm font-medium text-slate-700">{date}</div>;
          }
        },
      },
      {
        id: 'type',
        header: () => <div className="text-center">{t('salaries.headers.type')}</div>,
        cell: ({ row }) => <TypePill value={row.original.salary_type || row.original.type} t={t} />,
      },
      {
        id: 'changeType',
        header: () => <div className="text-center">{t('salaries.headers.changeType')}</div>,
        cell: ({ row }) => <ChangeTypePill value={row.original.change_type} t={t} />,
      },
      {
        id: 'newSalary',
        header: () => <div className="text-center">{t('salaries.headers.newSalary')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.base_salary || row.original.newSalary} locale={locale} />,
      },
      {
        id: 'commission',
        header: () => <div className="text-center">{t('salaries.headers.commission')}</div>,
        cell: ({ row }) => <CommissionCell value={row.original.commission_percentage} locale={locale} />,
      },
    ];

    const extras = [
      {
        id: 'medical',
        header: () => <div className="text-center">{t('salaries.headers.medical')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.medical} locale={locale} />,
      },
      {
        id: 'research',
        header: () => <div className="text-center">{t('salaries.headers.research')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.research} locale={locale} />,
      },
      {
        id: 'ms',
        header: () => <div className="text-center">{t('salaries.headers.ms')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.ms} locale={locale} />,
      },
      {
        id: 'print',
        header: () => <div className="text-center">{t('salaries.headers.print')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.print} locale={locale} />,
      },
    ];

    const tail = [
      {
        id: 'newKpi',
        header: () => <div className="text-center">{t('salaries.headers.newKpi')}</div>,
        cell: ({ row }) => <MoneyCell value={row.original.kpi || row.original.newKpi} locale={locale} />,
      },
      {
        id: 'actions',
        header: () => <div className={isArabic ? 'text-left' : 'text-right'}>{t('salaries.headers.action')}</div>,
        cell: ({ row }) => <ActionCell row={row.original} onView={onView} onEdit={onEdit} onDelete={onDelete} />,
      },
    ];

    return showExtras ? [...base, ...extras, ...salaryDetailsColumns, ...tail] : [...base, ...tail];
  }, [showExtras, onView, onEdit, onDelete, salaryDetailsColumns, t, locale, isArabic]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-3" dir={dir}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{tableTitle}</h3>
          {showToggle ? (
            <ShowHideToggle
              checked={showExtras}
              onCheckedChange={setShowExtras}
              labelLeft={t('salaries.show')}
              labelRight={t('salaries.hide')}
            />
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/80">
                  {Array.from({ length: showExtras ? 13 : 9 }).map((_, idx) => (
                    <TableHead
                      key={idx}
                      className="h-16 px-6 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      <Skeleton className="h-3 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-slate-100 last:border-b-0">
                    {Array.from({ length: showExtras ? 13 : 9 }).map((__, i) => (
                      <TableCell key={i} className="px-6 py-5">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir={dir}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{tableTitle}</h3>
        {showToggle ? (
          <ShowHideToggle
            checked={showExtras}
            onCheckedChange={setShowExtras}
            labelLeft={t('salaries.show')}
            labelRight={t('salaries.hide')}
          />
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50/80">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-16 px-6 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-28 text-center">
                    <EmptyState title={t('salaries.messages.noUpdates')} description="" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}