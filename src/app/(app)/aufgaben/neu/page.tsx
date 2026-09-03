import type { Metadata } from "next";
import { createTask } from "@/actions/tasks";
import { PageHeader } from "@/components/PageHeader";
import { TaskForm } from "@/components/TaskForm";
import { getAllUsers, requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/dates";
import { getProjects } from "@/lib/queries";

export const metadata: Metadata = { title: "Neue Aufgabe" };

export default async function NewTaskPage() {
  const me = await requireUser();
  const [users, projects] = await Promise.all([getAllUsers(), getProjects()]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Neue Aufgabe" description="Eine Sache, ein Datum, eine verantwortliche Person." />
      <TaskForm
        action={createTask}
        users={users}
        projects={projects}
        meId={me.id}
        defaultDue={addDaysISO(todayISO(), 7)}
      />
    </div>
  );
}
