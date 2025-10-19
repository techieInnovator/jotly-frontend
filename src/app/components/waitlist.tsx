"use client"

import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'jotly_waitlist_emails_v1'

function isValidEmail(v?: string) {
  if (!v) return false
  // simple RFC-ish check
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
}

export default function Waitlist() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  // prefill email if the user previously joined
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const list = JSON.parse(raw) as string[]
      if (Array.isArray(list) && list.length > 0) {
        // don't auto-fill, but keep last used email handy in placeholder
      }
    } catch (e) {
      // ignore
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    if (!isValidEmail(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    // local dedupe before calling server: prevents accidental double-submits
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? (JSON.parse(raw) as string[]) : []
      const normalized = email.trim().toLowerCase()
      if (list.includes(normalized)) {
        setStatus('success')
        setMessage('Looks like you already joined — we saved your spot locally.')
        return
      }
    } catch (e) {
      // ignore localStorage parse errors
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Submission failed')

      // save locally to avoid repeat submissions from this browser
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const list = raw ? (JSON.parse(raw) as string[]) : []
        const normalized = email.trim().toLowerCase()
        if (!list.includes(normalized)) {
          list.push(normalized)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
        }
      } catch (e) {
        // ignore
      }

      setStatus('success')
      setMessage(data?.message || 'Thanks — you are on the list!')
      setName('')
      setEmail('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Something went wrong')
    }
  }

  return (
    <div id="waitlist" className="waitlist-card">
      <form onSubmit={submit} className="waitlist-form" aria-label="Join waitlist">
        <div className="waitlist-row">
          <input aria-label="Name" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} className="mini-input" />
          <input required aria-label="Email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="mini-input" />
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Joining…' : 'Join waitlist'}
          </button>
        </div>

        <div style={{ marginTop: 10 }} aria-live="polite">
          {status === 'success' && <div className="hint success">{message}</div>}
          {status === 'error' && <div className="hint error">{message}</div>}
        </div>
      </form>
    </div>
  )
}
