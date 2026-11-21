import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StepBar from '@/features/employees/components/form/StepBar';
import { usePublicPositions } from '@/features/applicants/hooks/usePublicLookups';
import { useCandidatesQuery } from '@/features/candidates/hooks/useCandidatesQueries';
import { useAuthStore } from '@/services/auth/auth.store';
import { usePublicQuestionsFormQuery, useSubmitCandidateAnswersMutation } from '../hooks/useJobsQueries';
import { toast } from 'sonner';

export default function PublicQuestionsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };


  const { positionId: positionIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company_id') || '';
  const candidateIdFromUrl = searchParams.get('candidate_id') || '';
  const positionIdFromUrl = useMemo(() => {
    return positionIdParam || searchParams.get('position_id') || '';
  }, [positionIdParam, searchParams]);

  const [selectedPositionId, setSelectedPositionId] = useState(positionIdFromUrl || '');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  const positionId = useMemo(() => selectedPositionId || positionIdFromUrl || '', [selectedPositionId, positionIdFromUrl]);
  const companyId = useMemo(() => companyIdFromUrl || '1', [companyIdFromUrl]);
  const candidateId = useMemo(() => candidateIdFromUrl || selectedCandidateId || '', [candidateIdFromUrl, selectedCandidateId]);

  useEffect(() => {
    if (companyIdFromUrl) return;
    const next = new URLSearchParams(searchParams);
    next.set('company_id', '');
    navigate({ pathname: window.location.pathname, search: next.toString() }, { replace: true });
  }, [companyIdFromUrl, navigate, searchParams]);

  const { data: positionsRaw, isLoading: isPositionsLoading } = usePublicPositions(companyId);
  const positions = useMemo(() => {
    if (Array.isArray(positionsRaw)) return positionsRaw;
    if (positionsRaw && Array.isArray(positionsRaw.data)) return positionsRaw.data;
    return [];
  }, [positionsRaw]);

  const { data: candidatesRes, isLoading: isCandidatesLoading } = useCandidatesQuery(
    {
      page: 1,
      limit: 200,
      keyword: '',
      position_id: positionId || 'all',
      status: 'all',
    },
    { enabled: isAuthenticated }
  );

  const candidatesList = useMemo(() => candidatesRes?.data || [], [candidatesRes]);

  const { data, isLoading, isError } = usePublicQuestionsFormQuery(positionId, companyId);
  const submitMutation = useSubmitCandidateAnswersMutation(positionId, companyId);

  const sections = useMemo(() => data?.data || [], [data]);
  const steps = useMemo(() => sections.map((s) => s.section_name || `Section ${s.section_id}`), [sections]);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const safeCurrentStep = useMemo(() => {
    if (!steps.length) return 1;
    return Math.min(Math.max(currentStep, 1), steps.length);
  }, [currentStep, steps.length]);

  const activeSection = useMemo(() => {
    if (!sections.length) return null;
    return sections[safeCurrentStep - 1] || null;
  }, [sections, safeCurrentStep]);

  const activeQuestions = activeSection?.questions || [];

  const updateEssay = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: { type: 'essay', value: value ?? '' },
    }));
  };

  const getPositionName = (pos) => {
  if (isRTL) {
    return (
      pos.title_ar ||
      pos.name_ar ||
      pos.title_en ||
      pos.name_en ||
      pos.title ||
      pos.position_name ||
      `#${pos.id}`
    );
  }

  return (
    pos.title_en ||
    pos.name_en ||
    pos.title_ar ||
    pos.name_ar ||
    pos.title ||
    pos.position_name ||
    `#${pos.id}`
  );
};
  const updateSingleChoice = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: { type: 'single_choice', value: optionId ? Number(optionId) : null },
    }));
  };

  const toggleMultiChoice = (questionId, optionId, checked) => {
    setAnswers((prev) => {
      const key = String(questionId);
      const prevArr = Array.isArray(prev?.[key]?.value) ? prev[key].value : [];
      const nextArr = checked
        ? Array.from(new Set([...prevArr, Number(optionId)]))
        : prevArr.filter((id) => Number(id) !== Number(optionId));

      return {
        ...prev,
        [key]: { type: 'multi_choice', value: nextArr },
      };
    });
  };

  const handleNext = () => {
    if (safeCurrentStep < steps.length) setCurrentStep((p) => p + 1);
  };

  const handleBack = () => {
    if (safeCurrentStep > 1) setCurrentStep((p) => p - 1);
  };

  const buildSubmitPayload = () => {
    const list = [];

    sections.forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        const stored = answers?.[String(q.id)];
        if (!stored) return;

        if (stored.type === 'essay') {
          const text = String(stored.value ?? '').trim();
          if (!text) return;
          list.push({ question_id: q.id, essay_answer: text });
          return;
        }

        if (stored.type === 'single_choice') {
          if (!stored.value) return;
          list.push({ question_id: q.id, selected_options: [Number(stored.value)] });
          return;
        }

        if (stored.type === 'multi_choice') {
          const arr = Array.isArray(stored.value) ? stored.value : [];
          if (!arr.length) return;
          list.push({ question_id: q.id, selected_options: arr.map(Number) });
        }
      });
    });

    return {
      name: String(name || '').trim(),
      email: String(email || '').trim(),
      company_id: Number(companyId),
      answers: list,
    };
  };

  const handleSubmit = async () => {
    try {
      const safeName = String(name || '').trim();
      const safeEmail = String(email || '').trim();

      if (!safeName) {
        toast.error(t('publicQuestions.validation.nameRequired'));
        return;
      }

      if (!safeEmail || !safeEmail.includes('@')) {
        toast.error(t('publicQuestions.validation.invalidEmail'));
        return;
      }

      const payload = buildSubmitPayload();
      if (!payload.answers.length) {
        toast.error(t('publicQuestions.validation.answerRequired'));
        return;
      }

      const res = await submitMutation.mutateAsync(payload);
      const successMessage = res?.message || t('publicQuestions.submitted');
      toast.success(successMessage);
      setSubmittedMessage(successMessage);
      setIsSubmitted(true);
      setAnswers({});
      setCurrentStep(1);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        t('publicQuestions.submitFailed');
      toast.error(msg);
    }
  };

