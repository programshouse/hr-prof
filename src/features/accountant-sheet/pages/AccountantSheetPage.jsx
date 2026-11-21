import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { toast } from 'sonner';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { useAccountantSheetQuery } from '../hooks/useAccountantSheetQuery';
import AccountantSheetFilters from '../components/AccountantSheetFilters';
import AccountantSheetTable from '../components/AccountantSheetTable';
import { Pagination } from '@/components/ui/Pagination';

const FIXED_COMMENT = 'Optional data';
const FIXED_TRUE = 'TRUE';
const FIXED_BANK_TRANSACTION_TYPE = 'cash_transfer';
const FIXED_ORANGE_ISSUER = 'orange';
const FIXED_E_WALLET_ISSUER = 'vodafone';
const FIXED_CARD_STATUS = 'Delivered';
const FIXED_DELIVERY_METHOD = 'Home delivery';

const TABLE_EXPORT_COLUMNS = [
  { key: 'code', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'salary_payment_day', label: 'Payment Date' },
  { key: 'department_name', label: 'Department' },
  { key: 'transaction_number', label: 'Transaction Number' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'salary_method', label: 'Salary Method' },
  { key: 'total_salary', label: 'Total Salary' },
  { key: 'national_id', label: 'National ID' },
];

const ACCOUNTANT_SUMMARY_COLUMNS = [
  { key: 'code', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'transaction_number', label: 'Transaction Number', asText: true },
  {
    key: 'card_number',
    label: 'Card Number',
    fallbackKeys: ['account_number'],
    asText: true,
  },
  { key: 'loans', label: 'Loans' },
  { key: 'total_salary', label: 'Total Salary' },
];

const ACCOUNTANT_SUMMARY_FORMAT = {
  id: 'accountant_summary',
  label: 'Accountant Summary Sheet',
  description: 'Export table with summary and signatures',
  fileName: 'accountant-summary-sheet',
  sheetName: 'Accountant Summary',
  columns: ACCOUNTANT_SUMMARY_COLUMNS,
};

const EXPORT_FORMATS = [
  {
    id: 'bank_cards',
    label: 'Bank Cards',
    description: 'Export bank cards file',
    fileName: 'bank-cards',
    sheetName: 'bank cards sheet',
    columns: [
      {
        key: 'account_number',
        label: 'account number / IBAN',
        fallbackKeys: ['card_number'],
        asText: true,
      },
      { key: 'total_salary', label: 'amount' },
      { key: 'name', label: 'full name' },
      { key: 'bank_swift_code', label: 'bank swift code' },
      {
        key: 'transaction_type',
        label: 'transaction type',
        fixedValue: FIXED_BANK_TRANSACTION_TYPE,
      },
      { key: 'comment_1', label: 'comment 1', fixedValue: FIXED_COMMENT },
      { key: 'comment_2', label: 'comment 2', fixedValue: FIXED_COMMENT },
      {
        key: 'customer_bears_fees',
        label: 'customer bears fees',
        fixedValue: FIXED_TRUE,
      },
    ],
  },
  {
    id: 'orange_paymob',
    label: 'Orange Paymob Sheet',
    description: 'Export orange paymob sheet',
    fileName: 'orange-paymob',
    sheetName: 'orange paymob sheet',
    columns: [
      {
        key: 'transaction_number',
        label: 'mobile number',
        fallbackKeys: ['phone', 'mobile_number'],
        asText: true,
      },
      { key: 'total_salary', label: 'amount' },
      { key: 'name', label: 'full name' },
      { key: 'issuer', label: 'issuer', fixedValue: FIXED_ORANGE_ISSUER },
      { key: 'comment_1', label: 'comment 1', fixedValue: FIXED_COMMENT },
      { key: 'comment_2', label: 'comment 2', fixedValue: FIXED_COMMENT },
      {
        key: 'customer_bears_fees',
        label: 'customer bears fees',
        fixedValue: FIXED_TRUE,
      },
    ],
  },
  {
    id: 'vodafone_etisalat_paymob',
    label: 'Vodafone / Etisalat Paymob',
    description: 'Export vodafone / etisalat paymob sheet',
    fileName: 'vodafone-etisalat-paymob',
    sheetName: 'vodafone - etisalat paymob',
    columns: [
      {
        key: 'transaction_number',
        label: 'mobile number',
        fallbackKeys: ['phone', 'mobile_number'],
        asText: true,
      },
      { key: 'total_salary', label: 'amount' },
      {
        key: 'issuer',
        label: 'issuer',
        fixedValue: FIXED_E_WALLET_ISSUER,
      },
      { key: 'comment_1', label: 'comment 1', fixedValue: FIXED_COMMENT },
      { key: 'comment_2', label: 'comment 2', fixedValue: FIXED_COMMENT },
      {
        key: 'customer_bears_fees',
        label: 'customer bears fees',
        fixedValue: FIXED_TRUE,
      },
    ],
  },
  {
    id: 'payment_file',
    label: 'Payment File',
    description: 'Export payroll payment file',
    fileName: 'payment-file',
    sheetName: 'Payment Employees',
    columns: [
      {
        key: 'dopay_number',
        label: 'dopay ID',
        fallbackKeys: ['dopay_id'],
        asText: true,
      },
      { key: 'name', label: 'Employee Name' },
      {
        key: 'national_id',
        label: 'ID Number',
        fallbackKeys: ['id_number'],
        asText: true,
      },
      { key: 'custom_id', label: 'Custom ID' },
      {
        key: 'card_status',
        label: 'Card Status',
        fixedValue: FIXED_CARD_STATUS,
      },
      {
        key: 'delivery_method',
        label: 'Delivery Method',
        fixedValue: FIXED_DELIVERY_METHOD,
      },
      { key: 'total_salary', label: 'Payment Amount' },
    ],
  },
];

