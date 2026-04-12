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

  // Clear pending state when navigation completes
  const activePending = isPending ? pendingHref : null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-center justify-around px-2">
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
                "flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 text-[0.65rem] font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-[1.35rem] w-[1.35rem] transition-transform",
                  isActive && "scale-110",
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
