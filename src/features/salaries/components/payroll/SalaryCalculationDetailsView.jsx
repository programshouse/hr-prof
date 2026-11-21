import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { formatValueWithUnitSuffix } from '@/utils/durationLabels';
import { formatRequestTime } from '@/utils/requestLabels';
import { formatTimeAMPMFromAPI } from '@/lib/formatTime';
import {
  CalcCard,
  CalcCardFooter,
  CalcDataTable,
  formatMoney,
  parseMoneyValue,
} from './salaryCalculationUi';
import SalaryCalculationSummaryView from './SalaryCalculationSummaryView';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

export default function SalaryCalculationDetailsView({
  data,
  penaltiesRows = [],
  rewardsRows = [],
  isLoading,
  onBack,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const lang = i18n.language;
  const detailsExportRef = useRef(null);

  const absence = data?.absence_attendance ?? {};
  const holidays = absence?.Holidays ?? absence?.holidays ?? {};
  const additions = data?.additions_breakdown ?? {};
  const deductions = data?.deductions_breakdown ?? {};
  const header = data?.header ?? {};

  const attendanceList = useMemo(() => {
    const raw = data?.attendance_rows || data?.attendance_details;
    return Array.isArray(raw) ? raw : [];
  }, [data?.attendance_rows, data?.attendance_details]);

  const approvedLeaves = data?.tables?.approved_leaves ?? [];

  const presentDays =
    absence?.attendance?.days ??
    absence?.attendance_days ??
    absence?.attendance ??
    0;

  const absentDays = absence?.absence?.total ?? absence?.absence_total ?? 0;

  const sickDays =
    absence?.sick_days ??
    data?.sick_days ??
    deductions?.sick_days ??
    0;

  const annualLeaveDays =
    holidays?.used_days_in_month ?? absence?.annual_leave_days ?? 0;

  const unpaidLeaveDays =
    absence?.absence?.unpaid ?? absence?.absence_unpaid ?? 0;

  const holidayDays = holidays?.holiday_days ?? absence?.holiday_days ?? 0;

  const remainingAnnual =
    holidays?.annual_remaining_days_end_of_month ??
    holidays?.remaining_annual ??
    holidays?.remaining_days_end_of_month ??
    0;

  const remainingCasual =
    holidays?.casual_remaining_days_end_of_month ??
    holidays?.remaining_casual ??
    0;

  const totalWorkingDays =
    absence?.total_working_days ??
    data?.total_working_days ??
    Number(presentDays) +
      Number(absentDays) +
      Number(sickDays) +
      Number(annualLeaveDays) +
      Number(unpaidLeaveDays) +
      Number(holidayDays);

  const overtimeMinutes = useMemo(() => {
    const requests = data?.tables?.overtime_requests ?? [];

    if (!Array.isArray(requests) || requests.length === 0) {
      return parseMoneyValue(
        data?.attendance_details?.approved_overtime_minutes ??
          data?.overtime_minutes ??
          data?.approved_overtime_minutes
      );
    }

    return requests.reduce(
      (sum, row) => sum + Number(row?.minutes ?? row?.duration_minutes ?? 0),
      0
    );
  }, [data]);

  const overtimeHours = (overtimeMinutes / 60).toFixed(
    Number(overtimeMinutes) % 60 === 0 ? 0 : 1
  );

  const overtimeRate =
    data?.attendance_details?.overtime_multiplier ??
    data?.overtime_rate ??
    data?.header?.overtime_rate ??
    '--';

  const overtimeAmount = parseMoneyValue(
    data?.additions_breakdown?.overtime_payout ??
      additions?.overtime_payout ??
      data?.overtime_amount
  );

  const attendanceRows = useMemo(
    () =>
      attendanceList.map((row, idx) => ({
        id: row.id ?? idx,
        day: row.work_date ?? row.date ?? row.day ?? '--',
        checkIn: formatTimeAMPMFromAPI(row.clock_in ?? row.check_in, lang),
        checkOut: formatTimeAMPMFromAPI(row.clock_out ?? row.check_out, lang),
      })),
    [attendanceList, lang]
  );

  const leaveRows = useMemo(
    () =>
      approvedLeaves.map((row, idx) => ({
        id: row.id ?? idx,
        day: row.date ?? row.day ?? '--',
        from: formatRequestTime(row.from ?? row.start_time, lang),
        to: formatRequestTime(row.to ?? row.end_time, lang),
      })),
    [approvedLeaves, lang]
  );

  const formatDays = (count) => formatValueWithUnitSuffix(t, count, 'day');

  const formatHours = (count) => formatValueWithUnitSuffix(t, count, 'hour');

  const currency = useMemo(() => {
    const val = data?.basic_salary || data?.header?.net_salary || '';

    if (typeof val === 'string') {
      const match = val.match(/[a-zA-Z]+/);

      return match
        ? match[0].toUpperCase()
        : t('salaries.salaryCalculationModal.details.egp');
    }

    return t('salaries.salaryCalculationModal.details.egp');
  }, [data, t]);

  const employeeName =
    resolveEmployeeDisplayName(data?.employee, { preferArabic: isArabic }) ||
    data?.employee?.name ||
    data?.employee?.employee_name ||
    data?.employee_name ||
    data?.name ||
    'Employee';

  const attendanceSummaryRows = [
    {
      id: 'present',
      item: t('salaries.salaryCalculationModal.details.presentDays'),
      days: formatDays(presentDays),
    },
    {
      id: 'absent',
      item: t('salaries.salaryCalculationModal.details.absentDays'),
      days: formatDays(absentDays),
    },
    {
      id: 'sick',
      item: t('salaries.salaryCalculationModal.details.sickDays'),
      days: formatDays(sickDays),
    },
    {
      id: 'annual',
      item: t('salaries.salaryCalculationModal.details.annualLeave'),
      days: formatDays(annualLeaveDays),
    },
    {
      id: 'unpaid',
      item: t('salaries.salaryCalculationModal.details.unpaidLeave'),
      days: formatDays(unpaidLeaveDays),
    },
    {
      id: 'holidays',
      item: t('salaries.salaryCalculationModal.details.holidays'),
      days: formatDays(holidayDays),
    },
    {
      id: 'remaining',
      item: t('salaries.salaryCalculationModal.details.remaining'),
      isRemaining: true,
      annual: formatDays(remainingAnnual),
      casual: formatDays(remainingCasual),
    },
  ];

  const overtimeRows = [
    {
      id: 'hours',
      item: t('salaries.salaryCalculationModal.details.overtimeHours'),
      details: formatHours(overtimeHours),
    },
    {
      id: 'rate',
      item: t('salaries.salaryCalculationModal.details.overtimeRate'),
      details: overtimeRate,
    },
    {
      id: 'amount',
      item: t('salaries.salaryCalculationModal.details.overtimeAmount'),
      details: `${currency} ${formatMoney(overtimeAmount)}`,
    },
  ];

  const rates = data?.rates ?? {};

  const summaryMetricsRows = [
    {
      label: t('salaries.salaryCalculationModal.items.basicSalary'),
      value: `${currency} ${formatMoney(
        data?.basic_salary ?? header?.basic_salary ?? 0
      )}`,
    },
    {
      label: t('salaries.salaryCalculationModal.items.dailyRate'),
      value: `${currency} ${formatMoney(rates?.daily_rate ?? 0)}`,
    },
    {
      label: t('salaries.salaryCalculationModal.items.basicKpi'),
      value: `${formatMoney(data?.kpi?.target ?? 0)} %`,
    },
    {
      label: t('salaries.salaryCalculationModal.items.hourlyRate'),
      value: `${currency} ${formatMoney(rates?.hourly_rate ?? 0)}`,
    },
    {
      label: t('salaries.salaryCalculationModal.items.insurance'),
      value: formatMoney(deductions?.insurance ?? 0),
    },
  ];

  const formatExportAmount = (value) => {
    if (value === null || value === undefined || value === '') return '--';

    const numeric = parseMoneyValue(value);

    if (typeof value === 'string' && value.trim() !== '' && numeric === 0) {
      return value;
    }

    return `${currency} ${formatMoney(numeric)}`;
  };

  const getRowTitle = (row, index) =>
    row?.name ||
    row?.title ||
    row?.reason ||
    row?.type ||
    row?.description ||
    `#${index + 1}`;

  const getRowDate = (row) =>
    row?.date ||
    row?.created_at ||
    row?.day ||
    row?.work_date ||
    '--';

  const getRowAmount = (row) =>
    row?.amount ??
    row?.value ??
    row?.total ??
    row?.deduction ??
    row?.reward ??
    row?.payout ??
    '--';

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const safeFilePart = (value) =>
    String(value || 'employee')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[\\/:*?"<>|]/g, '')
      .toLowerCase();

  const safeSheetName = (name, index, usedNames = new Set()) => {
    const baseName =
      String(name || `Table ${index + 1}`)
        .replace(/[\\/?*[\]:]/g, '')
        .trim() || `Table ${index + 1}`;

    let sheetName = baseName.slice(0, 31);
    let counter = 1;

    while (usedNames.has(sheetName)) {
      const suffix = ` ${counter}`;
      sheetName = `${baseName.slice(0, 31 - suffix.length)}${suffix}`;
      counter += 1;
    }

    usedNames.add(sheetName);

    return sheetName;
  };

  const getText = (node) =>
    String(node?.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();

  const getTableTitle = (table, index) => {
    const card = table.closest(
      '[data-export-title], .rounded-xl, .rounded-lg, section, article'
    );

    const explicitTitle = card?.getAttribute?.('data-export-title');
    if (explicitTitle) return explicitTitle;

    const titleNode =
      card?.querySelector?.('h1, h2, h3, h4, h5, h6') ||
      table.previousElementSibling;

    const title = getText(titleNode);

    return title || `Table ${index + 1}`;
  };

  const readDomTable = (table) => {
    const rows = Array.from(table.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th, td')).map((cell) => getText(cell))
    );

    return rows.filter((row) => row.some(Boolean));
  };

  const getExportTablesFromDom = () => {
    if (!detailsExportRef.current) return [];

    const tables = Array.from(detailsExportRef.current.querySelectorAll('table'));

    return tables
      .map((table, index) => ({
        title: getTableTitle(table, index),
        rows: readDomTable(table),
      }))
      .filter((table) => table.rows.length > 0);
  };

  const getManualExportTables = () => {
    const attendanceExportRows = attendanceSummaryRows.map((row) => {
      if (row.isRemaining) {
        return [
          row.item,
          `${t('salaries.salaryCalculationModal.details.annual')}: ${row.annual}`,
          `${t('salaries.salaryCalculationModal.details.casual')}: ${row.casual}`,
        ];
      }

      return [row.item, row.days, ''];
    });

    const penaltiesExportRows = penaltiesRows.map((row, index) => [
      getRowDate(row),
      formatExportAmount(getRowAmount(row)),
      getRowTitle(row, index),
    ]);

    const rewardsExportRows = rewardsRows.map((row, index) => [
      getRowDate(row),
      formatExportAmount(getRowAmount(row)),
      getRowTitle(row, index),
    ]);

    return [
      {
        title: t('salaries.salaryCalculationModal.details.summary'),
        rows: [
          [t('salaries.salaryCalculationModal.details.title')],
          [employeeName],
          [],
          summaryMetricsRows.map((row) => row.label),
          summaryMetricsRows.map((row) => row.value),
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.details.attendance'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.item'),
            t('salaries.salaryCalculationModal.details.days'),
            t('salaries.salaryCalculationModal.details.details'),
          ],
          ...attendanceExportRows,
          [],
          [
            t('salaries.salaryCalculationModal.details.totalWorkingDays'),
            formatDays(totalWorkingDays),
            '',
          ],
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.details.overtimeDetails'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.item'),
            t('salaries.salaryCalculationModal.details.details'),
          ],
          ...overtimeRows.map((row) => [row.item, row.details]),
          [],
          [
            t('salaries.salaryCalculationModal.details.totalOvertime'),
            `${currency} ${formatMoney(overtimeAmount)}`,
          ],
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.details.attendanceDays'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.day'),
            t('salaries.salaryCalculationModal.details.checkIn'),
            t('salaries.salaryCalculationModal.details.checkOut'),
          ],
          ...attendanceRows.map((row) => [row.day, row.checkIn, row.checkOut]),
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.details.leaves'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.day'),
            t('salaries.salaryCalculationModal.details.from'),
            t('salaries.salaryCalculationModal.details.to'),
          ],
          ...leaveRows.map((row) => [row.day, row.from, row.to]),
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.items.penalties'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.day'),
            t('salaries.salaryCalculationModal.details.amount'),
            t('salaries.salaryCalculationModal.details.reason'),
          ],
          ...penaltiesExportRows,
          [],
          [
            t('salaries.salaryCalculationModal.items.totalPenalties'),
            formatExportAmount(
              penaltiesRows.reduce(
                (sum, row) => sum + parseMoneyValue(getRowAmount(row)),
                0
              )
            ),
            '',
          ],
        ],
      },
      {
        title: t('salaries.salaryCalculationModal.items.rewards'),
        rows: [
          [
            t('salaries.salaryCalculationModal.details.day'),
            t('salaries.salaryCalculationModal.details.amount'),
            t('salaries.salaryCalculationModal.details.reason'),
          ],
          ...rewardsExportRows,
          [],
          [
            t('salaries.salaryCalculationModal.items.totalRewards'),
            formatExportAmount(
              rewardsRows.reduce(
                (sum, row) => sum + parseMoneyValue(getRowAmount(row)),
                0
              )
            ),
            '',
          ],
        ],
      },
    ];
  };

  const getAllExportTables = () => {
    const domTables = getExportTablesFromDom();

    if (domTables.length > 0) {
      return [
        {
          title: t('salaries.salaryCalculationModal.details.summary'),
          rows: [
            [t('salaries.salaryCalculationModal.details.title')],
            [employeeName],
            [],
            summaryMetricsRows.map((row) => row.label),
            summaryMetricsRows.map((row) => row.value),
          ],
        },
        ...domTables,
      ];
    }

    return getManualExportTables();
  };

