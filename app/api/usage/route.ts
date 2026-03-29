export async function GET() {
  const freeLimit = 2
  const used = 0
  const remaining = freeLimit - used

  return Response.json(
    {
      freeLimit,
      used,
      remaining,
    },
    { status: 200 }
  )
}
