// v.1.1.7 =================================================
// src/components/hero-section.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Video, Facebook, Youtube, Play } from "lucide-react";

type PromotionLike = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  link_url?: string | null;
  linkUrl?: string | null;
  badge_text?: string | null;
  badgeText?: string | null;
};

export type HeroSectionProps = {
  items?: PromotionLike[];
};

export const HeroSection = ({ items = [] }: HeroSectionProps) => {
  const router = useRouter();

  // ===== ค่าพื้นฐานตามโปสเตอร์เดิม =====
  const BADGE = "🔥 Clearance Sale ลดสูงสุด 90%";
  const TITLE = "CLEARANCE CLEAROUT 2025";
  const SUB1 = "INTERLINK Clear the Shelves : Mega Clearance Sale!";
  const SUB2 = "Hurry! Limited Stock at Unbeatable Prices!";
  const WEEK = "SPECIAL WEEK 1–7 DEC 2025";
  const LIVE1 = "2 Dec 2025 / 09.30 – 11.30 am";
  const LIVE2 = "4 Dec 2025 / 09.30 – 11.30 am";
  const LIVE3 = "6 Dec 2025 / 09.30 – 11.30 am";

  const first = items[0];
  const badgeText =
    first?.badge_text ?? first?.badgeText ?? first?.title ?? BADGE;
  const heroTitle = first?.title || TITLE;
  const sub1 = first?.subtitle || SUB1;
  const sub2 = SUB2;
  const firstLink = first?.link_url ?? first?.linkUrl ?? null;

  const navigateSmart = (to: string) => {
    if (/^https?:\/\//i.test(to)) window.open(to, "_blank", "noopener");
    else router.push(to);
  };

  const handleMainBadgeClick = () => {
    if (firstLink) navigateSmart(firstLink);
    else router.push("/products?search=Clearance Sale");
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[380px] lg:h-[460px] bg-gradient-hero">
        <Image
          src="/assets/hero-banner.jpg"
          alt="Hero Banner"
          fill
          className="object-cover mix-blend-overlay"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white w-full animate-slide-up">
              {/* ── แถวเดียว: Badge + โลโก้แบรนด์ ───────────────────────── */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
                <Badge
                  className="bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200 shrink-0"
                  onClick={handleMainBadgeClick}
                >
                  {badgeText}
                </Badge>

                <div className="flex items-center gap-3 sm:gap-4">
                  {[
                    { src: "/uploads/banners/band_logo/commscope_logo.png", alt: "CommScope" },
                    { src: "/uploads/banners/band_logo/link_logo.png", alt: "LINK American Cabling" },
                    { src: "/uploads/banners/band_logo/germanyrack_logo.png", alt: `19\" GERMANY Export Rack` },
                  ].map((b) => (
                    <div
                      key={b.src}
                      className="rounded-xl px-2.5 py-1.5 bg-white/80 text-black border border-white/80 shadow-md"
                    >
                      <Image
                        src={b.src}
                        alt={b.alt}
                        width={120}
                        height={40}
                        className="h-8 sm:h-9 w-auto object-contain"
                        priority
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* ─────────────────────────────────────────────────────────── */}

              {/* หัวข้อใหญ่ ไล่สีส้ม-แดง */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
                {heroTitle}
              </h1>

              {/* คำโปรย */}
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-snug">
                {sub1}
              </p>
              <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
                {sub2}
              </p>

              {/* WEEK */}
              <div className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20 mb-3">
                {WEEK}
              </div>

              {/* LIVE + ตารางเวลา */}
              <div className="flex items-start gap-3">
                <div className="relative select-none">
                  <div className="absolute -top-2 left-2 z-10 text-[10px] font-bold px-2 py-[2px] rounded bg-white/90 text-gray-800 shadow">
                    FULL HD
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-yellow-400 text-black px-3 py-2 shadow-md">
                    <span className="text-base sm:text-lg font-extrabold tracking-wide">
                      LIVE
                    </span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow">
                      <Play className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="leading-tight">
                  <div className="text-sm sm:text-base">{LIVE1}</div>
                  <div className="text-sm sm:text-base">{LIVE2}</div>
                  <div className="text-sm sm:text-base">{LIVE3}</div>
                </div>
              </div>

              {/* ปุ่มแพลตฟอร์ม 3 ปุ่ม */}
              <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#2D8CFF] hover:bg-[#1C6FE0] text-white rounded-full shadow"
                  onClick={() => navigateSmart("https://zoom.us")}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
                    <Video className="h-3.5 w-3.5" />
                  </span>
                  Zoom
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#1877F2] hover:bg-[#0E63CF] text-white rounded-full shadow"
                  onClick={() => navigateSmart("https://www.facebook.com/Interlink")}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
                    <Facebook className="h-3.5 w-3.5" />
                  </span>
                  Facebook
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#FF0000] hover:bg-[#D80000] text-white rounded-full shadow"
                  onClick={() => navigateSmart("https://www.youtube.com/")}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
                    <Youtube className="h-3.5 w-3.5" />
                  </span>
                  YouTube
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// v.1.1.7 =================================================

// v.1.1.6 =================================================
// // src/components/hero-section.tsx

// "use client";

// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Video, Facebook, Youtube, Play } from "lucide-react";

// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== ค่าพื้นฐานตามโปสเตอร์เดิม =====
//   const BADGE = "🔥 Clearance Sale ลดสูงสุด 90%";
//   const TITLE = "CLEARANCE CLEAROUT 2024";
//   const SUB1 = "INTERLINK Clear the Shelves : Mega Clearance Sale!";
//   const SUB2 = "Hurry! Limited Stock at Unbeatable Prices!";
//   const WEEK = "SPECIAL WEEK 1–7 DEC 2024";
//   const LIVE1 = "2 Dec 2024 / 09.30 – 11.30 am";
//   const LIVE2 = "4 Dec 2024 / 09.30 – 11.30 am";
//   const LIVE3 = "6 Dec 2024 / 09.30 – 11.30 am";

//   const first = items[0];
//   const badgeText =
//     first?.badge_text ?? first?.badgeText ?? first?.title ?? BADGE;
//   const heroTitle = first?.title || TITLE;
//   const sub1 = first?.subtitle || SUB1;
//   const sub2 = SUB2;
//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) window.open(to, "_blank", "noopener");
//     else router.push(to);
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) navigateSmart(firstLink);
//     else router.push("/products?search=Clearance Sale");
//   };

//   return (
//     <section className="relative overflow-hidden">
//       <div className="relative h-[380px] lg:h-[460px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//           priority
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               {/* Badge โปร */}
//               <Badge
//                 className="mb-3 sm:mb-5 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {badgeText}
//               </Badge>

//               {/* แถวโลโก้แบรนด์ (อยู่ใต้ Badge) */}
//               <div className="mb-3 sm:mb-4 flex items-center gap-4 sm:gap-6">
//                 {[
//                   { src: "/uploads/banners/band_logo/commscope_logo.png", alt: "CommScope" },
//                   { src: "/uploads/banners/band_logo/link_logo.png", alt: "LINK American Cabling" },
//                   { src: "/uploads/banners/band_logo/germanyrack_logo.png", alt: `19\" GERMANY Export Rack` },
//                 ].map((b) => (
//                   <div
//                     key={b.src}
//                     className="bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/15 shadow-sm"
//                   >
//                     <Image
//                       src={b.src}
//                       alt={b.alt}
//                       width={140}
//                       height={48}
//                       className="h-8 sm:h-10 w-auto object-contain"
//                       priority
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* หัวข้อใหญ่ ไล่สีส้ม-แดง */}
//               <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
//                 {heroTitle}
//               </h1>

//               {/* คำโปรย */}
//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-snug">
//                 {sub1}
//               </p>
//               <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
//                 {sub2}
//               </p>

//               {/* WEEK */}
//               <div className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20 mb-3">
//                 {WEEK}
//               </div>

//               {/* LIVE + ตารางเวลา */}
//               <div className="flex items-start gap-3">
//                 {/* LIVE badge */}
//                 <div className="relative select-none">
//                   <div className="absolute -top-2 left-2 z-10 text-[10px] font-bold px-2 py-[2px] rounded bg-white/90 text-gray-800 shadow">
//                     FULL HD
//                   </div>
//                   <div className="flex items-center gap-2 rounded-lg bg-yellow-400 text-black px-3 py-2 shadow-md">
//                     <span className="text-base sm:text-lg font-extrabold tracking-wide">
//                       LIVE
//                     </span>
//                     <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow">
//                       <Play className="h-3.5 w-3.5" />
//                     </span>
//                   </div>
//                 </div>

//                 <div className="leading-tight">
//                   <div className="text-sm sm:text-base">{LIVE1}</div>
//                   <div className="text-sm sm:text-base">{LIVE2}</div>
//                   <div className="text-sm sm:text-base">{LIVE3}</div>
//                 </div>
//               </div>

//               {/* ปุ่มแพลตฟอร์ม 3 ปุ่ม — ย้ายมาไว้ด้านล่างแทน CTA เดิม */}
//               <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#2D8CFF] hover:bg-[#1C6FE0] text-white rounded-full shadow"
//                   onClick={() => navigateSmart("https://zoom.us")}
//                 >
//                   <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                     <Video className="h-3.5 w-3.5" />
//                   </span>
//                   Zoom
//                 </Button>
//                 <Button
//                   size="sm"
//                   className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#1877F2] hover:bg-[#0E63CF] text-white rounded-full shadow"
//                   onClick={() =>
//                     navigateSmart("https://www.facebook.com/Interlink")
//                   }
//                 >
//                   <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                     <Facebook className="h-3.5 w-3.5" />
//                   </span>
//                   Facebook
//                 </Button>
//                 <Button
//                   size="sm"
//                   className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#FF0000] hover:bg-[#D80000] text-white rounded-full shadow"
//                   onClick={() => navigateSmart("https://www.youtube.com/")}
//                 >
//                   <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                     <Youtube className="h-3.5 w-3.5" />
//                   </span>
//                   YouTube
//                 </Button>
//               </div>

//               {/* ❌ CTA เดิมถูกถอดออกตามคำขอ */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.6 =================================================

// v.1.1.5 ==================================================
// // src/components/hero-section.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { Video, Facebook, Youtube, Play } from "lucide-react";

// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== ค่าพื้นฐานตามโปสเตอร์เดิม =====
//   const BADGE = "🔥 Clearance Sale ลดสูงสุด 90%";
//   const TITLE = "CLEARANCE CLEAROUT 2024";
//   const SUB1 = "INTERLINK Clear the Shelves : Mega Clearance Sale!";
//   const SUB2 = "Hurry! Limited Stock at Unbeatable Prices!";
//   const WEEK  = "SPECIAL WEEK 1–7 DEC 2024";
//   const LIVE1 = "2 Dec 2024 / 09.30 – 11.30 am";
//   const LIVE2 = "4 Dec 2024 / 09.30 – 11.30 am";
//   const LIVE3 = "6 Dec 2024 / 09.30 – 11.30 am";

//   const first = items[0];
//   const badgeText = first?.badge_text ?? first?.badgeText ?? first?.title ?? BADGE;
//   const heroTitle = first?.title || TITLE;
//   const sub1 = first?.subtitle || SUB1;
//   const sub2 = SUB2;
//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) window.open(to, "_blank", "noopener");
//     else router.push(to);
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) navigateSmart(firstLink);
//     else router.push("/products?search=Clearance Sale");
//   };

//   return (
//     <section className="relative overflow-hidden">
//       <div className="relative h-[380px] lg:h-[460px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//           priority
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               {/* Badge โปร */}
//               <Badge
//                 className="mb-3 sm:mb-5 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {badgeText}
//               </Badge>

//               {/* หัวข้อใหญ่ ไล่สีส้มแดง */}
//               <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
//                 {heroTitle}
//               </h1>

//               {/* คำโปรย */}
//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-snug">
//                 {sub1}
//               </p>
//               <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
//                 {sub2}
//               </p>

//               {/* แถบสรุป + LIVE + ปุ่มแพลตฟอร์ม (เลียนแบบภาพเดิม) */}
//               <div className="flex flex-col gap-4">
//                 {/* WEEK bar */}
//                 <div className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {WEEK}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
//                   {/* LIVE block (ซ้าย) */}
//                   <div className="flex items-start gap-3">
//                     {/* LIVE badge like poster */}
//                     <div className="relative select-none">
//                       <div className="absolute -top-2 left-2 z-10 text-[10px] font-bold px-2 py-[2px] rounded bg-white/90 text-gray-800 shadow">
//                         FULL HD
//                       </div>
//                       <div className="flex items-center gap-2 rounded-lg bg-yellow-400 text-black px-3 py-2 shadow-md">
//                         <span className="text-base sm:text-lg font-extrabold tracking-wide">LIVE</span>
//                         <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white shadow">
//                           <Play className="h-3.5 w-3.5" />
//                         </span>
//                       </div>
//                     </div>

//                     {/* ตารางวัน/เวลา 3 บรรทัด */}
//                     <div className="leading-tight">
//                       <div className="text-sm sm:text-base">{LIVE1}</div>
//                       <div className="text-sm sm:text-base">{LIVE2}</div>
//                       <div className="text-sm sm:text-base">{LIVE3}</div>
//                     </div>
//                   </div>

//                   {/* Platform buttons (ขวา) */}
//                   <div className="flex items-center gap-3 justify-start md:justify-end">
//                     <Button
//                       size="sm"
//                       className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#2D8CFF] hover:bg-[#1C6FE0] text-white rounded-full shadow"
//                       onClick={() => navigateSmart("https://zoom.us")}
//                     >
//                       <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                         <Video className="h-3.5 w-3.5" />
//                       </span>
//                       Zoom
//                     </Button>
//                     <Button
//                       size="sm"
//                       className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#1877F2] hover:bg-[#0E63CF] text-white rounded-full shadow"
//                       onClick={() => navigateSmart("https://www.facebook.com/Interlink")}
//                     >
//                       <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                         <Facebook className="h-3.5 w-3.5" />
//                       </span>
//                       Facebook
//                     </Button>
//                     <Button
//                       size="sm"
//                       className="h-9 text-xs sm:text-sm px-3 sm:px-4 bg-[#FF0000] hover:bg-[#D80000] text-white rounded-full shadow"
//                       onClick={() => navigateSmart("https://www.youtube.com/")}
//                     >
//                       <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 mr-2">
//                         <Youtube className="h-3.5 w-3.5" />
//                       </span>
//                       YouTube
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//               {/* ปุ่มช้อป/แคตตาล็อก (คงไว้) */}
//               <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 shadow-glow transition-spring hover:scale-105 bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={() => router.push("/products?search=Clearance Sale")}
//                 >
//                   ช้อปโปรฯ นี้
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 border border-white sm:border-2 bg-white/10 text-white hover:bg-white hover:text-primary transition-spring hover:scale-105"
//                   onClick={() => router.push("/products")}
//                 >
//                   ดูแคตตาล็อก
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// v.1.1.5 ==================================================

// v.1.1.4 ===================================================
// // src/components/hero-section.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { Video, Facebook, Youtube } from "lucide-react";

// // รองรับทั้งเคสที่มาจาก API ต่างสไตล์ key
// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== ข้อความจากระบบเดิม (ป้ายแดง) – ใช้เป็นค่าเริ่มต้น =====
//   const FALLBACK_BADGE = "🔥 Clearance Sale ลดสูงสุด 90%";
//   const FALLBACK_TITLE = "CLEARANCE CLEAROUT 2024";
//   const FALLBACK_SUB1 = "INTERLINK Clear the Shelves : Mega Clearance Sale!";
//   const FALLBACK_SUB2 = "Hurry! Limited Stock at Unbeatable Prices!";
//   const FALLBACK_META_L = "SPECIAL WEEK 1–7 DEC 2024";
//   const FALLBACK_META_M = "LIVE 2, 4, 6 DEC / 09.30–11.30";
//   const FALLBACK_META_R = "SHOPPING ONLINE ONLY";

//   // ===== Helpers =====
//   const first = items[0];

//   const badgeText =
//     first?.badge_text ?? first?.badgeText ?? first?.title ?? FALLBACK_BADGE;

//   const heroTitle = first?.title || FALLBACK_TITLE;
//   const sub1 = first?.subtitle || FALLBACK_SUB1;
//   const sub2 = FALLBACK_SUB2;

//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) {
//       window.open(to, "_blank", "noopener");
//     } else {
//       router.push(to);
//     }
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) {
//       navigateSmart(firstLink);
//     } else {
//       router.push("/products?search=Clearance Sale");
//     }
//   };

//   return (
//     <section className="relative overflow-hidden">
//       {/* Main hero banner */}
//       <div className="relative h-[360px] lg:h-[440px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//           priority
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               {/* Badge โปรหลัก */}
//               <Badge
//                 className="mb-3 sm:mb-5 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {badgeText}
//               </Badge>

//               {/* หัวข้อใหญ่: โทนส้ม-แดงแบบไล่สี */}
//               <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
//                 {heroTitle}
//               </h1>

//               {/* คำโปรย 2 บรรทัด */}
//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-snug">
//                 {sub1}
//               </p>
//               <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
//                 {sub2}
//               </p>

//               {/* แถบข้อมูลย่อย */}
//               <div className="flex flex-wrap gap-2 sm:gap-3 mb-5">
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_L}
//                 </span>
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_M}
//                 </span>
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_R}
//                 </span>
//               </div>

//               {/* ปุ่ม 3 ปุ่มพร้อมไอคอน */}
//               <div className="flex flex-wrap items-center gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 shadow-glow transition-spring hover:scale-105 bg-[#2D8CFF] hover:bg-[#1C6FE0] text-white"
//                   onClick={() => navigateSmart("https://zoom.us")}
//                 >
//                   <Video className="mr-2 h-4 w-4" />
//                   Zoom
//                 </Button>

//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 shadow-glow transition-spring hover:scale-105 bg-[#1877F2] hover:bg-[#0E63CF] text-white"
//                   onClick={() => navigateSmart("https://www.facebook.com/Interlink")}
//                 >
//                   <Facebook className="mr-2 h-4 w-4" />
//                   Facebook
//                 </Button>

//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 shadow-glow transition-spring hover:scale-105 bg-[#FF0000] hover:bg-[#D80000] text-white"
//                   onClick={() => navigateSmart("https://www.youtube.com/")}
//                 >
//                   <Youtube className="mr-2 h-4 w-4" />
//                   YouTube
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Discount styling rules strip (แทนการ์ดคงที่เดิม) */}
//       {/* <DiscountRuleStrip /> */}
//     </section>
//   );
// };

