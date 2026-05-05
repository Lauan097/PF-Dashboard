import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!action || !["up", "warning", "ban"].includes(action)) {
    return NextResponse.json(
      { error: "Ação inválida. Use: up, warning ou ban." },
      { status: 400 },
    );
  }

  const body = await req.json();
  const { guildId, targetUserId } = body;

  if (!guildId || !targetUserId) {
    return NextResponse.json(
      { error: "guildId e targetUserId são obrigatórios." },
      { status: 400 },
    );
  }

  const authorId = session.user.id;

  try {
    if (action === "up") {
      const { roleId, reason } = body;
      if (!roleId || !reason?.trim()) {
        return NextResponse.json(
          { error: "roleId e reason são obrigatórios para promoção." },
          { status: 400 },
        );
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao processar promoção")),
          10000,
        );
        socket.emit(
          "member:processUp",
          { guildId, targetUserId, authorId, roleId, reason },
          (res: { success: boolean; error?: string }) => {
            clearTimeout(timeout);
            if (!res.success) reject(new Error(res.error ?? "Erro no bot"));
            else resolve();
          },
        );
      });

      return NextResponse.json({ success: true });
    }

    if (action === "warning") {
      const { reason, level, durationSeconds } = body;
      if (!reason?.trim() || !level || !durationSeconds) {
        return NextResponse.json(
          { error: "reason, level e durationSeconds são obrigatórios para advertência." },
          { status: 400 },
        );
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao processar advertência")),
          10000,
        );
        socket.emit(
          "member:processWarning",
          { guildId, targetUserId, authorId, reason, level, durationSeconds },
          (res: { success: boolean; error?: string }) => {
            clearTimeout(timeout);
            if (!res.success) reject(new Error(res.error ?? "Erro no bot"));
            else resolve();
          },
        );
      });

      return NextResponse.json({ success: true });
    }

    if (action === "ban") {
      const { reason } = body;
      if (!reason?.trim()) {
        return NextResponse.json(
          { error: "reason é obrigatório para exoneração." },
          { status: 400 },
        );
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao processar exoneração")),
          10000,
        );
        socket.emit(
          "member:processBan",
          { guildId, targetUserId, authorId, reason },
          (res: { success: boolean; error?: string }) => {
            clearTimeout(timeout);
            if (!res.success) reject(new Error(res.error ?? "Erro no bot"));
            else resolve();
          },
        );
      });

      return NextResponse.json({ success: true });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
