import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await requireUser();
  return (
    <div className="min-h-screen md:pl-60">
      <Sidebar me={me} />
      <main className="mx-auto w-full max-w-5xl px-5 py-7 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
