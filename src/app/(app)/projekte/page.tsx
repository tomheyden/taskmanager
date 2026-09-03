import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { createProject, deleteProject, renameProject } from "@/actions/projects";
import { ColorPicker } from "@/components/ColorPicker";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { formatDay, todayISO } from "@/lib/dates";
import { getProjects, getTasks } from "@/lib/queries";

export const metadata: Metadata = { title: "Projekte" };

export default async function ProjectsPage() {
  await requireUser();
  const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);
  todayISO();

  const stats = projects.map((project) => {
    const open = tasks.filter((t) => t.projectId === project.id && t.status !== "done");
    const done = tasks.filter((t) => t.projectId === project.id && t.status === "done").length;
    const next = open[0]; // Aufgaben kommen bereits nach Stichtag sortiert
    return { project, open: open.length, done, next };
  });

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Projekte"
        description="Ordne Aufgaben einem Thema oder Kunden zu. Rein zur Übersicht, ohne Zwang."
      />

      <form action={createProject} className="panel mb-8 flex flex-wrap items-end gap-4 px-5 py-4">
        <div className="min-w-0 flex-1 basis-48">
          <label className="label" htmlFor="name">
            Neues Projekt
          </label>
          <input id="name" name="name" required placeholder="z. B. Kunde Nordlicht" className="input" />
        </div>
        <div>
          <span className="label">Farbe</span>
          <ColorPicker name="color" />
        </div>
        <button type="submit" className="btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          Anlegen
        </button>
      </form>

      {stats.length === 0 ? (
        <EmptyState title="Noch keine Projekte" hint="Projekte sind optional. Aufgaben funktionieren auch ohne." />
      ) : (
        <div className="panel">
          {stats.map(({ project, open, done, next }) => (
            <details key={project.id} className="group border-t border-line first:border-t-0">
              <summary className="row row-hover cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: project.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{project.name}</span>
                  <span className="tnum block text-[13px] text-ink-3">
                    {open === 0 ? "Nichts offen" : open === 1 ? "1 offen" : `${open} offen`}
                    {done > 0 && `, ${done} erledigt`}
                    {next && `. Nächster Stichtag ${formatDay(next.dueDate)}`}
                  </span>
                </span>
                <span className="btn-ghost btn-sm">
                  <span className="group-open:hidden">Bearbeiten</span>
                  <span className="hidden group-open:inline">Schließen</span>
                </span>
              </summary>
              <div className="space-y-4 border-t border-line bg-surface-2/60 px-5 py-4">
                <form action={renameProject} className="flex flex-wrap items-end gap-4">
                  <input type="hidden" name="id" value={project.id} />
                  <div className="min-w-0 flex-1 basis-48">
                    <label className="label" htmlFor={`name-${project.id}`}>
                      Name
                    </label>
                    <input
                      id={`name-${project.id}`}
                      name="name"
                      defaultValue={project.name}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <span className="label">Farbe</span>
                    <ColorPicker name="color" value={project.color} />
                  </div>
                  <button type="submit" className="btn-ghost">
                    Speichern
                  </button>
                </form>
                <div className="flex items-center gap-2">
                  <Link href={`/aufgaben?projekt=${project.id}`} className="btn-quiet btn-sm">
                    Aufgaben in diesem Projekt
                  </Link>
                  <form action={deleteProject} className="ml-auto">
                    <input type="hidden" name="id" value={project.id} />
                    <ConfirmSubmit
                      className="btn-danger btn-sm"
                      message={`„${project.name}“ löschen? Die Aufgaben bleiben erhalten und verlieren nur die Zuordnung.`}
                    >
                      Projekt löschen
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
