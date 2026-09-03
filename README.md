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
| `pnpm db:setup:prod` | Dasselbe gegen die Produktionsdatenbank             |

## Konten

Es gibt keine Registrierung. Die beiden Konten kommen aus `.env.local` (`PARTNER_1_*`, `PARTNER_2_*`) und werden mit `pnpm db:seed` angelegt. Der Seed überspringt Konten, die es schon gibt. Passwort später ändern: in der App unter Einstellungen.

## Datenbank

Stichtag nutzt libSQL über Drizzle ORM. Es gibt genau zwei Betriebsarten, der Code ist derselbe:

| Wo | `DATABASE_URL` | Geteilt? |
| --- | --- | --- |
| Lokal | `file:./data/stichtag.db` | Nein, nur auf diesem Rechner |
| Produktion | `libsql://...` von Turso | Ja, beide sehen dieselben Daten |

Die Verbindung wird erst beim ersten Zugriff geöffnet, nicht beim Import. Dadurch läuft `next build`
auch ohne gesetzte Datenbank durch. Fehlt in Produktion eine Datenbank, kommt eine klare Fehlermeldung
statt eines Absturzes beim Bauen. Erkannt werden `DATABASE_URL` und `DATABASE_AUTH_TOKEN` sowie die
Namen `TURSO_DATABASE_URL` und `TURSO_AUTH_TOKEN`, die die Vercel-Integration selbst setzt.

## Deployment auf Vercel

Die lokale SQLite-Datei funktioniert nur auf einem Rechner, und Vercel hat kein beschreibbares
Dateisystem. Für den gemeinsamen Zugriff braucht ihr deshalb eine gehostete Datenbank.

**1. Turso über den Vercel Marketplace installieren**

```bash
vercel link --yes --project taskmanager
vercel integration add tursocloud/database --name stichtag-db
```

Beim ersten Mal verlangt Turso, dass die Nutzungsbedingungen im Browser bestätigt werden. Danach den
`add`-Befehl erneut ausführen. Die Integration legt die Datenbank an, verbindet sie mit dem Projekt
und setzt die Umgebungsvariablen automatisch.

**2. Login-Schlüssel setzen**, falls noch nicht geschehen:

```bash
vercel env add AUTH_SECRET production --value "$(openssl rand -hex 32)" --sensitive --yes
```

**3. Tabellen anlegen und die beiden Konten erzeugen.** Einmalig gegen die Produktionsdatenbank:

```bash
vercel env pull .env.production.local --environment=production --yes
pnpm db:setup:prod
```

Die `PARTNER_*`-Variablen liest nur das Seed-Skript, die Anwendung selbst braucht sie zur Laufzeit
nicht. Passwörter ändert ihr danach in der App unter Einstellungen.

**4. Deployen.** Jeder Push auf `main` löst ein Deployment aus.

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
