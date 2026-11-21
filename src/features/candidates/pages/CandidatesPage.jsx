// src/features/candidates/pages/CandidatesPage.jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useCandidatesQuery } from '../hooks/useCandidatesQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Trash2, Sparkles, UserCheck } from 'lucide-react';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import { toast } from 'sonner';

export default function CandidatesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  /* ---------------- Filters ---------------- */
  const [keyword, setKeyword] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  /* ---------------- Pagination ---------------- */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ---------------- Delete Modal State ---------------- */
  const [isDeleting, setIsDeleting] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  /* ---------------- Fetching Lookups (Positions) ---------------- */
  const { data: positionsRaw = [] } = useAllPositions();

  /* ---------------- Candidates List Query ---------------- */
  const { data, isLoading, isError, refetch } = useCandidatesQuery({
    page,
    limit: pageSize,
    keyword,
    position_id: selectedPosition,
    status: selectedStatus,
  });

  const candidatesList = data?.data || [];
  const totalPages = data?.meta?.last_page || 1;

  // Generate Initials Avatar
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Derive status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Progress':
      case 'قيد التنفيذ':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'Completed':
      case 'مكتمل':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'Invited':
      case 'تمت دعوته':
        return 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  // Derive Match score styling
  const getMatchBadgeClass = (percent) => {
    if (percent >= 85) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    } else if (percent >= 60) {
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    } else {
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    }
  };

  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const handlePositionChange = (val) => {
    setSelectedPosition(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setPage(1);
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    toast.success(isRTL ? 'تم حذف المرشح بنجاح' : 'Candidate deleted successfully');
    setIsDeleting(false);
    setCandidateToDelete(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{t('navigation.dashboard')}</span>
          <span>&rsaquo;</span>
          <span className="font-semibold text-slate-700">{t('candidates.title')}</span>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className={`absolute top-1/2 -translate-y-1/2 size-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            value={keyword}
            onChange={handleSearchChange}
            placeholder={t('candidates.search') + '...'}
            className={`h-10 w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} border-slate-200 focus-visible:ring-indigo-500`}
          />
        </div>

        {/* Job Dropdown */}
        <div className="w-[180px]">
          <Select value={selectedPosition} onValueChange={handlePositionChange}>
            <SelectTrigger className="h-10 border-slate-200 bg-white">
              <SelectValue placeholder={t('candidates.jobDropdown')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allPositions') || 'All Jobs'}</SelectItem>
              {positionsRaw.map((pos) => (
                <SelectItem key={pos.id} value={String(pos.id)}>
                  {isRTL ? pos.title_ar || pos.title_en : pos.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Dropdown */}
        <div className="w-[180px]">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 border-slate-200 bg-white">
              <SelectValue placeholder={t('candidates.statusDropdown')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all') || 'All Statuses'}</SelectItem>
              <SelectItem value="Invited">{t('candidates.invited')}</SelectItem>
              <SelectItem value="In Progress">{t('candidates.inProgress')}</SelectItem>
              <SelectItem value="Completed">{t('candidates.completed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Total Count / Page Size */}
      <div className="flex items-center gap-4 px-1">
        <span className="text-sm font-semibold text-slate-700">{t('candidates.title')}</span>
        <PageSizeSelect
          value={pageSize}
          onChange={(v) => {
            setPageSize(Number(v));
            setPage(1);
          }}
        />
      </div>

      {/* Candidates List Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[13px] font-semibold text-slate-500">
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('candidates.name')}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('candidates.job')}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('candidates.status')}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('candidates.match')}</th>
                <th className="px-6 py-4 text-center">{t('candidates.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                      <span>{t('common.loading') || 'Loading...'}</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-500">
                    {t('common.error') || 'An error occurred while loading data.'}
                  </td>
                </tr>
              ) : candidatesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {t('candidates.noCandidates')}
                  </td>
                </tr>
              ) : (
                candidatesList.map((c) => {
                  // Derive status
                  let derivedStatus = c.status;
                  if (!derivedStatus) {
                    if (c.answers_count > 0) {
                      derivedStatus = c.match_percent > 0 ? 'Completed' : 'In Progress';
                    } else {
                      derivedStatus = 'Invited';
                    }
                  }

                  // Translate status
                  const displayStatus = 
                    derivedStatus === 'Completed' ? t('candidates.completed') :
                    derivedStatus === 'In Progress' ? t('candidates.inProgress') :
                    t('candidates.invited');

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200">
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{c.name}</div>
                            <div className="text-xs text-slate-400 font-medium">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {c.position || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm tracking-wide ${getStatusBadgeClass(derivedStatus)}`}>
                          {displayStatus}
                        </span>
                      </td>

                      {/* Match Score */}
                      <td className="px-6 py-4">
                        {c.match_percent > 0 ? (
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm tracking-wide ${getMatchBadgeClass(c.match_percent)}`}>
                            {c.match_percent}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/candidates/${c.id}`)}
                            className="size-8 rounded-lg border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(c)}
                            className="size-8 rounded-lg border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100" dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-bold text-slate-800">
              {isRTL ? 'حذف المرشح' : 'Delete Candidate'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {isRTL
                ? `هل أنت متأكد من رغبتك في حذف المرشح "${candidateToDelete?.name}"؟`
                : `Are you sure you want to delete candidate "${candidateToDelete?.name}"?`}
            </p>
            <div className={`mt-6 flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleting(false);
                  setCandidateToDelete(null);
                }}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {t('common.delete') || 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
