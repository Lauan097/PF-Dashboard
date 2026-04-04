import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { RecordPDF } from "@/app/components/RecordPDF";
import type { MemberRecord } from "@/types/user";
import React from "react";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const member: MemberRecord = body.member;

  if (!member?.userId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const buffer = await renderToBuffer(
    React.createElement(RecordPDF, {
      member,
    }) as React.ReactElement<DocumentProps>,
  );

  const name = member.gameName ?? member.userId;
  const filename = `ficha-${name.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
