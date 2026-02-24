import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-2xl px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
