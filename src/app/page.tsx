// v.1.1.2 ================================================
// src/app/page.tsx  (Server Component)
import { HeroSection } from "@/components/hero-section";
import { CategoryGrid } from "@/components/category-grid";
import { FlashSale } from "@/components/flash-sale";
import { InterlinkMall } from "@/components/interlink-mall";
import ProductGridWithCart from "@/components/product-grid.with-cart";
// ถ้า ProductGrid ต้อง onAddToCart ให้ดูหมายเหตุด้านล่าง

export default function IndexPage() {
  return (
    <>
      <HeroSection />
      <ProductGridWithCart />
      <CategoryGrid />
      <FlashSale />
      <InterlinkMall />
    </>
  );
}

// v.1.1.2 ================================================


// // src/app/page.tsx

// "use client";

// import { useState } from "react";
// import { Header } from "@/components/header";
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import { ProductGrid } from "@/components/product-grid";
// import { Footer } from "@/components/footer";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { MessageChat } from "@/components/message-chat";

// export default function IndexPage() {
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   // Mock cart items count - in real app this would come from state management
//   const cartItemCount = 4;

//   return (
//     <div className="min-h-screen bg-background">
//       <Header onCartClick={() => setIsCartOpen(true)} cartItemCount={cartItemCount} />
//       <main>
//         <HeroSection />
//         <ProductGrid onAddToCart={() => setIsCartOpen(true)} />
//         <CategoryGrid />
//         <FlashSale />
//         <InterlinkMall />
//       </main>
//       <Footer />
//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//       <MessageChat />
//     </div>
//   );
// }