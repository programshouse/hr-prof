import React from 'react';
import { useTranslation } from 'react-i18next';

const DEFAULT_STEPS = [
  'Personal Information',
  'Role & Availability',
  'Experience',
  'Education',
  'Skills & Links',
  'Attachment',
  'Consents',
  'Done',
  'Salary Details',
];

export default function StepBar({
  currentStep,
  onStepChange,
  steps = DEFAULT_STEPS,
  allowAll = false,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const totalSteps = steps.length;

  const clampStep = (value) => {
    if (totalSteps === 0) return 1;
    return Math.min(Math.max(value ?? 1, 1), totalSteps);
  };

  const safeCurrent = clampStep(currentStep);
  const [maxStepReached, setMaxStepReached] = React.useState(safeCurrent);

  React.useEffect(() => {
    setMaxStepReached(safeCurrent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowAll]);

  React.useEffect(() => {
    if (allowAll) return;
    setMaxStepReached((prev) => Math.max(prev, safeCurrent));
  }, [safeCurrent, allowAll]);

  const safeMax = allowAll ? totalSteps : clampStep(maxStepReached);
  const progress = totalSteps > 1 ? ((safeCurrent - 1) / (totalSteps - 1)) * 100 : 0;

  const handleClick = (stepNumber) => {
    if (!allowAll && stepNumber > safeMax) return;
    onStepChange?.(stepNumber);
  };

  const currentLabel = steps[safeCurrent - 1];

  return (
    <>
      <div className="mb-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700 md:hidden">
        <span className="font-semibold">
          {t('employees.form.stepOf', { current: safeCurrent, total: totalSteps })}
        </span>
        {currentLabel && (
          <span className="max-w-[60%] truncate text-[11px] text-slate-500">{currentLabel}</span>
        )}
      </div>

      <div className="hidden w-full md:block">
        <div className="relative flex items-center justify-between px-2 lg:px-4">
          <div className="pointer-events-none absolute top-1/2 right-2 left-2 h-0.5 -translate-y-1/2 bg-slate-200 lg:right-4 lg:left-4" />

          <div
            className={[
              'bg-primary pointer-events-none absolute top-1/2 h-0.5 -translate-y-1/2 transition-all',
              isArabic ? 'right-2 lg:right-4' : 'left-2 lg:left-4',
            ].join(' ')}
            style={{ width: `calc(${progress}% - 8px)` }}
          />

          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === safeCurrent;
            const isVisited = allowAll ? true : stepNumber <= safeMax;
            const isLocked = allowAll ? false : stepNumber > safeMax;

            let circleClasses =
              'relative z-10 flex size-7 items-center justify-center rounded-full border text-[11px] font-medium transition-colors lg:size-8';

            if (isActive) {
              circleClasses += ' bg-primary text-white border-primary shadow-sm cursor-default';
            } else if (isVisited) {
              circleClasses += ' bg-white text-primary border-primary cursor-pointer';
            } else if (isLocked) {
              circleClasses += ' bg-white text-slate-500 border-slate-200 cursor-not-allowed opacity-60';
            }

            return (
              <div key={`${label}-${stepNumber}`} className="flex flex-1 justify-center px-4">
                <button
                  type="button"
                  className={circleClasses}
                  onClick={() => handleClick(stepNumber)}
                  disabled={isLocked}
                >
                  {stepNumber}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between px-2 lg:px-4">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isLocked = allowAll ? false : stepNumber > safeMax;

            return (
              <button
                key={`${label}-lbl-${stepNumber}`}
                type="button"
                onClick={() => handleClick(stepNumber)}
                disabled={isLocked}
                className={[
                  'flex-1 truncate px-1 text-center text-[10px] leading-snug transition-colors lg:px-3 lg:text-[11px]',
                  isLocked
                    ? 'cursor-not-allowed text-slate-500'
                    : 'hover:text-primary text-slate-700',
                ].join(' ')}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}