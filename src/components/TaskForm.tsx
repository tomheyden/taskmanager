"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { TaskFormState } from "@/actions/tasks";
import type { Project, Task, User } from "@/db/schema";
import { PRIORITIES } from "@/db/schema";
import { PRIORITY_LABEL } from "@/lib/constants";
import { Avatar } from "./Avatar";

export function TaskForm({
  action,
  users,
  projects,
  meId,
  task,
  defaultDue,
}: {
  action: (prev: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  users: User[];
  projects: Project[];
  meId: string;
  task?: Task;
  defaultDue: string;
}) {
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(action, {});
  const editing = Boolean(task);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="label" htmlFor="title">
          Was muss erledigt sein?
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          autoFocus={!editing}
          defaultValue={task?.title}
          placeholder="z. B. Jahresabschluss an die Steuerberatung übergeben"
          className="input h-11 text-[15px]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="dueDate">
            Stichtag
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={task?.dueDate ?? defaultDue}
            className="input tnum"
          />
        </div>
        <div>
          <span className="label">Verantwortlich</span>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface-2 px-3 transition-colors hover:border-line-strong has-checked:border-paper/70 has-checked:bg-surface-3"
              >
                <input
                  type="radio"
                  name="assigneeId"
                  value={user.id}
                  defaultChecked={(task?.assigneeId ?? meId) === user.id}
                  className="sr-only"
                />
                <Avatar name={user.name} color={user.color} size={22} />
                <span className="truncate text-[14px]">{user.id === meId ? "Ich" : user.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="priority">
            Priorität
          </label>
          <select id="priority" name="priority" defaultValue={task?.priority ?? "medium"} className="select">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="projectId">
            Projekt
          </label>
          <select id="projectId" name="projectId" defaultValue={task?.projectId ?? ""} className="select">
            <option value="">Kein Projekt</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Worum geht es genau?
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={task?.description}
          placeholder="Kontext, Links, offene Fragen. Alles, was die andere Person wissen muss."
          className="textarea"
        />
      </div>

      {!editing && (
        <div>
          <label className="label" htmlFor="steps">
            Teilschritte, einer pro Zeile
          </label>
          <textarea
            id="steps"
            name="steps"
            placeholder={"Belege sortieren\nRückfragen klären\nÜbergabe bestätigen lassen"}
            className="textarea min-h-24"
          />
          <p className="mt-1.5 text-[12px] text-ink-3">Du kannst Teilschritte später jederzeit ergänzen.</p>
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-[13px] text-urgent">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-line pt-5">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Wird gespeichert…" : editing ? "Änderungen speichern" : "Aufgabe anlegen"}
        </button>
        <Link href={task ? `/aufgaben/${task.id}` : "/aufgaben"} className="btn-quiet">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
