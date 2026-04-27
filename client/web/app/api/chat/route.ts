import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { session_id, message } = await request.json()

  if (!session_id || !message) {
    return Response.json({ error: 'session_id and message required' }, { status: 400 })
  }

  const upstream = process.env.CONVERSATION_SERVICE_URL
  if (!upstream) {
    return Response.json({ error: 'Conversation service not configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization') ?? ''

  try {
    const res = await fetch(`${upstream}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: auth,
      },
      body: JSON.stringify({ session_id, message }),
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Upstream unavailable' }, { status: 502 })
  }
}
