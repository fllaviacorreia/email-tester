import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type Body = {
  to: string;
  subject: string;
  message: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure?: boolean;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const { to, subject, message, smtp } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios: to, subject, message" },
        { status: 400 }
      );
    }
    console.log("SMTP recebido:", {...smtp});
if (!smtp) {
  return NextResponse.json(
  { error: "Configurações SMTP obrigatórias" },
  { status: 400 }
  );
}
    const host = smtp?.host
    const port = smtp?.port 
    const user = smtp?.user 
    const pass = smtp?.pass 
    const from = smtp?.from 
    const secure =
      typeof smtp?.secure === "boolean"
        ? smtp.secure
        : String(port) === "465"; // default heurística

    if (!host || !port || !user || !pass || !from) {
      return NextResponse.json(
        { error: "SMTP incompleto (env ou credenciais informadas)." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // 465 true, 587 false
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Erro ao enviar email" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
