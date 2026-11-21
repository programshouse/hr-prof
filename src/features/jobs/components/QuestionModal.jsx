import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

const optionSchema = z.object({
  id: z.any().optional(),
  option_text_en: z.string().max(50, 'Max 50 characters'),
  option_text_ar: z.string().max(50, 'Max 50 characters'),
  is_correct: z.boolean().default(false),
});

const questionSchema = z.object({
  type: z.enum(['single_choice', 'multi_choice', 'essay']),
  question_en: z.string().min(1, 'English question text is required').max(180, 'Max 180 characters'),
  question_ar: z.string().min(1, 'Arabic question text is required').max(180, 'Max 180 characters'),
  weight: z.coerce.number().min(1, 'Weight must be at least 1').default(1),
  ideal_answer_en: z.string().optional(),
  ideal_answer_ar: z.string().optional(),
  options: z.array(optionSchema).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'essay') {
    if (!data.ideal_answer_en || !data.ideal_answer_en.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'English ideal answer is required',
        path: ['ideal_answer_en'],
      });
    }
    if (!data.ideal_answer_ar || !data.ideal_answer_ar.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Arabic ideal answer is required',
        path: ['ideal_answer_ar'],
      });
    }
  } else {
    // single or multi choice
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least 2 answer options are required',
        path: ['options'],
      });
      return;
    }

    // Validate that each option text is not empty for choice questions
    data.options.forEach((opt, idx) => {
      if (!opt.option_text_en || !opt.option_text_en.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'English option text is required',
          path: ['options', idx, 'option_text_en'],
        });
      }
      if (!opt.option_text_ar || !opt.option_text_ar.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Arabic option text is required',
          path: ['options', idx, 'option_text_ar'],
        });
      }
    });

    const correctCount = data.options.filter((o) => o.is_correct).length;
    if (data.type === 'single_choice') {
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Exactly one correct answer must be selected',
          path: ['options'],
        });
      }
    } else if (data.type === 'multi_choice') {
      if (correctCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select at least one correct answer',
          path: ['options'],
        });
      }
    }
  }
});

