"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

type PetType = "собака" | "кошка" | "другое";

type FormErrors = {
  petType?: string;
  title?: string;
  description?: string;
};

type UsagePayload = {
  freeLimit: number;
  used: number;
  remaining: number;
};

type VetQuestion = {
  id: string;
  pet_type: string;
  title: string;
  description: string;
  created_at: string;
};

const FREE_QUESTION_LIMIT = 2;

const usageErrorBannerClass =
  "mb-6 rounded-xl border-2 border-amber-600/70 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm dark:border-amber-500/60 dark:bg-amber-950/40 dark:text-amber-100 sm:mb-8 sm:px-5 sm:py-4";

const questionsErrorBannerClass =
  "rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-200 sm:px-5 sm:py-4 sm:text-base";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20";

const labelClass =
  "text-sm font-medium text-zinc-700 dark:text-zinc-300";

const errorClass = "mt-1 text-sm text-red-600 dark:text-red-400";

const successBannerClass =
  "mb-6 rounded-xl border-2 border-emerald-500/80 bg-emerald-50 px-4 py-4 text-emerald-950 shadow-sm dark:border-emerald-400/70 dark:bg-emerald-950/40 dark:text-emerald-100 sm:mb-8 sm:px-5 sm:py-4";

const submitErrorBannerClass =
  "mb-6 rounded-xl border-2 border-red-500/70 bg-red-50 px-4 py-4 text-red-950 shadow-sm dark:border-red-400/60 dark:bg-red-950/40 dark:text-red-100 sm:mb-8 sm:px-5 sm:py-4";

const questionCardClass =
  "rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 sm:px-5 sm:py-5";

