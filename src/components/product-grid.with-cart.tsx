// src/components/product-grid.with-cart.tsx
"use client";

import { useCart } from "@/components/app-shell";
import { ProductGrid } from "@/components/product-grid";

export default function ProductGridWithCart() {
  const cart = useCart();
  return <ProductGrid onAddToCart={cart.open} />;
}
