"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, LayoutGrid, ClipboardCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const tabs = [
  { href: "/registrar", label: "Registrar", icon: Camera },
  { href: "/inventario", label: "Inventário", icon: LayoutGrid },
  { href: "/enxoval", label: "Enxoval", icon: ClipboardCheck },
  { href: "/tipos", label: "Tipos", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  function handleNav(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  }

  const activePending = isPending ? pendingHref : null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-card">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          const isLoading = activePending === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNav(e, href)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-[0.65rem] uppercase tracking-widest transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 stroke-[1.5]",
                  isLoading && "animate-pulse"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
