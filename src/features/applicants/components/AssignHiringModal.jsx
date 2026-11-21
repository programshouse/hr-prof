import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import EmployeeCombobox from '@/components/ui/EmployeeCombobox';
import { useAllEmployees } from '@/shared/hooks';
import { useAssignHiring } from '../hooks/useAssignHiring';
import { useApplicantDetailsQuery } from '../hooks/useApplicantDetailsQuery';
import { UserCheck, Briefcase, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function getInitials(firstName = '', lastName = '', fallback = '') {
  const f = String(firstName || '').trim();
  const l = String(lastName || '').trim();
  const res = ((f ? f[0] : '') + (l ? l[0] : '')).toUpperCase();
  if (res) return res;

  const parts = String(fallback || '').trim().split(/\s+/).filter(Boolean);
  const x = parts[0]?.[0] || '';
  const y = parts[1]?.[0] || '';
  return (x + y || x || '--').toUpperCase();
}

export default function AssignHiringModal({
  open,
  onOpenChange,
  applicant,
  onSuccess,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir?.() === 'rtl' || i18n.language?.startsWith('ar');

  const applicantId = applicant?.id ?? applicant?.applicant_id ?? applicant?.personal_data_id;

  // Fetch full details if opened to ensure existing notes and assigned managers are loaded
  const { data: detailsData, isLoading: isDetailsLoading } = useApplicantDetailsQuery(
    open ? applicantId : null
  );

  const { data: employees = [], isLoading: isEmployeesLoading } = useAllEmployees(open);

  const assignHiringMutation = useAssignHiring();

  const EMPTY_FORM = {
    hiring_manager_id: '',
    hiring_hr_id: '',
    hiring_manager_note: '',
    hiring_hr_note: '',
  };

  const [userForm, setUserForm] = useState({});
  // After successful save, don't repopulate this applicant's fields
  // from the GET response when the dialog is opened again.
  const [clearedApplicantIds, setClearedApplicantIds] = useState(() => new Set());
  const showSavedDefaults = !clearedApplicantIds.has(String(applicantId));

  // Do not retain edits when switching applicants or reopening the dialog.
  useEffect(() => {
    setUserForm({});
  }, [open, applicantId]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) setUserForm({});
    onOpenChange(nextOpen);
  };

  const source = detailsData || applicant || {};
  const defaultHmId =
    source.hiring_manager_id ??
    source.hiring_manager?.id ??
    source.hiring_manager?.employee_id ??
    '';
  const defaultHrId =
    source.hiring_hr_id ??
    source.hiring_hr?.id ??
    source.hiring_hr?.employee_id ??
    '';
  const defaultHmNote = source.hiring_manager_note || '';
  const defaultHrNote = source.hiring_hr_note || '';

  const formData = showSavedDefaults ? {
    hiring_manager_id:
      userForm.hiring_manager_id !== undefined
        ? userForm.hiring_manager_id
        : (defaultHmId ? String(defaultHmId) : ''),
    hiring_hr_id:
      userForm.hiring_hr_id !== undefined
        ? userForm.hiring_hr_id
        : (defaultHrId ? String(defaultHrId) : ''),
    hiring_manager_note:
      userForm.hiring_manager_note !== undefined
        ? userForm.hiring_manager_note
        : defaultHmNote,
    hiring_hr_note:
      userForm.hiring_hr_note !== undefined
        ? userForm.hiring_hr_note
        : defaultHrNote,
  } : { ...EMPTY_FORM, ...userForm };

  // Applicant display info
  const fullName = useMemo(() => {
    const source = detailsData || applicant || {};
    return (
      source.full_name ||
      [source.first_name, source.middle_name, source.last_name].filter(Boolean).join(' ') ||
      source.name ||
      '—'
    );
  }, [detailsData, applicant]);

  const applicantCode =
    detailsData?.applicant_code ||
    applicant?.applicant_code ||
    (applicantId ? `ID: ${applicantId}` : '—');

  const position = useMemo(() => {
    const source = detailsData || applicant || {};
    return (
      source.position_applied_for?.name_en ||
      source.position_applied_for?.name_ar ||
      source.position_title_en ||
      source.position_title_ar ||
      source.position ||
      '—'
    );
  }, [detailsData, applicant]);

  const initials = useMemo(() => {
    const source = detailsData || applicant || {};
    return getInitials(source.first_name, source.last_name, fullName);
  }, [detailsData, applicant, fullName]);

  const imageUrl = detailsData?.image || detailsData?.avatar || applicant?.image || applicant?.avatar || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantId) return;

    if (!formData.hiring_manager_id && !formData.hiring_hr_id) {
      toast.warning(t('applicants.assignHiringModal.pleaseSelectAtLeastOne', 'Please select at least a Line Manager or HR Manager.'));
      return;
    }

    const payload = {
      hiring_manager_id: formData.hiring_manager_id ? Number(formData.hiring_manager_id) : null,
      hiring_hr_id: formData.hiring_hr_id ? Number(formData.hiring_hr_id) : null,
      hiring_manager_note: formData.hiring_manager_note?.trim() || null,
      hiring_hr_note: formData.hiring_hr_note?.trim() || null,
    };

    assignHiringMutation.mutate(
      { applicantId, payload },
      {
        onSuccess: () => {
          // Clear controlled inputs, including the values otherwise
          // restored from previously saved applicant details.
          setClearedApplicantIds((previous) => new Set(previous).add(String(applicantId)));
          setUserForm({ ...EMPTY_FORM });
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <UserCheck className="size-5" />
              </div>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  {t('applicants.assignHiringModal.title', 'Assign Hiring Responsibles')}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'applicants.assignHiringModal.description',
                    'Assign line manager, HR manager, and feedback notes for this applicant.'
                  )}
                </DialogDescription>
              </div>
            </div>

            {/* Applicant Summary Card */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={fullName}
                    className="size-10 rounded-full object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="grid size-10 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 text-left rtl:text-right">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {fullName}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {position}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 shrink-0">
                {applicantCode}
              </span>
            </div>
          </DialogHeader>

          {/* Form Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Section 1: Line Manager */}
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-800">
                  {t('applicants.assignHiringModal.lineManager', 'Line Manager')}
                </h4>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  {t('applicants.assignHiringModal.lineManager', 'Line Manager')}
                </Label>
                <EmployeeCombobox
                  value={formData.hiring_manager_id}
                  onChange={(val) =>
                    setUserForm((prev) => ({ ...prev, hiring_manager_id: val }))
                  }
                  employees={employees}
                  loading={isEmployeesLoading || isDetailsLoading}
                  placeholder={t(
                    'applicants.assignHiringModal.selectLineManager',
                    'Select line manager...'
                  )}
                  searchPlaceholder={t(
                    'applicants.assignHiringModal.selectLineManager',
                    'Select line manager...'
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  {t('applicants.assignHiringModal.lineManagerNote', 'Line Manager Note')}
                </Label>
                <Textarea
                  rows={2}
                  value={formData.hiring_manager_note}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, hiring_manager_note: e.target.value }))
                  }
                  placeholder={t(
                    'applicants.assignHiringModal.lineManagerNotePlaceholder',
                    'Enter line manager feedback or notes...'
                  )}
                  className="bg-white text-xs resize-none min-h-[68px]"
                />
              </div>
            </div>

            {/* Section 2: HR Manager */}
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-slate-800">
                  {t('applicants.assignHiringModal.hrManager', 'HR Manager')}
                </h4>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  {t('applicants.assignHiringModal.hrManager', 'HR Manager')}
                </Label>
                <EmployeeCombobox
                  value={formData.hiring_hr_id}
                  onChange={(val) =>
                    setUserForm((prev) => ({ ...prev, hiring_hr_id: val }))
                  }
                  employees={employees}
                  loading={isEmployeesLoading || isDetailsLoading}
                  placeholder={t(
                    'applicants.assignHiringModal.selectHrManager',
                    'Select HR manager...'
                  )}
                  searchPlaceholder={t(
                    'applicants.assignHiringModal.selectHrManager',
                    'Select HR manager...'
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  {t('applicants.assignHiringModal.hrManagerNote', 'HR Manager Note')}
                </Label>
                <Textarea
                  rows={2}
                  value={formData.hiring_hr_note}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, hiring_hr_note: e.target.value }))
                  }
                  placeholder={t(
                    'applicants.assignHiringModal.hrManagerNotePlaceholder',
                    'Enter HR manager review notes...'
                  )}
                  className="bg-white text-xs resize-none min-h-[68px]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={assignHiringMutation.isPending}
            >
              {t('applicants.assignHiringModal.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={assignHiringMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            >
              {assignHiringMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('applicants.assignHiringModal.saving', 'Saving...')}
                </>
              ) : (
                t('applicants.assignHiringModal.save', 'Save Assignment')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
