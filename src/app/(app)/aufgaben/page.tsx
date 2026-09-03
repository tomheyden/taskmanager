import { Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader, SectionHeader } from "@/components/PageHeader";
import { TaskList } from "@/components/TaskRow";
import type { TaskWithRelations } from "@/db/schema";
import { getAllUsers, requireUser } from "@/lib/auth";
import { daysUntil, todayISO } from "@/lib/dates";
import { getProjects, getTasks } from "@/lib/queries";

export const metadata: Metadata = { title: "Aufgaben" };

const STATUS_FILTERS = [
  { key: "offen", label: "Offen" },
  { key: "erledigt", label: "Erledigt" },
  { key: "alle", label: "Alle" },
] as const;

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function TasksPage({ searchParams }: PageProps<"/aufgaben">) {
  const params = await searchParams;
  const me = await requireUser();
  const [users, projects, all] = await Promise.all([getAllUsers(), getProjects(), getTasks()]);
  const today = todayISO();

  const status = STATUS_FILTERS.some((f) => f.key === one(params.status)) ? one(params.status) : "offen";
  const wer = one(params.wer) || "alle";
  const projekt = one(params.projekt) || "alle";
  const q = one(params.q).trim();
  const needle = q.toLowerCase();

  let list = all.filter((t) =>
    status === "alle" ? true : status === "erledigt" ? t.status === "done" : t.status !== "done",
  );
  if (wer !== "alle") list = list.filter((t) => t.assigneeId === wer);
  if (projekt !== "alle") {
    list = list.filter((t) => (projekt === "ohne" ? !t.projectId : t.projectId === projekt));
  }
  if (needle) {
    list = list.filter(
      (t) => t.title.toLowerCase().includes(needle) || t.description.toLowerCase().includes(needle),
    );
  }
  if (status === "erledigt") {
    list = [...list].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  }

  const href = (overrides: Record<string, string>) => {
    const merged: Record<string, string> = { status, wer, projekt, q, ...overrides };
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (!value || value === "alle" || (key === "status" && value === "offen")) continue;
      sp.set(key, value);
    }
    const query = sp.toString();
    return `/aufgaben${query ? `?${query}` : ""}`;
  };

  const groups: Array<{ title: string; tone?: "urgent"; tasks: TaskWithRelations[] }> =
    status === "offen"
      ? [
          {
            title: "Überfällig",
            tone: "urgent" as const,
            tasks: list.filter((t) => daysUntil(t.dueDate, today) < 0),
          },
          { title: "Heute", tasks: list.filter((t) => daysUntil(t.dueDate, today) === 0) },
          {
            title: "Diese Woche",
            tasks: list.filter((t) => {
              const d = daysUntil(t.dueDate, today);
              return d >= 1 && d <= 7;
            }),
          },
          { title: "Später", tasks: list.filter((t) => daysUntil(t.dueDate, today) > 7) },
        ].filter((g) => g.tasks.length > 0)
      : list.length > 0
        ? [{ title: status === "erledigt" ? "Erledigt" : "Alle Aufgaben", tasks: list }]
        : [];

  const filtersActive = wer !== "alle" || projekt !== "alle" || q !== "";

  return (
    <div>
      <PageHeader title="Aufgaben" description="Alles, was einen Stichtag hat, nach Dringlichkeit sortiert.">
        <Link href="/aufgaben/neu" className="btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          Neue Aufgabe
        </Link>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={href({ status: f.key })}
              className={`pill ${status === f.key ? "pill-active" : ""}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link href={href({ wer: "alle" })} className={`pill ${wer === "alle" ? "pill-active" : ""}`}>
            Beide
          </Link>
          {users.map((u) => (
            <Link key={u.id} href={href({ wer: u.id })} className={`pill ${wer === u.id ? "pill-active" : ""}`}>
              {u.id === me.id ? "Ich" : u.name}
            </Link>
          ))}
        </div>
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Link href={href({ projekt: "alle" })} className={`pill ${projekt === "alle" ? "pill-active" : ""}`}>
              Alle Projekte
            </Link>
            {projects.map((p) => (
              <Link
                key={p.id}
                href={href({ projekt: p.id })}
                className={`pill gap-1.5 ${projekt === p.id ? "pill-active" : ""}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                {p.name}
              </Link>
            ))}
            <Link href={href({ projekt: "ohne" })} className={`pill ${projekt === "ohne" ? "pill-active" : ""}`}>
              Ohne Projekt
            </Link>
          </div>
        )}
        <form action="/aufgaben" method="get" className="relative ml-auto w-full sm:w-60">
          {status !== "offen" && <input type="hidden" name="status" value={status} />}
          {wer !== "alle" && <input type="hidden" name="wer" value={wer} />}
          {projekt !== "alle" && <input type="hidden" name="projekt" value={projekt} />}
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input name="q" defaultValue={q} placeholder="Suchen" className="input h-8 rounded-full pl-9 text-[13px]" />
        </form>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={
            filtersActive
              ? "Keine Aufgabe passt zu diesem Filter"
              : status === "erledigt"
                ? "Noch nichts erledigt"
                : "Alles erledigt"
          }
          hint={filtersActive ? "Setze einen Filter zurück oder ändere den Suchbegriff." : undefined}
          action={
            filtersActive ? (
              <Link href="/aufgaben" className="btn-ghost">
                Filter zurücksetzen
              </Link>
            ) : status === "offen" ? (
              <Link href="/aufgaben/neu" className="btn-primary">
                Neue Aufgabe
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <SectionHeader title={group.title} meta={group.tasks.length} tone={group.tone} />
              <TaskList tasks={group.tasks} today={today} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
