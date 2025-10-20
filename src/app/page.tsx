// v.1.1.9 ================================================
// src/app/page.tsx
import { HeroSection } from "@/components/hero-section";
import DiscountRuleStripServer from "@/components/discount-rule-strip.server"; // ⇐ เพิ่มบรรทัดนี้
import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
import { ProductGridServer } from "@/components/product-grid.server";
import { absoluteUrl } from "@/lib/base-url";

export const revalidate = 0; // ไม่ cache ขณะพัฒนา

type UICategory = {
  id?: number | string;
  name: string;
  slug: string;
  image_url?: string;
  visible?: boolean;
  order?: number;
};

type UIMeta = {
  title?: string;
  subtitle?: string;
};

async function getCategoriesAndMeta(): Promise<{ items: UICategory[]; meta: UIMeta }> {
  const url = await absoluteUrl("/api/mock/categories");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { items: [], meta: {} };

  const { items = [], meta = {} } = await res.json();

  const normalized = (items as UICategory[])
    .filter((c) => c.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return { items: normalized, meta };
}

export default async function IndexPage() {
  const { items, meta } = await getCategoriesAndMeta();

  return (
    <>
      <HeroSection />

      {/* แถบส่วนลด เรนเดอร์จากฝั่งเซิร์ฟเวอร์ (ขึ้นพร้อม HTML ของหน้า) */}
      <DiscountRuleStripServer />

      <CategoryGrid
        items={items}
        title={meta.title}
        subtitle={meta.subtitle}
      />

      {/* ใช้ค่า title/subtitle/limit จาก featured list: home_weekly */}
      <ProductGridServer listKey="home_weekly" />

      {/* อีกบล็อกจาก featured list: home_cable (จะดึง title/subtitle/limit จากลิสต์เอง) */}
      {/* <ProductGridServer listKey="home_cable" /> */}

      {/* <FlashSale /> */}
      {/* <InterlinkMall /> */}
    </>
  );
}

// v.1.1.9 ================================================

// v.1.1.8 ================================================
// // src/app/page.tsx
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// // import ProductGridWithCart from "@/components/product-grid.with-cart";
// import { ProductGridServer } from "@/components/product-grid.server";
// import { absoluteUrl } from "@/lib/base-url";

// export const revalidate = 0; // ไม่ cache ขณะพัฒนา

// type UICategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = {
//   title?: string;
//   subtitle?: string;
// };

// async function getCategoriesAndMeta(): Promise<{ items: UICategory[]; meta: UIMeta }> {
//   const url = await absoluteUrl("/api/mock/categories");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return { items: [], meta: {} };

//   const { items = [], meta = {} } = await res.json();

//   const normalized = (items as UICategory[])
//     .filter((c) => c.visible !== false)
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//   return { items: normalized, meta };
// }

// export default async function IndexPage() {
//   const { items, meta } = await getCategoriesAndMeta();

//   return (
//     <>
//       <HeroSection />
//       <ProductGridServer listKey="home_weekly" />
//       <CategoryGrid
//         items={items}
//         title={meta.title}         // ✅ ส่งหัวข้อจาก mock
//         subtitle={meta.subtitle}   // ✅ ส่งคำอธิบายจาก mock
//       />
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }

// v.1.1.8 ================================================

// v.1.1.7 ================================================
// // src/app/page.tsx
// import { ProductGridServer } from "@/components/product-grid.server";

// export default async function IndexPage() {
//   return (
//     <>
//       {/* ... */}
//       <ProductGridServer listKey="home_weekly" limit={24} />
//       <ProductGridServer listKey="home_cable" limit={24} />
//       {/* ... */}
//     </>
//   );
// }

// v.1.1.7 ================================================

// v.1.1.6 ================================================
// // src/app/page.tsx
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import ProductGridWithCart from "@/components/product-grid.with-cart";
// import { absoluteUrl } from "@/lib/base-url";

// export const revalidate = 0; // ไม่ cache ขณะพัฒนา

// type UICategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = {
//   title?: string;
//   subtitle?: string;
// };

