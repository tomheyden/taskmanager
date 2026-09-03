# Stichtag

Ein Aufgaben-Tool für zwei Geschäftspartner. Wenige, große Aufgaben statt vieler kleiner, jede mit einem klaren Stichtag, einer verantwortlichen Person und Teilschritten, an denen man den Fortschritt sieht.

## Was drin ist

- **Übersicht**: Zeitstrahl der nächsten vier Wochen, Überfälliges zuerst, dann die Aufgaben von dir und deiner Partnerin nebeneinander.
- **Aufgaben**: nach Dringlichkeit gruppiert (Überfällig, Heute, Diese Woche, Später), filterbar nach Person, Projekt und Status, mit Suche.
- **Aufgabendetail**: Status umschalten (Offen, In Arbeit, Blockiert, Erledigt), Teilschritte abhaken, Beschreibung, Bearbeiten, Löschen.
- **Projekte**: optionale Gruppierung mit Farbe.
- **Einstellungen**: Name, Farbe, Passwort.
- Login für genau die beiden Konten, die beim Seed angelegt werden.

## Stack

Next.js 16 (App Router, Server Actions), Tailwind CSS 4, Drizzle ORM mit libSQL (lokal SQLite-Datei, in Produktion z. B. Turso), Sessions per signiertem Cookie (jose), Passwörter mit bcrypt.

## Lokal starten

```bash
git clone https://github.com/tomheyden/taskmanager.git
cd taskmanager
pnpm install
cp .env.example .env.local   # Namen, E-Mails, Passwörter und AUTH_SECRET anpassen
pnpm db:setup                # Tabellen anlegen und die beiden Konten erzeugen
pnpm dev
```

Dann `http://localhost:3000` öffnen und mit einem der beiden Konten aus `.env.local` anmelden.

Beispieldaten zum Ausprobieren: `pnpm db:demo` legt acht Demo-Aufgaben an (nur, wenn noch keine Aufgaben existieren).

## Befehle

| Befehl            | Zweck                                                  |
| ----------------- | ------------------------------------------------------ |
| `pnpm dev`        | Entwicklungsserver                                     |
| `pnpm build`      | Produktions-Build                                      |
| `pnpm typecheck`  | TypeScript prüfen                                      |
| `pnpm db:push`    | Schema in die Datenbank schreiben                      |
| `pnpm db:seed`    | Konten und Standardprojekte anlegen (idempotent)       |
| `pnpm db:demo`    | Seed plus Demo-Aufgaben                                |
| `pnpm db:studio`  | Drizzle Studio, um direkt in die Daten zu schauen      |

## Konten

Es gibt keine Registrierung. Die beiden Konten kommen aus `.env.local` (`PARTNER_1_*`, `PARTNER_2_*`) und werden mit `pnpm db:seed` angelegt. Der Seed überspringt Konten, die es schon gibt. Passwort später ändern: in der App unter Einstellungen.

## Deployment (z. B. Vercel)

Die lokale SQLite-Datei funktioniert nur auf einem Rechner. Für den gemeinsamen Zugriff braucht ihr eine gehostete libSQL-Datenbank:

1. Bei [Turso](https://turso.tech) eine Datenbank anlegen, URL (`libsql://...`) und Token kopieren.
2. Auf Vercel als Umgebungsvariablen setzen: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`, sowie die `PARTNER_*`-Variablen.
3. Einmalig gegen die Produktionsdatenbank ausführen: `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... pnpm db:setup`
4. Projekt deployen.

`AUTH_SECRET` sollte ein langer Zufallswert sein, z. B. aus `openssl rand -hex 32`.

## Struktur

```
src/
  app/
    login/            Anmeldung
    (app)/            eingeloggter Bereich mit Sidebar
      page.tsx        Übersicht
      aufgaben/       Liste, Neu, Detail, Bearbeiten
      projekte/
      einstellungen/
  actions/            Server Actions (tasks, subtasks, projects, settings)
  components/         UI-Bausteine (TaskRow, Timeline, Subtasks, ...)
  db/                 Drizzle-Schema, Client, Seed
  lib/                Auth, Datumslogik, Konstanten, Queries
  proxy.ts            Login-Schutz für alle Seiten
```
