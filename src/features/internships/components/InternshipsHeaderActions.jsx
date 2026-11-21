// src/features/internships/components/InternshipsHeaderActions.jsx
import { CloudUpload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { toast } from 'sonner';
import { exportToExcel, exportToPdf, printTable } from '@/lib/export/tableExport.js';

export default function InternshipsHeaderActions({
  viewMode,
  setViewMode,
  table,
  showSelection,
  onEnableSelection,
  allRows = [],
}) {
  const { t } = useTranslation();

  const exportColumns = [
    { key: 'code', label: t('tables.headers.id') },
    { key: 'full_name', label: t('tables.headers.name') },
    { key: 'phone', label: t('tables.headers.phone') },
    { key: 'position', label: t('tables.headers.job') },
    { key: 'department', label: t('tables.headers.department') },
    { key: 'shift', label: t('tables.headers.shift') },
    { key: 'join_date', label: t('tables.headers.joinDate') },
  ];

  const getRowsToExport = () => {
    if (table) {
      const selectedRows = table.getSelectedRowModel().flatRows;
      const pageRows = table.getRowModel().rows;

      if (selectedRows.length > 0) {
        return selectedRows.map((r) => r.original);
      }

      if (pageRows.length > 0) {
        return pageRows.map((r) => r.original);
      }
    }

    if (allRows.length > 0) return allRows;

    toast.error(t('internships.export.noData'));
    return [];
  };

  const handlePdf = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToPdf({
      rows,
      columns: exportColumns,
      fileName: 'internships',
      title: t('internships.export.reportTitle'),
    });
  };

  const handleExcel = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    exportToExcel({
      rows,
      columns: exportColumns,
      fileName: 'internships',
    });
  };

  const handlePrint = () => {
    const rows = getRowsToExport();
    if (!rows.length) return;

    printTable({
      rows,
      columns: exportColumns,
      title: t('internships.export.reportTitle'),
    });
  };

  const isTableReady = viewMode === 'table' && !!table;

  let exportControl = null;

  if (!isTableReady) {
    exportControl = (
      <Button
        data-keep-selection="true"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => {
          setViewMode('table');
          onEnableSelection?.(true);
          toast.info(t('internships.export.selectionEnabled'));
        }}
      >
        <CloudUpload className="size-4" />
        <span>{t('internships.actions.exportInternship')}</span>
      </Button>
    );
  } else if (!showSelection) {
    exportControl = (
      <Button
        data-keep-selection="true"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => {
          onEnableSelection?.(true);
          toast.info(t('internships.export.selectionEnabledAgain'));
        }}
      >
        <CloudUpload className="size-4" />
        <span>{t('internships.actions.exportInternship')}</span>
      </Button>
    );
  } else {
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
            <span>{t('internships.actions.exportInternship')}</span>
          </Button>
        }
        onPdf={handlePdf}
        onExcel={handleExcel}
        onPrintTable={handlePrint}
      />
    );
  }

  return <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">{exportControl}</div>;
}
