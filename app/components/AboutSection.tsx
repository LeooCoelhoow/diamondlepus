import type { brandInfo as BrandInfo } from "../data/products";

interface AboutSectionProps {
  brand: typeof BrandInfo;
}

export default function AboutSection({ brand }: AboutSectionProps) {
  return (
    <section id="sobre" className="about-section" aria-label="Sobre a Diamond Lepus">
      <div className="about-inner">
        <div className="section-header">
          <p className="section-label">Quem somos</p>
          <h2 className="section-title">Sobre a Marca</h2>
          <div className="section-divider" />
        </div>

        <div className="about-icon" aria-hidden="true">
          🐇
        </div>

        <p className="about-text">{brand.about}</p>
      </div>
    </section>
  );
}
