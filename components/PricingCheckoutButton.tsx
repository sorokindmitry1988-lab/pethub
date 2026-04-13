"use client";

import Link from "next/link";
import { useState } from "react";

const buttonClass =
  "inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:pointer-events-none disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100";

export function PricingCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  async function handleClick() {
    setError(null);
    setNeedsLogin(false);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      let data: { url?: unknown; error?: unknown } = {};
      try {
        data = (await res.json()) as { url?: unknown; error?: unknown };
      } catch {
        // не JSON
      }

      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }

      if (!res.ok) {
        const msg =
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : "Не удалось начать оплату";
        setError(msg);
        return;
      }

      const url = typeof data.url === "string" ? data.url : null;
      if (!url) {
        setError("Не получена ссылка на оплату");
        return;
      }

      window.location.href = url;
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={buttonClass}
      >
        {loading ? "Переход к оплате…" : "Оплатить 99 ₽"}
      </button>
      {needsLogin ? (
        <p
          className="mt-3 text-sm text-zinc-600 dark:text-zinc-400"
          role="status"
        >
          Чтобы оплатить тариф,{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline decoration-current underline-offset-2 dark:text-zinc-100"
          >
            войдите в аккаунт
          </Link>
          .
        </p>
      ) : null}
      {error ? (
        <p
          className="mt-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
