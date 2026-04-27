'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './ChatShell.module.css'

type Message = { role: 'user' | 'assistant'; content: string }
type SessionEntry = { id: string; preview: string; ts: number }

const LS_SESSIONS_KEY = 'ttm_sessions'
const LS_TOKEN_KEY = 'ttm_token'

function loadSessions(): SessionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSIONS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function upsertSession(
  list: SessionEntry[],
  id: string,
  preview: string,
): SessionEntry[] {
  const exists = list.find(s => s.id === id)
  const updated = { id, preview: preview.slice(0, 60), ts: Date.now() }
  if (exists) return list.map(s => (s.id === id ? updated : s))
  return [updated, ...list]
}

function groupByDate(list: SessionEntry[]) {
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const yestStart = todayStart - 86_400_000
  const weekStart = todayStart - 6 * 86_400_000

  const groups: [string, SessionEntry[]][] = [
    ['Today', []],
    ['Yesterday', []],
    ['This week', []],
    ['Earlier', []],
  ]
  for (const s of list) {
    if (s.ts >= todayStart) groups[0][1].push(s)
    else if (s.ts >= yestStart) groups[1][1].push(s)
    else if (s.ts >= weekStart) groups[2][1].push(s)
    else groups[3][1].push(s)
  }
  return groups.filter(([, items]) => items.length > 0)
}

// Fetch or create an anonymous JWT. Stored in localStorage.
async function getOrCreateToken(): Promise<string> {
  const stored = localStorage.getItem(LS_TOKEN_KEY)
  if (stored) return stored
  const res = await fetch('/api/auth', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to initialise account')
  const { token } = await res.json()
  localStorage.setItem(LS_TOKEN_KEY, token)
  return token
}

// Create a new session on the server, linked to the authenticated user.
async function createServerSession(token: string): Promise<string> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to create session')
  const { session_id } = await res.json()
  return session_id
}

export function ChatShell() {
  const [mounted, setMounted] = useState(false)
  const [token, setToken] = useState('')
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessions(loadSessions())
    getOrCreateToken()
      .then(async tok => {
        setToken(tok)
        const sid = await createServerSession(tok)
        setSessionId(sid)
        setMounted(true)
      })
      .catch(() => setMounted(true))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  // Re-initialise auth (e.g. after 401). Previous chat history on this device is lost.
  async function reInitAuth() {
    localStorage.removeItem(LS_TOKEN_KEY)
    try {
      const tok = await getOrCreateToken()
      setToken(tok)
      const sid = await createServerSession(tok)
      setSessionId(sid)
      setMessages([])
    } catch {
      // silently fail — user can retry
    }
  }

  async function loadSession(id: string) {
    setSessionId(id)
    setMessages([])
    setPending(true)
    try {
      const res = await fetch(`/api/history/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { await reInitAuth(); return }
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch {
      setMessages([])
    } finally {
      setPending(false)
    }
  }

  async function newChat() {
    if (!token) return
    try {
      const sid = await createServerSession(token)
      setSessionId(sid)
    } catch {
      setSessionId(crypto.randomUUID()) // fallback so UI isn't blocked
    }
    setMessages([])
    setInput('')
  }

  async function send() {
    const text = input.trim()
    if (!text || pending || !token) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setPending(true)

    setSessions(prev => {
      const updated = upsertSession(prev, sessionId, text)
      localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(updated))
      return updated
    })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })
      if (res.status === 401) { await reInitAuth(); return }
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply ?? data.error ?? 'No response.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setPending(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!mounted) return <div className={styles.loading} />

  const groups = groupByDate(sessions)

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarTop}>
          <span className={styles.logo}>TalktoMe</span>
        </div>

        <button className={styles.newChatBtn} onClick={newChat}>
          + New chat
        </button>

        <nav className={styles.sessionList}>
          {groups.length === 0 ? (
            <p className={styles.noSessions}>No previous chats</p>
          ) : (
            groups.map(([label, items]) => (
              <div key={label} className={styles.group}>
                <span className={styles.groupLabel}>{label}</span>
                {items.map(s => (
                  <button
                    key={s.id}
                    className={`${styles.sessionItem} ${s.id === sessionId ? styles.active : ''}`}
                    onClick={() => loadSession(s.id)}
                  >
                    {s.preview}
                  </button>
                ))}
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Main chat area */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div>
            <p className={styles.headerTitle}>Chat</p>
            <p className={styles.headerSub}>Anonymous &amp; private</p>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.length === 0 && !pending && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyTitle}>Hi, I&apos;m here to listen.</p>
              <p className={styles.emptySub}>
                Share whatever&apos;s on your mind — no judgment, just support.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${styles[m.role]}`}>
              {m.content}
            </div>
          ))}

          {pending && (
            <div className={`${styles.bubble} ${styles.assistant} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className={styles.inputRow}>
          <textarea
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Share what's on your mind… (Enter to send)"
            rows={2}
            disabled={pending}
          />
          <button
            className={styles.sendBtn}
            onClick={send}
            disabled={pending || !input.trim()}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
