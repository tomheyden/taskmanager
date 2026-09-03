import { FolderKanban, LayoutDashboard, ListChecks, LogOut, Plus, Settings } from "lucide-react";
import Link from "next/link";
import type { User } from "@/db/schema";
import { logout } from "@/app/login/actions";
import { Avatar } from "./Avatar";
import { NavLink } from "./NavLink";

const nav = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard, exact: true },
  { href: "/aufgaben", label: "Aufgaben", icon: ListChecks },
  { href: "/projekte", label: "Projekte", icon: FolderKanban },
];

export function Sidebar({ me }: { me: User }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface md:flex">
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="display text-[22px] leading-none font-semibold">
            Stichtag
          </Link>
        </div>
        <div className="px-3">
          <Link href="/aufgaben/neu" className="btn-primary mb-4 w-full justify-center">
            <Plus size={16} strokeWidth={2.5} />
            Neue Aufgabe
          </Link>
        </div>
        <nav className="space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} exact={item.exact}>
              <item.icon size={17} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-0.5 px-3 pb-4">
          <NavLink href="/einstellungen">
            <Settings size={17} strokeWidth={1.75} />
            Einstellungen
          </NavLink>
          <div className="flex items-center gap-2.5 px-2.5 pt-3">
            <Avatar name={me.name} color={me.color} size={28} />
            <p className="min-w-0 flex-1 truncate text-[14px]">{me.name}</p>
            <form action={logout}>
              <button type="submit" className="btn-quiet btn-icon" title="Abmelden" aria-label="Abmelden">
                <LogOut size={16} strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" className="display text-[20px] leading-none font-semibold">
            Stichtag
          </Link>
          <nav className="ml-2 flex items-center gap-0.5 overflow-x-auto">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href} exact={item.exact} className="h-8 px-2 text-[13px]">
                {item.label}
              </NavLink>
            ))}
            <NavLink href="/einstellungen" className="h-8 px-2 text-[13px]">
              Einstellungen
            </NavLink>
          </nav>
          <Link href="/aufgaben/neu" className="btn-primary btn-icon ml-auto" aria-label="Neue Aufgabe">
            <Plus size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </header>
    </>
  );
}
