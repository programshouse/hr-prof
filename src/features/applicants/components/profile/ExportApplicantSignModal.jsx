// src/features/applicants/components/profile/ExportApplicantSignModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Check, X, UserCheck, ShieldCheck, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/services/auth/auth.store';
import { useAllEmployees } from '@/shared/hooks';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';

function resolveEmpName(id, employees = [], preferArabic = false) {
  if (!id) return '';
  const emp = employees.find(
    (e) => String(e.id ?? e.employee_id) === String(id)
  );
  if (!emp) return '';
  return (
    resolveEmployeeDisplayName(emp, { preferArabic }) ||
    emp.name ||
    emp.full_name ||
    emp.employee_name ||
    ''
  );
}

export default function ExportApplicantSignModal({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
  applicant = null,
  rawData = null,
}) {
  const { t, i18n } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const isRTL = String(i18n.language || '').toLowerCase().startsWith('ar');

  const { data: employees = [] } = useAllEmployees(open);

  const todayStr = new Date().toISOString().split('T')[0];

  const cvDoc = applicant?.documents?.find(
    (d) => String(d?.label || '').toUpperCase() === 'CV'
  );
  const cvUrl =
    cvDoc?.url ||
    applicant?.cv ||
    rawData?.cv ||
    rawData?.data?.cv ||
    null;

  const [downloadCvFile, setDownloadCvFile] = useState(true);
  const [activeRole, setActiveRole] = useState('lineManager'); // 'lineManager' | 'hrManager'

  const [userLineManager, setUserLineManager] = useState({});
  const [userHrManager, setUserHrManager] = useState({});

  // The details query can return either an applicant or { data: applicant }.
  const source = rawData?.data ?? rawData ?? applicant ?? {};

  const lmId =
    source.hiring_manager_id ??
    source.hiring_manager?.id ??
    applicant?.hiring_manager_id;
  const hrId =
    source.hiring_hr_id ??
    source.hiring_hr?.id ??
    applicant?.hiring_hr_id;

  const defaultLmName =
    source.hiring_manager_name ||
    source.hiring_manager?.name ||
    resolveEmpName(lmId, employees, isRTL) ||
    '';

  const defaultHrName =
    source.hiring_hr_name ||
    source.hiring_hr?.name ||
    resolveEmpName(hrId, employees, isRTL) ||
    currentUser?.name ||
    '';

  const defaultLmNotes =
    source.hiring_manager_note ||
    applicant?.hiring_manager_note ||
    '';

  const defaultHrNotes =
    source.hiring_hr_note ||
    applicant?.hiring_hr_note ||
    '';

  const lineManager = {
    name: userLineManager.name !== undefined ? userLineManager.name : defaultLmName,
    date: userLineManager.date !== undefined ? userLineManager.date : todayStr,
    decision: userLineManager.decision !== undefined ? userLineManager.decision : '',
    notes: userLineManager.notes !== undefined ? userLineManager.notes : defaultLmNotes,
    signature: userLineManager.signature !== undefined ? userLineManager.signature : '',
  };

  const hrManager = {
    name: userHrManager.name !== undefined ? userHrManager.name : defaultHrName,
    date: userHrManager.date !== undefined ? userHrManager.date : todayStr,
    decision: userHrManager.decision !== undefined ? userHrManager.decision : '',
    notes: userHrManager.notes !== undefined ? userHrManager.notes : defaultHrNotes,
    signature: userHrManager.signature !== undefined ? userHrManager.signature : '',
  };

  const handleExportWithSignatures = () => {
    onExport(
      {
        lineManager,
        hrManager,
      },
      { downloadCv: Boolean(cvUrl && downloadCvFile) }
    );
  };

  const handleExportBlank = () => {
    onExport(
      {
        lineManager: { name: '', decision: '', date: '', notes: '', signature: '' },
        hrManager: { name: '', decision: '', date: '', notes: '', signature: '' },
      },
      { downloadCv: Boolean(cvUrl && downloadCvFile) }
    );
  };

  const currentData = activeRole === 'lineManager' ? lineManager : hrManager;
  const setCurrentData = (updater) => {
    if (activeRole === 'lineManager') {
      setUserLineManager((prev) =>
        typeof updater === 'function' ? updater({ ...lineManager, ...prev }) : updater
      );
    } else {
      setUserHrManager((prev) =>
        typeof updater === 'function' ? updater({ ...hrManager, ...prev }) : updater
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-7"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="space-y-1 text-start">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {t('applicants.profile.exportModal.title', 'Export Applicant Profile')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t(
              'applicants.profile.exportModal.description',
              'Review line manager and HR manager decisions and notes before exporting.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveRole('lineManager')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeRole === 'lineManager'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>{t('applicants.profile.exportModal.lineManager', 'Line Manager')}</span>
            {lineManager.decision && (
              <span
                className={`h-2 w-2 rounded-full ${
                  lineManager.decision === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('hrManager')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeRole === 'hrManager'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{t('applicants.profile.exportModal.hrManager', 'HR Manager')}</span>
            {hrManager.decision && (
              <span
                className={`h-2 w-2 rounded-full ${
                  hrManager.decision === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
            )}
          </button>
        </div>

        {/* Form Body for Current Role */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t('applicants.profile.exportModal.name', 'Name')}
              </label>
              <input
                type="text"
                value={currentData.name}
                onChange={(e) =>
                  setCurrentData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={
                  activeRole === 'lineManager'
                    ? t(
                        'applicants.profile.exportModal.lineManagerPlaceholder',
                        'Line Manager Name'
                      )
                    : t(
                        'applicants.profile.exportModal.hrManagerPlaceholder',
                        'HR Manager Name'
                      )
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t('applicants.profile.exportModal.signature', 'Signature')}
              </label>
              <input
                type="text"
                value={currentData.signature || ''}
                onChange={(e) =>
                  setCurrentData((prev) => ({ ...prev, signature: e.target.value }))
                }
                placeholder={t(
                  'applicants.profile.exportModal.signaturePlaceholder',
                  'e.g. signature or initials'
                )}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {t('applicants.profile.exportModal.date', 'Date')}
              </label>
              <input
                type="date"
                value={currentData.date}
                onChange={(e) =>
                  setCurrentData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Decision Buttons */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              {t('applicants.profile.exportModal.decision', 'Decision')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentData((prev) => ({
                    ...prev,
                    decision: prev.decision === 'approved' ? '' : 'approved',
                  }))
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  currentData.decision === 'approved'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{t('applicants.profile.exportModal.approved', 'Approved')}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentData((prev) => ({
                    ...prev,
                    decision: prev.decision === 'rejected' ? '' : 'rejected',
                  }))
                }
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  currentData.decision === 'rejected'
                    ? 'border-red-300 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <X className="h-3.5 w-3.5" />
                <span>{t('applicants.profile.exportModal.rejected', 'Rejected')}</span>
              </button>
            </div>
          </div>

          {/* Separate signature field for the selected hiring responsible. */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              {t('applicants.profile.exportModal.signature', 'Signature')}
            </label>
            <input
              type="text"
              value={currentData.signature}
              onChange={(e) =>
                setCurrentData((prev) => ({ ...prev, signature: e.target.value }))
              }
              placeholder={t(
                'applicants.profile.exportModal.signaturePlaceholder',
                'Enter signature name or leave blank for handwritten signature'
              )}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              {t('applicants.profile.exportModal.signatureHelp',
                'This is a typed signature label, not a verified digital signature.')}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              {t('applicants.profile.exportModal.notes', 'Notes / Recommendations')}
            </label>
            <textarea
              rows={3}
              value={currentData.notes}
              onChange={(e) =>
                setCurrentData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder={t(
                'applicants.profile.exportModal.notesPlaceholder',
                'Enter recommendations or interview feedback...'
              )}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {cvUrl && (
          <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t(
                    'applicants.profile.exportModal.cvDocument',
                    'Applicant CV Document'
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t(
                    'applicants.profile.exportModal.cvDesc',
                    'Included in the exported PDF as a direct document link'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                <span>{t('common.preview', 'Preview')}</span>
              </a>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={downloadCvFile}
                  onChange={(e) => setDownloadCvFile(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span>
                  {t('applicants.profile.exportModal.downloadCv', 'Also download file')}
                </span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleExportBlank}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {t(
              'applicants.profile.exportModal.exportBlank',
              'Export Fillable / Blank'
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleExportWithSignatures}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>
                {t('applicants.profile.exportModal.exportWithSignatures', 'Export PDF')}
              </span>
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
