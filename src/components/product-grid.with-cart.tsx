// v.1.1.2 ================================================
// src/components/product-grid.with-cart.tsx
// ❌ ลบ "use client"; ตัวนี้เป็น Server Component
import { ProductGrid } from "@/components/product-grid"; // re-export ของ server component

export default async function ProductGridWithCart() {
  // ไม่ต้องมี hook หรือ fetch ใด ๆ ฝั่ง client ที่นี่
  return <ProductGrid />;
}

// v.1.1.2 ================================================

// // src/components/product-grid.with-cart.tsx
// "use client";

// import { useCart } from "@/components/app-shell";
// import { ProductGrid } from "@/components/product-grid";

// export default function ProductGridWithCart() {
//   const cart = useCart();
//   return <ProductGrid onAddToCart={cart.open} />;
// }
