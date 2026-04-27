import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const upstream = process.env.CONVERSATION_SERVICE_URL
  if (!upstream) {
    return Response.json({ error: 'Conversation service not configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization') ?? ''

  try {
    const res = await fetch(`${upstream}/sessions`, {
      method: 'POST',
      headers: { authorization: auth },
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
