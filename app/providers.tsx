"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" />
      {children}
    </SessionProvider>
  );
}