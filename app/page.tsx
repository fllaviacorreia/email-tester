"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SmtpCreds = {
  host: string;
  port: string; // manter string pra input
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

/** ===== Steps ===== */
type StepStatus = "pending" | "running" | "done" | "error";
type StepKey =
  | "validateEmail"
  | "validateService"
  | "buildTransporter"
  | "sendEmail"
  | "success";

type Step = {
  key: StepKey;
  label: string;
  status: StepStatus;
  detail?: string;
};

const INITIAL_STEPS: Step[] = [
  { key: "validateEmail", label: "Validando email", status: "pending" },
  { key: "validateService", label: "Validando serviço", status: "pending" },
  { key: "buildTransporter", label: "Montando nodemailer", status: "pending" },
  { key: "sendEmail", label: "Enviando email", status: "pending" },
  { key: "success", label: "Email enviado com sucesso.", status: "pending" },
];

function resetSteps(): Step[] {
  return INITIAL_STEPS.map((s) => ({ ...s, status: "pending", detail: "" }));
}

function setStep(steps: Step[], key: StepKey, patch: Partial<Step>): Step[] {
  return steps.map((s) => (s.key === key ? { ...s, ...patch } : s));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ProcessBox({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = useMemo(() => {
    const running = steps.findIndex((s) => s.status === "running");
    if (running !== -1) return running;
    const error = steps.findIndex((s) => s.status === "error");
    if (error !== -1) return error;
    const doneCount = steps.filter((s) => s.status === "done").length;
    return Math.min(doneCount, steps.length - 1);
  }, [steps]);

  const progress = useMemo(() => {
    const total = steps.length;
    const done = steps.filter((s) => s.status === "done").length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [steps]);

  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-step-index="${activeIndex}"]`
    ) as HTMLElement | null;

    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const icon = (st: StepStatus) => {
    if (st === "done") return "✅";
    if (st === "running") return "⏳";
    if (st === "error") return "❌";
    return "•";
  };

  return (
    <div ref={containerRef} className="p-4">
      <div className="sticky top-0 z-10 backdrop-blur bg-background/80 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Processos</h2>
          <span className="text-xs opacity-70">{progress}%</span>
        </div>

        <div className="mt-2 h-2 w-full rounded-full bg-input/60 overflow-hidden">
          <div
            className="h-full bg-indigo-500/70 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="mt-3 space-y-2 text-sm">
        {steps.map((s, idx) => (
          <li
            key={s.key}
            data-step-index={idx}
            className={[
              "flex items-start gap-2 rounded-lg px-2 py-2 transition",
              idx === activeIndex ? "bg-white/5 ring-1 ring-white/10" : "",
              s.status === "error" ? "ring-1 ring-red-500/30" : "",
            ].join(" ")}
          >
            <span className="mt-[1px]">{icon(s.status)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={s.status === "error" ? "font-semibold" : ""}>
                  {s.label}
                </span>
                <span className="opacity-70 text-xs">{s.status}</span>
              </div>
              {s.detail ? (
                <p className="opacity-80 text-xs mt-1">{s.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  // email
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // creds
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
    return (
      smtp.host.trim() &&
      smtp.port.trim() &&
      smtp.user.trim() &&
      smtp.pass.trim() &&
      smtp.from.trim()
    );
  }, [smtp]);

  const [steps, setSteps] = useState<Step[]>(resetSteps());

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSend = async () => {
    setStatus("");
    setSteps(resetSteps());

    // 1) Validando email
    setSteps((prev) => setStep(prev, "validateEmail", { status: "running" }));
    await delay(120);

    if (!validateEmail(email)) {
      setSteps((prev) =>
        setStep(prev, "validateEmail", {
          status: "error",
          detail: "Formato de email inválido.",
        })
      );
      setStatus("❌ Email inválido.");
      return;
    }
    setSteps((prev) => setStep(prev, "validateEmail", { status: "done" }));

    // 2) Validando serviço
    setSteps((prev) => setStep(prev, "validateService", { status: "running" }));
    await delay(120);

    if (!isCredsValid) {
      setSteps((prev) =>
        setStep(prev, "validateService", {
          status: "error",
          detail: "Preencha host, porta, usuário, senha e from.",
        })
      );
      setStatus("❌ Credenciais SMTP incompletas.");
      return;
    }
    setSteps((prev) => setStep(prev, "validateService", { status: "done" }));

    // 3) Preparar requisição
    setSteps((prev) =>
      setStep(prev, "buildTransporter", {
        status: "running",
        detail: "Preparando requisição para o servidor...",
      })
    );
    await delay(120);

    setStatus("Enviando...");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        to: email,
        subject,
        message,
      };

      payload.smtp = {
        host: smtp.host,
        port: Number(smtp.port),
        user: smtp.user,
        pass: smtp.pass,
        from: smtp.from,
        secure: smtp.secure,
      };

      setSteps((prev) => setStep(prev, "buildTransporter", { status: "done" }));
      setSteps((prev) => setStep(prev, "sendEmail", { status: "running" }));

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSteps((prev) => setStep(prev, "sendEmail", { status: "done" }));
        setSteps((prev) => setStep(prev, "success", { status: "done" }));
        setStatus("✅ Email enviado!");
      } else {
        const stepFromServer = (data?.step as StepKey | undefined) ?? "sendEmail";

        setSteps((prev) =>
          setStep(prev, stepFromServer, {
            status: "error",
            detail: data?.error ?? "Erro ao enviar",
          })
        );

        if (stepFromServer !== "sendEmail") {
          setSteps((prev) =>
            setStep(prev, "sendEmail", { status: "error", detail: "Abortado." })
          );
        }

        setStatus(`❌ ${data?.error ?? "Erro ao enviar"}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "erro";

      setSteps((prev) =>
        setStep(prev, "sendEmail", {
          status: "error",
          detail: errorMessage,
        })
      );

      setStatus(`❌ Falha de rede: ${errorMessage}`);
    }
  };

  const handleClear = () => {
  setEmail("");
  setSubject("");
  setMessage("");
  setStatus("");

  setSmtp({
    host: "",
    port: "",
    user: "",
    pass: "",
    from: "",
    secure: false,
  });

  setSteps(resetSteps());
};

  return (
    <main className="flex flex-col justify-start items-center max-w-5xl w-full shadow-2xl shadow-indigo-500/80 rounded-xl px-6 md:px-10 py-6 gap-6 my-4">
      <h1 className="my-2 text-xl font-bold">Teste de envio de email</h1>

      {/* Processos + Credenciais lado a lado */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 max-h-[420px] overflow-y-auto scrollbar">
          <ProcessBox steps={steps} />
        </div>

        <section className="rounded-xl border border-white/10 p-4 max-h-[420px] overflow-y-auto scrollbar">
          <div className="sticky top-0 z-10 backdrop-blur bg-background/80 pb-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Credenciais SMTP</h2>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 rounded-2xl bg-input"
                placeholder="SMTP Host (ex: smtp.gmail.com)"
                value={smtp.host}
                onChange={(e) =>
                  setSmtp((s) => ({ ...s, host: e.target.value }))
                }
              />
              <input
                className="px-3 py-2 rounded-2xl bg-input"
                placeholder="Porta (ex: 587)"
                value={smtp.port}
                onChange={(e) =>
                  setSmtp((s) => ({ ...s, port: e.target.value }))
                }
              />
            </div>

            <input
              className="px-3 py-2 rounded-2xl bg-input"
              placeholder="Usuário (email)"
              value={smtp.user}
              onChange={(e) =>
                setSmtp((s) => ({ ...s, user: e.target.value }))
              }
            />

            <div className="flex gap-2">
              <input
                className="px-3 py-2 rounded-2xl bg-input w-full"
                type={showPass ? "text" : "password"}
                placeholder="Senha / App Password"
                value={smtp.pass}
                onChange={(e) =>
                  setSmtp((s) => ({ ...s, pass: e.target.value }))
                }
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
              onChange={(e) =>
                setSmtp((s) => ({ ...s, from: e.target.value }))
              }
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
              secure=false e usar <b> senha de app</b>.
            </p>
          </div>
        </section>
      </div>

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

       <div className="flex gap-3">
  <button
    className="bg-indigo-500/70 flex-1 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={handleSend}
    disabled={!email || !subject || !message || !isCredsValid}
  >
    Enviar
  </button>

  <button
    type="button"
    onClick={handleClear}
    className="px-4 py-2 rounded-xl border border-black/20 hover:bg-black/5 transition"
  >
    Limpar
  </button>
</div>

        <p className="my-4">{status}</p>
      </section>

       <small className="text-xs opacity-70">Repositório no <a className="text-indigo-500" href="https://github.com/fllaviacorreia/email-tester" target="_blank" rel="noopener noreferrer">GitHub</a></small>
      
    </main>
  );
}