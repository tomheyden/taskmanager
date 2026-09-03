import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import type { Status } from "@/db/schema";

const TIME_ZONE = "Europe/Berlin";

/** Heutiges Datum als YYYY-MM-DD in deutscher Zeitzone. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function daysUntil(dueISO: string, today = todayISO()): number {
  return differenceInCalendarDays(parseISO(dueISO), parseISO(today));
}

export type Urgency = "overdue" | "today" | "soon" | "calm" | "done";

export function urgencyFor(dueISO: string, status: Status, today = todayISO()): Urgency {
  if (status === "done") return "done";
  const days = daysUntil(dueISO, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "soon";
  return "calm";
}

/** "heute", "morgen", "in 4 Tagen", "seit 3 Tagen überfällig" ... */
export function relativeLabel(dueISO: string, status: Status, today = todayISO()): string {
  const days = daysUntil(dueISO, today);
  if (status === "done") return "erledigt";
  if (days === 0) return "heute fällig";
  if (days === 1) return "morgen fällig";
  if (days === -1) return "seit gestern überfällig";
  if (days < -1) {
    const abs = Math.abs(days);
    if (abs >= 14) return `seit ${Math.round(abs / 7)} Wochen überfällig`;
    return `seit ${abs} Tagen überfällig`;
  }
  if (days <= 13) return `in ${days} Tagen`;
  if (days <= 60) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "in einer Woche" : `in ${weeks} Wochen`;
  }
  const months = Math.round(days / 30);
  return months === 1 ? "in einem Monat" : `in ${months} Monaten`;
}

export function formatDay(iso: string, style: "short" | "long" | "numeric" = "short") {
  const date = parseISO(iso);
  if (style === "long") return format(date, "EEEE, d. MMMM yyyy", { locale: de });
  if (style === "numeric") return format(date, "dd.MM.yyyy", { locale: de });
  return format(date, "EEE, d. MMM", { locale: de });
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "d. MMM yyyy, HH:mm", { locale: de });
}

export function addDaysISO(iso: string, days: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return format(d, "yyyy-MM-dd");
}