// v.1.1.4 ===================================================

// v.1.1.3 ===================================================
// // src/components/hero-section.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// // รองรับทั้งเคสที่มาจาก API ต่างสไตล์ key
// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== ข้อความจากระบบเดิม (ป้ายแดง) – ใช้เป็นค่าเริ่มต้น =====
//   const FALLBACK_BADGE = "🔥 Clearance Sale ลดสูงสุด 90%";
//   const FALLBACK_TITLE = "CLEARANCE CLEAROUT 2024";
//   const FALLBACK_SUB1 = "INTERLINK Clear the Shelves : Mega Clearance Sale!";
//   const FALLBACK_SUB2 = "Hurry! Limited Stock at Unbeatable Prices!";
//   const FALLBACK_META_L = "SPECIAL WEEK 1–7 DEC 2024";
//   const FALLBACK_META_M = "LIVE 2, 4, 6 DEC / 09.30–11.30";
//   const FALLBACK_META_R = "SHOPPING ONLINE ONLY";

//   // ===== Helpers =====
//   const first = items[0];

//   const badgeText =
//     first?.badge_text ?? first?.badgeText ?? first?.title ?? FALLBACK_BADGE;

//   const heroTitle = first?.title || FALLBACK_TITLE;

//   const sub1 = first?.subtitle || FALLBACK_SUB1;
//   // ถ้าอยากส่ง sub2 มาจาก API ก็อ่านจาก items[1] หรือ field อื่นได้
//   const sub2 = FALLBACK_SUB2;

