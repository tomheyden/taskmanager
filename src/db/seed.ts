import "dotenv/config";
import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { getDb } from "./index";
import { projects, subtasks, tasks, users } from "./schema";

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function isoDaysFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function ensureUser(name: string, email: string, password: string, color: string) {
  const existing = await getDb().query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing;
  const user = {
    id: id(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    color,
    createdAt: now(),
  };
  await getDb().insert(users).values(user);
  console.log(`Konto angelegt: ${name} <${email}>`);
  return user;
}

async function ensureProject(name: string, color: string) {
  const existing = await getDb().query.projects.findFirst({ where: eq(projects.name, name) });
  if (existing) return existing;
  const project = { id: id(), name, color, createdAt: now() };
  await getDb().insert(projects).values(project);
  console.log(`Projekt angelegt: ${name}`);
  return project;
}

async function main() {
  const demo = process.argv.includes("--demo");

  const one = await ensureUser(
    process.env.PARTNER_1_NAME ?? "Tom",
    process.env.PARTNER_1_EMAIL ?? "tom@example.com",
    process.env.PARTNER_1_PASSWORD ?? "stichtag",
    "#8fb3ff",
  );
  const two = await ensureUser(
    process.env.PARTNER_2_NAME ?? "Partnerin",
    process.env.PARTNER_2_EMAIL ?? "partnerin@example.com",
    process.env.PARTNER_2_PASSWORD ?? "stichtag",
    "#d9a3f2",
  );

  const finanzen = await ensureProject("Finanzen", "#e8b658");
  const vertrieb = await ensureProject("Vertrieb", "#86bd9f");
  const produkt = await ensureProject("Produkt", "#8fb3ff");

  if (!demo) return;

  const [{ value: existing }] = await getDb().select({ value: count() }).from(tasks);
  if (existing > 0) {
    console.log("Es gibt bereits Aufgaben, Demo-Daten werden nicht angelegt.");
    return;
  }

  const demoTasks: Array<{
    title: string;
    description: string;
    due: number;
    assignee: typeof one;
    project: typeof finanzen | null;
    priority: "low" | "medium" | "high" | "critical";
    status: "open" | "in_progress" | "blocked" | "done";
    steps: Array<[string, boolean]>;
  }> = [
    {
      title: "Jahresabschluss 2025 an die Steuerberatung übergeben",
      description:
        "Alle Belege sortiert, Kontoauszüge exportiert und offene Rückfragen aus dem Q4 geklärt. Übergabe per DATEV-Unternehmen-Online.",
      due: -3,
      assignee: one,
      project: finanzen,
      priority: "critical",
      status: "in_progress",
      steps: [
        ["Belege Q4 sortieren", true],
        ["Kontoauszüge exportieren", true],
        ["Rückfragen Steuerberatung beantworten", false],
        ["Übergabe bestätigen lassen", false],
      ],
    },
    {
      title: "Angebot für Kunde Nordlicht GmbH finalisieren",
      description: "Zweite Runde nach dem Feedback vom Kick-off. Preis bleibt, Leistungsumfang wird um Workshop-Tag ergänzt.",
      due: 0,
      assignee: two,
      project: vertrieb,
      priority: "high",
      status: "in_progress",
      steps: [
        ["Leistungsbeschreibung anpassen", true],
        ["Preisblatt prüfen", false],
        ["Versand mit Deckblatt", false],
      ],
    },
    {
      title: "Website-Relaunch: Inhalte für alle Unterseiten freigeben",
      description: "Texte liegen im Drive. Jede Seite braucht ein finales Okay von uns beiden.",
      due: 6,
      assignee: two,
      project: produkt,
      priority: "high",
      status: "open",
      steps: [
        ["Startseite", true],
        ["Leistungen", false],
        ["Über uns", false],
        ["Kontakt und Impressum", false],
      ],
    },
    {
      title: "Gesellschaftervertrag um Vertretungsregelung ergänzen",
      description: "Termin mit dem Notar steht. Vorher Entwurf gemeinsam durchgehen.",
      due: 12,
      assignee: one,
      project: null,
      priority: "medium",
      status: "open",
      steps: [
        ["Entwurf vom Anwalt einholen", false],
        ["Gemeinsam durchgehen", false],
        ["Notartermin wahrnehmen", false],
      ],
    },
    {
      title: "Pipeline-Review und Forecast für Q4",
      description: "Alle offenen Deals durchgehen, Wahrscheinlichkeiten aktualisieren und Forecast an die Bank melden.",
      due: 19,
      assignee: two,
      project: vertrieb,
      priority: "medium",
      status: "open",
      steps: [],
    },
    {
      title: "Neue Preisstruktur für 2027 festlegen",
      description: "Drei Pakete statt Stundensätze. Entscheidungsvorlage mit Beispielrechnungen.",
      due: 34,
      assignee: one,
      project: produkt,
      priority: "low",
      status: "open",
      steps: [
        ["Kostenbasis berechnen", false],
        ["Paketvorschläge ausarbeiten", false],
      ],
    },
    {
      title: "Bürovertrag verlängern",
      description: "Verlängerung um 24 Monate, Indexmiete prüfen.",
      due: 45,
      assignee: one,
      project: finanzen,
      priority: "medium",
      status: "blocked",
      steps: [["Antwort der Hausverwaltung abwarten", false]],
    },
    {
      title: "Umsatzsteuervoranmeldung August",
      description: "",
      due: -8,
      assignee: one,
      project: finanzen,
      priority: "high",
      status: "done",
      steps: [],
    },
  ];

  for (const t of demoTasks) {
    const taskId = id();
    const created = now();
    await getDb().insert(tasks).values({
      id: taskId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: isoDaysFromToday(t.due),
      assigneeId: t.assignee.id,
      creatorId: one.id,
      projectId: t.project?.id ?? null,
      createdAt: created,
      updatedAt: created,
      completedAt: t.status === "done" ? created : null,
    });
    for (const [index, [title, done]] of t.steps.entries()) {
      await getDb().insert(subtasks).values({
        id: id(),
        taskId,
        title,
        done,
        position: index,
        createdAt: created,
      });
    }
  }
  console.log(`${demoTasks.length} Demo-Aufgaben angelegt.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
