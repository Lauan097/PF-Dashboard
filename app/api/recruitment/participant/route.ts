import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { socket } from "@/lib/socket";
import { AcademyParticipant } from "@/types/recruitment";

interface WsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function emitWithTimeout<T>(
  event: string,
  payload: object,
  timeoutMs = 8000
): Promise<WsResponse<T>> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Timeout na resposta do bot.")),
      timeoutMs
    );
    socket.emit(event, payload, (response: WsResponse<T>) => {
      clearTimeout(timeout);
      resolve(response);
    });
  });
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Body inválido." },
        { status: 400 }
      );
    }

    const { guildId, participantId, gameName, gameId, gamePhone, antecedents } =
      body as {
        guildId: string;
        participantId: string;
        gameName?: string | null;
        gameId?: string | null;
        gamePhone?: string | null;
        antecedents?: string | null;
      };

    if (!guildId || !participantId) {
      return NextResponse.json(
        { success: false, error: "guildId e participantId são obrigatórios." },
        { status: 400 }
      );
    }

    const response = await emitWithTimeout<AcademyParticipant>(
      "recruitment:editParticipant",
      {
        userId: session.user.id,
        guildId,
        participantId,
        gameName,
        gameId,
        gamePhone,
        antecedents,
      }
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || "Erro ao editar participante." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno.";
    console.error("[API] PATCH /api/recruitment/participant:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");
    const participantId = searchParams.get("participantId");

    if (!guildId || !participantId) {
      return NextResponse.json(
        { success: false, error: "guildId e participantId são obrigatórios." },
        { status: 400 }
      );
    }

    const response = await emitWithTimeout<{ id: string }>(
      "recruitment:deleteParticipant",
      { userId: session.user.id, guildId, participantId }
    );

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || "Erro ao deletar participante." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro interno.";
    console.error("[API] DELETE /api/recruitment/participant:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
