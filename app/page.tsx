'use client';

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingScreen from "./components/LoadingScreen";
import { SessionCheckResponse } from "@/types/verify";

export default function HomeDashboard() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/verify?type=checkSession");
        const data: SessionCheckResponse = await res.json();

        if (!res.ok || !data.success || !data.isAdmin || !data.guilds?.length) {
          router.replace("/access-denied");
          return;
        }

        const savedId = typeof window !== 'undefined' ? localStorage.getItem('lastGuildId') : null;
        const target  = savedId && data.guilds.some((g) => g.id === savedId)
          ? savedId
          : data.guilds[0].id;

        router.replace(`/${target}`);
      } catch {
        router.replace("/access-denied");
      }
    };

    verify();
  }, [status, router]);

  return <LoadingScreen isLoading />;
}
