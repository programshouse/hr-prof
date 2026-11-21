import { useTranslation } from 'react-i18next';
import { Plus, MousePointerClick, CircleHelp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyInterviewState({ onAddSection, onAddQuestion }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {/* Sections Card */}
      <div className="flex min-h-[610px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
        <h2 className="text-sm font-bold text-slate-900">{t('jobs.emptySectionsTitle')}</h2>

        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-[220px] sm:h-[327px] w-full max-w-[327px] items-center justify-center rounded-full bg-indigo-100/70">
            <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm">
              <MousePointerClick className="text-primary h-20 sm:h-24 w-20 sm:w-24" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <Button
          onClick={onAddSection}
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/5 mt-auto h-10 w-full rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('jobs.addNewSection')}
        </Button>
      </div>

      {/* Questions Card */}
      <div className="flex min-h-[610px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-8">
        <h2 className="text-sm font-bold text-slate-900">{t('jobs.emptyQuestionsTitle')}</h2>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-12 h-[180px] sm:h-[260px] w-full max-w-[430px] rounded-3xl bg-indigo-100/70">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={[
                  'absolute flex items-center rounded-lg border border-slate-100 bg-white px-3 shadow-md sm:px-4 sm:h-[72px] h-[60px]',
                  item === 0 && 'top-2 sm:top-8 left-1 sm:left-[-38px] w-[200px] sm:w-[310px]',
                  item === 1 && 'top-[70px] sm:top-[115px] right-1 sm:right-[-60px] w-[210px] sm:w-[315px]',
                  item === 2 && 'bottom-2 sm:bottom-8 left-1 sm:left-[-38px] w-[200px] sm:w-[310px]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="bg-primary mr-3 sm:mr-4 flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-md text-white">
                  <CircleHelp className="h-5 sm:h-7 w-5 sm:w-7" />
                </div>

                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="h-2.5 sm:h-3 w-16 sm:w-24 rounded-full bg-indigo-100" />
                  <div className="h-2.5 sm:h-3 w-24 sm:w-36 rounded-full bg-indigo-100" />
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-bold text-slate-900">
            {t('jobs.emptyStartAddingQuestion')}
          </h3>

          <p className="mt-2 text-xs text-slate-500">{t('jobs.emptyQuestionDescription')}</p>
        </div>

        <Button
          onClick={onAddQuestion}
          className="bg-primary hover:bg-primary/90 mx-auto mt-auto h-10 w-full max-w-[360px] rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('jobs.addNewQuestion')}
        </Button>
      </div>
    </div>
  );
}