export default function QuestionModal({
  open,
  onOpenChange,
  sectionId,
  question = null,
  onSubmitQuestion,
  isLoading = false,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeLang, setActiveLang] = useState(null); // null | 'en' | 'ar'

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'single_choice',
      question_en: '',
      question_ar: '',
      weight: 1,
      ideal_answer_en: '',
      ideal_answer_ar: '',
      options: [
        { option_text_en: '', option_text_ar: '', is_correct: true },
        { option_text_en: '', option_text_ar: '', is_correct: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const questionType = watch('type');
  const questionEnText = watch('question_en') || '';
  const questionArText = watch('question_ar') || '';
  const idealAnswerEnText = watch('ideal_answer_en') || '';
  const idealAnswerArText = watch('ideal_answer_ar') || '';
  const optionsValues = watch('options') || [];

  // Reset or fill form on open/change
  useEffect(() => {
    if (open) {
      if (question) {
        const mappedOptions = (question.options || []).map((o) => ({
          id: o.id,
          option_text_en: o.option_text_en || '',
          option_text_ar: o.option_text_ar || '',
          is_correct: o.is_correct === true || o.is_correct === 1,
        }));

        reset({
          type: question.type || 'single_choice',
          question_en: question.question_en || '',
          question_ar: question.question_ar || '',
          weight: question.weight || 1,
          ideal_answer_en: question.ideal_answer_en || '',
          ideal_answer_ar: question.ideal_answer_ar || '',
          options: mappedOptions.length > 0 ? mappedOptions : [
            { option_text_en: '', option_text_ar: '', is_correct: true },
            { option_text_en: '', option_text_ar: '', is_correct: false },
          ],
        });
      } else {
        reset({
          type: 'single_choice',
          question_en: '',
          question_ar: '',
          weight: 1,
          ideal_answer_en: '',
          ideal_answer_ar: '',
          options: [
            { option_text_en: '', option_text_ar: '', is_correct: true },
            { option_text_en: '', option_text_ar: '', is_correct: false },
          ],
        });
      }
    }
  }, [open, question, reset]);

  const onFormSubmit = (values) => {
    const payload = {
      section_id: Number(sectionId),
      type: values.type,
      question_en: values.question_en,
      question_ar: values.question_ar,
      weight: Number(values.weight),
    };

    if (values.type === 'essay') {
      payload.ideal_answer_en = values.ideal_answer_en;
      payload.ideal_answer_ar = values.ideal_answer_ar;
      payload.options = [];
    } else {
      payload.ideal_answer_en = null;
      payload.ideal_answer_ar = null;
      payload.options = values.options.map((opt) => ({
        ...(opt.id ? { id: opt.id } : {}),
        option_text_en: opt.option_text_en,
        option_text_ar: opt.option_text_ar,
        is_correct: opt.is_correct,
      }));
    }

    onSubmitQuestion(payload);
  };

  const handleCorrectToggle = (index, val) => {
    if (questionType === 'single_choice') {
      // Set toggled index to correct, all others to false
      const updated = optionsValues.map((opt, i) => ({
        ...opt,
        is_correct: i === index ? val : false,
      }));
      setValue('options', updated, { shouldValidate: true });
    } else {
      setValue(`options.${index}.is_correct`, val, { shouldValidate: true });
    }
  };

  const handleAddOption = () => {
    append({ option_text_en: '', option_text_ar: '', is_correct: false });
  };

  // Convert internal type string to UI title
  const getUiType = (type) => {
    switch (type) {
      case 'single_choice':
        return 'Choice';
      case 'multi_choice':
        return 'Multi Select';
      case 'essay':
        return 'Text Area';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {question ? t('jobs.editQuestion', 'Edit Question') : t('jobs.addNewQuestion', 'Add New Question')}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveLang((s) => (s === 'en' ? null : 'en'))}
              className={`h-8 px-3 rounded-md text-sm font-medium ${activeLang === 'en' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => setActiveLang((s) => (s === 'ar' ? null : 'ar'))}
              className={`h-8 px-3 rounded-md text-sm font-medium ${activeLang === 'ar' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
            >
              AR
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 space-y-5">
          {/* Question Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {t('jobs.questionType', 'Question Type')}
            </Label>
            <Select
              value={questionType}
              onValueChange={(val) => {
                setValue('type', val, { shouldValidate: true });
                // Reset options to default values when changing types to prevent state mismatch
                if (val !== 'essay' && optionsValues.length === 0) {
                  setValue('options', [
                    { option_text_en: '', option_text_ar: '', is_correct: true },
                    { option_text_en: '', option_text_ar: '', is_correct: false },
                  ]);
                }
              }}
            >
              <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                <SelectValue placeholder={t('jobs.selectQuestionType', 'Select Type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">{t('jobs.choiceType', 'Choice')}</SelectItem>
                <SelectItem value="multi_choice">{t('jobs.multiSelectType', 'Multi Select')}</SelectItem>
                <SelectItem value="essay">{t('jobs.textAreaType', 'Text Area')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Title/Content */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-slate-700">
              {t('jobs.enterQuestion', 'Enter Your Question')}
            </Label>
            
            {/* English Question */}
            {activeLang !== 'ar' && (
              <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">English</span>
                <span className="text-xs text-slate-400 font-medium">
                  {questionEnText.length}/180
                </span>
              </div>
              <Textarea
                {...register('question_en')}
                placeholder="Enter question content in English..."
                className="min-h-[80px] rounded-lg border-slate-200 resize-none pr-3"
                maxLength={180}
              />
              {errors.question_en && (
                <p className="text-xs text-red-500">{errors.question_en.message}</p>
              )}
              </div>
            )}

            {/* Arabic Question */}
            {activeLang !== 'en' && (
              <div className="space-y-2" dir="rtl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">العربية (Arabic)</span>
                <span className="text-xs text-slate-400 font-medium">
                  {questionArText.length}/180
                </span>
              </div>
              <Textarea
                {...register('question_ar')}
                placeholder="أدخل نص السؤال بالعربية..."
                className="min-h-[80px] rounded-lg border-slate-200 resize-none pl-3 text-right"
                maxLength={180}
                dir="rtl"
              />
              {errors.question_ar && (
                <p className="text-xs text-red-500 text-right">{errors.question_ar.message}</p>
              )}
              </div>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              {t('jobs.questionWeight', 'Weight (Score)')}
            </Label>
            <Input
              type="number"
              {...register('weight')}
              className="h-11 rounded-lg border-slate-200"
            />
            {errors.weight && (
              <p className="text-xs text-red-500">{errors.weight.message}</p>
            )}
          </div>

          {/* Ideal Answer for Text Area / Essay type */}
          {questionType === 'essay' && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-semibold text-slate-700">
                {t('jobs.answerIdeal', 'Answer Criteria / Ideal Answer')}
              </Label>

              {/* English Ideal Answer */}
              {activeLang !== 'ar' && (
                <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">English</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {idealAnswerEnText.length}/180
                  </span>
                </div>
                <Textarea
                  {...register('ideal_answer_en')}
                  placeholder="Enter the ideal answer criteria in English..."
                  className="min-h-[90px] rounded-lg border-slate-200 resize-none pr-3"
                  maxLength={180}
                />
                {errors.ideal_answer_en && (
                  <p className="text-xs text-red-500">{errors.ideal_answer_en.message}</p>
                )}
                </div>
              )}

              {/* Arabic Ideal Answer */}
              {activeLang !== 'en' && (
                <div className="space-y-2" dir="rtl">
                <div className="flex items-center justify-between" dir="ltr">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">العربية (Arabic)</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {idealAnswerArText.length}/180
                  </span>
                </div>
                <Textarea
                  {...register('ideal_answer_ar')}
                  placeholder="أدخل معايير الإجابة النموذجية بالعربية..."
                  className="min-h-[90px] rounded-lg border-slate-200 resize-none pl-3 text-right"
                  maxLength={180}
                  dir="rtl"
                />
                {errors.ideal_answer_ar && (
                  <p className="text-xs text-red-500 text-right">{errors.ideal_answer_ar.message}</p>
                )}
                </div>
              )}
            </div>
          )}

          {/* Answer Options for single/multi choice */}
          {questionType !== 'essay' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">
                {t('jobs.answerOptions', 'Add answer options')}
              </Label>

              <div className="space-y-3.5">
                {fields.map((field, index) => {
                  const optVal = optionsValues[index] || {};
                  const optTextEn = optVal.option_text_en || '';
                  const optTextAr = optVal.option_text_ar || '';
                  const isCorrect = optVal.is_correct || false;

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      {/* Top Header of the Option Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500 shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-xs font-bold text-slate-600">{t('jobs.option', 'Option')} #{index + 1}</span>
                        </div>

                        {/* Right side: Correct switch/radio & Delete */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 shrink-0">
                            {questionType === 'single_choice' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                                  {isCorrect ? t('jobs.correct', 'Correct') : t('jobs.wrong', 'Incorrect')}
                                </span>
                                <input
                                  type="radio"
                                  name="correct-option-radio"
                                  checked={isCorrect}
                                  onChange={(e) => handleCorrectToggle(index, e.target.checked)}
                                  className="size-5 accent-primary cursor-pointer"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                                  {isCorrect ? t('jobs.correct', 'Correct') : t('jobs.wrong', 'Incorrect')}
                                </span>
                                <Switch
                                  checked={isCorrect}
                                  onCheckedChange={(checked) => handleCorrectToggle(index, checked)}
                                  className="data-[state=checked]:bg-emerald-500"
                                />
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 size-8 rounded-md shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Inputs Row or Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* English Option Input */}
                        <div className="relative">
                          <Input
                            value={optTextEn}
                            onChange={(e) => {
                              setValue(`options.${index}.option_text_en`, e.target.value.slice(0, 50), { shouldValidate: true });
                            }}
                            placeholder="English option..."
                            className={`h-10 rounded-md pr-12 bg-white transition-colors duration-200 text-xs ${
                              errors.options?.[index]?.option_text_en
                                ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500'
                                : 'border-slate-200'
                            }`}
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 bg-white/80 px-1">
                            {optTextEn.length}/50
                          </span>
                        </div>

                        {/* Arabic Option Input */}
                        <div className="relative" dir="rtl">
                          <Input
                            value={optTextAr}
                            onChange={(e) => {
                              setValue(`options.${index}.option_text_ar`, e.target.value.slice(0, 50), { shouldValidate: true });
                            }}
                            placeholder="الخيار بالعربية..."
                            className={`h-10 rounded-md pl-12 bg-white transition-colors duration-200 text-xs text-right ${
                              errors.options?.[index]?.option_text_ar
                                ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500'
                                : 'border-slate-200'
                            }`}
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 bg-white/80 px-1" dir="ltr">
                            {optTextAr.length}/50
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.options && (
                <p className="text-xs text-red-500 pl-1">{errors.options.root?.message || errors.options.message}</p>
              )}

              {/* Add Option Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className="w-full h-11 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:text-primary/90 flex items-center justify-center gap-2 rounded-lg mt-1 font-semibold"
              >
                <Plus className="size-4" />
                {t('jobs.addAnotherAnswer', 'Add Another Answer')}
              </Button>
            </div>
          )}

          <DialogFooter className="flex flex-row items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200"
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 px-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition"
            >
              {isLoading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
