import { createClient } from "@/lib/supabase/server"

const FEATURE_KEY = "vet_questions"
const DEFAULT_FREE_LIMIT = 2
const DEFAULT_USED_COUNT = 0

type UsageLimitRow = {
  free_limit: number
  used_count: number
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Требуется вход" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Некорректное тело запроса" }, { status: 400 })
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Все поля обязательны" }, { status: 400 })
  }

  const { petType, title, description } = body as Record<string, unknown>

  if (!isFilledString(petType) || !isFilledString(title) || !isFilledString(description)) {
    return Response.json({ error: "Все поля обязательны" }, { status: 400 })
  }

  const { data: existingUsage, error: usageSelectError } = await supabase
    .from("usage_limits")
    .select("free_limit, used_count")
    .eq("user_id", user.id)
    .eq("feature_key", FEATURE_KEY)
    .maybeSingle<UsageLimitRow>()

  if (usageSelectError) {
    console.error("Supabase usage_limits select error:", usageSelectError)
    return Response.json({ error: "Не удалось проверить лимит" }, { status: 500 })
  }

  let usage = existingUsage

  if (!usage) {
    const { data: createdUsage, error: usageInsertError } = await supabase
      .from("usage_limits")
      .insert({
        user_id: user.id,
        feature_key: FEATURE_KEY,
        free_limit: DEFAULT_FREE_LIMIT,
        used_count: DEFAULT_USED_COUNT,
      })
      .select("free_limit, used_count")
      .single<UsageLimitRow>()

    if (usageInsertError) {
      console.error("Supabase usage_limits insert error:", usageInsertError)
      return Response.json({ error: "Не удалось инициализировать лимит" }, { status: 500 })
    }

    usage = createdUsage
  }

  if (usage.used_count >= usage.free_limit) {
    return Response.json({ error: "Бесплатный лимит исчерпан" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("vet_questions")
    .insert({
      user_id: user.id,
      pet_type: petType.trim(),
      title: title.trim(),
      description: description.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    return Response.json({ error: "Не удалось сохранить вопрос" }, { status: 500 })
  }

  const { error: usageUpdateError } = await supabase
    .from("usage_limits")
    .update({ used_count: usage.used_count + 1 })
    .eq("user_id", user.id)
    .eq("feature_key", FEATURE_KEY)

  if (usageUpdateError) {
    console.error("Supabase usage_limits update error:", usageUpdateError)
    return Response.json({ error: "Не удалось обновить лимит" }, { status: 500 })
  }

  return Response.json(
    {
      success: true,
      message: "Вопрос отправлен",
      question: data,
    },
    { status: 200 }
  )
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Требуется вход" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("vet_questions")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Supabase select error:", error)
    return Response.json({ error: "Не удалось загрузить вопросы" }, { status: 500 })
  }

  return Response.json(
    {
      success: true,
      questions: data,
    },
    { status: 200 }
  )
}
