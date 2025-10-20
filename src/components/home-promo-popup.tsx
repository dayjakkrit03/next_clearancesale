// v.1.1.3 ================================================
"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";

type OncePer = "session" | "day" | "always";

type Props = {
  /** path รูป เช่น /uploads/popup/popup.webp */
  imageSrc: string;
  /** คลิกรูปแล้วไปลิงก์นี้ (ออปชัน) */
  linkUrl?: string;

  /** ข้อความใต้รูป (แสดงในกล่องขาวด้านล่าง) */
  caption?: ReactNode;
  /** ตำแหน่งข้อความใต้รูป: 'center' (default) | 'left' */
  captionAlign?: "center" | "left";
  /** className เพิ่มเติมให้ caption (ออปชัน) */
  captionClassName?: string;

  /** คีย์เก็บสถานะใน storage (default: 'home-promo-popup') */
  storageKey?: string;
  /** แสดงครั้งละ: session | day | always (default: 'day') */
  oncePer?: OncePer;
  /** ดีเลย์ก่อนแสดง (ms) default: 300 */
  openDelayMs?: number;
};

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function HomePromoPopup({
  imageSrc,
  linkUrl,

  caption,
  captionAlign = "center",
  captionClassName,

  storageKey = "home-promo-popup",
  oncePer = "day",
  openDelayMs = 300,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let shouldOpen = true;
    try {
      if (oncePer === "session") {
        if (sessionStorage.getItem(`${storageKey}:seen`) === "1") shouldOpen = false;
      } else if (oncePer === "day") {
        const last = localStorage.getItem(`${storageKey}:lastAt`);
        if (last && isSameLocalDay(new Date(last), new Date())) shouldOpen = false;
      }
    } catch {
      /* ignore storage errors */
    }

    if (shouldOpen) {
      const t = setTimeout(() => setOpen(true), openDelayMs);
      return () => clearTimeout(t);
    }
  }, [oncePer, storageKey, openDelayMs]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        if (oncePer === "session") {
          sessionStorage.setItem(`${storageKey}:seen`, "1");
        } else if (oncePer === "day") {
          localStorage.setItem(`${storageKey}:lastAt`, new Date().toISOString());
        }
      } catch {
        /* ignore */
      }
    }
  };

  const Img = useMemo(
    () => (
      <img
        src={imageSrc}
        alt="โปรโมชั่นหน้าแรก"
        className="w-full h-auto max-h-[75vh] object-contain"
        loading="eager"
      />
    ),
    [imageSrc]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent max-w-[92vw] sm:max-w-[720px] shadow-none">
        {/* ✅ a11y: DialogTitle ซ่อนด้วย VisuallyHidden */}
        <VisuallyHidden asChild>
          <DialogTitle>โปรโมชั่นหน้าแรก</DialogTitle>
        </VisuallyHidden>

        {/* ปุ่มปิด */}
        <DialogClose
          className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white w-8 h-8 shadow-md"
          aria-label="ปิด"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-700" aria-hidden="true">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </DialogClose>

        {/* กล่องหลัก (ภาพ + แคปชัน) */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* รูปโปรโมชัน */}
          {linkUrl ? (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {Img}
            </a>
          ) : (
            Img
          )}

          {/* แคปชันด้านล่าง (ออปชัน) */}
          {caption ? (
            <div
              className={clsx(
                "px-4 sm:px-5 py-3 border-t text-sm text-gray-800",
                captionAlign === "center" ? "text-center" : "text-left",
                captionClassName
              )}
            >
              {caption}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/components/home-promo-popup.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogClose,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// type OncePer = "session" | "day" | "always";

// type Props = {
//   imageSrc: string;        // /uploads/popup/popup.webp
//   linkUrl?: string;        // optional: คลิกรูปแล้วเปิดลิงก์
//   storageKey?: string;     // default: home-promo-popup
//   oncePer?: OncePer;       // default: "day"
//   openDelayMs?: number;    // default: 300
// };

// function isSameLocalDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// export default function HomePromoPopup({
//   imageSrc,
//   linkUrl,
//   storageKey = "home-promo-popup",
//   oncePer = "day",
//   openDelayMs = 300,
// }: Props) {
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     let shouldOpen = true;
//     try {
//       if (oncePer === "session") {
//         if (sessionStorage.getItem(`${storageKey}:seen`) === "1") shouldOpen = false;
//       } else if (oncePer === "day") {
//         const last = localStorage.getItem(`${storageKey}:lastAt`);
//         if (last && isSameLocalDay(new Date(last), new Date())) shouldOpen = false;
//       }
//     } catch {
//       /* ignore storage errors */
//     }

//     if (shouldOpen) {
//       const t = setTimeout(() => setOpen(true), openDelayMs);
//       return () => clearTimeout(t);
//     }
//   }, [oncePer, storageKey, openDelayMs]);

//   const handleOpenChange = (next: boolean) => {
//     setOpen(next);
//     if (!next) {
//       try {
//         if (oncePer === "session") {
//           sessionStorage.setItem(`${storageKey}:seen`, "1");
//         } else if (oncePer === "day") {
//           localStorage.setItem(`${storageKey}:lastAt`, new Date().toISOString());
//         }
//       } catch {
//         /* ignore */
//       }
//     }
//   };

//   const Img = useMemo(
//     () => (
//       <img
//         src={imageSrc}
//         alt="โปรโมชั่นหน้าแรก"
//         className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
//         loading="eager"
//       />
//     ),
//     [imageSrc]
//   );

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogContent className="p-0 border-0 bg-transparent max-w-[92vw] sm:max-w-[640px] shadow-none">
//         {/* ✅ ใส่ DialogTitle จริง แล้วซ่อนด้วย VisuallyHidden ตามคำแนะนำของ Radix */}
//         <VisuallyHidden asChild>
//           <DialogTitle>โปรโมชั่นหน้าแรก</DialogTitle>
//         </VisuallyHidden>

//         {/* ปุ่มปิด (ตัวเดียว) */}
//         <DialogClose
//           className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white w-8 h-8 shadow-md"
//           aria-label="ปิด"
//         >
//           <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-700" aria-hidden="true">
//             <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//           </svg>
//         </DialogClose>

//         <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
//           {linkUrl ? (
//             <a href={linkUrl} target="_blank" rel="noopener noreferrer">
//               {Img}
//             </a>
//           ) : (
//             Img
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.2 ================================================

// // src/components/home-promo-popup.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
// import { X } from "lucide-react";

// type OncePer = "session" | "day" | "always";

// type Props = {
//   /** path รูป เช่น /uploads/popup/popup.webp */
//   imageSrc: string;
//   /** คลิกที่รูปให้ไปลิงก์นี้ (ออปชัน) */
//   linkUrl?: string;
//   /** คีย์เก็บสถานะใน storage (default: 'home-promo-popup') */
//   storageKey?: string;
//   /** แสดงครั้งละ: session | day | always (default: 'day') */
//   oncePer?: OncePer;
//   /** ดีเลย์ก่อนแสดง (ms) default: 300 */
//   openDelayMs?: number;
// };

// function isSameLocalDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// export default function HomePromoPopup({
//   imageSrc,
//   linkUrl,
//   storageKey = "home-promo-popup",
//   oncePer = "day",
//   openDelayMs = 300,
// }: Props) {
//   const [open, setOpen] = useState(false);

//   // คำนวณเงื่อนไข “ควรแสดงไหม” ครั้งแรกที่ mount
//   useEffect(() => {
//     let shouldOpen = true;

//     try {
//       if (oncePer === "session") {
//         const seen = sessionStorage.getItem(`${storageKey}:seen`);
//         if (seen === "1") shouldOpen = false;
//       } else if (oncePer === "day") {
//         const last = localStorage.getItem(`${storageKey}:lastAt`);
//         if (last) {
//           const lastAt = new Date(last);
//           if (isSameLocalDay(lastAt, new Date())) shouldOpen = false;
//         }
//       } else {
//         // "always" -> ไม่จำสถานะ
//       }
//     } catch {
//       // ถ้า storage พัง ก็แค่แสดงตามปกติ
//     }

//     if (shouldOpen) {
//       const t = setTimeout(() => setOpen(true), openDelayMs);
//       return () => clearTimeout(t);
//     }
//   }, [oncePer, storageKey, openDelayMs]);

//   // เมื่อปิดแล้ว ให้บันทึกสถานะตามนโยบาย
//   const onOpenChange = (next: boolean) => {
//     setOpen(next);
//     if (!next) {
//       try {
//         if (oncePer === "session") {
//           sessionStorage.setItem(`${storageKey}:seen`, "1");
//         } else if (oncePer === "day") {
//           localStorage.setItem(`${storageKey}:lastAt`, new Date().toISOString());
//         }
//       } catch {
//         /* ignore */
//       }
//     }
//   };

//   // ใช้ <img> ธรรมดาเพื่อเลี่ยงการต้องใส่ width/height แน่นอน
//   const Img = useMemo(
//     () => (
//       <img
//         src={imageSrc}
//         alt="Promotion"
//         className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
//         loading="eager"
//       />
//     ),
//     [imageSrc]
//   );

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="p-0 border-0 bg-transparent max-w-[92vw] sm:max-w-[640px] shadow-none"
//         aria-describedby={undefined}
//       >
//         {/* ปุ่มปิดมุมขวาบน */}
//         <button
//           type="button"
//           aria-label="Close"
//           onClick={() => onOpenChange(false)}
//           className="absolute -top-3 -right-3 z-10 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white w-8 h-8 shadow-md"
//         >
//           <X className="h-4 w-4 text-gray-700" />
//         </button>

//         <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
//           {linkUrl ? (
//             <a href={linkUrl} target="_blank" rel="noopener noreferrer">
//               {Img}
//             </a>
//           ) : (
//             Img
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
