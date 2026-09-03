import { setStatus } from "@/actions/tasks";
import { STATUSES, type Status } from "@/db/schema";
import { STATUS_LABEL } from "@/lib/constants";

const tone: Record<Status, string> = {
  open: "bg-paper text-[#111318]",
  in_progress: "bg-paper text-[#111318]",
  blocked: "bg-soon text-[#111318]",
  done: "bg-calm text-[#111318]",
};

export function StatusSwitch({ taskId, current }: { taskId: string; current: Status }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-surface-2 p-0.5" role="group" aria-label="Status">
      {STATUSES.map((status) => {
        const active = status === current;
        return (
          <form key={status} action={setStatus}>
            <input type="hidden" name="id" value={taskId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              aria-pressed={active}
              className={`h-8 rounded-[6px] px-3 text-[13px] font-medium transition-colors ${
                active ? tone[status] : "text-ink-2 hover:bg-surface-3 hover:text-ink"
              }`}
            >
              {STATUS_LABEL[status]}
            </button>
          </form>
        );
      })}
    </div>
  );
}
