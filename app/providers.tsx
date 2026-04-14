"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/sonner";
import { TooltipProvider } from "@/components/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" />
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SessionProvider>
  );
}