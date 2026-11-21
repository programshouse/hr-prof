import { useTranslation } from 'react-i18next';
import { CloudUpload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { toast } from 'sonner';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';

/** helper: extract department amount from salary_details */
const getDepartmentAmount = (salaryDetails, departmentName) => {
  if (!salaryDetails || !Array.isArray(salaryDetails)) return 0;

  const dept = salaryDetails.find((detail) =>
    String(detail.department_name || '')
      .toLowerCase()
      .includes(String(departmentName).toLowerCase())
  );

  return Number(dept?.amount ?? 0) || 0;
};

/**
 * ✅ IMPORTANT:
 * Your export helpers expect "row[column.key]" to exist.
 * But your API rows are like:
 *   net_salary, total_salary, salary_details[], ...
 *
 * So we normalize each row to match the export columns keys below.
 */
const mapRowForExport = (row) => {
  const programs = getDepartmentAmount(row.salary_details, 'Programs');

  const marketing =
    getDepartmentAmount(row.salary_details, 'M&S') ||
    getDepartmentAmount(row.salary_details, 'Marketing');

  const research =
    getDepartmentAmount(row.salary_details, 'Prof') ||
    getDepartmentAmount(row.salary_details, 'Research');

  const print =
    getDepartmentAmount(row.salary_details, 'Print') ||
    getDepartmentAmount(row.salary_details, 'Dolphin');

  return {
    id: row.id ?? '',
    name: row.name ?? '',
    type: row.type ?? '',
    netSalary: row.net_salary ?? row.netSalary ?? '',
    programs,
    marketing,
    research,
    print,
    kpi: row.kpi ?? '',
    rewards: row.rewards ?? '',
    deductions: row.deductions ?? '',
    totalSalary: row.total_salary ?? row.totalSalary ?? '',
  };
};

const ALL_SALARIES_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'netSalary', label: 'Net Salary' },
  { key: 'programs', label: 'Programs' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'research', label: 'Research' },
  { key: 'print', label: 'Print' },
  { key: 'kpi', label: 'KPI' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'totalSalary', label: 'Total Salary' },
];

const HIDDEN_SALARIES_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'netSalary', label: 'Net Salary' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'deductions', label: 'Deductions' },
  { key: 'totalSalary', label: 'Total Salary' },
];

export default function SalariesHeaderActions({
  table, // TanStack table instance
  showSelection, // whether checkbox column is visible
  onEnableSelection, // () => void
  hideColumns, // hide toggle state
  allRows = [], // fallback if table not ready (optional)
}) {
  const { t } = useTranslation();
  const getExportColumns = () => (hideColumns ? HIDDEN_SALARIES_COLUMNS : ALL_SALARIES_COLUMNS);

  const getRowsToExport = () => {
    // If we have table instance, we export selected rows ONLY
    if (table) {
      const selected = table.getSelectedRowModel().flatRows;

      if (!selected.length) {
        toast.error(t('salaries.selectSalariesToExport'));
        return [];
      }

      return selected.map((r) => mapRowForExport(r.original));
    }

    // fallback (rare)
    if (allRows.length) return allRows.map(mapRowForExport);

    toast.error(t('salaries.noSalariesToExport'));
    return [];
  };

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: getExportColumns(),
      fileName: 'salaries',
      title: t('salaries.salariesReport'),
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: getExportColumns(),
      fileName: 'salaries',
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: getExportColumns(),
      title: t('salaries.salariesReport'),
    });
  };

  // ✅ Same behavior you wanted:
  // - If selection NOT enabled → clicking export enables selection & shows toast
  // - If selection enabled → button opens ExportDialog
  if (!showSelection) {
    return (
      <Button
        data-keep-selection="true"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => {
          onEnableSelection?.(true);
          toast.info(t('salaries.selectionEnabled'));
        }}
      >
        <CloudUpload className="size-4" />
        <span>{t('salaries.exportSalaries')}</span>
      </Button>
    );
  }

  return (
    <ExportDialog
      trigger={
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          data-keep-selection="true"
        >
          <Download className="mr-1.5 h-4 w-4" />
          {t('salaries.exportSalaries')}
        </Button>
      }
      onPdf={handlePdf}
      onExcel={handleExcel}
      onPrintTable={handlePrint}
    />
  );
}
