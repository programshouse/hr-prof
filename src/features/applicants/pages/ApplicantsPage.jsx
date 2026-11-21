import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Link2, Plus, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import ApplicantsStats from '../components/ApplicantsStats';
import ApplicantsFilters from '../components/ApplicantsFilters';
import ApplicantsTable from '../components/ApplicantsTable';
import DeleteApplicantModal from '../components/DeleteApplicantModal';
import AssignHiringModal from '../components/AssignHiringModal';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

import useApplicantsHeaderQuery from '../hooks/useApplicantsHeaderQuery';
import { useApplicantsQuery } from '../hooks/useApplicantsQuery';
import { useDeleteApplicant } from '../hooks/useDeleteApplicant';

import { EmployeeFormDialog } from '@/features/employees/components/EmployeeFormDialog';
import { applicantsApi } from '../api/applicants.api';
import { useAuthStore } from '@/services/auth/auth.store';

const DEFAULT_FILTERS = {
  keyword: '',
  position_id: 'all',
  status: 'all',
};

export default function ApplicantsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const companyId = user?.company_id;

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState(null);

  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [applicantToHire, setApplicantToHire] = useState(null);
  const [applicantToAssign, setApplicantToAssign] = useState(null);

  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useApplicantsHeaderQuery();

  const { data, isLoading, refetch, isFetching } = useApplicantsQuery({
    page,
    limit: pageSize,
    keyword: filters.keyword,
    position_id: filters.position_id,
    status: filters.status,
  });

  const deleteApplicant = useDeleteApplicant();

  const rows = useMemo(() => {
    const list = data?.data ?? [];

    return list.map((a) => {
      const fullName = [a.first_name, a.middle_name, a.last_name]
        .filter(Boolean)
        .join(' ');

      return {
        ...a,
        name: fullName || a.preferred_name || '—',
        position: a.position_title_en || a.position || '—',
        rating: a.rate ?? 0,
        interviews_count: Number(a.interviews_count ?? 0),
        expectedSalary: a.expected_salary ?? '—',
        availableTime: a.available_start_date ?? '—',
        avatar: a.image ?? null,
      };
    });
  }, [data]);

  const totalPages = data?.meta?.last_page || 1;

  const handleGenerateLink = async () => {
    if (!companyId) {
      toast.error('Company ID not found');
      return;
    }

    try {
      setIsGeneratingLink(true);
      setCopiedLink(false);

      const applyCode = data?.apply_code || '';
      let code = applyCode;
      let link = '';

      try {
        const res = await applicantsApi.generateApplyLink(companyId, applyCode);
        link = res?.link || res?.data?.link || '';
        code =
          res?.apply_code ||
          res?.code ||
          res?.data?.apply_code ||
          res?.data?.code ||
          applyCode;
      } catch (err) {
        console.warn('Backend generateApplyLink endpoint error, falling back to local URL generation:', err);
      }

      if (link) {
        try {
          const urlObj = new URL(link, window.location.origin);

          // If backend returned a path with code (e.g. /applicants/apply/:code)
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          if (
            pathSegments.length >= 3 &&
            pathSegments[0] === 'applicants' &&
            pathSegments[1] === 'apply'
          ) {
            if (!code) code = pathSegments[2];
          }

          // Always normalize pathname to /applicants/apply to avoid 404 on servers
          urlObj.pathname = '/applicants/apply';

          // When running on localhost, use current local host so developer can test locally
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            urlObj.protocol = window.location.protocol;
            urlObj.host = window.location.host;
          }

          if (companyId) {
            urlObj.searchParams.set('company_id', String(companyId));
          }
          if (code) {
            urlObj.searchParams.set('apply_code', code);
            urlObj.searchParams.set('code', code);
          }
          link = urlObj.toString();
        } catch {
          link = `${window.location.origin}/applicants/apply?company_id=${companyId}${code ? `&apply_code=${code}&code=${code}` : ''}`;
        }
      } else {
        link = `${window.location.origin}/applicants/apply?company_id=${companyId}${code ? `&apply_code=${code}&code=${code}` : ''}`;
      }

      setGeneratedLink(link);
      setGeneratedCode(code);

      try {
        await navigator.clipboard.writeText(link);
        setCopiedLink(true);
        toast.success(
          t('applicants.linkGeneratedAndCopied', 'Application link generated and copied to clipboard!')
        );
        setTimeout(() => {
          setCopiedLink(false);
        }, 2500);
      } catch {
        toast.success(t('applicants.linkGenerated', 'Application link generated!'));
      }

      setIsLinkModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(t('applicants.linkGenerateFailed', 'Failed to generate apply link'));
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyModalLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setModalCopied(true);
      toast.success(t('applicants.copied', 'Copied!'));
      setTimeout(() => setModalCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      toast.success(t('applicants.copied', 'Copied!'));
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="space-y-6">
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load applicants summary.
        </div>
      ) : (
        <ApplicantsStats data={headerData} isLoading={isHeaderLoading} />
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <ApplicantsFilters
            filters={filters}
            onFiltersChange={(next) => {
              setFilters({ ...DEFAULT_FILTERS, ...(next || {}) });
              setPage(1);
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleGenerateLink}
            disabled={isGeneratingLink}
          >
            {isGeneratingLink ? (
              <Link2 className="mr-2 size-4 animate-pulse" />
            ) : (
              <Copy className="mr-2 size-4" />
            )}
            <span>
              {isGeneratingLink
                ? t('applicants.generatingLink')
                : copiedLink
                  ? t('applicants.copied')
                  : t('applicants.generateLink')}
            </span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              const code = data?.apply_code;
              const url = `/applicants/apply${companyId ? `?company_id=${companyId}` : ''}${code ? `${companyId ? '&' : '?'}apply_code=${code}&code=${code}` : ''}`;
              navigate(url);
            }}
          >
            <Plus className="mr-2 size-4" />
            <span>{t('common.add')}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-700">
          {t('navigation.applicants')}
        </div>
        <PageSizeSelect
          value={pageSize}
          onChange={(v) => {
            setPageSize(Number(v));
            setPage(1);
          }}
        />
      </div>

      <ApplicantsTable
        rows={rows}
        isLoading={isLoading || isFetching}
        onRefresh={refetch}
        onView={(row) => navigate(`/applicants/${row.id}`)}
        onConvert={(row) => {
          setApplicantToHire(row);
          setHireDialogOpen(true);
        }}
        onAssignHiring={(row) => setApplicantToAssign(row)}
        onDelete={(row) => {
          setApplicantToDelete(row);
          setDeleteModalOpen(true);
        }}
        processingIds={
          deleteApplicant.isPending && deleteApplicant.variables
            ? new Set([deleteApplicant.variables])
            : new Set()
        }
      />

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <AssignHiringModal
        open={Boolean(applicantToAssign)}
        applicant={applicantToAssign}
        onOpenChange={(open) => { if (!open) setApplicantToAssign(null); }}
        onSuccess={() => { setApplicantToAssign(null); refetch(); }}
      />

      <DeleteApplicantModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setApplicantToDelete(null);
        }}
        applicant={applicantToDelete}
        onSuccess={refetch}
      />

      <EmployeeFormDialog
        open={hireDialogOpen}
        onOpenChange={(open) => {
          setHireDialogOpen(open);
          if (!open) setApplicantToHire(null);
        }}
        employee={null}
        applicantId={applicantToHire?.id}
        mode="hire"
        startStep={8}
        onSuccess={() => {
          setHireDialogOpen(false);
          setApplicantToHire(null);
          refetch();
        }}
      />

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Link2 className="size-5 text-primary" />
              {t('applicants.linkGeneratedTitle', 'Application Link Generated')}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500">
              {t(
                'applicants.linkGeneratedDesc',
                'Share this link with applicants. It includes your company application code.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">


            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                {t('applicants.applyLinkLabel', 'Application Link')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  onClick={(e) => e.target.select()}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 select-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyModalLink}
                  className="h-9 shrink-0 gap-1 px-3 text-xs"
                >
                  {modalCopied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>
                    {modalCopied
                      ? t('applicants.copied', 'Copied')
                      : t('applicants.copyLink', 'Copy Link')}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLinkModalOpen(false)}
            >
              {t('common.close', 'Close')}
            </Button>
            {generatedLink && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span>{t('applicants.openLink', 'Open Link')}</span>
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}