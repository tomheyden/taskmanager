import { Check } from "lucide-react";
import Link from "next/link";
import { setStatus } from "@/actions/tasks";
import type { TaskWithRelations } from "@/db/schema";
import { PRIORITY_LABEL } from "@/lib/constants";
import { formatDay } from "@/lib/dates";
import { Avatar } from "./Avatar";
import { DeadlineChip } from "./Deadline";

export function TaskRow({
  task,
  today,
  compact = false,
}: {
  task: TaskWithRelations;
  today: string;
  compact?: boolean;
}) {
  const done = task.status === "done";
  const total = task.subtasks.length;
  const finished = task.subtasks.filter((s) => s.done).length;
  const loud = task.priority === "high" || task.priority === "critical";

  return (
    <div className="row row-hover relative flex-wrap sm:flex-nowrap">
      <form action={setStatus} className="relative z-10 shrink-0">
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="status" value={done ? "open" : "done"} />
        <button
          type="submit"
          className={`check ${done ? "check-on" : ""}`}
          aria-label={done ? "Wieder öffnen" : "Als erledigt markieren"}
          title={done ? "Wieder öffnen" : "Als erledigt markieren"}
        >
          <Check size={12} strokeWidth={3} />
        </button>
      </form>

      <div className="min-w-0 flex-1 basis-40">
        <Link
          href={`/aufgaben/${task.id}`}
          className={`block text-[15px] font-medium after:absolute after:inset-0 after:content-[''] max-sm:line-clamp-2 sm:truncate ${
            done ? "text-ink-3 line-through decoration-ink-3/60" : ""
          }`}
        >
          {task.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-3">
          {!compact && task.project && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: task.project.color }} />
              {task.project.name}
            </span>
          )}
          {task.status === "in_progress" && <span>In Arbeit</span>}
          {task.status === "blocked" && <span className="text-soon">Blockiert</span>}
          {loud && !done && (
            <span className={task.priority === "critical" ? "text-urgent" : "text-ink-2"}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          {total > 0 && (
            <span className="tnum">
              {finished} von {total} Schritten
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 max-sm:w-full max-sm:pl-9">
        <div className="flex items-center gap-2 sm:block sm:text-right">
          <DeadlineChip dueDate={task.dueDate} status={task.status} today={today} />
          <p className="tnum text-[12px] text-ink-3 sm:mt-1">{formatDay(task.dueDate)}</p>
        </div>
        {!compact && (
          <Avatar name={task.assignee.name} color={task.assignee.color} size={28} className="max-sm:ml-auto" />
        )}
      </div>
    </div>
  );
}

export function TaskList({
  tasks,
  today,
  compact = false,
}: {
  tasks: TaskWithRelations[];
  today: string;
  compact?: boolean;
}) {
  return (
    <div className="panel overflow-hidden">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} today={today} compact={compact} />
      ))}
    </div>
  );
}
