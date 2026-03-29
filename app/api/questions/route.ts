import { supabase } from "@/lib/supabase"

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export async function POST(request: Request) {
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

  const { data, error } = await supabase
    .from("vet_questions")
    .insert({
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
  const { data, error } = await supabase
    .from("vet_questions")
    .select()
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
