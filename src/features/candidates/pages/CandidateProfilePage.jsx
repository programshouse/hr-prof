// src/features/candidates/pages/CandidateProfilePage.jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import {
  useCandidateAnswersQuery,
  useEvaluateAnswersMutation,
  useEvaluationAnswersQuery,
} from '../hooks/useCandidatesQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, CheckSquare, BarChart, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // --- Active Tab State ---
  // Options: 'answers', 'ai', 'hr', 'comparison'
  const [activeTab, setActiveTab] = useState('answers');

  // --- Accordions/Sections Active States ---
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // --- HR Evaluation Scores State ---
  // Maps question_id to { score, note }
  const [evaluationScores, setEvaluationScores] = useState({});

  // --- Query Lookups ---
  const { data: positionsRaw = [] } = useAllPositions();

  // --- API Queries & Mutations ---
  const {
    data: answersData,
    isLoading: isAnswersLoading,
    isError: isAnswersError,
  } = useCandidateAnswersQuery(id);

  const {
    data: evaluationData,
    isLoading: isEvaluationLoading,
    refetch: refetchEvaluation,
  } = useEvaluationAnswersQuery(id);

  const evaluateMutation = useEvaluateAnswersMutation(id);

  const applicant = answersData?.applicant || {};
  const answersList = answersData?.data || [];

  // Group candidate answers by section
  const sectionsMap = useMemo(() => {
    const map = {};
    answersList.forEach((item) => {
      const sec = item.section;
      if (!sec) return;
      if (!map[sec.id]) {
        map[sec.id] = {
          id: sec.id,
          name_en: sec.name_en,
          name_ar: sec.name_ar,
          questions: [],
        };
      }
      map[sec.id].questions.push(item);
    });

    // Auto-select first section if none selected
    const keys = Object.keys(map);
    if (keys.length > 0 && activeSectionId === null) {
      setActiveSectionId(Number(keys[0]));
    }

    return map;
  }, [answersList, activeSectionId]);

  // Compute answered/total counts per section
  const sectionsList = useMemo(() => {
    return Object.values(sectionsMap).map((sec) => {
      const total = sec.questions.length;
      const answered = sec.questions.filter((item) => {
        const hasEssay = item.essay_answer !== null && String(item.essay_answer).trim() !== '';
        const hasOptions = item.selected_options && item.selected_options.length > 0;
        return hasEssay || hasOptions;
      }).length;

      return {
        ...sec,
        total,
        answered,
      };
    });
  }, [sectionsMap]);

  // Active section's questions
  const activeQuestions = useMemo(() => {
    if (activeSectionId === null || !sectionsMap[activeSectionId]) return [];
    return sectionsMap[activeSectionId].questions;
  }, [sectionsMap, activeSectionId]);

  // Active position details
  const positionTitle = useMemo(() => {
    const posObj = positionsRaw.find((p) => String(p.id) === String(applicant.position));
    return posObj ? (isRTL ? posObj.title_ar : posObj.title_en) : (applicant.position || '—');
  }, [positionsRaw, applicant.position, isRTL]);

  // Handle Accordion Toggle
  const toggleQuestion = (qId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

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

  // Handle HR Score Change
  const handleScoreChange = (qId, weight, val) => {
    const scoreVal = val === '' ? '' : Math.min(Number(weight), Math.max(0, Number(val)));
    setEvaluationScores((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { note: '' }),
        score: scoreVal,
      },
    }));
  };

  const handleNoteChange = (qId, val) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || { score: '' }),
        note: val,
      },
    }));
  };

  // Submit HR Evaluation
  const handleHrEvaluationSubmit = async () => {
    const essayQuestions = answersList.filter((item) => item.question?.type === 'essay');
    
    // Validate that all essay questions have scores entered
    const unrated = essayQuestions.find((item) => {
      const itemScore = evaluationScores[item.question.id]?.score;
      return itemScore === undefined || itemScore === '';
    });

    if (unrated) {
      toast.warning(
        isRTL
          ? 'يرجى إدخال تقييمات صالحة لجميع الأسئلة المقالية أولاً.'
          : 'Please enter valid scores for all essay questions first.'
      );
      return;
    }

    const payload = {
      essay_scores: essayQuestions.map((item) => ({
        question_id: item.question.id,
        score: Number(evaluationScores[item.question.id].score),
        note: evaluationScores[item.question.id].note || '',
      })),
    };

    try {
      await evaluateMutation.mutateAsync(payload);
      toast.success(t('candidates.evaluationSuccess'));
      refetchEvaluation();
      setActiveTab('comparison'); // Switch automatically to answer comparison
    } catch (err) {
      toast.error(isRTL ? 'فشل إرسال التقييم' : 'Failed to submit evaluation');
    }
  };

  // Match Level Helper
  const getMatchLevel = (score, max) => {
    if (!max || max === 0) return { pct: 0, text: 'Low Match', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    const pct = Math.round((score / max) * 100);
    if (pct >= 85) {
      return { pct, text: isRTL ? 'مطابقة عالية' : 'High Match', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    } else if (pct >= 50) {
      return { pct, text: isRTL ? 'مطابقة متوسطة' : 'Medium Match', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    } else {
      return { pct, text: isRTL ? 'مطابقة منخفضة' : 'Low Match', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to Candidates */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/candidates')}
          className="rounded-lg gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>{isRTL ? 'العودة للمرشحين' : 'Back to Candidates'}</span>
        </Button>
      </div>

      {/* Header Info Card */}
      {isAnswersLoading ? (
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-100" />
      ) : isAnswersError ? (
        <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-600 border border-rose-100">
          {isRTL ? 'فشل تحميل بيانات الملف الشخصي.' : 'Failed to load profile details.'}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-full bg-slate-50 text-2xl font-bold text-indigo-600 shadow-inner border border-slate-100">
              {getInitials(applicant.name)}
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-xl font-bold text-slate-800">{applicant.name}</h2>
              <p className="text-sm font-semibold text-slate-400 mt-1">{positionTitle}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-500 font-medium">
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t('candidates.phone')}</span>
              <span className="text-slate-700 mt-1">{applicant.phone || '—'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t('candidates.email')}</span>
              <span className="text-slate-700 mt-1">{applicant.email || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="border-b border-slate-100 flex items-center gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <button
          onClick={() => setActiveTab('answers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'answers'
              ? 'border-indigo-500 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('candidates.candidateAnswer')}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ai'
              ? 'border-indigo-500 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('candidates.aiEvaluation')}
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'hr'
              ? 'border-indigo-500 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('candidates.hrEvaluation')}
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'comparison'
              ? 'border-indigo-500 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('candidates.answerComparison')}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[400px]">
        {/* --- TAB 1: CANDIDATE ANSWERS --- */}
        {activeTab === 'answers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Sections Sidebar */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4">
                {t('candidates.sections')}
              </h3>
              <div className="space-y-2">
                {sectionsList.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    {isRTL ? 'لا توجد أقسام متاحة.' : 'No sections available.'}
                  </p>
                ) : (
                  sectionsList.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
                        activeSectionId === sec.id
                          ? 'bg-indigo-50/70 text-indigo-600 border-indigo-200'
                          : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <span>{isRTL ? sec.name_ar || sec.name_en : sec.name_en}</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        activeSectionId === sec.id
                          ? 'bg-indigo-100/80 text-indigo-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {sec.answered}/{sec.total}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Questions Pane */}
            <div className="lg:col-span-8 space-y-4">
              {activeQuestions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                  {isRTL ? 'يرجى اختيار قسم من القائمة الجانبية.' : 'Please select a section from the list.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuestions.map((item, idx) => {
                    const isExpanded = !!expandedQuestions[item.question.id];
                    const q = item.question || {};
                    const hasEssay = item.essay_answer !== null && String(item.essay_answer).trim() !== '';

                    return (
                      <div
                        key={item.answer_id}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
                      >
                        {/* Question Accordion Header */}
                        <button
                          onClick={() => toggleQuestion(q.id)}
                          className="w-full flex items-center justify-between p-4 text-slate-700 hover:bg-slate-50/50 transition-colors"
                        >
                          <span className="font-bold text-[15px] text-slate-800 text-right md:text-left flex items-start gap-2">
                            <span>{idx + 1}-</span>
                            <span>{q.question}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="size-4 shrink-0 text-slate-400" />
                          ) : (
                            <ChevronDown className="size-4 shrink-0 text-slate-400" />
                          )}
                        </button>

                        {/* Expandable Answers Area */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 border-t border-slate-50 text-slate-600 bg-slate-50/10">
                            {q.type === 'essay' ? (
                              <div className="space-y-3">
                                {hasEssay ? (
                                  <div className="p-4 rounded-xl border border-indigo-100/50 bg-indigo-50/10 font-medium text-slate-700 leading-relaxed">
                                    {item.essay_answer}
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-400">
                                    {isRTL ? 'لا توجد إجابة مكتوبة.' : 'No written answer provided.'}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  {isRTL ? 'الإجابات المحددة' : 'Selected Options'}
                                </span>
                                {item.selected_options && item.selected_options.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {item.selected_options.map((opt) => (
                                      <span
                                        key={opt.id}
                                        className={`inline-flex px-3.5 py-1.5 rounded-lg text-sm font-bold tracking-wide shadow-sm border ${
                                          opt.is_correct
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}
                                      >
                                        {opt.option_text}
                                        <span className="text-[10px] uppercase font-bold tracking-wider ms-2 px-1 content-center bg-white/50 rounded-sm">
                                          {opt.is_correct ? (isRTL ? 'صحيح' : 'Correct') : (isRTL ? 'خاطئ' : 'Incorrect')}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-400">
                                    {isRTL ? 'لم يتم تحديد أي خيارات.' : 'No options selected.'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <Button
                  onClick={() => setActiveTab('ai')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-primary text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all rounded-xl"
                >
                  <Sparkles className="size-4 animate-pulse" />
                  <span>{t('candidates.checkAi')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('hr')}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold gap-2 transition-colors rounded-xl"
                >
                  <CheckSquare className="size-4" />
                  <span>{t('candidates.checkByHr')}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: AI EVALUATION --- */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 shadow-inner">
              <Sparkles className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t('candidates.aiEvaluation')}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {isRTL
                ? 'ميزة التقييم التلقائي للمرشحين بالذكاء الاصطناعي قيد التطوير حاليًا، وسنطلقها قريبًا لمساعدتك على تقييم المرشحين بدقة وسرعة فائقة.'
                : 'The AI-based evaluation module is currently under development. Soon, you will be able to automatically grade candidates answers with advanced semantic matching.'}
            </p>
            <span className="inline-flex px-3.5 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-widest animate-pulse">
              {t('candidates.comingSoon')}
            </span>
          </div>
        )}

        {/* --- TAB 3: HR EVALUATION --- */}
        {activeTab === 'hr' && (
          <div className="space-y-6 max-w-4xl mx-auto mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Find only essay questions to show */}
            {answersList.filter((item) => item.question?.type === 'essay').length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
                {isRTL ? 'لا توجد أسئلة مقالية لتقييمها.' : 'No essay questions require evaluation.'}
              </div>
            ) : (
              <div className="space-y-6">
                {answersList
                  .filter((item) => item.question?.type === 'essay')
                  .map((item, idx) => {
                    const q = item.question || {};
                    const valObj = evaluationScores[q.id] || { score: '', note: '' };

                    return (
                      <div
                        key={item.answer_id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
                      >
                        {/* Question Title */}
                        <div className="flex items-start gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-800 text-[15px] pt-0.5">{q.question}</h4>
                        </div>

                        {/* Side-by-side assessment grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Candidate Answer box */}
                          <div className="p-4 rounded-xl border border-indigo-100/50 bg-indigo-50/10 space-y-2">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                              {t('candidates.candidateAnswer')}
                            </span>
                            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                              {item.essay_answer || (isRTL ? '— لم يتم كتابة إجابة —' : '— No answer provided —')}
                            </p>
                          </div>

                          {/* Ideal Answer box */}
                          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/10 space-y-2">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                              {t('candidates.idealAnswer')}
                            </span>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                              {q.ideal_answer || (isRTL ? 'لا توجد إجابة نموذجية محددة.' : 'No ideal answer defined.')}
                            </p>
                          </div>

                          {/* Scoring rate input box */}
                          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 flex flex-col justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                                {t('candidates.rate')}
                              </span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={q.weight}
                                  value={valObj.score}
                                  onChange={(e) => handleScoreChange(q.id, q.weight, e.target.value)}
                                  placeholder={isRTL ? 'الدرجة' : 'Score'}
                                  className="h-10 border-emerald-200 bg-white font-bold text-slate-800 max-w-[80px]"
                                />
                                <span className="text-sm font-bold text-slate-400">/ {q.weight}</span>
                              </div>
                            </div>

                            {/* Note input */}
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {isRTL ? 'ملاحظة' : 'Note'}
                              </span>
                              <Input
                                value={valObj.note}
                                onChange={(e) => handleNoteChange(q.id, e.target.value)}
                                placeholder={isRTL ? 'ملاحظات إضافية...' : 'Optional review notes...'}
                                className="h-8 border-slate-200 bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Submit button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleHrEvaluationSubmit}
                    disabled={evaluateMutation.isPending}
                    className="bg-indigo-600 hover:bg-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md gap-2"
                  >
                    {evaluateMutation.isPending && (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    <CheckCircle2 className="size-4" />
                    <span>{t('candidates.submit')}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: ANSWER COMPARISON --- */}
        {activeTab === 'comparison' && (
          <div className="space-y-6 max-w-4xl mx-auto mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* If no evaluation results exist */}
            {isEvaluationLoading ? (
              <div className="h-60 w-full animate-pulse rounded-2xl bg-slate-100" />
            ) : !evaluationData || !evaluationData.data ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-4">
                <AlertCircle className="size-10 text-slate-400" />
                <p className="text-sm font-bold text-slate-500">
                  {isRTL
                    ? 'لم يتم تقييم هذا المرشح بعد من قبل الموارد البشرية.'
                    : 'This candidate has not been rated yet.'}
                </p>
                <Button
                  onClick={() => setActiveTab('hr')}
                  className="bg-indigo-600 hover:bg-primary text-white font-bold rounded-xl"
                >
                  {isRTL ? 'اذهب لتقييم الموارد البشرية' : 'Go to HR Evaluation'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Score Badge Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="text-base font-bold text-slate-800">{t('candidates.answerComparison')}</h3>
                    <p className="text-sm font-semibold text-slate-400 mt-1">
                      {isRTL ? 'مقارنة إجابات المرشح مع الإجابات النموذجية' : 'Comparing candidate answers with ideal answers'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-indigo-50/50 px-4 py-3 rounded-xl border border-indigo-100/50 shadow-sm">
                    <BarChart className="size-8 text-indigo-500" />
                    <div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {isRTL ? 'النتيجة الإجمالية' : 'Overall Score'}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {evaluationData.data.total_score} / {evaluationData.data.max_score}
                        <span className="text-xs font-medium text-indigo-500 ms-2">
                          ({evaluationData.data.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Legend */}
                <div className="flex flex-wrap items-center gap-4 px-2 text-xs font-bold text-slate-400 tracking-wide uppercase">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>{isRTL ? 'مطابقة عالية' : 'High Match'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span>{isRTL ? 'مطابقة متوسطة' : 'Medium Match'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span>{isRTL ? 'مطابقة منخفضة' : 'Low Match'}</span>
                  </span>
                </div>

                {/* List comparison details */}
                <div className="space-y-4">
                  {evaluationData.data.details &&
                    evaluationData.data.details.map((detail, idx) => {
                      const match = getMatchLevel(detail.score, detail.weight);
                      const isChoice = detail.type === 'single_choice' || detail.type === 'multi_choice';

                      return (
                        <div
                          key={detail.question_id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
                        >
                          {/* Title & match pill */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 pb-3">
                            <div className="flex items-start gap-2.5">
                              <span className="flex size-6 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-600 shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-slate-800 text-[15px] pt-0.5">{detail.question}</h4>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border shadow-sm ${match.color} shrink-0`}>
                              <span className="size-1.5 rounded-full bg-current" />
                              {match.pct}% {match.text}
                            </span>
                          </div>

                          {/* Split layout boxes */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Candidate answer */}
                            <div className={`p-4 rounded-xl border space-y-2 bg-slate-50/30 ${
                              match.pct >= 85 ? 'border-emerald-100/50' : match.pct >= 50 ? 'border-amber-100/50' : 'border-rose-100/50'
                            }`}>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                {t('candidates.candidateAnswer')}
                              </span>

                              {isChoice ? (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {detail.applicant_selected_options &&
                                    detail.applicant_selected_options.map((opt) => (
                                      <span
                                        key={opt.id}
                                        className="inline-flex px-3 py-1 bg-indigo-50 border border-indigo-100 text-primary text-xs font-bold rounded-lg"
                                      >
                                        {opt.option_text}
                                      </span>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                                  {detail.essay_answer || '—'}
                                </p>
                              )}

                              {detail.note && (
                                <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-500 font-medium leading-relaxed">
                                  <span className="font-bold text-slate-600 block mb-0.5">
                                    {isRTL ? 'ملاحظة التقييم:' : 'Evaluation Note:'}
                                  </span>
                                  {detail.note}
                                </div>
                              )}
                            </div>

                            {/* Ideal answer */}
                            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/10 space-y-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                {t('candidates.idealAnswer')}
                              </span>

                              {isChoice ? (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {detail.correct_options &&
                                    detail.correct_options.map((opt) => (
                                      <span
                                        key={opt.id}
                                        className="inline-flex px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg"
                                      >
                                        {opt.option_text}
                                      </span>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                                  {detail.ideal_answer || '—'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