const handleExportExcel = async () => {
  try {
    const XLSXModule = await import('xlsx');
    const XLSX = XLSXModule.default || XLSXModule;

    const workbook = XLSX.utils.book_new();
    const exportTables = getManualExportTables();

    const allRows = [];

    exportTables.forEach((table) => {
      allRows.push([table.title]);
      allRows.push([]);

      table.rows.forEach((row) => {
        allRows.push(row);
      });

      allRows.push([]);
      allRows.push([]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);

    const maxColumns = allRows.reduce(
      (max, row) => Math.max(max, row.length),
      0
    );

    worksheet['!cols'] = Array.from({
      length: Math.max(maxColumns, 1),
    }).map(() => ({
      wch: 24,
    }));

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isArabic ? 'كل الجداول' : 'All Tables'
    );

    exportTables.forEach((table, index) => {
      const rows = table.rows?.length ? table.rows : [['--']];
      const sheet = XLSX.utils.aoa_to_sheet(rows);

      const sheetMaxColumns = rows.reduce(
        (max, row) => Math.max(max, row.length),
        0
      );

      sheet['!cols'] = Array.from({
        length: Math.max(sheetMaxColumns, 1),
      }).map(() => ({
        wch: 24,
      }));

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        safeSheetName(table.title, index, new Set(workbook.SheetNames))
      );
    });

    const fileName = `salary-calculation-details-${safeFilePart(
      employeeName
    )}-${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName, {
      bookType: 'xlsx',
      type: 'binary',
    });
  } catch (error) {
    console.error('Excel export failed:', error);
  }
};

  const handleExportPdf = async () => {
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');

    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const autoTable = autoTableModule.default || autoTableModule.autoTable;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    const align = isArabic ? 'right' : 'left';
    const x = isArabic ? pageWidth - margin : margin;

    doc.setFontSize(15);
    doc.text(t('salaries.salaryCalculationModal.details.title'), x, 15, {
      align,
    });

    doc.setFontSize(11);
    doc.text(employeeName, x, 23, {
      align,
    });

    let currentY = 30;
    const exportTables = getAllExportTables();

    exportTables.forEach((table, tableIndex) => {
      const rows = table.rows?.length ? table.rows : [['--']];
      const [headRow, ...bodyRows] = rows;

      if (tableIndex > 0 && currentY > 250) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(11);
      doc.text(table.title, x, currentY, {
        align,
      });

      autoTable(doc, {
        startY: currentY + 4,
        head: headRow ? [headRow] : undefined,
        body: bodyRows.length ? bodyRows : [['--']],
        styles: {
          fontSize: 7,
          cellPadding: 2,
          halign: align,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [71, 85, 105],
        },
        margin: {
          left: margin,
          right: margin,
        },
        pageBreak: 'auto',
        tableWidth: 'auto',
      });

      currentY = (doc.lastAutoTable?.finalY ?? currentY + 20) + 10;
    });

    const fileName = `salary-calculation-details-${safeFilePart(
      employeeName
    )}-${new Date().toISOString().split('T')[0]}.pdf`;

    doc.save(fileName);
  };

  const getDocumentStyles = () => {
    return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n');
  };

  const openStyledPrintWindow = () => {
    if (!detailsExportRef.current) return;

    const clonedContent = detailsExportRef.current.cloneNode(true);

    clonedContent
      .querySelectorAll('[data-exclude-from-export="true"]')
      .forEach((node) => node.remove());

    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) return;

    const title = `${t(
      'salaries.salaryCalculationModal.details.title'
    )} - ${employeeName}`;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          ${getDocumentStyles()}
          <style>
            @page {
              size: A4;
              margin: 14mm;
            }

            body {
              background: #f8fafc !important;
              color: #0f172a;
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
            }

            .export-page {
              width: 100%;
              max-width: 1100px;
              margin: 0 auto;
              padding: 20px;
            }

            .export-header {
              margin-bottom: 18px;
            }

            .export-title {
              font-size: 20px;
              font-weight: 700;
              margin: 0 0 8px;
              color: #0f172a;
            }

            .export-subtitle {
              font-size: 14px;
              font-weight: 600;
              margin: 0;
              color: #334155;
            }

            [data-exclude-from-export="true"] {
              display: none !important;
            }

            button {
              display: none !important;
            }

            .max-h-64 {
              max-height: none !important;
              overflow: visible !important;
            }

            .overflow-y-auto {
              overflow: visible !important;
            }

            table {
              page-break-inside: avoid;
            }

            .rounded-xl,
            .rounded-lg {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .export-page {
                padding: 0;
              }
            }
          </style>
        </head>

        <body dir="${isArabic ? 'rtl' : 'ltr'}">
          <div class="export-page">
            <div class="export-header">
              <h1 class="export-title">${escapeHtml(
                t('salaries.salaryCalculationModal.details.title')
              )}</h1>
              <p class="export-subtitle">${escapeHtml(employeeName)}</p>
            </div>

            ${clonedContent.innerHTML}
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
                setTimeout(function () { window.close(); }, 500);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleExport = (format) => {
    if (format === 'excel') {
      handleExportExcel();
    } else if (format === 'pdf') {
      handleExportPdf();
    } else if (format === 'print') {
      openStyledPrintWindow();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center py-10 text-slate-500">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between"
        data-exclude-from-export="true"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 px-0 text-slate-600 hover:text-slate-900"
          onClick={onBack}
        >
          <ChevronLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
          {t('salaries.salaryCalculationModal.buttons.backToSummary')}
        </Button>

        <ExportDialog
          trigger={
            <Button type="button" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t('common.export')}
            </Button>
          }
          onPdf={() => handleExport('pdf')}
          onExcel={() => handleExport('excel')}
          onPrintTable={() => handleExport('print')}
        />
      </div>

      <div ref={detailsExportRef} className="space-y-6">
        <SalaryCalculationSummaryView
          data={data}
          penaltiesRows={penaltiesRows}
          rewardsRows={rewardsRows}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CalcCard
            title={t('salaries.salaryCalculationModal.details.attendance')}
            footer={
              <CalcCardFooter
                variant="blue"
                label={t(
                  'salaries.salaryCalculationModal.details.totalWorkingDays'
                )}
                value={formatDays(totalWorkingDays)}
              />
            }
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2.5 text-start text-xs font-semibold text-slate-500">
                    {t('salaries.salaryCalculationModal.details.item')}
                  </th>
                  <th className="px-4 py-2.5 text-end text-xs font-semibold text-slate-500">
                    {t('salaries.salaryCalculationModal.details.days')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendanceSummaryRows.map((row) =>
                  row.isRemaining ? (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">
                        {row.item}
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="flex divide-x divide-slate-200 text-end text-sm font-semibold text-slate-800">
                          <span className="flex-1 pe-3">
                            <span className="block text-xs font-medium text-slate-500">
                              {t(
                                'salaries.salaryCalculationModal.details.annual'
                              )}
                            </span>
                            {row.annual}
                          </span>

                          <span className="flex-1 ps-3">
                            <span className="block text-xs font-medium text-slate-500">
                              {t(
                                'salaries.salaryCalculationModal.details.casual'
                              )}
                            </span>
                            {row.casual}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-2.5 text-sm text-slate-600">
                        {row.item}
                      </td>

                      <td className="px-4 py-2.5 text-end text-sm font-semibold text-slate-800">
                        {row.days}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CalcCard>

          <CalcCard
            title={t('salaries.salaryCalculationModal.details.overtimeDetails')}
            footer={
              <CalcCardFooter
                variant="yellow"
                label={t(
                  'salaries.salaryCalculationModal.details.totalOvertime'
                )}
                value={`${currency} ${formatMoney(overtimeAmount)}`}
              />
            }
          >
            <CalcDataTable
              columns={[
                {
                  key: 'item',
                  label: t('salaries.salaryCalculationModal.details.item'),
                },
                {
                  key: 'details',
                  label: t('salaries.salaryCalculationModal.details.details'),
                  align: 'end',
                },
              ]}
              rows={overtimeRows}
              emptyMessage={t('salaries.emptyStates.noOvertimeRequestsFound')}
            />
          </CalcCard>

          <CalcCard
            title={t('salaries.salaryCalculationModal.details.attendanceDays')}
          >
            <div className="max-h-64 overflow-y-auto">
              <CalcDataTable
                columns={[
                  {
                    key: 'day',
                    label: t('salaries.salaryCalculationModal.details.day'),
                  },
                  {
                    key: 'checkIn',
                    label: t('salaries.salaryCalculationModal.details.checkIn'),
                  },
                  {
                    key: 'checkOut',
                    label: t(
                      'salaries.salaryCalculationModal.details.checkOut'
                    ),
                  },
                ]}
                rows={attendanceRows}
                emptyMessage={t('emptyStates.noAttendanceRecordsFound')}
                valueClassName="text-slate-500"
              />
            </div>
          </CalcCard>

          <CalcCard title={t('salaries.salaryCalculationModal.details.leaves')}>
            <div className="max-h-64 overflow-y-auto">
              <CalcDataTable
                columns={[
                  {
                    key: 'day',
                    label: t('salaries.salaryCalculationModal.details.day'),
                  },
                  {
                    key: 'from',
                    label: t('salaries.salaryCalculationModal.details.from'),
                  },
                  {
                    key: 'to',
                    label: t('salaries.salaryCalculationModal.details.to'),
                  },
                ]}
                rows={leaveRows}
                emptyMessage={t('salaries.emptyStates.noApprovedLeavesFound')}
                valueClassName="text-slate-500"
              />
            </div>
          </CalcCard>
        </div>
      </div>
    </div>
  );
}