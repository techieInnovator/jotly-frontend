"use client";

import { useEffect, useState, useRef } from "react";

export default function ToolBadge({ target = 10 }: { target?: number }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (mounted) setCount(i);
      if (i >= target) {
        clearInterval(interval);
      }
    }, 80);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [target]);

  // pulse when reaching target
  const [justReached, setJustReached] = useState(false);
  useEffect(() => {
    if (count >= target) {
      setJustReached(true);
      const t = setTimeout(() => setJustReached(false), 900);
      return () => clearTimeout(t);
    }
    return;
  }, [count, target]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const tools = [
    "Notes",
    "Tasks",
    "Docs",
    "Wiki",
    "Bookmarks",
    "Reminders",
    "To-dos",
    "Snippets",
    "Drafts",
    "Universal Search",
  ];

  const displayCount = count >= target ? `${target}+` : String(count);

  return (
    <>
      <div className="tool-badge-wrap">
        <button className={`tool-badge ${justReached ? 'pulse' : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
          <div className="count">{displayCount}</div>
          <div className="label">tools replaced</div>
        </button>
        <div className="tool-tooltip" role="tooltip">
          <div className="tt-title">Examples</div>
          <div className="tt-list">Notes · Tasks · Docs</div>
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Tools Jotly replaces"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="modal-header">
              <h3>Jotly replaces 10+ tools</h3>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <ul className="modal-list">
              {tools.map((t) => (
                <li key={t} className="modal-item">{t}</li>
              ))}
            </ul>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setOpen(false)}>Get Started</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
