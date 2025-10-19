"use client";

import { useState } from "react";
import Image from "next/image";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo">Jotly</div>

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <a className="nav-link" href="#">Product</a>
          <a className="nav-link" href="#">Templates</a>
          <a className="nav-link" href="#">Pricing</a>
        </nav>

        <div className="header-cta">
          <a className="btn btn-ghost" href="#waitlist">Join waitlist</a>
          <a className="btn btn-primary" href="#waitlist">Get early access</a>
        </div>

        <button
          className={`nav-toggle ${open ? "open" : ""}`}
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hamburger" />
        </button>
      </div>
    </header>
  );
}
