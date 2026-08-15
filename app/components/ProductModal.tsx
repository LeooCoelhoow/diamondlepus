"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Product } from "../data/products";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [initials, setInitials] = useState("");

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });
  const priceCustomFormatted = product.priceCustom.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no produto ${product.name}${
      initials ? ` com as iniciais "${initials.toUpperCase()}"` : ""
    }. Poderia me dar mais informações?`
  );

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes do produto ${product.name}`}
    >
      <div className="modal-panel">
        {/* Close button */}
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
          id="modal-close-btn"
        >
          ✕
        </button>

        <div className="modal-grid">
          {/* Left — Gallery */}
          <div className="modal-gallery">
            <div className="gallery-main">
              <Image
                src={product.images[activeImg].src}
                alt={product.images[activeImg].alt}
                width={400}
                height={400}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                priority
              />
            </div>

            <div className="gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={img.src}
                  className={`gallery-thumb ${i === activeImg ? "active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Ver ${img.color}`}
                  id={`thumb-${product.id}-${i}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={60}
                    height={60}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>

            <p className="gallery-color-label">
              Cor: {product.images[activeImg].color}
            </p>
          </div>

          {/* Right — Info */}
          <div className="modal-info">
            <div>
              <h2 className="modal-product-name">{product.name}</h2>
              <p className="modal-tagline">{product.longDescription}</p>
            </div>

            {/* Price */}
            <div className="modal-price-row">
              <span className="modal-price">{priceFormatted}</span>
              {product.customizable && (
                <span className="modal-price-custom">
                  Com personalização: {priceCustomFormatted}
                </span>
              )}
            </div>

            {/* Specs */}
            <div>
              <table className="specs-table" aria-label="Especificações do produto">
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Personalization field */}
            {product.customizable && (
              <div>
                <p className="custom-field-label">Personalização — Iniciais</p>
                <input
                  className="custom-field-input"
                  type="text"
                  maxLength={3}
                  placeholder="ex: DL"
                  value={initials}
                  onChange={(e) =>
                    setInitials(e.target.value.replace(/[^a-zA-Z]/g, ""))
                  }
                  id={`initials-input-${product.id}`}
                  aria-label="Suas iniciais para personalização"
                />
                <p className="custom-field-hint">
                  {initials.length}/3 letras — Deixe em branco para a versão padrão
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href={`https://wa.me/5500000000000?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                id={`whatsapp-cta-${product.id}`}
              >
                <button className="btn-primary">
                  💬 Pedir via WhatsApp
                </button>
              </a>
              <button className="btn-secondary" onClick={onClose}>
                Continuar explorando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