//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) {
//       window.open(to, "_blank", "noopener");
//     } else {
//       router.push(to);
//     }
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) {
//       navigateSmart(firstLink);
//     } else {
//       router.push("/products?search=Clearance Sale");
//     }
//   };

//   return (
//     <section className="relative overflow-hidden">
//       {/* Main hero banner */}
//       <div className="relative h-[360px] lg:h-[440px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//           priority
//         />

//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               {/* Badge โปรหลัก */}
//               <Badge
//                 className="mb-3 sm:mb-5 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {badgeText}
//               </Badge>

//               {/* หัวข้อใหญ่แบบป้ายแดง */}
//               <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 sm:mb-3 drop-shadow-md">
//                 {heroTitle}
//               </h1>

//               {/* คำโปรย 2 บรรทัด (จากป้ายแดง) */}
//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-snug">
//                 {sub1}
//               </p>
//               <p className="text-xs sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
//                 {sub2}
//               </p>

//               {/* แถบข้อมูลย่อย: สัปดาห์โปร / ไลฟ์ / ช่องทาง */}
//               <div className="flex flex-wrap gap-2 sm:gap-3 mb-5">
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_L}
//                 </span>
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_M}
//                 </span>
//                 <span className="rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm backdrop-blur border border-white/20">
//                   {FALLBACK_META_R}
//                 </span>
//               </div>

