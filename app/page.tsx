"use client";

import { useMemo, useState } from "react";

type SmtpCreds = {
  host: string;
  port: string; // manter string pra input
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

export default function Home() {
  // email
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // creds
  // const [useEnv, setUseEnv] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const [smtp, setSmtp] = useState<SmtpCreds>({
    host: "",
    port: "",
    user: "",
    pass: "",
    from: "",
    secure: false, // 587 => STARTTLS (secure:false)
  });

  const isCredsValid = useMemo(() => {
    //    if (useEnv) return true;
    return (
      smtp.host.trim() &&
      smtp.port.trim() &&
      smtp.user.trim() &&
      smtp.pass.trim() &&
      smtp.from.trim()
    );
  }, [smtp]);

  const handleSend = async () => {
    setStatus("Enviando...");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        to: email,
        subject,
        message,
      };

      // if (!useEnv) {
        payload.smtp = {
          host: smtp.host,
          port: Number(smtp.port),
          user: smtp.user,
          pass: smtp.pass,
          from: smtp.from,
          secure: smtp.secure,
        };
      // }

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("✅ Email enviado!");
      } else {
        setStatus(`❌ ${data?.error ?? "Erro ao enviar"}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "erro";
      setStatus(`❌ Falha de rede: ${errorMessage}`);
    }
  };

  return (
    <main className="flex flex-col justify-start items-center max-w-xl w-full shadow-2xl shadow-indigo-500/80 rounded-xl px-10 py-6 gap-4 my-4">
      <h1 className="my-2 text-xl font-bold">Teste de Email</h1>

      {/* Card Credenciais */}
      <section className="w-full rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Credenciais SMTP</h2>

          {/* <label className="flex items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="scale-110"
              checked={useEnv}
              onChange={(e) => setUseEnv(e.target.checked)}
            />
            Usar .env
          </label> */}
        </div>

        {/* {!useEnv && ( */}
        <div className="mt-3 grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="px-3 py-2 rounded-2xl bg-input"
              placeholder="SMTP Host (ex: smtp.gmail.com)"
              value={smtp.host}
              onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
            />
            <input
              className="px-3 py-2 rounded-2xl bg-input"
              placeholder="Porta (ex: 587)"
              value={smtp.port}
              onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))}
            />
          </div>

          <input
            className="px-3 py-2 rounded-2xl bg-input"
            placeholder="Usuário (email)"
            value={smtp.user}
            onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
          />

          <div className="flex gap-2">
            <input
              className="px-3 py-2 rounded-2xl bg-input w-full"
              type={showPass ? "text" : "password"}
              placeholder="Senha / App Password"
              value={smtp.pass}
              onChange={(e) => setSmtp((s) => ({ ...s, pass: e.target.value }))}
            />
            <button
              type="button"
              className="px-3 py-2 rounded-xl border border-white/10"
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <input
            className="px-3 py-2 rounded-2xl bg-input"
            placeholder='From (ex: "Teste <meuemail@gmail.com>")'
            value={smtp.from}
            onChange={(e) => setSmtp((s) => ({ ...s, from: e.target.value }))}
          />

          <label className="flex items-center gap-2 text-sm select-none mt-1">
            <input
              type="checkbox"
              className="scale-110"
              checked={smtp.secure}
              onChange={(e) =>
                setSmtp((s) => ({ ...s, secure: e.target.checked }))
              }
            />
            Secure (465 = true / 587 = false)
          </label>

          <p className="text-xs opacity-80 mt-1">
            * Para Gmail, normalmente: host smtp.gmail.com, porta 587,
            secure=false e usar
            <b> senha de app</b>.
          </p>
        </div>
        {/* )} */}
      </section>

      {/* Card Email */}
      <section className="w-full rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold mb-3">Enviar Email</h2>

        <input
          className="px-3 py-2 rounded-2xl mb-2 w-full bg-input"
          type="email"
          placeholder="Para (to)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="px-3 py-2 rounded-2xl mb-2 w-full bg-input"
          type="text"
          placeholder="Assunto"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          placeholder="Mensagem"
          className="px-3 py-2 rounded-2xl mb-2 w-full bg-input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          className="bg-indigo-500/70 w-full py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={!email || !subject || !message || !isCredsValid}
        >
          Enviar
        </button>

        <p className="my-4">{status}</p>
      </section>
    </main>
  );
}
