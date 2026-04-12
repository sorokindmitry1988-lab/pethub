import { createClient } from "@/lib/supabase/server"

const FEATURE_KEY = "vet_questions"
const DEFAULT_FREE_LIMIT = 2
const DEFAULT_USED_COUNT = 0

type UsageLimitRow = {
  free_limit: number
  used_count: number
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Требуется вход" }, { status: 401 })
  }

  const { data: existingUsage, error: selectError } = await supabase
    .from("usage_limits")
    .select("free_limit, used_count")
    .eq("user_id", user.id)
    .eq("feature_key", FEATURE_KEY)
    .maybeSingle<UsageLimitRow>()

  if (selectError) {
    console.error("Supabase usage_limits select error:", selectError)
    return Response.json({ error: "Не удалось получить лимиты" }, { status: 500 })
  }

  let usage = existingUsage

  if (!usage) {
    const { data: createdUsage, error: insertError } = await supabase
      .from("usage_limits")
      .insert({
        user_id: user.id,
        feature_key: FEATURE_KEY,
        free_limit: DEFAULT_FREE_LIMIT,
        used_count: DEFAULT_USED_COUNT,
      })
      .select("free_limit, used_count")
      .single<UsageLimitRow>()

    if (insertError) {
      console.error("Supabase usage_limits insert error:", insertError)
      return Response.json({ error: "Не удалось инициализировать лимиты" }, { status: 500 })
    }

    usage = createdUsage
  }

  const freeLimit = usage.free_limit
  const used = usage.used_count
  const remaining = Math.max(freeLimit - used, 0)

  return Response.json(
    {
      freeLimit,
      used,
      remaining,
    },
    { status: 200 }
  )
}