//               {/* ปุ่ม */}
//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 shadow-glow transition-spring hover:scale-105 bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={() => router.push("/products?search=Clearance Sale")}
//                 >
//                   ช้อปโปรฯ นี้
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 border border-white sm:border-2 bg-white/10 text-white hover:bg-white hover:text-primary transition-spring hover:scale-105"
//                   onClick={() => router.push("/products")}
//                 >
//                   ดูแคตตาล็อก
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Discount styling rules strip (แทนการ์ดคงที่เดิม) */}
//       {/* <DiscountRuleStrip /> */}
//     </section>
//   );
// };

// v.1.1.3 ===================================================

// v.1.1.2 ===================================================
// // src/components/hero-section.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// // import DiscountRuleStrip from "@/components/discount-rule-strip";

// // รองรับทั้งเคสที่มาจาก API ต่างสไตล์ key
// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== Helpers =====
//   const first = items[0];
//   const firstBadge =
//     first?.badge_text ?? first?.badgeText ?? first?.title ?? "🔥 Clearance Sale ลดสูงสุด 90%";
//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) {
//       window.open(to, "_blank", "noopener");
//     } else {
//       router.push(to);
//     }
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) {
//       navigateSmart(firstLink);
//     } else {
//       router.push("/products?search=Clearance Sale");
//     }
//   };

//   return (
//     <section className="relative overflow-hidden">
//       {/* Main hero banner */}
//       <div className="relative h-[320px] lg:h-[400px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               <Badge
//                 className="mb-3 sm:mb-6 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {firstBadge}
//               </Badge>

//               <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-6 leading-tight">
//                 ช๊อปออนไลน์
//                 <br />
//                 ง่ายๆ ที่{" "}
//                 <span className="text-accent animate-float inline-block">
//                   Interlink
//                 </span>
//               </h1>

//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-8 text-white/90">
//                 อุปกรณ์เครือข่ายคุณภาพสูง ส่งฟรี ทั่วไทย ส่งไว ถึงมือใน 24 ชม.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 shadow-glow transition-spring hover:scale-105 bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={() => router.push("/products")}
//                 >
//                   เริ่มช็อปเลย
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 border border-white sm:border-2 bg-white/10 text-white hover:bg-white hover:text-primary transition-spring hover:scale-105"
//                   onClick={() => router.push("/products")}
//                 >
//                   ดูแคตตาล็อก
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Discount styling rules strip (แทนการ์ดคงที่เดิม) */}
//       {/* <DiscountRuleStrip /> */}
//     </section>
//   );
// };

