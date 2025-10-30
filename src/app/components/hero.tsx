import Image from "next/image";
import Tiptap from "./tiptap";
import ToolBadge from "./tool-badge";
import HeroDemos from "./hero-demos";

export default function Hero() {
  return (
    <section className="hero-landing">
      <div className="hero-bg">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 className="hero-main">Capture clarity.</h1>
          <p className="hero-subtitle">A calm space for your thoughts — jot faster, think clearer, stay organized.</p>

          {/* <div className="hero-actions">
            <HeroDemos />
          </div> */}

          <div className="hero-featureline">Lightweight · Distraction-free · Searchable</div>
        </div>

        <div className="hero-visual">
          <div className="visual-wrap">
            <Tiptap />
            {/* <div className="hero-badge-sticky">
              <ToolBadge target={10} />
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
