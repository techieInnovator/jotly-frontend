"use client";

import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Image
          src={"/jotlyLogo.png"}
          alt="Jotly Logo"
          width={150}
          height={0}
          className="max-h-18 object-contain"
        />

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <a className="nav-link" href="#">Product</a>
          <a className="nav-link" href="#">Templates</a>
          <a className="nav-link" href="#">Pricing</a>
        </nav>

        <div className="header-cta">
          <a className="btn btn-ghost" style={{ cursor: "pointer" }} href="waitlist">Join waitlist</a>
          <a className="btn btn-primary" href="/auth?mode=sign-up">Get early access</a>
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
