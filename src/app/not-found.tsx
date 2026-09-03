import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="display text-[30px] font-semibold">Diese Seite gibt es nicht.</p>
      <p className="text-ink-2">Vielleicht wurde die Aufgabe gelöscht oder der Link ist unvollständig.</p>
      <Link href="/" className="btn-primary mt-2">
        Zur Übersicht
      </Link>
    </main>
  );
}
