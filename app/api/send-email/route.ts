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
    // STEP: validateService + payload
    const body = (await req.json()) as Body;
    const { to, subject, message, smtp } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios: to, subject, message", step: "validateEmail" },
        { status: 400 }
      );
    }

    const host = smtp?.host ?? process.env.SMTP_HOST;
    const port = smtp?.port ?? Number(process.env.SMTP_PORT);
    const user = smtp?.user ?? process.env.SMTP_USER;
    const pass = smtp?.pass ?? process.env.SMTP_PASS;
    const from = smtp?.from ?? process.env.SMTP_FROM;
    const secure =
      typeof smtp?.secure === "boolean" ? smtp.secure : String(port) === "465";

    if (!host || !port || !user || !pass || !from) {
      return NextResponse.json(
        { error: "SMTP incompleto (env ou credenciais informadas).", step: "validateService" },
        { status: 400 }
      );
    }

    // STEP: buildTransporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "erro";
      return NextResponse.json(
        { error: `Falha ao montar nodemailer: ${errorMessage}`, step: "buildTransporter" },
        { status: 500 }
      );
    }

    // STEP: sendEmail
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html: `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "erro";
      return NextResponse.json(
        { error: `Falha ao enviar: ${errorMessage}`, step: "sendEmail" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json(
      { error: errorMessage, step: "sendEmail" },
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