// async function getCategoriesAndMeta(): Promise<{ items: UICategory[]; meta: UIMeta }> {
//   const url = await absoluteUrl("/api/mock/categories");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return { items: [], meta: {} };

//   const { items = [], meta = {} } = await res.json();

//   const normalized = (items as UICategory[])
//     .filter((c) => c.visible !== false)
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//   return { items: normalized, meta };
// }

// export default async function IndexPage() {
//   const { items, meta } = await getCategoriesAndMeta();

//   return (
//     <>
//       <HeroSection />
//       <ProductGridWithCart />
//       <CategoryGrid
//         items={items}
//         title={meta.title}         // ✅ ส่งหัวข้อจาก mock
//         subtitle={meta.subtitle}   // ✅ ส่งคำอธิบายจาก mock
//       />
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }

// v.1.1.6 ================================================

// v.1.1.5 ================================================
// // src/app/page.tsx

// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import ProductGridWithCart from "@/components/product-grid.with-cart";
// import { absoluteUrl } from "@/lib/base-url";

// export const revalidate = 0; // ไม่ cache หน้า Home ขณะพัฒนา

// type UICategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// async function getCategories(): Promise<UICategory[]> {
//   const url = await absoluteUrl("/api/mock/categories");
//   const res = await fetch(url, { cache: "no-store" });
//   if (!res.ok) return [];
//   const { items } = await res.json();
//   return (items as UICategory[])
//     .filter(c => c.visible !== false)
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
// }

// export default async function IndexPage() {
//   const categories = await getCategories();

//   return (
//     <>
//       <HeroSection />
//       <ProductGridWithCart />
//       <CategoryGrid items={categories} /> {/* <-- ส่งข้อมูลจริงลงไป */}
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// src/app/page.tsx
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import ProductGridWithCart from "@/components/product-grid.with-cart";
// import { absoluteUrl } from "@/lib/base-url";

// export const revalidate = 60;

// type UICategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
//   visible?: boolean;
//   order?: number;
// };

// async function getCategories(): Promise<UICategory[]> {
//   // ใช้ Mock API เพื่อให้ลำดับ/การซ่อนตรงกับแอดมิน
//   const url = await absoluteUrl("/api/mock/categories");
//   const res = await fetch(url, { next: { revalidate } });
//   if (!res.ok) return [];

//   const { items } = await res.json();

//   // กรองเฉพาะที่แสดง และเรียงตาม order
//   return (items as UICategory[])
//     .filter((c) => c.visible !== false)
//     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
// }

// export default async function IndexPage() {
//   const categories = await getCategories();

//   return (
//     <>
//       <HeroSection />
//       <ProductGridWithCart />
//       <CategoryGrid items={categories} />
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/page.tsx
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import ProductGridWithCart from "@/components/product-grid.with-cart";
// import { absoluteUrl } from "@/lib/base-url";

// export const revalidate = 60;

// type UICategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   image?: string;
// };

// async function getCategories(): Promise<UICategory[]> {
//   const url = await absoluteUrl("/api/categories");
//   const res = await fetch(url, { next: { revalidate: 60 } });
//   if (!res.ok) return [];
//   const { items } = await res.json();
//   return items as UICategory[];
// }

// export default async function IndexPage() {
//   const categories = await getCategories();

//   return (
//     <>
//       <HeroSection />
//       <ProductGridWithCart />
//       <CategoryGrid items={categories} />
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }


// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/page.tsx  (Server Component)
// import { HeroSection } from "@/components/hero-section";
// import { CategoryGrid } from "@/components/category-grid";
// import { FlashSale } from "@/components/flash-sale";
// import { InterlinkMall } from "@/components/interlink-mall";
// import ProductGridWithCart from "@/components/product-grid.with-cart";
// // ถ้า ProductGrid ต้อง onAddToCart ให้ดูหมายเหตุด้านล่าง

// export default function IndexPage() {
//   return (
//     <>
//       <HeroSection />
//       <ProductGridWithCart />
//       <CategoryGrid />
//       <FlashSale />
//       <InterlinkMall />
//     </>
//   );
// }

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