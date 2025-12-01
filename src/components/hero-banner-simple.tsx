// v.1.1.3 ================================================================
// src/components/hero-banner-simple.tsx

"use client";

import Image from "next/image";

export default function HeroBannerSimple() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #ff5a3c 0%, #c51d1d 40%, #5a0b0b 100%)",
      }}
    >
      {/* กล่องคุมอัตราส่วน 1440x680 (สูง ~47.22% ของความกว้างจอ) */}
      <div
        className="relative w-full"
        style={{ paddingTop: "47.22%" }} // (680 / 1440) * 100
      >
        <Image
          src="/uploads/banners/hero_banner/NewWebHeader1440x680px.webp"
          alt="Promotional Hero Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}

// v.1.1.3 ================================================================

// v.1.1.2 ================================================================
// // src/components/hero-banner-simple.tsx

// "use client";

// import Image from "next/image";

// export default function HeroBannerSimple() {
//   return (
//     <section
//       className="relative w-full flex items-center justify-center"
//       style={{
//         maxHeight: "680px",
//         background: `
//           linear-gradient(
//             to bottom,
//             #ff5a3c 0%,
//             #c51d1d 40%,
//             #5a0b0b 100%
//           )
//         `,
//       }}
//     >
//       <div className="relative w-full max-w-[1440px] h-auto">
//         <Image
//           src="/uploads/banners/hero_banner/NewWebHeader1440x680px.webp"
//           alt="Promotional Hero Banner"
//           width={1440}
//           height={680}
//           priority
//           className="w-full h-auto object-contain mx-auto"
//         />
//       </div>
//     </section>
//   );
// }


// v.1.1.2 ================================================================

// // src/components/hero-banner-simple.tsx

// "use client";

// import Image from "next/image";

// export default function HeroBannerSimple() {
//   return (
//     <section className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] lg:h-[520px] xl:h-[560px] overflow-hidden">
//       <Image
//         src="/uploads/banners/hero_banner/fbheader_820x312px.webp"
//         alt="Promotional Hero Banner"
//         fill
//         priority
//         className="object-cover object-center"
//         sizes="100vw"
//       />

//       {/* Optional: ดาร์คเลเยอร์บาง ๆ ปรับ mood ให้ภาพดูหรูขึ้น
//           ถ้าไม่ต้องการ สามารถลบบรรทัดนี้ได้เลย */}
//       <div className="absolute inset-0 bg-black/10"></div>
//     </section>
//   );
// }
