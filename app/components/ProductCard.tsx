"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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

      const rotateX = ((y - cy) / cy) * -8; // max 8°
      const rotateY = ((x - cx) / cx) * 8;

      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  const previewImage = product.images[0];
  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: product.currency,
  });

  return (
    <div
      className="product-card-scene"
      onClick={onClick}
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
          style={{ transition: "transform 0.1s ease-out, box-shadow 0.4s ease, border-color 0.4s ease" }}
        >
          {/* Preview image */}
          <div className="card-preview-area">
            <Image
              src={previewImage.src}
              alt={previewImage.alt}
              fill
              className="card-preview-img"
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {product.badge && (
              <span className="card-badge">{product.badge}</span>
            )}
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
