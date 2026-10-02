"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { Product } from "../data/products";

/* Dynamic import of side-by-side 3D gallery to prevent SSR hydration mismatches */
const Modal3DGallery = dynamic(() => import("./Modal3DGallery"), {
  ssr: false,
  loading: () => (
    <div className="modal-gallery-loading">
      <div className="product-3d-skeleton-spinner" />
      <span className="product-3d-skeleton-text">
        Carregando modelos 3D em alta fidelidade...
      </span>
    </div>
  ),
});

interface ProductModalProps {
  product: Product;
  originRect?: DOMRect;
  initialColor?: "branco" | "preto";
  onClose: () => void;
}

export default function ProductModal({
  product,
  originRect,
  initialColor = "branco",
  onClose,
}: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [initials, setInitials] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Smooth close handler with reverse card collapse animation
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    const panel = panelRef.current;
    const overlay = overlayRef.current;

    if (panel && originRect) {
      const panelRect = panel.getBoundingClientRect();
      const scaleX = originRect.width / panelRect.width;
      const scaleY = originRect.height / panelRect.height;
      const translateX =
        originRect.left +
        originRect.width / 2 -
        (panelRect.left + panelRect.width / 2);
      const translateY =
        originRect.top +
        originRect.height / 2 -
        (panelRect.top + panelRect.height / 2);

      panel.style.transition =
        "transform 0.34s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.28s ease, border-radius 0.34s ease";
      panel.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
      panel.style.opacity = "0";

      if (overlay) {
        overlay.style.transition = "opacity 0.3s ease";
        overlay.style.opacity = "0";
      }

      setTimeout(onClose, 340);
    } else {
      if (panel) {
        panel.style.transition = "transform 0.25s ease, opacity 0.25s ease";
        panel.style.transform = "scale(0.92) translateY(16px)";
        panel.style.opacity = "0";
      }
      if (overlay) {
        overlay.style.transition = "opacity 0.25s ease";
        overlay.style.opacity = "0";
      }
      setTimeout(onClose, 250);
    }
  }, [isClosing, originRect, onClose]);

  // Handle overlay backdrop click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Lock body & html scroll completely while modal is open
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;

    document.documentElement.classList.add("modal-locked");
    document.body.classList.add("modal-locked");
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.classList.remove("modal-locked");
      document.body.classList.remove("modal-locked");
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose]);

  // FLIP Card Expansion Animation: Expand from clicked card bounding rect
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !originRect) return;

    const panelRect = panel.getBoundingClientRect();
    if (!panelRect.width || !originRect.width) return;

    const scaleX = originRect.width / panelRect.width;
    const scaleY = originRect.height / panelRect.height;
    const translateX =
      originRect.left +
      originRect.width / 2 -
      (panelRect.left + panelRect.width / 2);
    const translateY =
      originRect.top +
      originRect.height / 2 -
      (panelRect.top + panelRect.height / 2);

    // Initial state: aligned with original card
    panel.style.transformOrigin = "center center";
    panel.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
    panel.style.borderRadius = "20px";
    panel.style.transition = "none";

    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.transition = "none";
    }

    // Trigger physical expansion in next animation frame
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!panel) return;
        panel.style.transition =
          "transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, border-radius 0.46s ease, box-shadow 0.46s ease";
        panel.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
        panel.style.borderRadius = "28px";
        panel.style.opacity = "1";

        if (overlay) {
          overlay.style.transition = "opacity 0.4s ease";
          overlay.style.opacity = "1";
        }
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [originRect]);

  const selectedModel = product.models3D?.find((m) => m.id === selectedColor);
  const colorDisplayName =
    selectedModel?.colorName ||
    (selectedColor === "preto" ? "Preto Ônix" : "Branco Ártico");

  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });
  const priceCustomFormatted = product.priceCustom.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no ${product.name} na cor ${colorDisplayName}${initials ? ` com as iniciais personalizadas "${initials.toUpperCase()}"` : ""
    }. Poderia me passar mais informações para finalizarmos o pedido?`
  );

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes e personalização de ${product.name}`}
    >
      <div ref={panelRef} className="modal-panel">
        {/* Floating Close Button */}
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Fechar modal"
          id="modal-close-btn"
        >
          ✕
        </button>

        {/* ── Header: Title & Badges ── */}
        <div className="modal-header">
          <div className="modal-header-meta">
            <span className="modal-badge-brand">
              DIAMOND LEPUS • DESIGN AUTORAL
            </span>
            {product.badge && (
              <span className="modal-badge-custom">{product.badge}</span>
            )}
          </div>
          <h2 className="modal-product-name">{product.name}</h2>
          <p className="modal-tagline">{product.tagline}</p>
        </div>

        {/* ── 1. MODAL GALLERY (OVER MODAL INFO) ── */}
        <div className="modal-gallery">
          {product.models3D && product.models3D.length > 0 ? (
            <Modal3DGallery
              models={product.models3D}
              selectedColorId={selectedColor}
              onSelectColor={setSelectedColor}
            />
          ) : (
            <div className="modal-gallery-empty">Visualização indisponível</div>
          )}
        </div>

        {/* ── 2. MODAL INFO (UNDER MODAL GALLERY) ── */}
        <div className="modal-info">
          {/* Active Color Feedback Banner */}
          <div className="modal-selected-color-banner">
            <div className="selected-color-info-group">
              <span className="selected-color-label">
                COR SELECIONADA PARA PEDIDO:
              </span>
              <span className="selected-color-title">{colorDisplayName}</span>
            </div>
            <div className="selected-color-status-pill">
              <span
                className="selected-color-swatch-dot"
                style={{
                  background:
                    selectedModel?.colorGradient ||
                    (selectedColor === "preto"
                      ? "linear-gradient(135deg, #373747 0%, #0d0d12 100%)"
                      : "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)"),
                }}
              />
              <span>{selectedModel?.tagline || "Pronto para produção"}</span>
            </div>
          </div>

          {/* Value Proposition Presentation Cards */}
          <div className="modal-value-props">
            <div className="value-prop-card">
              <div className="value-prop-icon"></div>
              <div className="value-prop-text">
                <strong>Impressão 3D de Alta Resolução</strong>
                <p>
                  Geometria lapidada com precisão dimensional e estética
                  orgânica sofisticada.
                </p>
              </div>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon"></div>
              <div className="value-prop-text">
                <strong>Empunhadura Ergonômica</strong>
                <p>
                  Encaixe perfeito para latas de 350ml e 473ml, mantendo o
                  conforto térmico da pegada.
                </p>
              </div>
            </div>
            <div className="value-prop-card">
              <div className="value-prop-icon"></div>
              <div className="value-prop-text">
                <strong>Gravação Exclusiva</strong>
                <p>
                  Opção de iniciais em relevo no escudo frontal para tornar sua
                  peça verdadeiramente única.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Product Long Description */}
          <div className="modal-description-box">
            <p className="modal-long-desc">{product.longDescription}</p>
          </div>

          {/* Specifications & Customization Grid */}
          <div className="modal-details-grid">
            {/* Technical Specs */}
            <div className="modal-specs-col">
              <h3 className="modal-section-title">Especificações Técnicas</h3>
              <table
                className="specs-table"
                aria-label="Especificações do produto"
              >
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

            {/* Customization Input */}
            {product.customizable && (
              <div className="modal-custom-col">
                <h3 className="modal-section-title">
                  Personalização do Escudo
                </h3>
                <p className="custom-field-label">
                  Iniciais em Relevo (2 a 3 letras)
                </p>

                <div className="custom-input-wrapper">
                  <input
                    className="custom-field-input"
                    type="text"
                    maxLength={3}
                    placeholder="Ex: DL"
                    value={initials}
                    onChange={(e) =>
                      setInitials(
                        e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase()
                      )
                    }
                    id={`initials-input-${product.id}`}
                    aria-label="Suas iniciais para personalização"
                  />
                  {initials && (
                    <div className="custom-initials-preview">
                      <span className="preview-label">Prévia:</span>
                      <span className="preview-badge">{initials}</span>
                    </div>
                  )}
                </div>

                <p className="custom-field-hint">
                  {initials.length}/3 letras — Deixe vazio caso deseje a peça
                  lisa padrão sem gravação.
                </p>
              </div>
            )}
          </div>

          {/* Pricing & WhatsApp CTA */}
          <div className="modal-checkout-area">
            <div className="modal-price-container">
              <span className="modal-price-prefix">Valor da Peça:</span>
              <div className="modal-price-row">
                <span className="modal-price">
                  {initials ? priceCustomFormatted : priceFormatted}
                </span>
                {product.customizable && !initials && (
                  <span className="modal-price-custom">
                    (Com personalização: {priceCustomFormatted})
                  </span>
                )}
                {product.customizable && initials && (
                  <span className="modal-price-badge-active">
                    ✦ Iniciais inclusas
                  </span>
                )}
              </div>
            </div>

            <div className="modal-cta-buttons">
              <a
                href={`https://wa.me/5500000000000?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", width: "100%" }}
                id={`whatsapp-cta-${product.id}`}
              >
                <button className="btn-primary">
                  <span className="btn-icon">💬</span>
                  <span>
                    Pedir via WhatsApp • {colorDisplayName}
                  </span>
                </button>
              </a>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
              >
                Continuar explorando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
