import type { Metadata } from "next";
import { Avatar } from "@/components/Avatar";
import { PageHeader, SectionHeader } from "@/components/PageHeader";
import { getAllUsers, requireUser } from "@/lib/auth";
import { PasswordForm, ProfileForm } from "./forms";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const me = await requireUser();
  const users = await getAllUsers();
  const dbUrl = process.env.DATABASE_URL ?? "file:./data/stichtag.db";
  const remote = dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://");

  return (
    <div className="max-w-2xl space-y-10">
      <PageHeader title="Einstellungen" />

      <section>
        <SectionHeader title="Profil" />
        <ProfileForm name={me.name} color={me.color} />
      </section>

      <section>
        <SectionHeader title="Passwort" />
        <PasswordForm />
      </section>

      <section>
        <SectionHeader title="Wer hier arbeitet" />
        <div className="panel">
          {users.map((user) => (
            <div key={user.id} className="row">
              <Avatar name={user.name} color={user.color} size={32} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {user.name}
                  {user.id === me.id && (
                    <span className="ml-2 text-[12px] font-normal text-ink-3">das bist du</span>
                  )}
                </p>
                <p className="truncate text-[13px] text-ink-3">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-ink-3">
          Konten werden über die Umgebungsvariablen und den Seed-Befehl angelegt, siehe README.
        </p>
      </section>

      <section>
        <SectionHeader title="Daten" />
        <div className="panel px-5 py-4 text-[13px] text-ink-2">
          {remote ? (
            <p>Die Daten liegen in einer externen Datenbank (libSQL/Turso).</p>
          ) : (
            <p>
              Die Daten liegen lokal in <span className="text-ink">{dbUrl.replace("file:", "")}</span>. Für den
              gemeinsamen Zugriff in Produktion eine libSQL-Datenbank hinterlegen, siehe README.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