return (
  <div
    dir={isRTL ? 'rtl' : 'ltr'}
    className={`min-h-screen bg-slate-100 ${
      isRTL ? 'text-right' : 'text-left'
    }`}
  >
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {isSubmitted ? (
          <div className="space-y-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <img
                src="/nizam-logo.svg"
                alt="Nizam"
                className="h-20 w-auto object-contain p-2 "
              />
              <Button type="button" variant="outline" onClick={toggleLanguage} className="shrink-0">
                {isRTL ? 'EN' : 'AR'}
              </Button>
            </div>

            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-500 text-emerald-500">
                  <Check className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-3xl font-bold text-slate-900">
                  {t('publicQuestions.success.title')}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-8 text-slate-500">
                  {t('publicQuestions.success.message')}
                </p>
                {submittedMessage && (
                  <p className="mt-3 text-sm text-slate-400">{submittedMessage}</p>
                )}
              </div>

              <div className="mx-auto mt-10 max-w-2xl   bg-emerald-50/60 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-md bg-white text-success">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {t('publicQuestions.success.nextTitle')}
                    </h3>
                    <p className="mt-2 text-lg leading-8 text-slate-500">
                      {t('publicQuestions.success.nextMessage')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
       <div
  className={`rounded-2xl border bg-white p-4 sm:p-6 ${
    isRTL ? 'text-right' : 'text-left'
  }`}
>
  
          <div className="mb-4 flex items-center justify-between gap-4">
            <img src="/nizam-logo.svg" alt="Nizam" className="h-14 w-auto object-contain" />
            <Button type="button" variant="outline" onClick={toggleLanguage} className="shrink-0">
              {isRTL ? 'EN' : 'AR'}
            </Button>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">{t('publicQuestions.title')}</h1>
            <p className="text-sm text-slate-500">
              {t('publicQuestions.subtitle')}
            </p>
          </div>

          <div className="mt-5">
            <StepBar
              currentStep={safeCurrentStep}
              steps={steps.length ? steps : [t('publicQuestions.title')]}
              allowAll={true}
              onStepChange={(s) => setCurrentStep(s)}
            />
          </div>

          <div className="mt-6 space-y-6">
            {!positionId && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-800">
                  {t('publicQuestions.selectPositionTitle')}
                </div>
                <div className="mt-3 max-w-md">
                  <Select
                    value={selectedPositionId}
                    onValueChange={(v) => {
                      setSelectedPositionId(v);
                      setSelectedCandidateId('');
                      const next = new URLSearchParams(searchParams);
                      navigate({ pathname: `/public/questions/${v}`, search: next.toString() });
                    }}
                    disabled={isPositionsLoading}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue
                        placeholder={
                          isPositionsLoading
                            ? t('publicQuestions.loading')
                            : t('publicQuestions.selectPositionPlaceholder')
                        }
                      />
                    </SelectTrigger>
<SelectContent>
  {positions.map((pos) => (
    <SelectItem
      key={pos.id}
      value={String(pos.id)}
    >
      {getPositionName(pos)}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {positionId && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-800">
                  {t('publicQuestions.applicantInfoTitle')}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="public-q-name">{t('publicQuestions.name')}</Label>
                    <Input
                      id="public-q-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="public-q-email">{t('publicQuestions.email')}</Label>
                    <Input
                      id="public-q-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {positionId && isAuthenticated && candidatesList.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-800">
                  {t('publicQuestions.selectCandidateTitle')}
                </div>
                <div className="mt-3 max-w-md">
                  <Select
                    value={selectedCandidateId}
                    onValueChange={(v) => {
                      setSelectedCandidateId(v);
                      const picked = candidatesList.find((c) => String(c.id) === String(v));
                      if (picked) {
                        setName(picked.name || '');
                        setEmail(picked.email || '');
                      }
                    }}
                    disabled={isCandidatesLoading}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue
                        placeholder={
                          isCandidatesLoading
                            ? t('publicQuestions.loading')
                            : t('publicQuestions.selectCandidatePlaceholder')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {candidatesList.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name || c.email || `#${c.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {positionId && isLoading && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {t('publicQuestions.loading')}
              </div>
            )}

            {positionId && isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {t('publicQuestions.loadError')}
              </div>
            )}

            {positionId && !isLoading && !isError && steps.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {t('publicQuestions.noQuestions')}
              </div>
            )}

            {positionId && !isLoading && !isError && activeSection && (
              <div className="space-y-6">
                {activeQuestions.map((q, idx) => {
                  const qKey = String(q.id);
                  const typeLabel = t(`publicQuestions.type.${q.type}`);
                  const isEssay = q.type === 'essay';
                  const isMulti = q.type === 'multi_choice';
                  const isSingle = q.type === 'single_choice';

                  const stored = answers?.[qKey];
                  const essayValue = stored?.type === 'essay' ? stored.value : '';
                  const singleValue = stored?.type === 'single_choice' ? String(stored.value ?? '') : '';
                  const multiValue = stored?.type === 'multi_choice' ? stored.value : [];

                  return (
                    <div key={q.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {t('publicQuestions.question', { index: idx + 1 })}
                          </h2>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {typeLabel}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900">{q.question}</p>
                      </div>

                      <div className="mt-4">
                        {isEssay && (
                          <Textarea
                            value={essayValue}
                            onChange={(e) => updateEssay(q.id, e.target.value)}
                            rows={4}
                          />
                        )}

                        {isSingle && (
                          <RadioGroup value={singleValue} onValueChange={(v) => updateSingleChoice(q.id, v)}>
                            {(q.options || []).map((opt) => {
                              const id = `q-${q.id}-opt-${opt.id}`;
                              return (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <RadioGroupItem id={id} value={String(opt.id)} />
                                  <Label htmlFor={id} className="text-sm text-slate-800">
                                    {opt.option_text}
                                  </Label>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        )}

                        {isMulti && (
                          <div className="grid gap-2">
                            {(q.options || []).map((opt) => {
                              const id = `q-${q.id}-opt-${opt.id}`;
                              const checked = Array.isArray(multiValue)
                                ? multiValue.some((v) => Number(v) === Number(opt.id))
                                : false;

                              return (
                                <div key={opt.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={id}
                                    checked={checked}
                                    onCheckedChange={(val) =>
                                      toggleMultiChoice(q.id, opt.id, val === true)
                                    }
                                  />
                                  <Label htmlFor={id} className="text-sm text-slate-800">
                                    {opt.option_text}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between gap-3">
                  <div>
                    {safeCurrentStep > 1 && (
                      <Button type="button" variant="outline" onClick={handleBack}>
                        {t('publicQuestions.buttons.back')}
                      </Button>
                    )}
                  </div>

                  <div className="ms-auto">
                    {safeCurrentStep < steps.length ? (
                      <Button type="button" onClick={handleNext}>
                        {t('publicQuestions.buttons.next')}
                      </Button>
                    ) : (
                      <Button type="button" onClick={handleSubmit} disabled={submitMutation.isPending}>
                        {t('publicQuestions.buttons.submit')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
