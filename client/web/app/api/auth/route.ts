export async function POST() {
  const upstream = process.env.CONVERSATION_SERVICE_URL
  if (!upstream) {
    return Response.json({ error: 'Conversation service not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(`${upstream}/auth/anon`, { method: 'POST' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
