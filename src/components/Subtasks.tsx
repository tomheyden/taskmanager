"use client";

import { Check, Plus, X } from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { addSubtask, deleteSubtask, toggleSubtask } from "@/actions/subtasks";
import type { Subtask } from "@/db/schema";

type Change = { type: "toggle"; id: string; done: boolean } | { type: "remove"; id: string };

export function Subtasks({ taskId, items }: { taskId: string; items: Subtask[] }) {
  const [list, apply] = useOptimistic(items, (state: Subtask[], change: Change) => {
    if (change.type === "remove") return state.filter((s) => s.id !== change.id);
    return state.map((s) => (s.id === change.id ? { ...s, done: change.done } : s));
  });
  const [, startTransition] = useTransition();
  const [adding, startAdding] = useTransition();
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = list.length;
  const finished = list.filter((s) => s.done).length;
  const percent = total === 0 ? 0 : Math.round((finished / total) * 100);

  function toggle(item: Subtask) {
    setLastToggled(item.id);
    startTransition(async () => {
      apply({ type: "toggle", id: item.id, done: !item.done });
      await toggleSubtask(item.id, !item.done);
    });
  }

  function remove(item: Subtask) {
    startTransition(async () => {
      apply({ type: "remove", id: item.id });
      await deleteSubtask(item.id);
    });
  }

  function submit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    startAdding(async () => {
      await addSubtask(taskId, title);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    });
  }

  return (
    <section className="panel">
      <div className="flex items-baseline justify-between gap-4 px-5 pt-4 pb-3">
        <h2 className="text-[15px] font-medium">Teilschritte</h2>
        {total > 0 && (
          <p className="tnum text-[13px] text-ink-3">
            {finished} von {total} erledigt
          </p>
        )}
      </div>
      {total > 0 && (
        <div className="mx-5 mb-2 h-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${percent === 100 ? "bg-calm" : "bg-ink-2"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {total === 0 ? (
        <p className="px-5 pb-4 text-ink-3">
          Noch keine Teilschritte. Zerlege die Aufgabe in Etappen, dann sieht man den Fortschritt.
        </p>
      ) : (
        <ul>
          {list.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 border-t border-line px-5 py-2.5">
              <button
                type="button"
                onClick={() => toggle(item)}
                className={`check ${item.done ? "check-on" : ""}`}
                aria-pressed={item.done}
                aria-label={item.done ? `${item.title} wieder öffnen` : `${item.title} abhaken`}
              >
                <Check size={12} strokeWidth={3} />
              </button>
              <span className="min-w-0 flex-1 text-[14px]">
                <span
                  className={
                    item.done ? `text-ink-3 ${lastToggled === item.id ? "struck" : "line-through"}` : ""
                  }
                >
                  {item.title}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(item)}
                className="btn-danger btn-icon h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`${item.title} entfernen`}
                title="Entfernen"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={submit} className="flex items-center gap-2 border-t border-line px-5 py-3">
        <Plus size={16} className="shrink-0 text-ink-3" />
        <input
          ref={inputRef}
          name="title"
          placeholder="Teilschritt hinzufügen"
          className="h-8 min-w-0 flex-1 bg-transparent text-[14px] placeholder:text-ink-3 focus:outline-none"
          disabled={adding}
          autoComplete="off"
        />
        <button type="submit" className="btn-ghost btn-sm" disabled={adding}>
          Hinzufügen
        </button>
      </form>
    </section>
  );
}
