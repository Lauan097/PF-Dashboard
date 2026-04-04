import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { RecordPDF } from "@/app/components/RecordPDF";
import type { MemberRecord } from "@/types/user";
import React from "react";
import fs from "fs";
import path from "path";

async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") ?? "image/png";
    return `data:${ct};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

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

  // Pré-carrega o logo do filesystem (evita URL localhost em produção)
  const logoPath = path.join(process.cwd(), "public", "logoTP.png");
  const logoBuf = fs.readFileSync(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuf.toString("base64")}`;

  // Pré-carrega foto e assinatura como base64 para evitar problemas de extensão
  const [photoSrc, signatureSrc] = await Promise.all([
    member.photoUrl ? toBase64(member.photoUrl) : Promise.resolve(null),
    member.signature ? toBase64(member.signature) : Promise.resolve(null),
  ]);

  const buffer = await renderToBuffer(
    React.createElement(RecordPDF, {
      member,
      logoSrc,
      photoSrc: photoSrc ?? undefined,
      signatureSrc: signatureSrc ?? undefined,
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