function formatMonthDisplay(value) {
  return value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatExportDate(value) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = String(value.getFullYear()).slice(-2);

  return `${day}.${month}.${year}`;
}

function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === '' ||
    value === '—' ||
    value === '---'
  );
}

function toTextValue(value) {
  if (isEmptyValue(value)) return '';
  return String(value).trim();
}

function getValueFromFallbackKeys(row, keys = []) {
  for (const key of keys) {
    if (!isEmptyValue(row?.[key])) return row[key];
  }

  return '';
}

function getExportValue(row, column) {
  if (Object.prototype.hasOwnProperty.call(column, 'fixedValue')) {
    return column.fixedValue;
  }

  let mainValue = row?.[column.key];

  if (column.key === 'account_number') {
    mainValue = row?.account_number ?? row?.card_number;
  }

  if (column.key === 'card_number') {
    mainValue = row?.card_number ?? row?.account_number;
  }

  if (column.key === 'dopay_number') {
    mainValue = row?.dopay_number ?? row?.dopay_id;
  }

  if (column.key === 'national_id') {
    mainValue = row?.national_id ?? row?.id_number;
  }

  if (isEmptyValue(mainValue) && column.fallbackKeys?.length) {
    mainValue = getValueFromFallbackKeys(row, column.fallbackKeys);
  }

  if (isEmptyValue(mainValue) && Object.prototype.hasOwnProperty.call(column, 'fallback')) {
    mainValue = column.fallback;
  }

  if (isEmptyValue(mainValue)) return '';

  return column.asText ? toTextValue(mainValue) : mainValue;
}

function normalizeRowsForTableExport(rows) {
  return normalizeRowsForColumns(rows, TABLE_EXPORT_COLUMNS);
}

function normalizeRowsForColumns(rows, columns) {
  return rows.map((row) => {
    const item = {};

    columns.forEach((column) => {
      item[column.key] = getExportValue(row, column);
    });

    return item;
  });
}

function formatTotalSalaryValue(total) {
  return Number(total || 0);
}

function isAmountColumn(column) {
  return (
    column.key === 'total_salary' ||
    column.label === 'amount' ||
    column.label === 'Payment Amount' ||
    column.label === 'Total Salary'
  );
}

function getTotalLabelColumnIndex(columns) {
  const fullNameIndex = columns.findIndex(
    (column) =>
      column.key === 'name' ||
      column.label === 'full name' ||
      column.label === 'Employee Name'
  );

  return fullNameIndex >= 0 ? fullNameIndex : 0;
}

function getTotalRowCellValue(column, totalSalaries, columnIndex, columns) {
  if (columnIndex === getTotalLabelColumnIndex(columns)) {
    return 'Total Salaries ';
  }

  if (isAmountColumn(column)) {
    return formatTotalSalaryValue(totalSalaries);
  }

  return '';
}

function buildTableExportTotalRow(totalSalaries) {
  return {
    code: '',
    name: 'Total Salaries ',
    salary_payment_day: '',
    department_name: '',
    transaction_number: '',
    account_number: '',
    salary_method: '',
    total_salary: formatTotalSalaryValue(totalSalaries),
    national_id: '',
  };
}

function buildAccountantSummaryTotalRow(totalSalaries) {
  return {
    code: '',
    name: 'Total Salaries ',
    transaction_number: '',
    card_number: '',
    loans: '',
    total_salary: formatTotalSalaryValue(totalSalaries),
  };
}

