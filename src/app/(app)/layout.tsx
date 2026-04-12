import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-11 max-w-2xl items-center px-4">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Coisinhas do Gu
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
