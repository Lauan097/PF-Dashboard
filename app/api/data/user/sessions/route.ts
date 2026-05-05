import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  const userId = searchParams.get("userId");
  const sessionId = searchParams.get("sessionId");

  if (!guildId || !userId) {
    return NextResponse.json(
      { error: "guildId e userId são obrigatórios." },
      { status: 400 },
    );
  }

  const authorId = session.user.id;

  try {
    if (sessionId) {
      // Detail
      const response = await new Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
      }>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Timeout ao buscar sessão")),
          10000,
        );
        socket.emit(
          "member:getSessionDetail",
          { sessionId, guildId, authorId },
          (res: { success: boolean; data?: unknown; error?: string }) => {
            clearTimeout(timeout);
            if (res.success) resolve(res);
            else reject(new Error(res.error ?? "Erro no bot"));
          },
        );
      });
      return NextResponse.json({ success: true, data: response.data });
    }

    // List
    const response = await new Promise<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Timeout ao buscar sessões")),
        10000,
      );
      socket.emit(
        "member:getSessions",
        { userId, guildId, authorId },
        (res: { success: boolean; data?: unknown; error?: string }) => {
          clearTimeout(timeout);
          if (res.success) resolve(res);
          else reject(new Error(res.error ?? "Erro no bot"));
        },
      );
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
