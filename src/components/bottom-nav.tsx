"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, LayoutGrid, ClipboardCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/registrar", label: "Registrar", icon: Camera },
  { href: "/inventario", label: "Inventário", icon: LayoutGrid },
  { href: "/enxoval", label: "Enxoval", icon: ClipboardCheck },
  { href: "/tipos", label: "Tipos", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