function appendTotalRowToLabelRows(exportData, format, totalSalaries) {
  const emptySpaceRow = {};
  const totalRow = {};

  format.columns.forEach((column) => {
    emptySpaceRow[column.label] = '';
  });

  format.columns.forEach((column, columnIndex) => {
    totalRow[column.label] = getTotalRowCellValue(
      column,
      totalSalaries,
      columnIndex,
      format.columns
    );
  });

  return [...exportData, emptySpaceRow, totalRow];
}

function safeSheetName(name) {
  return String(name || 'Sheet1')
    .replace(/[:\\/?*[\]]/g, '-')
    .slice(0, 31);
}

function buildCustomWorksheet(rows, format, totalSalaries = 0) {
  const exportData = rows.map((row) => {
    const item = {};

    format.columns.forEach((column) => {
      item[column.label] = getExportValue(row, column);
    });

    return item;
  });

  const worksheet = XLSX.utils.json_to_sheet(
    appendTotalRowToLabelRows(exportData, format, totalSalaries),
    {
      header: format.columns.map((column) => column.label),
    }
  );

  worksheet['!cols'] = format.columns.map((column) => ({
    wch: Math.max(column.label.length + 6, 22),
  }));

  return worksheet;
}

function buildPaymentWorksheet(rows, format, totalSalaries = 0) {
  const sheetRows = [];

  sheetRows.push([]);
  sheetRows.push([]);
  sheetRows.push([]);
  sheetRows.push([]);
  sheetRows.push(['', '', '', '', '', '', '', 'Sent on:', formatExportDate(new Date())]);
  sheetRows.push([]);
  sheetRows.push(['', '', '', '', 'Company name:', '']);
  sheetRows.push([]);
  sheetRows.push(['', '', ...format.columns.map((column) => column.label)]);

  rows.forEach((row) => {
    sheetRows.push([
      '',
      '',
      ...format.columns.map((column) => getExportValue(row, column)),
    ]);
  });

  sheetRows.push([]);

  sheetRows.push([
    '',
    '',
    ...format.columns.map((column, columnIndex) =>
      getTotalRowCellValue(column, totalSalaries, columnIndex, format.columns)
    ),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 6 },
    ...format.columns.map((column) => ({
      wch: Math.max(column.label.length + 6, 22),
    })),
  ];

  return worksheet;
}

function buildAccountantSummaryTables(rows, summary = {}, summaryBySalaryMethod = []) {
  const summaryList = summary?.total_by_payment_methods?.length
    ? summary.total_by_payment_methods
    : summaryBySalaryMethod || [];

  const totalSalaries = summary?.total_salaries ?? 0;
  const normalizedRows = normalizeRowsForColumns(rows, ACCOUNTANT_SUMMARY_COLUMNS);

  return [
    {
      title: ACCOUNTANT_SUMMARY_FORMAT.label,
      columns: ACCOUNTANT_SUMMARY_COLUMNS,
      rows: [...normalizedRows, buildAccountantSummaryTotalRow(totalSalaries)],
    },
    {
      title: 'Summary',
      columns: [
        { key: 'label', label: 'Label' },
        { key: 'value', label: 'Value' },
      ],
      rows: [{ label: 'Total Salaries', value: totalSalaries }],
    },
    {
      title: 'Salary Method Summary',
      columns: [
        { key: 'salary_method', label: 'Salary Method' },
        { key: 'employees_count', label: 'Employees Count' },
        { key: 'total_salary', label: 'Total Salary' },
      ],
      rows: summaryList,
    },
    {
      title: 'Signatures',
      columns: [
        { key: 'manager_signature', label: 'امضاء المدير' },
        { key: 'accountant_signature', label: 'امضاء المحاسب' },
      ],
      rows: [{ manager_signature: '', accountant_signature: '' }],
    },
  ];
}

