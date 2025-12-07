// v.1.1.6 =============================================
// src/components/header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Zustand store
import { useCartStore } from "@/store/cart-store";

// components ย่อย
import { HeaderUserMenu } from "./header/user-menu";
import { HeaderSearchBar } from "./header/search-bar";
import { HeaderCategoryMenu } from "./header/category-menu";

interface HeaderProps {
  onCartClick?: () => void;
  /** ใช้กรณีบางหน้าส่งจำนวนสินค้าในตะกร้ามาเอง (เช่น /about) */
  cartItemCount?: number;
}

export const Header = ({ onCartClick, cartItemCount }: HeaderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // 🛒 Zustand global store
  const storeTotalQuantity = useCartStore((s) => s.summary.totalQuantity);
  const setSummary = useCartStore((s) => s.setSummary);

  // ใช้ค่าจาก prop ถ้ามี, ถ้าไม่มีใช้ค่าจาก store ตามปกติ
  const totalQuantity = cartItemCount ?? storeTotalQuantity;

  /* -------------------------------------------------
   * โหลด summary ครั้งแรกตอนหน้าโหลด (header)
   * ------------------------------------------------- */
  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch("/api/cart/summary", { cache: "no-store" });
        const json = await res.json();
        if (json?.summary) {
          setSummary(json.summary);
        }
      } catch (err) {
        console.error("Failed to load cart summary", err);
      }
    }

    loadSummary();
  }, [setSummary]);

  // sync searchTerm กับ query string
  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    if (category) {
      setSearchTerm(category);
    } else if (search) {
      setSearchTerm(search);
    } else {
      setSearchTerm("");
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleCategorySelected = (category: string) => {
    setSearchTerm(category);
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleClearanceSaleClick = () => {
    router.push("/products");
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
      {/* Main header */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:gap-3">
            <Image
              src="/assets/interlink-logo.png"
              alt="Interlink Logo"
              width={150}
              height={50}
              className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform"
            />
            <div
              className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
            >
              Interlink Shop
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <HeaderSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <HeaderUserMenu />

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-white hover:bg-white/20"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />

              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white text-primary border-t border-primary/10">
        <div className="w-full max-w-screen-2xl mx-auto px-4">
          <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
            {/* หมวดหมู่สินค้า */}
            <HeaderCategoryMenu onCategorySelected={handleCategorySelected} />

            {/* Main menu */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link
                href="/"
                className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
              >
                หน้าแรก
              </Link>
              <Link
                href="/products"
                className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
              >
                สินค้าทั้งหมด
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
              >
                ติดต่อเรา
              </Link>
            </div>

            {/* Clearance sale banner */}
            <span
              className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors"
              onClick={handleClearanceSaleClick}
            >
              Clearance Sale ลดสูงสุด 90%
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
};

// v.1.1.6 =============================================

// v.1.1.5 =============================================
// // src/components/header.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ShoppingCart } from "lucide-react";
// import { Button } from "@/components/ui/button";

// // Zustand store
// import { useCartStore } from "@/store/cart-store";

// // components ย่อย
// import { HeaderUserMenu } from "./header/user-menu";
// import { HeaderSearchBar } from "./header/search-bar";
// import { HeaderCategoryMenu } from "./header/category-menu";

// interface HeaderProps {
//   onCartClick?: () => void;
// }

// export const Header = ({ onCartClick }: HeaderProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchTerm, setSearchTerm] = useState("");

//   // 🛒 Zustand global store
//   const totalQuantity = useCartStore((s) => s.summary.totalQuantity);
//   const setSummary = useCartStore((s) => s.setSummary);

//   /* -------------------------------------------------
//    * โหลด summary ครั้งแรกตอนหน้าโหลด (header)
//    * ------------------------------------------------- */
//   useEffect(() => {
//     async function loadSummary() {
//       try {
//         const res = await fetch("/api/cart/summary", { cache: "no-store" });
//         const json = await res.json();
//         if (json?.summary) {
//           setSummary(json.summary);
//         }
//       } catch (err) {
//         console.error("Failed to load cart summary", err);
//       }
//     }

//     loadSummary();
//   }, [setSummary]);

//   // sync searchTerm กับ query string
//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");
//     if (category) {
//       setSearchTerm(category);
//     } else if (search) {
//       setSearchTerm(search);
//     } else {
//       setSearchTerm("");
//     }
//   }, [searchParams]);

//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   };

//   const handleCategorySelected = (category: string) => {
//     setSearchTerm(category);
//     router.push(`/products?category=${encodeURIComponent(category)}`);
//   };

//   const handleClearanceSaleClick = () => {
//     router.push("/products");
//   };

//   return (
//     <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
//       {/* Main header */}
//       <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
//         <div className="flex items-center gap-4 lg:gap-6">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 lg:gap-3">
//             <Image
//               src="/assets/interlink-logo.png"
//               alt="Interlink Logo"
//               width={150}
//               height={50}
//               className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform"
//             />
//             <div
//               className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors"
//               style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
//             >
//               Interlink Shop
//             </div>
//           </Link>

//           {/* Search */}
//           <div className="flex-1 max-w-2xl">
//             <HeaderSearchBar
//               value={searchTerm}
//               onChange={setSearchTerm}
//               onSearch={handleSearch}
//             />
//           </div>

//           {/* Right actions */}
//           <div className="flex items-center gap-2 lg:gap-4">
//             <HeaderUserMenu />

//             {/* Cart Button */}
//             <Button
//               variant="ghost"
//               size="sm"
//               className="relative text-white hover:bg-white/20"
//               onClick={onCartClick}
//             >
//               <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />

//               {totalQuantity > 0 && (
//                 <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
//                   {totalQuantity}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white text-primary border-t border-primary/10">
//         <div className="w-full max-w-screen-2xl mx-auto px-4">
//           <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
//             {/* หมวดหมู่สินค้า */}
//             <HeaderCategoryMenu onCategorySelected={handleCategorySelected} />

//             {/* Main menu */}
//             <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//               <Link
//                 href="/"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 หน้าแรก
//               </Link>
//               <Link
//                 href="/products"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 สินค้าทั้งหมด
//               </Link>
//               <Link
//                 href="/contact"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 ติดต่อเรา
//               </Link>
//             </div>

//             {/* Clearance sale banner */}
//             <span
//               className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors"
//               onClick={handleClearanceSaleClick}
//             >
//               Clearance Sale ลดสูงสุด 90%
//             </span>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// v.1.1.5 =============================================

// v.1.1.4 =============================================
// // src/components/header.tsx
// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ShoppingCart } from "lucide-react";
// import { Button } from "@/components/ui/button";

// // components ย่อย
// import { HeaderUserMenu } from "./header/user-menu";
// import { HeaderSearchBar } from "./header/search-bar";
// import { HeaderCategoryMenu } from "./header/category-menu";

// interface HeaderProps {
//   onCartClick?: () => void;
//   cartItemCount?: number;
// }

// export const Header = ({ onCartClick, cartItemCount = 0 }: HeaderProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchTerm, setSearchTerm] = useState("");

//   // sync searchTerm กับ query string
//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");
//     if (category) {
//       setSearchTerm(category);
//     } else if (search) {
//       setSearchTerm(search);
//     } else {
//       setSearchTerm("");
//     }
//   }, [searchParams]);

//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       router.push(
//         `/products?search=${encodeURIComponent(searchTerm.trim())}`
//       );
//     }
//   };

//   const handleCategorySelected = (category: string) => {
//     setSearchTerm(category);
//     router.push(`/products?category=${encodeURIComponent(category)}`);
//   };

//   const handleClearanceSaleClick = () => {
//     router.push("/products");
//   };

//   return (
//     <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
//       {/* Main header */}
//       <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
//         <div className="flex items-center gap-4 lg:gap-6">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 lg:gap-3">
//             <Image
//               src="/assets/interlink-logo.png"
//               alt="Interlink Logo"
//               width={150}
//               height={50}
//               className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform"
//             />
//             <div
//               className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors"
//               style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
//             >
//               Interlink Shop
//             </div>
//           </Link>

//           {/* Search */}
//           <div className="flex-1 max-w-2xl">
//             <HeaderSearchBar
//               value={searchTerm}
//               onChange={setSearchTerm}
//               onSearch={handleSearch}
//             />
//           </div>

//           {/* Right actions */}
//           <div className="flex items-center gap-2 lg:gap-4">
//             <HeaderUserMenu />

//             <Button
//               variant="ghost"
//               size="sm"
//               className="relative text-white hover:bg-white/20"
//               onClick={onCartClick}
//             >
//               <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white text-primary border-t border-primary/10">
//         <div className="w-full max-w-screen-2xl mx-auto px-4">
//           <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
//             {/* หมวดหมู่สินค้า */}
//             <HeaderCategoryMenu onCategorySelected={handleCategorySelected} />

//             {/* เมนูหลัก */}
//             <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//               <Link
//                 href="/"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 หน้าแรก
//               </Link>
//               <Link
//                 href="/products"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 สินค้าแนะนำ
//               </Link>
//               <Link
//                 href="/contact"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 ติดต่อเรา
//               </Link>
//             </div>

//             {/* Clearance sale banner */}
//             <span
//               className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors"
//               onClick={handleClearanceSaleClick}
//             >
//               Clearance Sale ลดสูงสุด 90%
//             </span>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/header.tsx

// "use client";

// import { useState, useEffect, type KeyboardEvent } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Search,
//   ShoppingCart,
//   User,
//   Menu,
//   ChevronDown,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface HeaderProps {
//   onCartClick?: () => void;
//   cartItemCount?: number;
// }

// /** ข้อมูลง่าย ๆ สำหรับเมนูหมวดหมู่ (ให้เข้ากันกับ mock api) */
// type MenuCategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// export const Header = ({
//   onCartClick,
//   cartItemCount = 0,
// }: HeaderProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchTerm, setSearchTerm] = useState("");

//   // ----- state ของเมนูหมวด -----
//   const [menuCats, setMenuCats] = useState<MenuCategory[]>([]);
//   const [catsLoading, setCatsLoading] = useState<boolean>(false);
//   const [catsError, setCatsError] = useState<string | null>(null);

//   // ดึงค่าค้นหา/หมวดจาก query เพื่อ sync กับกล่องค้นหา
//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");
//     if (category) {
//       setSearchTerm(category);
//     } else if (search) {
//       setSearchTerm(search);
//     } else {
//       setSearchTerm("");
//     }
//   }, [searchParams]);

//   // โหลดหมวดหมู่จาก mock api (client)
//   useEffect(() => {
//     const ac = new AbortController();
//     async function load() {
//       try {
//         setCatsLoading(true);
//         setCatsError(null);
//         const r = await fetch("/api/mock/categories", {
//           cache: "no-store",
//           signal: ac.signal,
//         });
//         if (!r.ok) throw new Error(`HTTP ${r.status}`);
//         const data = await r.json().catch(() => ({}));
//         const items = Array.isArray(data?.items)
//           ? (data.items as MenuCategory[])
//           : [];

//         const normalized = items
//           .filter((c) => c && c.name && c.visible !== false)
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//         setMenuCats(normalized);
//       } catch (e: any) {
//         if (e?.name === "AbortError") return;
//         setCatsError(e?.message || "โหลดหมวดหมู่ไม่สำเร็จ");
//         setMenuCats([]);
//       } finally {
//         setCatsLoading(false);
//       }
//     }
//     load();
//     return () => ac.abort();
//   }, []);

//   // ----- handlers -----
//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   };

//   const handleCategoryClick = (category: string) => {
//     setSearchTerm(category);
//     router.push(`/products?category=${encodeURIComponent(category)}`);
//   };

//   const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   const handleClearanceSaleClick = () => {
//     router.push("/products?search=Clearance Sale");
//   };

//   return (
//     <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
//       {/* Main header */}
//       <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
//         <div className="flex items-center gap-4 lg:gap-6">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 lg:gap-3">
//             <Image
//               src="/assets/interlink-logo.png"
//               alt="Interlink Logo"
//               width={150}
//               height={50}
//               className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform"
//             />
//             <div
//               className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors"
//               style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
//             >
//               Interlink Shop
//             </div>
//           </Link>

//           {/* Search */}
//           <div className="flex-1 max-w-2xl">
//             <div className="relative flex items-center">
//               <Input
//                 placeholder="ค้นหาสินค้า..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="w-full pl-4 pr-12 py-2 lg:py-3 text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50 h-10 lg:h-12 text-sm lg:text-base"
//               />
//               <Button
//                 size="sm"
//                 onClick={handleSearch}
//                 className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 h-8 w-8 lg:h-10 lg:w-10 p-0"
//               >
//                 <Search className="h-3 w-3 lg:h-4 lg:w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Right actions */}
//           <div className="flex items-center gap-2 lg:gap-4">
//             {/* 🎯 User menu */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-white hover:bg-white/20 hidden sm:flex"
//                 >
//                   <User className="h-4 w-4 lg:h-5 lg:w-5" />
//                   <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 align="end"
//                 className="w-44 bg-white text-foreground shadow-lg border border-primary/10"
//               >
//                 <DropdownMenuItem
//                   className="cursor-pointer text-sm"
//                   onClick={() => router.push("/profile")}
//                 >
//                   โปรไฟล์
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   className="cursor-pointer text-sm"
//                   onClick={() => router.push("/orders")}
//                 >
//                   ประวัติการสั่งซื้อ
//                 </DropdownMenuItem>
//                 <DropdownMenuItem
//                   className="cursor-pointer text-sm"
//                   onClick={() => router.push("/login")}
//                 >
//                   เข้าสู่ระบบ
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* Cart */}
//             <Button
//               variant="ghost"
//               size="sm"
//               className="relative text-white hover:bg-white/20"
//               onClick={onCartClick}
//             >
//               <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white text-primary border-t border-primary/10">
//         <div className="w-full max-w-screen-2xl mx-auto px-4">
//           <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-primary hover:bg-primary/10 shrink-0"
//                 >
//                   <Menu className="h-4 w-4 mr-1" />
//                   <span className="hidden sm:inline font-semibold text-base">
//                     หมวดหมู่สินค้า
//                   </span>
//                   <span className="sm:hidden text-xs">หมวดหมู่</span>
//                   <ChevronDown className="h-3 w-3 ml-1" />
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent className="w-64 bg-white shadow-lg border border-primary/10 z-50">
//                 {catsLoading && (
//                   <>
//                     {Array.from({ length: 8 }).map((_, i) => (
//                       <div
//                         key={`s-${i}`}
//                         className="px-2 py-2 text-sm text-muted-foreground"
//                       >
//                         กำลังโหลด…
//                       </div>
//                     ))}
//                   </>
//                 )}

//                 {!catsLoading && catsError && (
//                   <div className="px-3 py-2 text-sm text-destructive">
//                     โหลดหมวดหมู่ไม่สำเร็จ
//                   </div>
//                 )}

//                 {!catsLoading && !catsError && menuCats.length > 0 && (
//                   <>
//                     {menuCats.map((c) => (
//                       <DropdownMenuItem
//                         key={String(c.id ?? c.slug)}
//                         className="text-primary hover:bg-primary/10 cursor-pointer"
//                         onClick={() => handleCategoryClick(c.name)}
//                       >
//                         {c.name}
//                       </DropdownMenuItem>
//                     ))}
//                   </>
//                 )}

//                 {!catsLoading && !catsError && menuCats.length === 0 && (
//                   <div className="px-3 py-2 text-sm text-muted-foreground">
//                     ไม่มีหมวดหมู่ให้แสดง
//                   </div>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//               <Link
//                 href="/"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 หน้าแรก
//               </Link>
//               <Link
//                 href="/products?tag=new"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 สินค้าแนะนำ
//               </Link>
//               <Link
//                 href="https://interlink.co.th/contact"
//                 className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium"
//               >
//                 ติดต่อเรา
//               </Link>
//             </div>

//             <span
//               className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors"
//               onClick={handleClearanceSaleClick}
//             >
//               Clearance Sale ลดสูงสุด 90%
//             </span>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/header.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Search, ShoppingCart, User, Menu, Bell, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// interface HeaderProps {
//   onCartClick?: () => void;
//   cartItemCount?: number;
// }

// /** ข้อมูลง่าย ๆ สำหรับเมนูหมวดหมู่ (ให้เข้ากันกับ mock api) */
// type MenuCategory = {
//   id?: number | string;
//   name: string;
//   slug: string;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// export const Header = ({
//   onCartClick,
//   cartItemCount = 0
// }: HeaderProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchTerm, setSearchTerm] = useState("");

//   // ----- state ของเมนูหมวด -----
//   const [menuCats, setMenuCats] = useState<MenuCategory[]>([]);
//   const [catsLoading, setCatsLoading] = useState<boolean>(false);
//   const [catsError, setCatsError] = useState<string | null>(null);

//   // ดึงค่าค้นหา/หมวดจาก query เพื่อ sync กับกล่องค้นหา
//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");
//     if (category) {
//       setSearchTerm(category);
//     } else if (search) {
//       setSearchTerm(search);
//     } else {
//       setSearchTerm("");
//     }
//   }, [searchParams]);

//   // โหลดหมวดหมู่จาก mock api (client)
//   useEffect(() => {
//     const ac = new AbortController();
//     async function load() {
//       try {
//         setCatsLoading(true);
//         setCatsError(null);
//         const r = await fetch("/api/mock/categories", {
//           cache: "no-store",
//           signal: ac.signal,
//         });
//         if (!r.ok) throw new Error(`HTTP ${r.status}`);
//         const data = await r.json().catch(() => ({}));
//         const items = Array.isArray(data?.items) ? (data.items as MenuCategory[]) : [];

//         const normalized = items
//           .filter((c) => c && c.name && (c.visible !== false))
//           .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//         setMenuCats(normalized);
//       } catch (e: any) {
//         if (e?.name === "AbortError") return;
//         setCatsError(e?.message || "โหลดหมวดหมู่ไม่สำเร็จ");
//         // fallback แบบเบา ๆ กรณี API ล่ม (ป้องกันเมนูว่าง)
//         // คุณจะลบ fallback นี้ทิ้งก็ได้ถ้าอยากให้พังชัดเจน
//         setMenuCats([]);
//       } finally {
//         setCatsLoading(false);
//       }
//     }
//     load();
//     return () => ac.abort();
//   }, []);

//   // ----- handlers -----
//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   };

//   const handleCategoryClick = (category: string) => {
//     setSearchTerm(category);
//     router.push(`/products?category=${encodeURIComponent(category)}`);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   const handleClearanceSaleClick = () => {
//     router.push("/products?search=Clearance Sale");
//   };

//   return (
//     <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
//       {/* Top bar */}
//       {/* <div className="bg-black/10 text-xs py-1 hidden md:block">
//         <div className="w-full max-w-screen-2xl mx-auto px-4 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <Link href="/" className="hover:text-white/80 transition-colors">หน้าแรก</Link>
//             <Link href="https://interlink.co.th/contact" className="hover:text-white/80 transition-colors"><span>ติดต่อเรา</span></Link>
//           </div>
//           <div className="flex items-center gap-4">
//             <span>โปรไฟล์</span>
//             <span>ประวัตการสั่งซื้อ</span>
//             <span>เข้าสู่ระบบ</span>
//             <span>สมัครใหม่</span>
//           </div>
//         </div>
//       </div> */}

//       {/* Main header */}
//       <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
//         <div className="flex items-center gap-4 lg:gap-6">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 lg:gap-3">
//             <Image
//               src="/assets/interlink-logo.png"
//               alt="Interlink Logo"
//               width={150}
//               height={50}
//               className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform"
//             />
//             <div
//               className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors"
//               style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
//             >
//               Interlink Shop
//             </div>
//           </Link>

//           {/* Search */}
//           <div className="flex-1 max-w-2xl">
//             <div className="relative flex items-center">
//               <Input
//                 placeholder="ค้นหาสินค้า..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="w-full pl-4 pr-12 py-2 lg:py-3 text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50 h-10 lg:h-12 text-sm lg:text-base"
//               />
//               <Button
//                 size="sm"
//                 onClick={handleSearch}
//                 className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 h-8 w-8 lg:h-10 lg:w-10 p-0"
//               >
//                 <Search className="h-3 w-3 lg:h-4 lg:w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Right actions */}
//           <div className="flex items-center gap-2 lg:gap-4">
//             <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hidden sm:flex">
//               <User className="h-4 w-4 lg:h-5 lg:w-5" />
//             </Button>
//             <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20" onClick={onCartClick}>
//               <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white text-primary border-t border-primary/10">
//         <div className="w-full max-w-screen-2xl mx-auto px-4">
//           <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 shrink-0">
//                   <Menu className="h-4 w-4 mr-1" />
//                   <span className="hidden sm:inline font-semibold text-base">หมวดหมู่สินค้า</span>
//                   <span className="sm:hidden text-xs">หมวดหมู่</span>
//                   <ChevronDown className="h-3 w-3 ml-1" />
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent className="w-64 bg-white shadow-lg border border-primary/10 z-50">
//                 {/* Loading state */}
//                 {catsLoading && (
//                   <>
//                     {Array.from({ length: 8 }).map((_, i) => (
//                       <div
//                         key={`s-${i}`}
//                         className="px-2 py-2 text-sm text-muted-foreground"
//                       >
//                         กำลังโหลด…
//                       </div>
//                     ))}
//                   </>
//                 )}

//                 {/* Error state */}
//                 {!catsLoading && catsError && (
//                   <div className="px-3 py-2 text-sm text-destructive">
//                     โหลดหมวดหมู่ไม่สำเร็จ
//                   </div>
//                 )}

//                 {/* Normal list */}
//                 {!catsLoading && !catsError && menuCats.length > 0 && (
//                   <>
//                     {menuCats.map((c) => (
//                       <DropdownMenuItem
//                         key={String(c.id ?? c.slug)}
//                         className="text-primary hover:bg-primary/10 cursor-pointer"
//                         onClick={() => handleCategoryClick(c.name)}
//                       >
//                         {c.name}
//                       </DropdownMenuItem>
//                     ))}
//                   </>
//                 )}

//                 {/* Empty fallback */}
//                 {!catsLoading && !catsError && menuCats.length === 0 && (
//                   <div className="px-3 py-2 text-sm text-muted-foreground">
//                     ไม่มีหมวดหมู่ให้แสดง
//                   </div>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//               <Link href="/" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">หน้าแรก</Link>
//               <Link href="/products?tag=new" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">สินค้าแนะนำ</Link>
//               <Link href="https://interlink.co.th/contact" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">ติดต่อเรา</Link>
//             </div>

//             <span
//               className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors"
//               onClick={handleClearanceSaleClick}
//             >
//               Clearance Sale ลดสูงสุด 90%
//             </span>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// v.1.1.2 =============================================

// // src/components/header.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Search, ShoppingCart, User, Menu, Bell, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// interface HeaderProps {
//   onCartClick?: () => void;
//   cartItemCount?: number;
// }

// export const Header = ({
//   onCartClick,
//   cartItemCount = 0
// }: HeaderProps) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const category = searchParams.get("category");
//     const search = searchParams.get("search");
//     if (category) {
//       setSearchTerm(category);
//     } else if (search) {
//       setSearchTerm(search);
//     } else {
//       setSearchTerm("");
//     }
//   }, [searchParams]);

//   const handleSearch = () => {
//     if (searchTerm.trim()) {
//       router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   };

//   const handleCategoryClick = (category: string) => {
//     setSearchTerm(category);
//     router.push(`/products?category=${encodeURIComponent(category)}`);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const handleClearanceSaleClick = () => {
//     router.push('/products?search=Clearance Sale');
//   };

//   return (
//     <header className="bg-primary text-primary-foreground shadow-header sticky top-0 z-50">
//       {/* Top bar */}
//       <div className="bg-black/10 text-xs py-1 hidden md:block">
//         <div className="w-full max-w-screen-2xl mx-auto px-4 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <Link href="/" className="hover:text-white/80 transition-colors">หน้าแรก</Link>
//             {/* <span>ร้านค้าของเรา</span> */}
//             {/* <span>ดาวน์โหลดแคตาล็อก</span> */}
//             <Link href="https://interlink.co.th/contact" className="hover:text-white/80 transition-colors"><span>ติดต่อเรา</span></Link>
//           </div>
//           <div className="flex items-center gap-4">
//             <span>โปรไฟล์</span>
//             <span>ประวัตการสั่งซื้อ</span>
//             {/* <span>ภาษาไทย</span> */}
//             <span>เข้าสู่ระบบ</span>
//             <span>สมัครใหม่</span>
//           </div>
//         </div>
//       </div>

//       {/* Main header */}
//       <div className="w-full max-w-screen-2xl mx-auto px-4 py-4">
//         <div className="flex items-center gap-4 lg:gap-6">
//           {/* Logo */}
//           <Link href="/" className="flex items-center gap-2 lg:gap-3">
//             <Image src="/assets/interlink-logo.png" alt="Interlink Logo" width={150} height={50} className="h-8 lg:h-10 w-auto hover:scale-105 transition-transform" />
//             <div className="text-white font-bold text-lg lg:text-xl drop-shadow-lg hidden sm:block hover:text-white/90 transition-colors" style={{
//               textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
//             }}>
//               Interlink Shop
//             </div>
//           </Link>

//           {/* Search */}
//           <div className="flex-1 max-w-2xl">
//             <div className="relative flex items-center">
//               <Input placeholder="ค้นหาสินค้า..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} className="w-full pl-4 pr-12 py-2 lg:py-3 text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50 h-10 lg:h-12 text-sm lg:text-base" />
//               <Button size="sm" onClick={handleSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 h-8 w-8 lg:h-10 lg:w-10 p-0">
//                 <Search className="h-3 w-3 lg:h-4 lg:w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Right actions */}
//           <div className="flex items-center gap-2 lg:gap-4">
//             <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hidden md:flex">
//               <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
//             </Button>
//             <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hidden sm:flex">
//               <User className="h-4 w-4 lg:h-5 lg:w-5" />
//             </Button>
//             <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20" onClick={onCartClick}>
//               <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white text-primary border-t border-primary/10">
//         <div className="w-full max-w-screen-2xl mx-auto px-4">
//           <nav className="flex items-center gap-2 md:gap-4 lg:gap-8 py-3">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 shrink-0">
//                   <Menu className="h-4 w-4 mr-1" />
//                   <span className="hidden sm:inline font-semibold text-base">หมวดหมู่สินค้า</span>
//                   <span className="sm:hidden text-xs">หมวดหมู่</span>
//                   <ChevronDown className="h-3 w-3 ml-1" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-64 bg-white shadow-lg border border-primary/10 z-50">
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("LAN (UTP) System")}>LAN (UTP) System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("FIBER OPTIC System")}>FIBER OPTIC System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("FTTR/FTTx OVAL / FLAT CABLE")}>FTTR/FTTx OVAL / FLAT CABLE</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("DATA CENTER System")}>DATA CENTER System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("COAXIAL (RG) System")}>COAXIAL (RG) System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("Telephone CABLE")}>Telephone CABLE</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("SOLAR CABLE")}>SOLAR CABLE</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("SECURITY AND CONTROL System")}>SECURITY AND CONTROL System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("NETWORKING System")}>NETWORKING System</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("GERMANY RACK")}>GERMANY RACK</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("CCTV OUTDOOR CABINET")}>CCTV OUTDOOR CABINET</DropdownMenuItem>
//                 <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer" onClick={() => handleCategoryClick("LINK RACK")}>LINK RACK</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <div className="hidden lg:flex items-center gap-4 xl:gap-6">
//               <Link href="/" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">หน้าแรก</Link>
//               <Link href="/products?tag=new" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">สินค้าแนะนำ</Link>
//               {/* <Link href="/products?tag=sale" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">โปรโมชั่น</Link> */}
//               {/* <Link href="/about" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">เกี่ยวกับเรา</Link> */}
//               <Link href="https://interlink.co.th/contact" className="hover:text-primary/80 transition-colors whitespace-nowrap text-sm font-medium">ติดต่อเรา</Link>
//             </div>
//             <span className="text-destructive font-semibold ml-auto shrink-0 text-xs sm:text-sm cursor-pointer hover:text-destructive/80 transition-colors" onClick={handleClearanceSaleClick}>
//               Clearance Sale ลดสูงสุด 90%
//             </span>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };