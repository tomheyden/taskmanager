import { parseISO } from "date-fns";
import Link from "next/link";
import type { TaskWithRelations } from "@/db/schema";
import { addDaysISO, daysUntil, formatDay, urgencyFor } from "@/lib/dates";
import { Avatar } from "./Avatar";

function ringFor(task: TaskWithRelations, today: string) {
  const urgency = urgencyFor(task.dueDate, task.status, today);
  if (urgency === "overdue" || urgency === "today") return "var(--color-urgent)";
  if (urgency === "soon") return "var(--color-soon)";
  return undefined;
}

function Marker({ task, today, size }: { task: TaskWithRelations; today: string; size: number }) {
  return (
    <Link
      href={`/aufgaben/${task.id}`}
      title={task.title}
      className="block rounded-full transition-transform hover:scale-110"
    >
      <Avatar name={task.assignee.name} color={task.assignee.color} size={size} ring={ringFor(task, today)} />
    </Link>
  );
}

export function Timeline({
  tasks,
  today,
  days: DAYS = 28,
  className = "",
}: {
  tasks: TaskWithRelations[];
  today: string;
  days?: 14 | 28;
  className?: string;
}) {
  const size = DAYS === 14 ? 20 : 24;
  const days = Array.from({ length: DAYS }, (_, i) => {
    const iso = addDaysISO(today, i);
    const date = parseISO(iso);
    const weekday = date.getDay();
    return { i, iso, number: date.getDate(), weekend: weekday === 0 || weekday === 6 };
  });
  const lastDay = days[days.length - 1];

  const overdue = tasks.filter((t) => daysUntil(t.dueDate, today) < 0).length;
  const later = tasks.filter((t) => daysUntil(t.dueDate, today) >= DAYS).length;
  const byDay = new Map<number, TaskWithRelations[]>();
  for (const task of tasks) {
    const d = daysUntil(task.dueDate, today);
    if (d >= 0 && d < DAYS) byDay.set(d, [...(byDay.get(d) ?? []), task]);
  }
  const inWindow = [...byDay.values()].reduce((n, list) => n + list.length, 0);
  const maxStack = Math.max(1, ...[...byDay.values()].map((list) => list.length));
  const columns = { gridTemplateColumns: `repeat(${DAYS}, minmax(0, 1fr))` };

  return (
    <section className={`panel overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-4 pb-3">
        <h2 className="text-[15px] font-medium">
          {DAYS === 14 ? "Die nächsten zwei Wochen" : "Die nächsten vier Wochen"}
        </h2>
        <p className="tnum text-[13px] text-ink-3">
          {inWindow === 1 ? "1 Stichtag" : `${inWindow} Stichtage`}
          {overdue > 0 && (
            <>
              {", "}
              <Link href="/aufgaben" className="text-urgent hover:underline">
                {overdue} überfällig
              </Link>
            </>
          )}
          {later > 0 && `, ${later} später`}
        </p>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        {/* Stichtage als Punkte, jeweils über ihrem Tag */}
        <div className="grid items-end" style={{ ...columns, minHeight: maxStack * (size + 2) + 10 }}>
          {days.map((d) => {
            const list = byDay.get(d.i) ?? [];
            return (
              <div key={d.iso} className="flex flex-col items-center justify-end gap-0.5">
                {list.map((task) => (
                  <Marker key={task.id} task={task} today={today} size={size} />
                ))}
                <span className={`w-px ${list.length ? "h-2.5 bg-line-strong" : "h-0"}`} />
              </div>
            );
          })}
        </div>

        {/* Kalenderleiste */}
        <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line" style={columns}>
          {days.map((d) => (
            <div
              key={d.iso}
              title={formatDay(d.iso, "long")}
              className={`tnum flex h-7 items-center justify-center text-[11px] leading-none ${
                d.i === 0
                  ? "bg-paper font-semibold text-[#111318]"
                  : d.weekend
                    ? "bg-surface text-ink-3"
                    : "bg-surface-2 text-ink-2"
              }`}
            >
              {d.number}
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex justify-between text-[11px] leading-none text-ink-3">
          <span>
            <span className="text-ink">Heute</span>, {formatDay(today)}
          </span>
          <span>{formatDay(lastDay.iso)}</span>
        </div>
      </div>
    </section>
  );
}
