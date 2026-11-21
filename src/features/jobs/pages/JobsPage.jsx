'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import EmptyInterviewState from '../components/EmptyInterviewState';
import {
  Search,
  Briefcase,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';
import { toast } from 'sonner';

import {
  useInterviewSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useInterviewQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '../hooks/useJobsQueries';

import SectionModal from '../components/SectionModal';
import QuestionModal from '../components/QuestionModal';

const tileThemes = [
  {
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    title: 'text-primary',
    hover: 'hover:border-indigo-200 hover:bg-indigo-50/80',
    ring: 'focus-visible:ring-indigo-500',
  },
  {
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    title: 'text-sky-700',
    hover: 'hover:border-sky-200 hover:bg-sky-50/80',
    ring: 'focus-visible:ring-sky-500',
  },
  {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'text-emerald-700',
    hover: 'hover:border-emerald-200 hover:bg-emerald-50/80',
    ring: 'focus-visible:ring-emerald-500',
  },
  {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    title: 'text-orange-700',
    hover: 'hover:border-orange-200 hover:bg-orange-50/80',
    ring: 'focus-visible:ring-orange-500',
  },
  {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    title: 'text-rose-700',
    hover: 'hover:border-rose-200 hover:bg-rose-50/80',
    ring: 'focus-visible:ring-rose-500',
  },
  {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    title: 'text-violet-700',
    hover: 'hover:border-violet-200 hover:bg-violet-50/80',
    ring: 'focus-visible:ring-violet-500',
  },
  {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'text-amber-700',
    hover: 'hover:border-amber-200 hover:bg-amber-50/80',
    ring: 'focus-visible:ring-amber-500',
  },
  {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    title: 'text-teal-700',
    hover: 'hover:border-teal-200 hover:bg-teal-50/80',
    ring: 'focus-visible:ring-teal-500',
  },
];

function getTheme(i) {
  return tileThemes[i % tileThemes.length];
}

export default function JobsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { positionId } = useParams();
  const navigate = useNavigate();

  const setName = useBreadcrumbStore((state) => state.setName);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 32;

  const [activeSectionId, setActiveSectionId] = useState(null);

  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const {
    data: positionsData,
    isLoading: isPositionsLoading,
    isError: isPositionsError,
    refetch: refetchPositions,
  } = useAllPositions();

  const currentPosition = useMemo(() => {
    if (!positionsData || !positionId) return null;
    return positionsData.find((p) => String(p.id) === String(positionId));
  }, [positionsData, positionId]);

  const positionName = useMemo(() => {
    if (!currentPosition) return '';

    return isRTL
      ? currentPosition.title_ar ||
          currentPosition.title_en ||
          currentPosition.title ||
          `Position #${positionId}`
      : currentPosition.title_en ||
          currentPosition.title_ar ||
          currentPosition.title ||
          `Position #${positionId}`;
  }, [currentPosition, positionId, isRTL]);

  useEffect(() => {
    if (positionId && positionName) {
      setName(`jobs/${positionId}`, positionName);
    }
  }, [positionId, positionName, setName]);

  const {
    data: sectionsRes,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
  } = useInterviewSectionsQuery(positionId);

  const sections = useMemo(() => sectionsRes?.data || [], [sectionsRes]);

  useEffect(() => {
    if (!sections.length) {
      setActiveSectionId(null);
      return;
    }

    const exists = sections.some((section) => section.id === activeSectionId);

    if (!activeSectionId || !exists) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const resolvedActiveSectionId = activeSectionId ?? sections[0]?.id ?? null;

  const {
    data: questionsRes,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useInterviewQuestionsQuery(resolvedActiveSectionId);

  const questions = useMemo(() => questionsRes?.data || [], [questionsRes]);

  const createSectionMutation = useCreateSectionMutation(positionId);
  const updateSectionMutation = useUpdateSectionMutation(positionId);
  const deleteSectionMutation = useDeleteSectionMutation(positionId);

  const createQuestionMutation = useCreateQuestionMutation(resolvedActiveSectionId);
  const updateQuestionMutation = useUpdateQuestionMutation(resolvedActiveSectionId);
  const deleteQuestionMutation = useDeleteQuestionMutation(resolvedActiveSectionId);

  const jobs = useMemo(() => {
    const rows = Array.isArray(positionsData) ? positionsData : [];

    return rows.map((j) => ({
      id: j.id,
      title: isRTL
        ? j.title_ar || j.title_en || j.title || j.name_ar || j.name_en || j.name || `Job #${j.id}`
        : j.title_en || j.title_ar || j.title || j.name_en || j.name || `Job #${j.id}`,
    }));
  }, [positionsData, isRTL]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((j) => String(j.title).toLowerCase().includes(q));
  }, [jobs, search]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length]);

  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const handleSectionClick = (sectionId) => {
    setActiveSectionId(sectionId);
  };

  const handleOpenAddSection = () => {
    setEditingSection(null);
    setIsSectionOpen(true);
  };

  const handleOpenEditSection = (section, e) => {
    e.stopPropagation();
    setEditingSection(section);
    setIsSectionOpen(true);
  };

  const handleSectionDelete = async (sectionId, e) => {
    e.stopPropagation();

    if (
      window.confirm(
        t('jobs.confirmDeleteSection', 'Are you sure you want to delete this section?')
      )
    ) {
      try {
        await deleteSectionMutation.mutateAsync(sectionId);
        toast.success(t('jobs.sectionDeleted', 'Section deleted successfully'));

        if (activeSectionId === sectionId) {
          setActiveSectionId(null);
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            t('jobs.failedToDeleteSection', 'Failed to delete section')
        );
      }
    }
  };

  const handleSectionSubmit = async (payload) => {
    try {
      const fixedPayload = {
        ...payload,
        position_ids:
          Array.isArray(payload.position_ids) && payload.position_ids.length > 0
            ? payload.position_ids
            : positionId
              ? [Number(positionId)]
              : [],
      };

      if (editingSection) {
        await updateSectionMutation.mutateAsync({
          id: editingSection.id,
          data: fixedPayload,
        });
        toast.success(t('jobs.sectionUpdated', 'Section updated successfully'));
      } else {
        await createSectionMutation.mutateAsync(fixedPayload);
        toast.success(t('jobs.sectionCreated', 'Section created successfully'));
      }

      setIsSectionOpen(false);
      setEditingSection(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t('jobs.failedToSaveSection', 'Failed to save section')
      );
    }
  };

  const handleOpenAddQuestion = () => {
    if (!resolvedActiveSectionId) {
      toast.error(t('jobs.selectSectionFirst', 'Please select or add a section first'));
      return;
    }

    setEditingQuestion(null);
    setIsQuestionOpen(true);
  };

  const handleOpenEditQuestion = (question) => {
    setEditingQuestion(question);
    setIsQuestionOpen(true);
  };

  const handleQuestionDelete = async (questionId) => {
    if (
      window.confirm(
        t('jobs.confirmDeleteQuestion', 'Are you sure you want to delete this question?')
      )
    ) {
      try {
        await deleteQuestionMutation.mutateAsync(questionId);
        toast.success(t('jobs.questionDeleted', 'Question deleted successfully'));
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            t('jobs.failedToDeleteQuestion', 'Failed to delete question')
        );
      }
    }
  };

  const handleQuestionSubmit = async (payload) => {
    try {
      if (editingQuestion) {
        await updateQuestionMutation.mutateAsync({
          id: editingQuestion.id,
          data: payload,
        });
        toast.success(t('jobs.questionUpdated', 'Question updated successfully'));
      } else {
        await createQuestionMutation.mutateAsync(payload);
        toast.success(t('jobs.questionCreated', 'Question created successfully'));
      }

      setIsQuestionOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t('jobs.failedToSaveQuestion', 'Failed to save question')
      );
    }
  };

  if (!positionId) {
    return (
      <div className="space-y-5">
        <Card className="border-border rounded-2xl border bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-primary text-base font-semibold">
                  {t('jobs.selectJob', 'Select Job')}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t('jobs.chooseDescription', 'Choose the job to view the detailed report.')}
                </p>
              </div>

              <div className="relative w-full sm:w-[280px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('common.search', 'Search')}
                  className="h-10 pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-2xl border bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            {isPositionsError ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {t('jobs.failedToLoad', 'Failed to load jobs.')}{' '}
                <button className="font-semibold underline" onClick={() => refetchPositions()}>
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : isPositionsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[72px] rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="rounded-full bg-slate-100 p-4">
                  <Briefcase className="size-6 text-slate-400" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  {t('jobs.noJobsFound', 'No jobs found')}
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {search
                    ? t('jobs.noMatch', 'No jobs match your search criteria. Try a different term.')
                    : t('jobs.noAvailable', 'There are no jobs available at the moment.')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {paginated.map((job, idx) => {
                    const theme = getTheme(idx);
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className={[
                          'group w-full text-left',
                          'rounded-xl border p-4 transition',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                          'cursor-pointer shadow-sm',
                          'hover:scale-[1.02]',
                          theme.bg,
                          theme.border,
                          theme.hover,
                          theme.ring,
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'text-sm font-semibold transition group-hover:underline',
                            theme.title,
                          ].join(' ')}
                        >
                          {job.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="pt-5">
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSection = sections.find((s) => s.id === resolvedActiveSectionId);

  const activeSectionName = activeSection
    ? isRTL
      ? activeSection.name_ar || activeSection.name_en
      : activeSection.name_en || activeSection.name_ar
    : '';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-row items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/jobs')}
          className="size-10 rounded-full border-slate-200 bg-white shadow-sm hover:bg-slate-50"
        >
          <ChevronLeft className={`size-5 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 text-primary flex size-11 items-center justify-center rounded-full border">
            <Briefcase className="size-5" />
          </div>

          <div>
            <h1 className="text-xl leading-tight font-bold text-slate-900">{positionName}</h1>
          </div>
        </div>
      </div>

      {isSectionsLoading ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>

              <div className="space-y-4 lg:col-span-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isSectionsError ? (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-[360px] items-center justify-center p-6 text-center text-sm text-red-500">
            {t('jobs.failedToLoadSections', 'Failed to load sections')}
          </CardContent>
        </Card>
      ) : sections.length === 0 ? (
        <EmptyInterviewState
          sectionTitle={t('jobs.sectionsHeader', 'Sections')}
          questionTitle={t('jobs.questionsList', 'Questions')}
          questionEmptyTitle={t('jobs.startByAddingQuestion', 'Start by Adding Question')}
          questionEmptyDescription={t(
            'jobs.clickBottomAddQuestion',
            'Click on the button at the bottom to add a new question'
          )}
          addSectionText={t('jobs.addNewSection', 'Add New Section')}
          addQuestionText={t('jobs.addNewQuestion', 'Add New Question')}
          onAddSection={handleOpenAddSection}
          onAddQuestion={handleOpenAddQuestion}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h2 className="text-base font-bold text-slate-800">
                  {t('jobs.sectionsHeader', 'Sections')}
                </h2>
              </div>

              <div className="p-3">
                <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                  {sections.map((sec) => {
                    const isActive = sec.id === resolvedActiveSectionId;
                    const secName = isRTL
                      ? sec.name_ar || sec.name_en || `Section #${sec.id}`
                      : sec.name_en || sec.name_ar || `Section #${sec.id}`;

                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleSectionClick(sec.id)}
                        className={[
                          'group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition select-none',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'border border-slate-100 bg-white text-slate-700 hover:bg-slate-50/70 hover:text-slate-900',
                        ].join(' ')}
                      >
                        <span className="flex-1 truncate pr-2">{secName}</span>

                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditSection(sec, e)}
                            className={[
                              'rounded-md p-1 transition',
                              isActive
                                ? 'hover:bg-primary/90 text-primary-foreground/95'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                            ].join(' ')}
                          >
                            <Pencil className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSectionDelete(sec.id, e)}
                            className={[
                              'rounded-md p-1 transition',
                              isActive
                                ? 'hover:bg-primary/90 text-rose-200'
                                : 'text-red-400 hover:bg-red-50 hover:text-red-600',
                            ].join(' ')}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleOpenAddSection}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary/90 mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-dashed font-bold"
                >
                  <Plus className="size-4" />
                  {t('jobs.addNewSection', 'Add New Section')}
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    {activeSectionName || t('jobs.selectSection', 'Select a Section')}
                  </h2>

                  {activeSectionName && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t('jobs.questionsList', 'Questions List')}
                    </p>
                  )}
                </div>

                {resolvedActiveSectionId && (
                  <Button
                    onClick={handleOpenAddQuestion}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-xl px-4 text-xs font-semibold shadow-sm transition"
                  >
                    <Plus className="mr-1.5 size-4" />
                    {t('jobs.addNewQuestion', 'Add New Question')}
                  </Button>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                {!resolvedActiveSectionId ? (
                  <div className="flex-1 bg-white" />
                ) : isQuestionsLoading ? (
                  <div className="flex-1 space-y-4 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-32 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5"
                      >
                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
                        <div className="space-y-1.5 pt-2">
                          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isQuestionsError ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-red-500">
                    {t('jobs.failedToLoadQuestions', 'Failed to load questions')}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full border border-slate-100 bg-slate-50 p-4">
                      <Briefcase className="size-6 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                      {t('jobs.noQuestionsFound', 'No questions found')}
                    </h3>

                    <p className="mt-1 max-w-xs text-sm text-slate-500">
                      {t(
                        'jobs.noQuestionsPrompt',
                        'There are no questions in this section yet. Click Add New Question to create one.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] space-y-6 overflow-y-auto pr-1">
                    {questions.map((q, qIdx) => {
                      const qText = isRTL
                        ? q.question_ar || q.question_en || `Question #${q.id}`
                        : q.question_en || q.question_ar || `Question #${q.id}`;

                      const typeLabel =
                        q.type === 'essay'
                          ? t('jobs.textAreaType', 'Text Area')
                          : q.type === 'multi_choice'
                            ? t('jobs.multiSelectType', 'Multi Select')
                            : t('jobs.choiceType', 'Choice');

                      return (
                        <Card
                          key={q.id}
                          className="overflow-hidden rounded-2xl border bg-[#F3F3F3] transition"
                        >
                          <div className="space-y-3.5 p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="text-sm leading-snug font-bold text-slate-900 sm:text-base">
                                  {qIdx + 1}. {qText}
                                </h3>

                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                    {typeLabel}
                                  </span>

                                  <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold">
                                    {t('jobs.weight', 'Weight')}: {q.weight}
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  onClick={() => handleOpenEditQuestion(q)}
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary hover:bg-primary/10 size-8 rounded-lg text-slate-500"
                                >
                                  <Pencil className="size-4" />
                                </Button>

                                <Button
                                  onClick={() => handleQuestionDelete(q.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>

                            {q.type !== 'essay' ? (
                              <div className="grid grid-cols-1 gap-2 border-t border-slate-50 pt-1 sm:grid-cols-2">
                                {(q.options || []).map((opt) => {
                                  const optText = isRTL
                                    ? opt.option_text_ar || opt.option_text_en || ''
                                    : opt.option_text_en || opt.option_text_ar || '';

                                  const isCorrect = opt.is_correct === true || opt.is_correct === 1;

                                  return (
                                    <div
                                      key={opt.id}
                                      className={[
                                        'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition',
                                        isCorrect
                                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                                          : 'border-slate-100 bg-white text-slate-600',
                                      ].join(' ')}
                                    >
                                      {isCorrect ? (
                                        <CheckCircle2 className="size-4.5 shrink-0 text-emerald-500" />
                                      ) : (
                                        <Circle className="size-4.5 shrink-0 text-slate-300" />
                                      )}

                                      <span className="truncate">{optText}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="border-t border-slate-50 pt-2">
                                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
                                  <span className="mb-1 block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    {t('jobs.idealAnswer', 'Ideal Answer')}:
                                  </span>

                                  <p className="text-sm leading-relaxed font-semibold text-slate-700">
                                    {isRTL
                                      ? q.ideal_answer_ar || q.ideal_answer_en || '—'
                                      : q.ideal_answer_en || q.ideal_answer_ar || '—'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      <SectionModal
        open={isSectionOpen}
        onOpenChange={setIsSectionOpen}
        section={editingSection}
        defaultPositionId={positionId}
        onSubmitSection={handleSectionSubmit}
        isLoading={createSectionMutation.isPending || updateSectionMutation.isPending}
      />

      <QuestionModal
        open={isQuestionOpen}
        onOpenChange={setIsQuestionOpen}
        sectionId={resolvedActiveSectionId}
        question={editingQuestion}
        onSubmitQuestion={handleQuestionSubmit}
        isLoading={createQuestionMutation.isPending || updateQuestionMutation.isPending}
      />
    </div>
  );
}