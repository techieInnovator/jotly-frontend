"use client"

import React from 'react'

export default function HeroDemos() {
  function runSchedule() {
    // scroll to editor then signal demo
    const el = document.getElementById('waitlist') || document.querySelector('.tiptap-wrapper')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.dispatchEvent(new CustomEvent('jotly:demo-schedule'))
  }

  function runTicket() {
    const el = document.getElementById('waitlist') || document.querySelector('.tiptap-wrapper')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.dispatchEvent(new CustomEvent('jotly:demo-ticket'))
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="btn btn-primary large" onClick={runSchedule}>See schedule demo</button>
      <button className="btn btn-ghost large" onClick={runTicket}>See ticket demo</button>
    </div>
  )
}
