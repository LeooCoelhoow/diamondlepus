import type { brandInfo as BrandInfo } from "../data/products";

interface ContactSectionProps {
  brand: typeof BrandInfo;
}

const channels = [
  {
    key: "instagram" as const,
    icon: "",
    label: "Instagram",
    href: (v: string) => `https://instagram.com/${v.replace("@", "")}`,
  },
  {
    key: "whatsapp" as const,
    icon: "",
    label: "WhatsApp",
    href: (v: string) =>
      `https://wa.me/${v.replace(/\D/g, "")}`,
  },
  {
    key: "email" as const,
    icon: "",
    label: "E-mail",
    href: (v: string) => `mailto:${v}`,
  },
];

export default function ContactSection({ brand }: ContactSectionProps) {
  return (
    <section id="contato" className="contact-section" aria-label="Contato Diamond Lepus">
      <div className="contact-inner">
        <div className="section-header">
          <p className="section-label">Fale conosco</p>
          <h2 className="section-title">Contato</h2>
          <div className="section-divider" />
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "1rem" }}>
          Dúvidas, pedidos personalizados ou apenas um oi — estamos aqui!
        </p>

        <div className="contact-cards">
          {channels.map((ch) => {
            const value = brand.contact[ch.key];
            return (
              <a
                key={ch.key}
                href={ch.href(value)}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                id={`contact-${ch.key}`}
                aria-label={`${ch.label}: ${value}`}
              >
                <span className="contact-card-icon" aria-hidden="true">
                  {ch.icon}
                </span>
                <span className="contact-card-label">{ch.label}</span>
                <span className="contact-card-value">{value}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
