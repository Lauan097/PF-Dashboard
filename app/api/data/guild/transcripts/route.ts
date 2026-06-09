import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";

interface BotResponse {
  success: boolean;
  html?: string;
  error?: string;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: "Não autorizado. Por favor, faça login." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID do transcript não fornecido." },
      { status: 400 }
    );
  }

  try {
    const botData = await new Promise<BotResponse>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("O bot demorou muito para responder.")), 20000);

      socket.emit(
        "transcript:getData",
        { id, authorId: session.user.id },
        (response: BotResponse) => {
          clearTimeout(timeout);
          resolve(response);
        }
      );
    });

    if (!botData.success) {
      return NextResponse.json(
        { success: false, error: botData.error || "Erro ao carregar o transcript do bot." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, html: botData.html });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}