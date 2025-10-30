import Image from "next/image";
import NavBar from "./components/navbar";
import Hero from "./components/hero";

export default function Home() {
  return (
    <div className="page-root">
      <NavBar />
      <main>
        <Hero />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="made-in">Made in India <span className="flag">🇮🇳</span></div>
        </div>
      </footer>
    </div>
  );
}
