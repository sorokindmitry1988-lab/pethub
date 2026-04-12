"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { FormEvent, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function resetCaptcha() {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!captchaToken) return;

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        resetCaptcha();
        return;
      }

      setSuccessMessage("Проверьте почту, мы отправили ссылку для входа");
      setEmail("");
      resetCaptcha();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось отправить ссылку. Попробуйте еще раз.";
      setErrorMessage(message);
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = isSubmitting || !captchaToken;

  return (
    <div className="min-h-dvh bg-zinc-50 px-4 py-8 dark:bg-black sm:px-6">
      <main className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Войти
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Введите email, и мы отправим вам безопасную ссылку для входа без пароля.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              placeholder="name@example.com"
              aria-describedby={
                errorMessage ? "login-error" : successMessage ? "login-success" : undefined
              }
              disabled={isSubmitting}
            />
          </div>

          {siteKey ? (
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => {
                  setCaptchaToken(null);
                }}
                onError={() => {
                  setCaptchaToken(null);
                }}
                onTimeout={() => {
                  setCaptchaToken(null);
                }}
                options={{ theme: "auto" }}
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitDisabled}
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "Отправка..." : "Отправить ссылку"}
          </button>
        </form>

        {successMessage ? (
          <p
            id="login-success"
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            id="login-error"
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {errorMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
