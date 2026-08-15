import Hero from "./components/Hero";
import ProductCatalog from "./components/ProductCatalog";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import ParticleBackgroundClient from "./components/ParticleBackgroundClient";
import { products, brandInfo } from "./data/products";

export default function Home() {
  return (
    <>
      {/* Particle background (client-only canvas) */}
      <ParticleBackgroundClient />

      <div className="page-wrapper">
        {/* ── HERO ── */}
        <Hero />

        <div className="glow-divider" />

        {/* ── PRODUCT CATALOG ── */}
        <main id="produtos">
          <div className="section">
            <div className="section-header">
              <p className="section-label">Catálogo</p>
              <h2 className="section-title">Nossos Produtos</h2>
              <div className="section-divider" />
            </div>

            <ProductCatalog products={products} />
          </div>
        </main>

        <div className="glow-divider" />

        {/* ── ABOUT ── */}
        <AboutSection brand={brandInfo} />

        <div className="glow-divider" />

        {/* ── CONTACT ── */}
        <ContactSection brand={brandInfo} />

        {/* ── FOOTER ── */}
        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} Diamond Lepus. Todos os direitos
            reservados.
          </span>
        </footer>
      </div>
    </>
  );
}
