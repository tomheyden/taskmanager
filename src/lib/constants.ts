import type { Priority, Status } from "@/db/schema";

export const STATUS_LABEL: Record<Status, string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  blocked: "Blockiert",
  done: "Erledigt",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  critical: "Kritisch",
};

export const PROJECT_COLORS = [
  "#e8b658",
  "#86bd9f",
  "#8fb3ff",
  "#d9a3f2",
  "#f27f6f",
  "#7fd0d6",
  "#c9b8ff",
  "#f0a35e",
];
