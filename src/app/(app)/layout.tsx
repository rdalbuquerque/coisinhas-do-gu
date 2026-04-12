import { BottomNav } from "@/components/bottom-nav";
import { Baby } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-2xl items-center gap-2 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground/80">
            Coisinhas do Gu
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
