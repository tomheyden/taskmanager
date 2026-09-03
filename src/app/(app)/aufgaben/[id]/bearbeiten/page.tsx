import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateTask } from "@/actions/tasks";
import { PageHeader } from "@/components/PageHeader";
import { TaskForm } from "@/components/TaskForm";
import { getAllUsers, requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { getProjects, getTask } from "@/lib/queries";

export const metadata: Metadata = { title: "Aufgabe bearbeiten" };

export default async function EditTaskPage({ params }: PageProps<"/aufgaben/[id]/bearbeiten">) {
  const { id } = await params;
  const me = await requireUser();
  const [task, users, projects] = await Promise.all([getTask(id), getAllUsers(), getProjects()]);
  if (!task) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Aufgabe bearbeiten" />
      <TaskForm
        action={updateTask.bind(null, task.id)}
        users={users}
        projects={projects}
        meId={me.id}
        task={task}
        defaultDue={todayISO()}
      />
    </div>
  );
}
