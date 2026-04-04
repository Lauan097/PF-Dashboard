import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { guildId, userId, data } = body;

  if (!guildId || !userId) {
    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 },
    );
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Timeout ao salvar ficha")),
        8000,
      );

      socket.emit(
        "register:edit",
        { userId, guildId, authorId: session.user.id, data },
        (res: { success: boolean; error?: string }) => {
          clearTimeout(timeout);
          if (!res.success) reject(new Error(res.error || "Erro no Bot"));
          else resolve();
        },
      );
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
