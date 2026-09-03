import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="display text-[30px] leading-[1.1] font-semibold">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-ink-2">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  meta,
  action,
  tone = "default",
}: {
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "urgent";
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className={`flex items-baseline gap-2 text-[15px] font-medium ${tone === "urgent" ? "text-urgent" : ""}`}>
        {title}
        {meta && <span className="tnum text-[13px] font-normal text-ink-3">{meta}</span>}
      </h2>
      {action}
    </div>
  );
}
