import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[12rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
  selected,
}: BentoCardProps) {
  const content = (
    <>
      {background && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
          {background}
        </div>
      )}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-[var(--text-secondary)] transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          {name}
        </h3>
        <p className="max-w-lg text-[var(--text-secondary)]">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        {cta && (
          <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">
            {selected ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Ausgewählt
              </>
            ) : (
              cta
            )}
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-[var(--bg-hover)]/50" />

      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 z-20">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </>
  );

  const baseClassName = cn(
    "group relative col-span-1 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl",
    // Base styles
    "bg-[var(--bg-card)] border border-[var(--border)]",
    // Hover styles
    "hover:border-[var(--border-hover)] hover:shadow-lg",
    // Shadow
    "shadow-[var(--shadow-sm)]",
    // Selected state
    selected && "ring-2 ring-[var(--accent)] border-[var(--accent)]",
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClassName}>
        {content}
      </a>
    );
  }

  return (
    <div onClick={onClick} className={baseClassName} role="button" tabIndex={0}>
      {content}
    </div>
  );
}