// v.1.1.2 ===================================================

// // src/components/hero-section.tsx

// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// // รองรับทั้งเคสที่มาจาก API ต่างสไตล์ key
// type PromotionLike = {
//   id: string;
//   title: string;
//   subtitle?: string | null;
//   image_url?: string | null;
//   imageUrl?: string | null;
//   link_url?: string | null;
//   linkUrl?: string | null;
//   badge_text?: string | null;
//   badgeText?: string | null;
// };

// export type HeroSectionProps = {
//   items?: PromotionLike[];
// };

// export const HeroSection = ({ items = [] }: HeroSectionProps) => {
//   const router = useRouter();

//   // ===== Helpers =====
//   const first = items[0];
//   const firstBadge =
//     first?.badge_text ?? first?.badgeText ?? first?.title ?? "🔥 Clearance Sale ลดสูงสุด 90%";
//   const firstLink = first?.link_url ?? first?.linkUrl ?? null;

//   const navigateSmart = (to: string) => {
//     if (/^https?:\/\//i.test(to)) {
//       // external link
//       window.open(to, "_blank", "noopener");
//     } else {
//       // internal route
//       router.push(to);
//     }
//   };

//   const handleMainBadgeClick = () => {
//     if (firstLink) {
//       navigateSmart(firstLink);
//     } else {
//       router.push("/products?search=Clearance Sale");
//     }
//   };

