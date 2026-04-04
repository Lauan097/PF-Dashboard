import SidebarDashboard from "@/app/components/NavbarDashboard";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { socket } from "@/lib/socket";
import { BotResponse, GuildData } from "@/types/verify";
import AnimationWrapper from "./AnimationWrapper";

async function verifyAdminAccess(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);

    socket.emit("user:checkSession", userId, (response: BotResponse) => {
      clearTimeout(timeout);
      if ("success" in response && response.success === false) {
        resolve(false);
      } else {
        const { isAdmin } = response as {
          isAdmin: boolean;
          guilds: GuildData[];
        };
        resolve(isAdmin);
      }
    });
  });
}

export default async function GuildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = await verifyAdminAccess(session.user.id);

  if (!isAdmin) {
    redirect("/access-denied");
  }

  return (
    <div className="flex h-screen">
      <div className="print:hidden">
        <SidebarDashboard />
      </div>
      <main className="flex-1 overflow-auto">
        <AnimationWrapper>{children}</AnimationWrapper>
      </main>
    </div>
  );
}
