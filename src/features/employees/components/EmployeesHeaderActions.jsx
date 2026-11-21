// src/features/employees/components/EmployeesHeaderActions.jsx
import { CloudUpload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { toast } from 'sonner';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';
import { useTranslation } from 'react-i18next';

export default function EmployeesHeaderActions({
  onAdd,
  viewMode,
  setViewMode,
  table, // TanStack table instance from EmployeesListPage
  showSelection, // whether checkbox column is visible
  onEnableSelection, // () => void
  allRows = [], // optional fallback (e.g. data?.rows ?? [])
}) {
  const { t } = useTranslation();

  const getEmployeeExportColumns = () => [
    { key: 'code', label: t('employees.export.columns.id') },
    { key: 'full_name', label: t('employees.export.columns.name') },
    { key: 'phone', label: t('employees.export.columns.phone') },
    { key: 'position', label: t('employees.export.columns.job') },
    { key: 'department', label: t('employees.export.columns.department') },
    { key: 'shift', label: t('employees.export.columns.shift') },
    { key: 'join_date', label: t('employees.export.columns.joinDate') },
  ];
  const getRowsToExport = () => {
    if (table) {
      const selectedRows = table.getSelectedRowModel().flatRows;
      const pageRows = table.getRowModel().rows;

      // If selection is visible and some rows are checked → export only the selected rows
      if (selectedRows.length > 0) {
        const rows = selectedRows.map((r) => r.original);
        console.log('[export] using SELECTED rows:', rows.length);
        return rows;
      }

      // If there are no selected rows → export all rows on the current page
      if (pageRows.length > 0) {
        const rows = pageRows.map((r) => r.original);
        console.log('[export] using PAGE rows:', rows.length);
        return rows;
      }
    }

    // Fallback: export from allRows (API data) if provided
    if (allRows.length > 0) {
      console.log('[export] using allRows fallback:', allRows.length);
      return allRows;
    }

    toast.error(t('employees.export.noData'));
    return [];
  };

  const handlePdf = () => {
    const rows = getRowsToExport();
    console.log('handlePdf rows:', rows.length, rows);
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: getEmployeeExportColumns(),
      fileName: 'employees',
      title: t('employees.export.title'),
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    console.log('handleExcel rows:', rows.length, rows);
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: getEmployeeExportColumns(),
      fileName: 'employees',
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    console.log('handlePrint rows:', rows.length, rows);
    if (!rows.length) return;

    printTable({
      rows,
      columns: getEmployeeExportColumns(),
      title: t('employees.export.title'),
    });
  };

  const isTableReady = viewMode === 'table' && !!table;

  let exportControl = null;

  if (!isTableReady) {
    // Not in table view → switch to table and enable selection
    exportControl = (
      <Button
        data-keep-selection="true"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => {
          setViewMode('table');
          onEnableSelection?.(true); // Enable selection automatically
          toast.info(t('employees.export.selectionEnabled'));
        }}
      >
        <CloudUpload className="size-4" />
        <span>{t('employees.actions.export')}</span>
      </Button>
    );
  } else if (isTableReady && !showSelection) {
    // In table view but the checkbox column is still hidden
    exportControl = (
      <Button
        data-keep-selection="true"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => {
          onEnableSelection?.(true);
          toast.info(t('employees.export.selectionEnabledAgain'));
        }}
      >
        <CloudUpload className="size-4" />
        <span>{t('employees.actions.export')}</span>
      </Button>
    );
  } else {
    // In table + selection mode → open ExportDialog (PDF / Excel / Print)
    exportControl = (
      <ExportDialog
        trigger={
          <Button
            data-keep-selection="true"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <CloudUpload className="size-4" />
            <span>{t('employees.actions.export')}</span>
          </Button>
        }
        onPdf={handlePdf}
        onExcel={handleExcel}
        onPrintTable={handlePrint}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      {exportControl}

      {/* Add Employee */}
      <Button variant="outline" size="lg" onClick={onAdd} className="w-full sm:w-auto">
        <UserPlus className="size-4" />
        <span>{t('employees.actions.add')}</span>
      </Button>
    </div>
  );
}
