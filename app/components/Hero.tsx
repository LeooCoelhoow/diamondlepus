"use client";

import dynamic from "next/dynamic";

const RabbitViewer = dynamic(() => import("./RabbitViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontSize: "0.75rem",
        letterSpacing: "0.2em",
        fontFamily: "Orbitron, monospace",
      }}
    >
      ◈
    </div>
  ),
});

export default function Hero() {
  return (
    <section className="hero-section" aria-label="Diamond Lepus — Hero">
      {/* Glow ring behind logo */}
      <div className="hero-glow-ring" aria-hidden="true" />

      {/* Brand name */}
      <h1 className="brand-title animate-slide-up">Diamond Lepus</h1>
      <p className="brand-subtitle animate-slide-up animate-delay-1">
        Impressão 3D com Identidade
      </p>

      {/* 3D Rabbit STL viewer */}
      <div className="hero-viewer-wrapper animate-slide-up animate-delay-2">
        <RabbitViewer />
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint">
        <span>Explorar</span>
        <span className="scroll-arrow" aria-hidden="true" />
      </div>
    </section>
  );
}