function parseQuestionsPayload(raw: unknown): VetQuestion[] {
  if (typeof raw !== "object" || raw === null) return [];
  const o = raw as Record<string, unknown>;
  if (o.success !== true || !Array.isArray(o.questions)) return [];
  const out: VetQuestion[] = [];
  for (const item of o.questions) {
    if (typeof item !== "object" || item === null) continue;
    const q = item as Record<string, unknown>;
    const id = q.id;
    const pet_type = q.pet_type;
    const title = q.title;
    const description = q.description;
    const created_at = q.created_at;
    if (
      typeof pet_type !== "string" ||
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof created_at !== "string"
    ) {
      continue;
    }
    out.push({
      id:
        typeof id === "string"
          ? id
          : `${created_at}-${out.length}-${title.slice(0, 24)}`,
      pet_type,
      title,
      description,
      created_at,
    });
  }
  return out;
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AskVetForm() {
  const [petType, setPetType] = useState<PetType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successfulSubmissions, setSuccessfulSubmissions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsagePayload | null>(null);

  const [questions, setQuestions] = useState<VetQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const res = await fetch("/api/questions");
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        throw new Error("not json");
      }
      if (!res.ok) {
        const errObj =
          typeof data === "object" &&
          data !== null &&
          typeof (data as Record<string, unknown>).error === "string"
            ? (data as { error: string }).error.trim()
            : "";
        throw new Error(errObj || "request failed");
      }
      if (typeof data !== "object" || data === null) {
        throw new Error("bad response");
      }
      const body = data as Record<string, unknown>;
      if (body.success !== true || !Array.isArray(body.questions)) {
        throw new Error("invalid shape");
      }
      setQuestions(parseQuestionsPayload(data));
    } catch {
      setQuestions([]);
      setQuestionsError(
        "Не удалось загрузить список вопросов. Проверьте соединение и обновите страницу."
      );
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsage() {
      setUsageLoading(true);
      setUsageError(null);
      try {
        const res = await fetch("/api/usage");
        let data: unknown;
        try {
          data = await res.json();
        } catch {
          throw new Error("not json");
        }
        if (cancelled) return;
        if (!res.ok || typeof data !== "object" || data === null) {
          throw new Error("bad response");
        }
        const o = data as Record<string, unknown>;
        const freeLimit = o.freeLimit;
        const used = o.used;
        const remaining = o.remaining;
        if (
          typeof freeLimit !== "number" ||
          typeof used !== "number" ||
          typeof remaining !== "number" ||
          !Number.isFinite(freeLimit) ||
          !Number.isFinite(used) ||
          !Number.isFinite(remaining)
        ) {
          throw new Error("invalid shape");
        }
        setUsage({ freeLimit, used, remaining });
      } catch {
        if (!cancelled) {
          setUsage(null);
          setUsageError(
            "Не удалось загрузить лимит вопросов. Форма доступна, лимит учитывается локально."
          );
        }
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    }

    void fetchUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  const freeRemaining = usage
    ? Math.max(0, usage.remaining - successfulSubmissions)
    : FREE_QUESTION_LIMIT - successfulSubmissions;

  const limitReached = usage
    ? successfulSubmissions >= usage.freeLimit ||
      usage.remaining - successfulSubmissions <= 0
    : successfulSubmissions >= FREE_QUESTION_LIMIT;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!petType) next.petType = "Выберите тип питомца";
    if (!title.trim()) next.title = "Введите заголовок вопроса";
    if (!description.trim()) next.description = "Опишите проблему";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resetForm() {
    setPetType("");
    setTitle("");
    setDescription("");
    setErrors({});
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (limitReached) return;
    if (!validate()) return;

    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petType,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
      } = {};
      try {
        data = (await res.json()) as {
          success?: boolean;
          error?: string;
        };
      } catch {
        // тело ответа не JSON
      }

      if (res.ok && data.success === true) {
        setSuccessfulSubmissions((n) => n + 1);
        resetForm();
        setSuccessMessage("Вопрос отправлен");
        void fetchQuestions();
      } else {
        const msg =
          typeof data.error === "string" && data.error.trim()
            ? data.error.trim()
            : "Не удалось отправить вопрос";
        setErrorMessage(msg);
      }
    } catch {
      setErrorMessage("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p
        className="mt-3 mb-6 text-sm text-zinc-500 dark:text-zinc-400 sm:mb-8"
        aria-live="polite"
      >
        {usageLoading ? (
          <>Загрузка лимита…</>
        ) : (
          <>Осталось бесплатных вопросов: {freeRemaining}</>
        )}
      </p>

      {usageError ? (
        <div
          className={usageErrorBannerClass}
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium leading-relaxed sm:text-base">
            {usageError}
          </p>
        </div>
      ) : null}

      {limitReached ? (
        <div
          className="mb-6 rounded-xl border-2 border-amber-500/80 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm dark:border-amber-400/70 dark:bg-amber-950/40 dark:text-amber-100 sm:mb-8 sm:px-5 sm:py-4"
          role="status"
        >
          <p className="text-sm font-medium leading-relaxed sm:text-base">
            Бесплатный лимит исчерпан. Разблокируйте консультации в платной
            версии.
          </p>
        </div>
      ) : null}

      {successMessage ? (
        <div
          className={successBannerClass}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium leading-relaxed sm:text-base">
            {successMessage}
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className={submitErrorBannerClass}
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-medium leading-relaxed sm:text-base">
            {errorMessage}
          </p>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 sm:gap-6"
        noValidate
      >
        <div>
          <label htmlFor="pet-type" className={labelClass}>
            Тип питомца
          </label>
          <select
            id="pet-type"
            name="petType"
            value={petType}
            onChange={(e) =>
              setPetType(e.target.value as PetType | "")
            }
            className={inputClass}
            disabled={limitReached}
            aria-invalid={Boolean(errors.petType)}
            aria-describedby={errors.petType ? "pet-type-error" : undefined}
          >
            <option value="">Выберите тип</option>
            <option value="собака">Собака</option>
            <option value="кошка">Кошка</option>
            <option value="другое">Другое</option>
          </select>
          {errors.petType ? (
            <p id="pet-type-error" className={errorClass} role="alert">
              {errors.petType}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="question-title" className={labelClass}>
            Заголовок вопроса
          </label>
          <input
            id="question-title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Кратко сформулируйте вопрос"
            className={inputClass}
            autoComplete="off"
            disabled={limitReached}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title ? (
            <p id="title-error" className={errorClass} role="alert">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="problem-description" className={labelClass}>
            Описание проблемы
          </label>
          <textarea
            id="problem-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Симптомы, длительность, что уже пробовали…"
            rows={5}
            className={`${inputClass} min-h-[8rem] resize-y sm:min-h-[9rem]`}
            disabled={limitReached}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          {errors.description ? (
            <p id="description-error" className={errorClass} role="alert">
              {errors.description}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={usageLoading || limitReached || loading}
          className="mt-1 w-full rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100 sm:mt-2 sm:w-auto sm:self-start sm:min-w-[200px]"
        >
          {loading ? "Отправка…" : "Отправить"}
        </button>
      </form>

      <section
        className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:mt-12 sm:pt-10"
        aria-labelledby="recent-questions-heading"
      >
        <div className="mb-4 flex flex-col gap-1 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <h2
            id="recent-questions-heading"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl"
          >
            Последние вопросы
          </h2>
          {questionsLoading ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
              Загрузка списка…
            </p>
          ) : null}
        </div>

        {questionsError ? (
          <div
            className={questionsErrorBannerClass}
            role="alert"
            aria-live="polite"
          >
            <p className="font-medium leading-relaxed">{questionsError}</p>
          </div>
        ) : null}

        {!questionsLoading && !questionsError && questions.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Пока нет сохранённых вопросов. Отправьте первый — он появится здесь.
          </p>
        ) : null}

        {!questionsError && questions.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3 sm:mt-5 sm:gap-4">
            {questions.map((q) => (
              <li key={q.id}>
                <article className={questionCardClass}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {q.pet_type}
                    </span>
                    <time
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                      dateTime={q.created_at}
                    >
                      {formatCreatedAt(q.created_at)}
                    </time>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {q.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {q.description}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  );
}