//   return (
//     <section className="relative overflow-hidden">
//       {/* Main hero banner */}
//       <div className="relative h-[320px] lg:h-[400px] bg-gradient-hero">
//         <Image
//           src="/assets/hero-banner.jpg"
//           alt="Hero Banner"
//           fill
//           className="object-cover mix-blend-overlay"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/60">
//           <div className="container mx-auto px-4 h-full flex items-center">
//             <div className="text-white w-full animate-slide-up">
//               <Badge
//                 className="mb-3 sm:mb-6 bg-sale/90 text-sale-foreground text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 animate-bounce-gentle shadow-glow cursor-pointer hover:bg-sale hover:scale-105 transition-all duration-200"
//                 onClick={handleMainBadgeClick}
//               >
//                 {firstBadge}
//               </Badge>

//               <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-6 leading-tight">
//                 ช๊อปออนไลน์
//                 <br />
//                 ง่ายๆ ที่{" "}
//                 <span className="text-accent animate-float inline-block">
//                   Interlink
//                 </span>
//               </h1>

//               <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-8 text-white/90">
//                 อุปกรณ์เครือข่ายคุณภาพสูง ส่งฟรี ทั่วไทย ส่งไว ถึงมือใน 24 ชม.
//               </p>

//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                 <Button
//                   size="sm"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 shadow-glow transition-spring hover:scale-105 bg-orange-500 hover:bg-orange-600 text-white"
//                   onClick={() => router.push("/products")}
//                 >
//                   เริ่มช็อปเลย
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-4 border border-white sm:border-2 bg-white/10 text-white hover:bg-white hover:text-primary transition-spring hover:scale-105"
//                   onClick={() => router.push("/products")}
//                 >
//                   ดูแคตตาล็อก
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Promotion banners / Trust badges */}
//       <div className="bg-gradient-subtle py-8">
//         <div className="container mx-auto px-4">
//           {items.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {items.slice(0, 3).map((b) => {
//                 const img = b.image_url ?? b.imageUrl ?? "/placeholder.png";
//                 const href = b.link_url ?? b.linkUrl ?? "/products";
//                 const badge = b.badge_text ?? b.badgeText ?? null;

