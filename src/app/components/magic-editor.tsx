"use client";

import { useEffect, useState, useRef } from "react";

export default function MagicEditor() {
  const [content, setContent] = useState("Brainstorm ideas for the new project...\n- Goal:\n- Next steps:\n");
  const [suggestion, setSuggestion] = useState<string | null>("Try: Summarize this into 3 bullets");
  const [loading, setLoading] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      // Cycle subtle suggestions
      setSuggestion((s) =>
        s === null
          ? "Try: Polished intro for your note"
          : s === "Try: Polished intro for your note"
          ? "Try: Extract action items"
          : null
      );
    }, 4200);
    return () => clearInterval(id);
  }, []);

  function applySuggestion() {
    if (!suggestion) return;
    setLoading(true);
    setTimeout(() => {
      setContent((c) => c + `\n• ${suggestion.replace(/^Try: /, "")}`);
      setLoading(false);
    }, 900);
  }

  function handleAI(action: "summarize" | "polish") {
    setLoading(true);
    setTimeout(() => {
      if (action === "summarize") {
        setContent((c) => c + "\n\nSummary:\n- Key idea 1\n- Key idea 2\n- Next step");
      } else {
        setContent((c) => c + "\n\nPolished intro: A clear plan to move forward — start with this next step...");
      }
      setLoading(false);
    }, 1200);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && fullMode) setFullMode(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullMode]);

  // lightweight focus-trap for fullscreen panel
  useEffect(() => {
    if (!fullMode) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (first && typeof first.focus === 'function') first.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [fullMode]);

  return (
    <div className="magic-editor" aria-live="polite">
      <div className="editor-top">
        <div className="editor-title">Untitled note</div>
        <div className="editor-actions">
          <button className="mini-btn" onClick={() => handleAI("summarize")}>
            {loading ? "…" : "Summarize"}
          </button>
          <button className="mini-btn" onClick={() => handleAI("polish")}>{loading ? "…" : "Polish"}</button>
          <div className="fullscreen-btn-wrap">
            <button
              className="mini-btn"
              onClick={() => setFullMode(true)}
              aria-haspopup="dialog"
              aria-expanded={fullMode}
              aria-label="Open editor full screen"
              title="Open editor full screen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 9V3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 15v6h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21l7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="fullscreen-tooltip" role="tooltip">Open — Esc to close</div>
          </div>
        </div>
      </div>

      <textarea ref={editorRef} className="editor-area" value={content} onChange={(e) => setContent(e.target.value)} />

      <div className="editor-footer">
        <div className="suggestion" onClick={applySuggestion} role="button" tabIndex={0}>
          {loading ? <span className="dot-pulse" /> : <span>{suggestion ?? "No suggestions"}</span>}
        </div>
      </div>

      {fullMode && (
        <div
          className="editor-fullscreen-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen editor"
          onClick={() => setFullMode(false)}
        >
    <div className="editor-fullscreen-panel" onClick={(e) => e.stopPropagation()} ref={panelRef}>
            <div className="editor-top">
              <div className="editor-title">Untitled note</div>
              <div className="editor-actions">
                <button className="mini-btn" onClick={() => handleAI("summarize")}>
                  {loading ? "…" : "Summarize"}
                </button>
                <button className="mini-btn" onClick={() => handleAI("polish")}>
                  {loading ? "…" : "Polish"}
                </button>
                <button className="mini-btn" onClick={() => setFullMode(false)} aria-label="Close full screen" title="Close full screen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <textarea
              ref={editorRef}
              className="editor-area editor-area-full"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="editor-footer">
              <div className="suggestion" onClick={applySuggestion} role="button" tabIndex={0}>
                {loading ? <span className="dot-pulse" /> : <span>{suggestion ?? "No suggestions"}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
