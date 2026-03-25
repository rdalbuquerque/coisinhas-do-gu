"use client";

import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    "standalone" in window.navigator &&
    (window.navigator as unknown as { standalone: boolean }).standalone
  );
}

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Must be iOS and Safari (not Chrome, Firefox, etc. on iOS)
  return isIos() && /safari/i.test(ua) && !/crios|fxios|opios/i.test(ua);
}

const DISMISS_KEY = "ios-install-prompt-dismissed";

export function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIos()) return;
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Small delay so it doesn't flash on load
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  const isSafari = isIosSafari();

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">Instalar Coisinhas do Gu</p>
            {isSafari ? (
              <p className="text-xs text-muted-foreground mt-1">
                Toque em{" "}
                <Share className="inline h-3.5 w-3.5 -mt-0.5 text-blue-500" />{" "}
                <span className="font-medium">Compartilhar</span> e depois em{" "}
                <span className="font-medium">&quot;Adicionar à Tela de Início&quot;</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Para instalar, abra este site no <span className="font-medium">Safari</span> e
                toque em{" "}
                <Share className="inline h-3.5 w-3.5 -mt-0.5 text-blue-500" />{" "}
                <span className="font-medium">Compartilhar</span> {" > "}{" "}
                <span className="font-medium">&quot;Adicionar à Tela de Início&quot;</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