//                 return (
//                   <button
//                     key={b.id}
//                     type="button"
//                     onClick={() => navigateSmart(href)}
//                     className="text-left group rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] bg-white"
//                   >
//                     <div className="relative h-32 md:h-40">
//                       <Image
//                         src={img}
//                         alt={b.title}
//                         fill
//                         className="object-cover"
//                       />
//                       {badge && (
//                         <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/70 text-white z-10">
//                           {badge}
//                         </span>
//                       )}
//                     </div>
//                     <div className="p-4">
//                       <h3 className="font-bold text-lg mb-1">{b.title}</h3>
//                       {b.subtitle && (
//                         <p className="text-sm text-muted-foreground">
//                           {b.subtitle}
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           ) : (
//             // เดิม (3 การ์ดบริการ/ข้อดี)
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-gradient-to-r from-sale to-sale/80 text-sale-foreground p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-bold text-lg mb-1">ส่งฟรี</h3>
//                     <p className="text-sm opacity-90">ซื้อครบ 2,999 บาท</p>
//                   </div>
//                   <div className="text-3xl group-hover:animate-bounce-gentle">🚚</div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-success to-success/80 text-success-foreground p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-bold text-lg mb-1">เก็บเงินปลายทาง</h3>
//                     <p className="text-sm opacity-90">ปลอดภัย 100%</p>
//                   </div>
//                   <div className="text-3xl group-hover:animate-bounce-gentle">💰</div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-bold text-lg mb-1">รับประกัน</h3>
//                     <p className="text-sm opacity-90">สินค้าของแท้</p>
//                   </div>
//                   <div className="text-3xl group-hover:animate-bounce-gentle">✅</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };