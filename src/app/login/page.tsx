import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.weiter === "string" ? params.weiter : "";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="display text-[34px] leading-none font-semibold">Stichtag</p>
          <p className="mt-3 text-ink-2">
            Die Aufgaben, die wirklich zählen. Mit einem Datum, das gilt.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
