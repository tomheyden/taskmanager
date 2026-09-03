"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteTask } from "@/actions/tasks";

export function DeleteTaskButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn-danger"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`„${title}“ endgültig löschen? Das lässt sich nicht rückgängig machen.`)) {
          startTransition(() => deleteTask(id));
        }
      }}
    >
      <Trash2 size={15} />
      Löschen
    </button>
  );
}
