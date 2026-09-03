import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/PageHeader";
import { TaskList } from "@/components/TaskRow";
import { Timeline } from "@/components/Timeline";
import { getPartner, requireUser } from "@/lib/auth";
import { daysUntil, todayISO } from "@/lib/dates";
import { getRecentlyCompleted, getTasks } from "@/lib/queries";

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(
      new Date(),
    ),
  );
  if (hour < 5) return "Noch wach";
  if (hour < 11) return "Guten Morgen";
  if (hour < 17) return "Hallo";
  return "Guten Abend";
}

function summary(overdue: number, week: number, open: number) {
  if (open === 0) return "Es liegt nichts an. Lege die erste Aufgabe an.";
  const parts: string[] = [];
  if (overdue > 0) {
    parts.push(overdue === 1 ? "eine Aufgabe ist überfällig" : `${overdue} Aufgaben sind überfällig`);
  }
  if (week > 0) {
    parts.push(
      week === 1
        ? "eine ist in den nächsten sieben Tagen fällig"
        : `${week} sind in den nächsten sieben Tagen fällig`,
    );
  }
  if (parts.length === 0) {
    return `Nichts ist dringend. ${open === 1 ? "Eine offene Aufgabe" : `${open} offene Aufgaben`} insgesamt.`;
  }
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

export default async function OverviewPage() {
  const me = await requireUser();
  const [partner, all, recent] = await Promise.all([getPartner(me), getTasks(), getRecentlyCompleted(4)]);
  const today = todayISO();

  const open = all.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => daysUntil(t.dueDate, today) < 0);
  const week = open.filter((t) => {
    const d = daysUntil(t.dueDate, today);
    return d >= 0 && d <= 7;
  });
  const mine = open.filter((t) => t.assigneeId === me.id);
  const theirs = partner ? open.filter((t) => t.assigneeId === partner.id) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-[30px] leading-[1.1] font-semibold">
          {greeting()}, {me.name}.
        </h1>
        <p className="mt-1.5 text-ink-2">{summary(overdue.length, week.length, open.length)}</p>
      </div>

      {open.length === 0 ? (
        <EmptyState
          title="Noch keine Aufgaben"
          hint="Fang mit der Sache an, die als Nächstes wirklich fertig sein muss."
          action={
            <Link href="/aufgaben/neu" className="btn-primary">
              Erste Aufgabe anlegen
            </Link>
          }
        />
      ) : (
        <>
          <Timeline tasks={open} today={today} days={14} className="xl:hidden" />
          <Timeline tasks={open} today={today} days={28} className="hidden xl:block" />
        </>
      )}

      {overdue.length > 0 && (
        <section>
          <SectionHeader title="Überfällig" meta={overdue.length} tone="urgent" />
          <TaskList tasks={overdue} today={today} />
        </section>
      )}

      {open.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="min-w-0">
            <SectionHeader
              title="Deine Aufgaben"
              meta={mine.length}
              action={
                <Link href={`/aufgaben?wer=${me.id}`} className="text-[13px] text-ink-3 hover:text-ink">
                  Alle anzeigen
                </Link>
              }
            />
            {mine.length === 0 ? (
              <EmptyState title="Nichts offen bei dir" />
            ) : (
              <TaskList tasks={mine.slice(0, 6)} today={today} compact />
            )}
          </section>
          {partner && (
            <section className="min-w-0">
              <SectionHeader
                title={`Bei ${partner.name}`}
                meta={theirs.length}
                action={
                  <Link href={`/aufgaben?wer=${partner.id}`} className="text-[13px] text-ink-3 hover:text-ink">
                    Alle anzeigen
                  </Link>
                }
              />
              {theirs.length === 0 ? (
                <EmptyState title={`Nichts offen bei ${partner.name}`} />
              ) : (
                <TaskList tasks={theirs.slice(0, 6)} today={today} compact />
              )}
            </section>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <section>
          <SectionHeader
            title="Zuletzt erledigt"
            action={
              <Link href="/aufgaben?status=erledigt" className="text-[13px] text-ink-3 hover:text-ink">
                Alle anzeigen
              </Link>
            }
          />
          <TaskList tasks={recent} today={today} />
        </section>
      )}
    </div>
  );
}
