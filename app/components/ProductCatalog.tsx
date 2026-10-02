"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import type { Product } from "../data/products";

interface ProductCatalogProps {
  products: Product[];
}

interface ModalState {
  product: Product;
  originRect?: DOMRect;
  initialColor?: "branco" | "preto";
}

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  return (
    <>
      <div className="catalog-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={(rect, activeColor) =>
              setModalState({
                product,
                originRect: rect,
                initialColor: activeColor,
              })
            }
          />
        ))}
      </div>

      {modalState && (
        <ProductModal
          product={modalState.product}
          originRect={modalState.originRect}
          initialColor={modalState.initialColor}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
}
