"use client";

import { useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "../data/products";

/* Dynamic import with SSR disabled to prevent WebGL hydration mismatches */
const Product3DViewer = dynamic(() => import("./Product3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="product-3d-skeleton">
      <div className="product-3d-skeleton-spinner" />
      <span className="product-3d-skeleton-text">Carregando modelo 3D...</span>
    </div>
  ),
});

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState<"branco" | "preto">("branco");

  // Track drag distance to differentiate between 3D model rotation and card click
  const pointerStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // 3D tilt on mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotateX = ((y - cy) / cy) * -6; // subtle 6° tilt
      const rotateY = ((x - cx) / cx) * 6;

      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (dx > 6 || dy > 6) {
      isDragging.current = true;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    onClick();
  };

  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });

  return (
    <div
      className="product-card-scene"
      onClick={handleCardClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      role="button"
      aria-label={`Ver detalhes de ${product.name}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Depth layers */}
      <div className="product-card-layers">
        <div className="product-card-layer" aria-hidden="true" />
        <div className="product-card-layer" aria-hidden="true" />

        {/* Main card */}
        <div
          ref={cardRef}
          className="product-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transition:
              "transform 0.1s ease-out, box-shadow 0.4s ease, border-color 0.4s ease",
          }}
        >
          {/* 3D Model Interactive Preview Area */}
          <div className="card-preview-area">
            <Product3DViewer
              activeColor={activeColor}
              onColorChange={setActiveColor}
              badge={product.badge}
            />
          </div>

          {/* Info */}
          <div className="card-body">
            <h2 className="card-name">{product.name}</h2>
            <p className="card-tagline">{product.tagline}</p>

            <div className="card-price">
              A partir de {priceFormatted}
            </div>

            <div className="card-cta">
              <span>Ver detalhes</span>
              <svg
                className="card-cta-arrow"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
