'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  label: string;
  shortLabel: string;
  available: boolean;
}

interface WizardShellProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  nextLabel?: string;
  children: React.ReactNode;
}

export function WizardShell({
  steps,
  currentStep,
  onStepClick,
  onBack,
  onNext,
  canGoNext,
  nextLabel,
  children,
}: WizardShellProps) {
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-53px)]">
      {/* Progress Bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {steps.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              const isClickable = step.available && i <= currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  {/* Step indicator */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(i)}
                    disabled={!isClickable}
                    className={cn(
                      'flex items-center gap-2 transition-all duration-200',
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0',
                      isCompleted
                        ? 'bg-[var(--accent)] text-white'
                        : isCurrent
                          ? 'bg-[var(--accent)] text-white ring-4 ring-[var(--accent)]/15'
                          : step.available
                            ? 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] opacity-40'
                    )}>
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={cn(
                      'text-xs font-medium hidden sm:block transition-colors',
                      isCurrent
                        ? 'text-[var(--text-primary)]'
                        : isCompleted
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--text-muted)]'
                    )}>
                      <span className="hidden md:inline">{step.label}</span>
                      <span className="md:hidden">{step.shortLabel}</span>
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-3 h-px bg-[var(--border)]">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-300"
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={currentStep === 0}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              currentStep === 0
                ? 'text-[var(--text-muted)] cursor-not-allowed'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            Zurück
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className={cn(
              'px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              canGoNext
                ? 'bg-gradient-to-r from-[var(--accent)] to-purple-500 text-white hover:brightness-110 active:scale-[0.98] shadow-md shadow-[var(--accent)]/20'
                : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
            )}
          >
            {nextLabel || (isLastStep ? 'Herunterladen' : 'Weiter')}
          </button>
        </div>
      </div>
    </div>
  );
}
