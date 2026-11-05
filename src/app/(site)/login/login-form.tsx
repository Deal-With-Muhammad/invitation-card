"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";

type Step = { kind: "email" } | { kind: "code"; email: string };

/** Sign in or sign up with a code sent by email. No passwords. */
export function LoginForm({ next, reauth, linkFailed }: { next: string; reauth: boolean; linkFailed: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "email" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(linkFailed ? "That sign-in link has expired or was already used. Ask for a new code." : null);
  const [resent, setResent] = useState(false);

  const post = async (path: string, body: object) => {
    const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "Something went wrong. Please try again.");
    return j;
  };

  const sendCode = async (to: string) => {
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/otp", { email: to, next });
      setStep({ kind: "code", email: to });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (step.kind !== "code") return;
    setBusy(true);
    setError(null);
    try {
      const j = await post("/api/auth/verify", { email: step.email, code, next });
      // A full load, so the header and every page pick up the new session.
      window.location.assign(j.next || next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't check the code.");
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-line bg-card p-6 sm:p-8">
      <h1 className="font-serif text-[34px] leading-tight">{step.kind === "email" ? "Sign in" : "Check your email"}</h1>
      {step.kind === "email" ? (
        <>
          <p className="mt-2 text-[15px] text-muted">
            {reauth
              ? "For safety, the admin area asks for a fresh code every 12 hours."
              : "New here? The same steps create your account. We email you a code, so there's no password to remember."}
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) sendCode(email.trim().toLowerCase());
            }}
          >
            <TextField value={email} onChange={setEmail} type="email" autoComplete="email" isRequired>
              <Label>Email</Label>
              <Input placeholder="you@example.com" autoCapitalize="none" spellCheck={false} />
            </TextField>
            {error && <p className="rounded-xl bg-wax/10 px-3.5 py-2.5 text-[14px] text-wax">{error}</p>}
            <Button type="submit" size="lg" fullWidth isDisabled={busy || !email.trim()}>
              {busy ? "Sending…" : "Email me a code"}
            </Button>
          </form>
          <p className="mt-5 text-[13px] leading-snug text-muted">
            You don&apos;t need an account to make an invitation. Signing in keeps your invitations safe in your account, so you can edit them from any phone.
          </p>
          <p className="mt-2 text-[13px] leading-snug text-muted">
            By continuing you agree to the{" "}
            <Link className="underline underline-offset-4" href="/terms">
              Terms
            </Link>{" "}
            and{" "}
            <Link className="underline underline-offset-4" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-[15px] text-muted">
            We sent a code to <strong className="text-ink">{step.email}</strong>. Enter it here, or tap the link in the email on this device.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <TextField value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 10))} autoComplete="one-time-code" isRequired>
              <Label>Code</Label>
              <Input inputMode="numeric" placeholder="123456" className="text-center font-mono text-[22px] tracking-[0.4em]" autoFocus />
            </TextField>
            {error && <p className="rounded-xl bg-wax/10 px-3.5 py-2.5 text-[14px] text-wax">{error}</p>}
            <Button type="submit" size="lg" fullWidth isDisabled={busy || code.length < 6}>
              {busy ? "Checking…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap justify-between gap-2 text-[13.5px]">
            <button type="button" className="text-brand underline underline-offset-4" onClick={() => { setStep({ kind: "email" }); setCode(""); setError(null); }}>
              Use another email
            </button>
            <button
              type="button"
              className="text-brand underline underline-offset-4 disabled:text-muted disabled:no-underline"
              disabled={busy || resent}
              onClick={async () => {
                if (await sendCode(step.email)) setResent(true);
              }}
            >
              {resent ? "New code sent" : "Send a new code"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
