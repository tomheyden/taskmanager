import type { Status } from "@/db/schema";
import { relativeLabel, urgencyFor, type Urgency } from "@/lib/dates";

// Vollständige Klassennamen, damit Tailwind sie beim Scannen findet.
const chipClass: Record<Urgency, string> = {
  overdue: "chip-overdue",
  today: "chip-today",
  soon: "chip-soon",
  calm: "chip-calm",
  done: "chip-done",
};

export function DeadlineChip({
  dueDate,
  status,
  today,
}: {
  dueDate: string;
  status: Status;
  today: string;
}) {
  const urgency = urgencyFor(dueDate, status, today);
  return <span className={chipClass[urgency]}>{relativeLabel(dueDate, status, today)}</span>;
}
