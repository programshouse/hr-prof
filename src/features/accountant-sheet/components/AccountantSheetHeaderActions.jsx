import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import { useTranslation } from 'react-i18next';

export default function AccountantSheetHeaderActions({
  onPdf,
  onExcel,
  onPrintTable,
}) {
  const { t } = useTranslation();

  return (
    <ExportDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-md px-4 text-xs font-semibold shadow-xs"
        >
          <Download className="mr-1.5 h-4 w-4" />
          {t('salaries.accountantSheet.exportSalaries')}
        </Button>
      }
      onPdf={onPdf}
      onExcel={onExcel}
      onPrintTable={onPrintTable}
    />
  );
}