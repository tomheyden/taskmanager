import { ChevronLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { DeadlineChip } from "@/components/Deadline";
import { DeleteTaskButton } from "@/components/DeleteTaskButton";
import { StatusSwitch } from "@/components/StatusSwitch";
import { Subtasks } from "@/components/Subtasks";
import { requireUser } from "@/lib/auth";
import { PRIORITY_LABEL } from "@/lib/constants";
import { formatDateTime, formatDay, todayISO, urgencyFor } from "@/lib/dates";
import { getTask } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/aufgaben/[id]">): Promise<Metadata> {
  const { id } = await params;
  const task = await getTask(id);
  return { title: task?.title ?? "Aufgabe" };
}

const dateTone = {
  overdue: "text-urgent",
  today: "text-urgent",
  soon: "text-soon",
  calm: "text-ink",
  done: "text-ink-3",
} as const;

export default async function TaskPage({ params }: PageProps<"/aufgaben/[id]">) {
  const { id } = await params;
  const me = await requireUser();
  const task = await getTask(id);
  if (!task) notFound();

  const today = todayISO();
  const urgency = urgencyFor(task.dueDate, task.status, today);
  const done = task.status === "done";

  return (
    <div>
      <Link href="/aufgaben" className="btn-quiet btn-sm -ml-3 mb-5 text-ink-3">
        <ChevronLeft size={15} />
        Alle Aufgaben
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_272px]">
        <div className="min-w-0 space-y-6">
          <header>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
              {task.project && (
                <Link
                  href={`/aufgaben?projekt=${task.project.id}`}
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: task.project.color }} />
                  {task.project.name}
                </Link>
              )}
              <span className={task.priority === "critical" ? "text-urgent" : undefined}>
                Priorität {PRIORITY_LABEL[task.priority].toLowerCase()}
              </span>
            </div>
            <h1
              className={`display mt-2 text-[32px] leading-[1.12] font-semibold text-balance ${
                done ? "text-ink-2 line-through decoration-ink-3/60" : ""
              }`}
            >
              {task.title}
            </h1>
            <div className="mt-5">
              <StatusSwitch taskId={task.id} current={task.status} />
            </div>
          </header>

          {task.description ? (
            <div className="panel px-5 py-4 text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink/90">
              {task.description}
            </div>
          ) : (
            <p className="text-ink-3">
              Keine Beschreibung.{" "}
              <Link
                href={`/aufgaben/${task.id}/bearbeiten`}
                className="text-ink-2 underline underline-offset-4 hover:text-ink"
              >
                Kontext ergänzen
              </Link>
            </p>
          )}

          <Subtasks taskId={task.id} items={task.subtasks} />

          <div className="flex items-center gap-2 border-t border-line pt-5">
            <Link href={`/aufgaben/${task.id}/bearbeiten`} className="btn-ghost">
              <Pencil size={15} />
              Bearbeiten
            </Link>
            <DeleteTaskButton id={task.id} title={task.title} />
          </div>
        </div>

        <aside className="space-y-4 lg:pt-1">
          <div className="panel px-5 py-4">
            <p className="text-[13px] text-ink-2">Stichtag</p>
            <p className={`display tnum mt-1 text-[30px] leading-none font-semibold ${dateTone[urgency]}`}>
              {formatDay(task.dueDate, "short")}
            </p>
            <p className="tnum mt-1.5 text-[13px] text-ink-3">{formatDay(task.dueDate, "long")}</p>
            <div className="mt-3">
              <DeadlineChip dueDate={task.dueDate} status={task.status} today={today} />
            </div>
          </div>

          <dl className="panel divide-y divide-line text-[13px]">
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-ink-3">Verantwortlich</dt>
              <dd className="flex items-center gap-2">
                <Avatar name={task.assignee.name} color={task.assignee.color} size={22} />
                {task.assignee.id === me.id ? "Du" : task.assignee.name}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-ink-3">Angelegt</dt>
              <dd className="tnum text-right">
                {formatDateTime(task.createdAt)}
                <span className="block text-ink-3">
                  von {task.creator.id === me.id ? "dir" : task.creator.name}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <dt className="text-ink-3">Geändert</dt>
              <dd className="tnum">{formatDateTime(task.updatedAt)}</dd>
            </div>
            {task.completedAt && (
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-ink-3">Erledigt</dt>
                <dd className="tnum text-calm">{formatDateTime(task.completedAt)}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
