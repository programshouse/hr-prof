// src/components/ui/exportDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Download,
  FileImage,
  FileText,
  FileSpreadsheet,
  Printer,
  ClipboardCopy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ExportIcon(props) {
  return <Download {...props} />;
}

export default function ExportDialog({
  trigger,
  onPdf,
  onExcel,
  onPrintTable,
  onImage,
  onPrepareCopyImage,
  onCopyImage,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const hasImageActions = Boolean(onImage || onCopyImage);
  const hasBothImageActions = Boolean(onImage && onCopyImage);

  const prepareClipboardImage = React.useCallback(() => {
    if (!onCopyImage || !onPrepareCopyImage) return;

    Promise.resolve(onPrepareCopyImage()).catch((error) => {
      // Preparation is only an optimization. The actual Copy click will retry
      // and show a user-facing error if preparation failed.
      console.warn('Could not pre-render clipboard image:', error);
    });
  }, [onCopyImage, onPrepareCopyImage]);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (nextOpen) {
      // Pre-render while the export menu is open so Copy Image can perform the
      // clipboard write immediately from the user's click.
      requestAnimationFrame(() => {
        prepareClipboardImage();
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="
          max-h-[45vh]
          min-h-[26vh]
          w-[90vw]
          rounded-2xl
          border-slate-200
          bg-slate-50
          sm:max-w-2xl
          lg:max-w-3xl
          my-9 mx-6
        "
      >
        <DialogHeader>
          <DialogTitle>{t('common.exportDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('common.exportDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`mx-2 mt-3 grid gap-3 ${
            hasBothImageActions
              ? 'sm:grid-cols-2 lg:grid-cols-5'
              : hasImageActions
                ? 'sm:grid-cols-2 lg:grid-cols-4'
                : 'sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {/* PDF */}
          <button
            type="button"
            data-keep-selection="true"
            className="flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
            onClick={() => onPdf && onPdf()}
          >
            <FileText className="text-error mb-2 size-7" />
            <p className="text-[10px] text-slate-500">
              {t('common.exportDialog.exportAs')}
            </p>
            <p className="text-xs font-semibold text-slate-900">PDF</p>
            <span className="text-primary mt-1 text-[11px] font-medium hover:underline">
              {t('common.exportDialog.download')}
            </span>
          </button>

          {/* Excel */}
          <button
            type="button"
            data-keep-selection="true"
            className="flex cursor-pointer flex-col items-center justify-between rounded-xl border bg-white px-3 py-4 text-center shadow-sm"
            onClick={() => onExcel && onExcel()}
          >
            <FileSpreadsheet className="text-success mb-2 size-7" />
            <p className="text-[10px] text-slate-500">
              {t('common.exportDialog.exportAs')}
            </p>
            <p className="text-xs font-semibold text-slate-900">Excel</p>
            <span className="text-primary mt-1 text-[11px] font-medium hover:underline">
              {t('common.exportDialog.download')}
            </span>
          </button>

          {/* Download Image */}
          {onImage && (
            <button
              type="button"
              data-keep-selection="true"
              className="flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
              onClick={() => onImage()}
            >
              <FileImage className="mb-2 size-7 text-sky-500" />
              <p className="text-[10px] text-slate-500">
                {t('common.exportDialog.exportAs')}
              </p>
              <p className="text-xs font-semibold text-slate-900">
                {t('common.exportDialog.image')}
              </p>
              <span className="text-primary mt-1 text-[11px] font-medium hover:underline">
                {t('common.exportDialog.download')}
              </span>
            </button>
          )}

          {/* Copy Image */}
          {onCopyImage && (
            <button
              type="button"
              data-keep-selection="true"
              className="flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
              onPointerEnter={prepareClipboardImage}
              onFocus={prepareClipboardImage}
              onClick={() => onCopyImage()}
            >
              <ClipboardCopy className="mb-2 size-7 text-violet-500" />
              <p className="text-[10px] text-slate-500">
                {t('common.exportDialog.exportAs')}
              </p>
              <p className="text-xs font-semibold text-slate-900">
                {t('common.exportDialog.copyImage', {
                  defaultValue: 'Copy Image',
                })}
              </p>
              <span className="text-primary mt-1 text-[11px] font-medium hover:underline">
                {t('common.exportDialog.copy', { defaultValue: 'Copy' })}
              </span>
            </button>
          )}

          {/* Print Table */}
          <button
            type="button"
            data-keep-selection="true"
            className="flex cursor-pointer flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-4 text-center shadow-sm"
            onClick={() => onPrintTable && onPrintTable()}
          >
            <Printer className="mb-2 size-7 text-indigo-400" />
            <p className="text-[10px] text-slate-500">
              {t('common.exportDialog.exportAs')}
            </p>
            <p className="text-xs font-semibold text-slate-900">
              {t('common.exportDialog.printTable')}
            </p>
            <span className="text-primary mt-1 text-[11px] font-medium hover:underline">
              {t('common.exportDialog.download')}
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
