"use client"

import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

type TiptapProps = {
  initialContent?: string;
  onUpdate?: (html: string, text: string) => void;
}

const Tiptap = function Tiptap({ initialContent, onUpdate }: TiptapProps) {
  const [loadingAction, setLoadingAction] = useState<null | string>(null)

  const editor: Editor | null = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? '<p>Welcome to Jotly — start writing something that matters.</p>',
    editorProps: { attributes: { class: 'tiptap-content', 'aria-label': 'Jotly editor' } },
    // avoid SSR rendering issues
    immediatelyRender: false,
  })

  // Smart Actions state
  const [actionsOpen, setActionsOpen] = useState(false)
  const [detected, setDetected] = useState<Array<any>>([])
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({})
  const [selectedProviders, setSelectedProviders] = useState<Record<string, string>>({})

  function detectActionsFromText(text: string) {
    const out: Array<any> = []
    const t = text || ''

    // detect meeting: "meet with NAME at 8pm" or "meeting with NAME at 8pm"
    const meetRe = /meet(?:ing)? with ([A-Za-z]+) at ([0-9]{1,2}(?::[0-9]{2})?\s?(?:am|pm)?)/i
    const m = t.match(meetRe)
    if (m) {
      out.push({ id: 'meet-1', type: 'schedule', title: `Call with ${m[1]}`, when: m[2], who: m[1] })
    }

    // detect handover/task: "handover <desc> to NAME"
    const handoverRe = /handover ([\w\s\-\_\.]+?) to ([A-Za-z]+)/i
    const h = t.match(handoverRe)
    if (h) {
      out.push({ id: 'task-1', type: 'ticket', title: `${h[1].trim()}`, assignee: h[2] })
    }

    return out
  }

  function openActions() {
    if (!editor) return
    const text = editor.getText()
    const found = detectActionsFromText(text)
    // set default providers per detected action
    const defaults: Record<string, string> = {}
    for (const f of found) {
      if (f.type === 'schedule') defaults[f.id] = 'Google Meet'
      if (f.type === 'ticket') defaults[f.id] = 'Jira'
    }
    setSelectedProviders(defaults)
    setDetected(found)
    setActionStatus({})
    setActionsOpen(true)
  }

  async function performAction(a: any) {
    // simulate an async operation
    setActionStatus((s) => ({ ...s, [a.id]: 'pending' }))
    await new Promise((r) => setTimeout(r, 700))
    // mark success and if schedule, insert a note into the editor
    setActionStatus((s) => ({ ...s, [a.id]: 'done' }))
    const provider = selectedProviders[a.id] || ''
    if (a.type === 'schedule' && editor) {
      const link = provider === 'Google Meet' ? `https://meet.google.com/${Math.random().toString(36).slice(2,8)}` : `https://zoom.us/j/${Math.floor(Math.random()*10000000)}`
      const snippet = `\n\n[Scheduled] ${a.title} with ${a.who} at ${a.when} — scheduled on ${provider}: ${link} (mock)`
      editor.chain().focus().insertContent(snippet).run()
    }
    if (a.type === 'ticket' && editor) {
      let ticketUrl = ''
      if (provider === 'Jira') ticketUrl = `https://yourjira.atlassian.net/browse/JOTLY-${Math.floor(Math.random()*900+100)}`
      if (provider === 'Asana') ticketUrl = `https://app.asana.com/0/123456/${Math.floor(Math.random()*900000+100000)}`
      if (provider === 'Linear') ticketUrl = `https://linear.app/yourorg/issue/${Math.random().toString(36).slice(2,9)}`
      const snippet = `\n\n[Ticket] ${a.title} — created in ${provider}: ${ticketUrl} (mock, assigned to ${a.assignee})`
      editor.chain().focus().insertContent(snippet).run()
    }
  }

  function applyMockAI(action: 'summarize' | 'polish') {
    if (!editor) return
    setLoadingAction(action)
    const current = editor.getText()
    // simulate processing
    setTimeout(() => {
      if (action === 'summarize') {
        const summary = `\n\nSummary:\n- ${current.slice(0, 40)}...\n- Quick action: follow up`;
        editor.chain().focus().insertContent(summary).run()
      } else {
        const polished = `\n\nPolished: ${current.slice(0, 80)} — rewritten to be concise.`
        editor.chain().focus().insertContent(polished).run()
      }
      setLoadingAction(null)
    }, 900)
  }

  // Demo typing: simulate a user typing into the editor for the landing page
  async function playDemo() {
    if (!editor) return
    const demo = `Project brainstorm:\n- Problem: Make note-taking delightful\n- Idea: Quick capture + AI polish\n- Next: Build a tiny prototype\n\nTry the "Summarize" button to see magic.`
    setLoadingAction('demo')
    // clear then type
    editor.chain().focus().setContent('<p></p>').run()
    for (let i = 0; i < demo.length; i++) {
      const ch = demo[i]
      // small delay to simulate typing
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 24 + (i % 4)))
  editor.commands.insertContent(ch)
    }
    // add a highlighted AI suggestion
    await new Promise((r) => setTimeout(r, 220))
    editor.chain().focus().insertContent(`<p><mark class="ai-suggestion">Try: Summarize this into 3 bullets for quick sharing.</mark></p>`).run()
    setLoadingAction(null)
  }

  // Quick demo helpers for landing page (auto-run the smart action)
  async function demoSchedule() {
    if (!editor) return
    const sample = 'meet with rohan at 8pm'
    editor.chain().focus().setContent(`<p>${sample}</p>`).run()
    // detect and show
    const found = detectActionsFromText(editor.getText())
    setDetected(found)
    // default provider
    const defaults: Record<string,string> = {}
    for (const f of found) {
      if (f.type === 'schedule') defaults[f.id] = 'Google Meet'
      if (f.type === 'ticket') defaults[f.id] = 'Jira'
    }
    setSelectedProviders(defaults)
    setActionStatus({})
    setActionsOpen(true)
    // auto-perform the first detected action after a short delay to show result
    if (found.length > 0) {
      setTimeout(() => performAction(found[0]), 900)
    }
  }

  async function demoTicket() {
    if (!editor) return
    const sample = 'handover python api to vikas'
    editor.chain().focus().setContent(`<p>${sample}</p>`).run()
    const found = detectActionsFromText(editor.getText())
    setDetected(found)
    const defaults: Record<string,string> = {}
    for (const f of found) {
      if (f.type === 'schedule') defaults[f.id] = 'Google Meet'
      if (f.type === 'ticket') defaults[f.id] = 'Jira'
    }
    setSelectedProviders(defaults)
    setActionStatus({})
    setActionsOpen(true)
    if (found.length > 0) {
      setTimeout(() => performAction(found[0]), 900)
    }
  }

  function copyContent() {
    if (!editor) return
    try {
      navigator.clipboard.writeText(editor.getHTML())
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    if (!editor || !onUpdate) return
    const handler = () => onUpdate(editor.getHTML(), editor.getText())
    editor.on('update', handler)
    return () => { editor.off('update', handler); }
  }, [editor, onUpdate])

  // listen for hero demo events
  useEffect(() => {
    function onDemoSchedule() { demoSchedule() }
    function onDemoTicket() { demoTicket() }
    window.addEventListener('jotly:demo-schedule', onDemoSchedule)
    window.addEventListener('jotly:demo-ticket', onDemoTicket)
    return () => {
      window.removeEventListener('jotly:demo-schedule', onDemoSchedule)
      window.removeEventListener('jotly:demo-ticket', onDemoTicket)
    }
  }, [editor])

  // small helpers for formatting
  const can = (cmd: (e: Editor) => void) => !!editor

  const isActive = (name: string, attrs?: Record<string, any>) => editor ? editor.isActive(name, attrs) : false

  const toggleBold = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleBold().run() }
  const toggleItalic = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run() }
  const toggleHeading = (level: number) => (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: level as any }).run() }
  const toggleBullet = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleBulletList().run() }
  const toggleOrdered = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleOrderedList().run() }
  const toggleBlockquote = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleBlockquote().run() }
  const toggleCodeBlock = (e: React.MouseEvent) => { e.preventDefault(); editor?.chain().focus().toggleCodeBlock().run() }

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar" role="toolbar" aria-label="Editor toolbar">
        <div className="tiptap-format" role="group" aria-label="Formatting">
          <button title="Bold" aria-pressed={isActive('bold')} disabled={!editor} className={`tiptap-format-btn ${isActive('bold') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleBold}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 7h5a3 3 0 0 1 0 6H7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 13h6a3 3 0 0 1 0 6H7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button title="Italic" aria-pressed={isActive('italic')} disabled={!editor} className={`tiptap-format-btn ${isActive('italic') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleItalic}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M10 4l4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 4l-4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button title="Heading" aria-pressed={isActive('heading', { level: 2 })} disabled={!editor} className={`tiptap-format-btn ${isActive('heading', { level: 2 }) ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleHeading(2)}>
            H2
          </button>

          <div className="tiptap-separator" aria-hidden />

          <button title="Bullet list" aria-pressed={isActive('bulletList')} disabled={!editor} className={`tiptap-format-btn ${isActive('bulletList') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleBullet}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M8 6h10M8 12h10M8 18h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4.5" cy="6" r="1" fill="currentColor" />
              <circle cx="4.5" cy="12" r="1" fill="currentColor" />
              <circle cx="4.5" cy="18" r="1" fill="currentColor" />
            </svg>
          </button>

          <button title="Numbered list" aria-pressed={isActive('orderedList')} disabled={!editor} className={`tiptap-format-btn ${isActive('orderedList') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleOrdered}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M8 6h10M8 12h10M8 18h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6v.01M3 12v.01M3 18v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="tiptap-separator" aria-hidden />

          <button title="Quote" aria-pressed={isActive('blockquote')} disabled={!editor} className={`tiptap-format-btn ${isActive('blockquote') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleBlockquote}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 8h3v6H7zM14 8h3v6h-3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button title="Code block" aria-pressed={isActive('codeBlock')} disabled={!editor} className={`tiptap-format-btn ${isActive('codeBlock') ? 'active' : ''}`} onMouseDown={(e) => e.preventDefault()} onClick={toggleCodeBlock}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M10 8l-4 4 4 4M14 8l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

  <div className="tiptap-ai" role="group" aria-label="AI actions">
          <button title="Summarize" aria-label="Summarize" className="tiptap-ai-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMockAI('summarize')}>
            <span className="ai-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6h8M8 12h8M8 18h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="ai-label">{loadingAction === 'summarize' ? '…' : 'Summarize'}</span>
          </button>

          <button title="Polish" aria-label="Polish" className="tiptap-ai-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMockAI('polish')}>
            <span className="ai-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="ai-label">{loadingAction === 'polish' ? '…' : 'Polish'}</span>
          </button>

          <button title="Demo" aria-label="Play demo" className="tiptap-ai-btn" onMouseDown={(e) => e.preventDefault()} onClick={playDemo}>
            <span className="ai-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3v18l15-9L5 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/></svg>
            </span>
            <span className="ai-label">{loadingAction === 'demo' ? '…' : 'Demo'}</span>
          </button>

          <button title="Copy" aria-label="Copy content" className="tiptap-ai-btn" onMouseDown={(e) => e.preventDefault()} onClick={copyContent}>
            <span className="ai-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9h8v8H9zM5 5h8v8H5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="ai-label">Copy</span>
          </button>
          <div style={{ width: 8 }} />
          <button title="Demo schedule" aria-label="Demo schedule" className="tiptap-demo-btn" onMouseDown={(e) => e.preventDefault()} onClick={demoSchedule}>Demo: Schedule</button>
          <button title="Demo ticket" aria-label="Demo ticket" className="tiptap-demo-btn" onMouseDown={(e) => e.preventDefault()} onClick={demoTicket}>Demo: Ticket</button>
          <div style={{ width: 8 }} />
          <button title="Actions" aria-label="Smart actions" className="tiptap-action-btn" onMouseDown={(e) => e.preventDefault()} onClick={openActions}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="tiptap-footer">
        <div className="char-count">{editor ? editor.getText().length : 0} chars</div>
      </div>

      {actionsOpen && (
        <div className="actions-overlay" role="dialog" aria-modal="true" aria-label="Smart actions">
          <div className="actions-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Suggested actions</h3>
              <div>
                <button className="tiptap-action-btn" onClick={() => setActionsOpen(false)}>Close</button>
              </div>
            </div>

            <div className="actions-list">
              {detected.length === 0 && <div className="actions-item">No actions found in your text.</div>}
              {detected.map((a) => (
                <div key={a.id} className="actions-item">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{a.title}</div>
                    <div className="actions-meta">{a.type === 'schedule' ? `When: ${a.when}` : `Assign to: ${a.assignee || ''}`}</div>
                    <div style={{ marginTop: 8 }}>
                      {a.type === 'schedule' && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ fontSize: 13, color: 'rgba(20,20,20,0.6)' }}>Provider:</div>
                          <button className={`provider-btn ${selectedProviders[a.id] === 'Google Meet' ? 'selected' : ''}`} onClick={() => setSelectedProviders((s) => ({ ...s, [a.id]: 'Google Meet' }))}>Google Meet</button>
                          <button className={`provider-btn ${selectedProviders[a.id] === 'Zoom' ? 'selected' : ''}`} onClick={() => setSelectedProviders((s) => ({ ...s, [a.id]: 'Zoom' }))}>Zoom</button>
                        </div>
                      )}
                      {a.type === 'ticket' && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ fontSize: 13, color: 'rgba(20,20,20,0.6)' }}>Create in:</div>
                          <button className={`provider-btn ${selectedProviders[a.id] === 'Jira' ? 'selected' : ''}`} onClick={() => setSelectedProviders((s) => ({ ...s, [a.id]: 'Jira' }))}>Jira</button>
                          <button className={`provider-btn ${selectedProviders[a.id] === 'Asana' ? 'selected' : ''}`} onClick={() => setSelectedProviders((s) => ({ ...s, [a.id]: 'Asana' }))}>Asana</button>
                          <button className={`provider-btn ${selectedProviders[a.id] === 'Linear' ? 'selected' : ''}`} onClick={() => setSelectedProviders((s) => ({ ...s, [a.id]: 'Linear' }))}>Linear</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => setDetected(detected.filter((x) => x.id !== a.id))}>Ignore</button>
                    <button className="btn btn-primary" onClick={() => performAction(a)} disabled={actionStatus[a.id] === 'pending'}>{actionStatus[a.id] === 'pending' ? 'Working…' : 'Perform'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tiptap;