export default function AccountantSheetPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    if (monthParam && yearParam) {
      const month = Number(monthParam);
      const year = Number(yearParam);
      const date = new Date(year, month - 1, 1);

      return { month, year, date };
    }

    const date = new Date();

    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      date,
    };
  };

  const { month, year, date } = getCurrentMonthYear();

  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 10);

  const [filters, setFilters] = useState(() => ({
    keyword: searchParams.get('keyword') || '',
    salary_payment_day: searchParams.get('salary_payment_day') || '',
    department_id: searchParams.get('department_id') || '',
    salary_method: searchParams.get('salary_method') || '',
  }));

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const { data, isLoading } = useAccountantSheetQuery({
    year,
    month,
    page: currentPage,
    limit: pageSize,
    keyword: filters.keyword,
    salary_payment_day: filters.salary_payment_day,
    department_id: filters.department_id,
    salary_method: filters.salary_method,
  });

  const rows = useMemo(() => data?.data || [], [data?.data]);
  const pagination = data?.pagination || {};
  const summary = data?.summary || {};
  const summaryBySalaryMethod = data?.summary_by_salary_method || [];

  const getRowsToExport = () => {
    if (!rows.length) {
      toast.error('No accountant sheet data found to export.');
      return [];
    }

    const normalizedRows = normalizeRowsForTableExport(rows);
    return [...normalizedRows, buildTableExportTotalRow(summary.total_salaries || 0)];
  };

  const handleTableExcel = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToExcel({
      rows: exportRows,
      columns: TABLE_EXPORT_COLUMNS,
      fileName: `accountant-sheet-${year}-${String(month).padStart(2, '0')}`,
      title: 'Accountant Sheet',
      subtitle: formatMonthDisplay(date),
    });
  };

  const handleTablePdf = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    exportToPdf({
      rows: exportRows,
      columns: TABLE_EXPORT_COLUMNS,
      fileName: `accountant-sheet-${year}-${String(month).padStart(2, '0')}`,
      title: 'Accountant Sheet',
      subtitle: formatMonthDisplay(date),
    });
  };

  const handleTablePrint = () => {
    const exportRows = getRowsToExport();
    if (!exportRows.length) return;

    printTable({
      rows: exportRows,
      columns: TABLE_EXPORT_COLUMNS,
      title: 'Accountant Sheet',
      subtitle: formatMonthDisplay(date),
    });
  };

  const handleAccountantSummaryPrint = () => {
    if (!rows.length) {
      toast.error('No accountant sheet data found to export.');
      return;
    }

    printTable({
      tables: buildAccountantSummaryTables(rows, summary, summaryBySalaryMethod),
      title: ACCOUNTANT_SUMMARY_FORMAT.label,
      subtitle: formatMonthDisplay(date),
    });
  };

  const handleCustomExcel = (format) => {
    if (!rows.length) {
      toast.error('No accountant sheet data found to export.');
      return;
    }

    const totalSalaries = summary.total_salaries || 0;
    const workbook = XLSX.utils.book_new();

    const worksheet =
      format.id === 'payment_file'
        ? buildPaymentWorksheet(rows, format, totalSalaries)
        : buildCustomWorksheet(rows, format, totalSalaries);

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      safeSheetName(format.sheetName || format.label)
    );

    XLSX.writeFile(
      workbook,
      `${format.fileName}-${year}-${String(month).padStart(2, '0')}.xlsx`
    );

    toast.success(`${format.label} exported successfully.`);
  };

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);

    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));

    setSearchParams(params);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;

    setPageSize(num);
    setCurrentPage(1);
  };

  const isCurrentMonth = () => {
    const now = new Date();

    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  useEffect(() => {
    const params = new URLSearchParams();

    params.set('month', String(month));
    params.set('year', String(year));

    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize) params.set('pageSize', String(pageSize));
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.salary_payment_day) {
      params.set('salary_payment_day', String(filters.salary_payment_day));
    }
    if (filters.department_id) params.set('department_id', String(filters.department_id));
    if (filters.salary_method) params.set('salary_method', String(filters.salary_method));

    setSearchParams(params);
  }, [month, year, currentPage, pageSize, filters, setSearchParams]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setMonth(newDate.getMonth() - 1);
              handleDateChange(newDate);
            }}
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-1 size-3 sm:size-4" />
                <span>{formatMonthDisplay(date)}</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && handleDateChange(newDate)}
                initialFocus
                toDate={new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setMonth(newDate.getMonth() + 1);
              handleDateChange(newDate);
            }}
            disabled={isCurrentMonth()}
          >
            <ChevronRight className="size-4 sm:size-5" />
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[500px] max-w-[calc(100vw-24px)] p-3">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Choose export format
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleTableExcel}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary/40 hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileSpreadsheet className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Excel</span>
                    <span className="block text-xs text-slate-500">Export as XLSX</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleTablePdf}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary/40 hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">PDF</span>
                    <span className="block text-xs text-slate-500">Export as PDF</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleTablePrint}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary/40 hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Printer className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Print</span>
                    <span className="block text-xs text-slate-500">Print table</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAccountantSummaryPrint}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary/40 hover:bg-slate-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Printer className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Accountant Summary
                    </span>
                    <span className="block text-xs text-slate-500">Print summary sheet</span>
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {EXPORT_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => handleCustomExcel(format)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-primary/40 hover:bg-slate-50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileSpreadsheet className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {format.label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {format.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <AccountantSheetFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PageSizeSelect
            value={pageSize}
            onChange={handlePageSizeChange}
            options={[10, 20, 50, 100, 500]}
          />
        </div>

        <AccountantSheetTable
          data={rows}
          loading={isLoading}
          totalSalaries={summary.total_salaries || 0}
        />
      </div>

      <Pagination
        currentPage={pagination.page || currentPage}
        totalPages={pagination.pages || 1}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}