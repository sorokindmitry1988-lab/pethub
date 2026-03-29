"use client";

import { useState } from "react";

type SubscribeButtonProps = {
  initialSubscribed?: boolean;
};

export function SubscribeButton({
  initialSubscribed = false,
}: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);

  return (
    <button
      type="button"
      onClick={() => setSubscribed((prev) => !prev)}
      aria-pressed={subscribed}
      className={
        subscribed
          ? "flex min-h-11 w-full min-w-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-500 sm:min-h-12 sm:px-5 sm:text-base"
          : "flex min-h-11 w-full min-w-0 items-center justify-center rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100 sm:min-h-12 sm:px-5 sm:text-base"
      }
    >
      {subscribed ? "Подписан" : "Подписаться"}
    </button>
  );
}
