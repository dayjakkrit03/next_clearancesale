// v.1.1.5 =================================================
// src/app/admin/components/products/ProductCardAdmin.tsx
"use client";

import Image from "next/image";
import AdminEditable from "../AdminEditable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Stars from "./Stars";
import { brandLogoPath } from "./brand";
import { calcOriginalPrice, frameBorderClass } from "./price";
import type { UIProduct, DiscountRuleLite } from "./types";

/* NEW: รับ settings การแสดงผลของการ์ด */
import {
  type CardPartsVisibility,
  defaultCardPartsVisibility,
} from "./cardSettings";

export default function ProductCardAdmin({
  item,
  onDelete,
  onToggleVisible,
  onEdit,
  categoryName,
  frameRule,
  selectable,
  selected,
  onSelectToggle,
  quickEdit,
  onInlineChange,
  visibleParts,
}: {
  item: UIProduct;
  onDelete: (id: UIProduct["id"]) => void;
  onToggleVisible: (id: UIProduct["id"]) => void;
  onEdit: (id: UIProduct["id"]) => void;
  categoryName?: string;
  frameRule?: DiscountRuleLite | null;

  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: (id: UIProduct["id"], checked: boolean) => void;

  quickEdit?: boolean;
  onInlineChange?: (
    id: UIProduct["id"],
    patch: Partial<Pick<UIProduct, "price" | "discountPercent">>
  ) => void;

  /* NEW: ควบคุมการแสดงผลส่วนต่าง ๆ ของการ์ด */
  visibleParts?: CardPartsVisibility;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const parts: CardPartsVisibility = { ...defaultCardPartsVisibility, ...(visibleParts ?? {}) };

  const isHidden = item.visible === false;
  const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

  // ===== IMAGE frame overlay helpers =====
  const isImageFrame =
    (frameRule?.frameMode ?? "draw") === "image" && !!frameRule?.frameImageUrl;
  const inset = Math.max(0, Number(frameRule?.frameInsetPx ?? 0));
  const opacity =
    typeof frameRule?.frameOpacity === "number"
      ? Math.max(0, Math.min(1, frameRule!.frameOpacity!))
      : 1;
  const objectFit =
    frameRule?.frameObjectFit === "stretch"
      ? ("fill" as React.CSSProperties["objectFit"])
      : (frameRule?.frameObjectFit ?? "contain");

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <AdminEditable
        onDelete={() => onDelete(item.id)}
        onToggleVisible={() => onToggleVisible(item.id)}
        onEdit={() => onEdit(item.id)}
        visible={item.visible ?? true}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <div
          className={[
            "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
            isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
          ].join(" ")}
        >
          {/* รูปสินค้า + กรอบ */}
          <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
            {/* รูปสินค้า (toggle) */}
            {parts.image ? (
              <Image
                src={item.image_url ?? "/placeholder.png"}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
                className="object-cover"
                priority={false}
              />
            ) : (
              // รักษาสัดส่วนไว้เมื่อปิดรูป
              <div className="absolute inset-0 bg-muted/20" />
            )}

            {/* FRAME OVERLAY (toggle แยก) */}
            {parts.frame &&
              (isImageFrame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={frameRule!.frameImageUrl!}
                  alt=""
                  className="absolute pointer-events-none"
                  style={{
                    zIndex: 5,
                    top: inset,
                    left: inset,
                    right: inset,
                    bottom: inset,
                    opacity,
                    objectFit,
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: "inherit",
                  }}
                  loading="lazy"
                />
              ) : (
                <>
                  {frameRule ? (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
                    />
                  ) : (
                    <div
                      className={[
                        "pointer-events-none absolute inset-0 rounded-xl border-2",
                        frameBorderClass(item.discountPercent),
                      ].join(" ")}
                      style={{ zIndex: 5 }}
                    />
                  )}
                </>
              ))}

            {/* ป้ายเปอร์เซ็นต์ส่วนลด (อยู่มุมซ้ายบนเสมอ) */}
            {parts.discountBadge && !!item.discountPercent && item.discountPercent > 0 && (
              <span className="absolute top-2 left-2 z-20 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
                -{item.discountPercent}%
              </span>
            )}

            {/* โลโก้แบรนด์ */}
            {parts.brandLogo &&
              (() => {
                const logo = brandLogoPath(item.brand);
                return logo ? (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo}
                        alt={item.brand ?? "brand"}
                        className="h-7 w-auto max-w-[72px] object-contain"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null;
              })()}

            {/* hidden flag */}
            {isHidden && (
              <span className="absolute left-2 top-2 z-20 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
                HIDDEN
              </span>
            )}
          </div>

          {/* เลือกหลายรายการ (อยู่นอกระบบ toggle) */}
          {selectable && (
            <label className="px-3 sm:px-4 mt-2 inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selected}
                onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
              />
              เลือก
            </label>
          )}

          {/* เนื้อหาใต้รูป */}
          <div className="p-3 sm:p-4 flex flex-col gap-1">
            {/* ชื่อยี่ห้อ (ตัวหนังสือ) */}
            {parts.brandName && item.brand && (
              <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
                {item.brand}
              </div>
            )}

            {/* SKU */}
            {parts.sku && item.sku && (
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>
            )}

            {/* ชื่อสินค้า */}
            {parts.name && (
              <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">
                {item.name}
              </div>
            )}

            {/* Rating & Reviews */}
            {parts.ratingReview && (item.rating || item.reviews) && (
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={item.rating} />
                {typeof item.reviews === "number" && (
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>
                )}
              </div>
            )}

            {/* Category */}
            {parts.category && categoryName && (
              <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>
            )}

            {/* ราคา / เดิม / หน่วย  */}
            {!quickEdit ? (
              (parts.price || (parts.originalPrice && originalPrice) || (parts.uom && item.uom)) && (
                <div className="mt-1 flex items-baseline gap-2">
                  {parts.price && (
                    <div
                      className={
                        originalPrice
                          ? "text-destructive font-bold text-base sm:text-lg"
                          : "text-primary font-bold text-base sm:text-lg"
                      }
                    >
                      ฿{Math.round(item.price).toLocaleString("th-TH")}
                    </div>
                  )}
                  {parts.originalPrice && originalPrice && (
                    <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
                      ฿{originalPrice.toLocaleString("th-TH")}
                    </div>
                  )}
                  {parts.uom && item.uom && (
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>
                  )}
                </div>
              )
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    defaultValue={item.price}
                    onBlur={(e) =>
                      onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    defaultValue={item.discountPercent ?? 0}
                    onBlur={(e) =>
                      onInlineChange?.(item.id, {
                        discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminEditable>
    </div>
  );
}

// v.1.1.5 ================================================

// v.1.1.4 =================================================
// // src/app/admin/components/products/ProductCardAdmin.tsx
// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { brandLogoPath } from "./brand";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// /* NEW: รับ settings การแสดงผลของการ์ด */
// import {
//   type CardPartsVisibility,
//   defaultCardPartsVisibility,
// } from "./cardSettings";

// export default function ProductCardAdmin({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
//   selectable,
//   selected,
//   onSelectToggle,
//   quickEdit,
//   onInlineChange,
//   visibleParts,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;

//   selectable?: boolean;
//   selected?: boolean;
//   onSelectToggle?: (id: UIProduct["id"], checked: boolean) => void;

//   quickEdit?: boolean;
//   onInlineChange?: (
//     id: UIProduct["id"],
//     patch: Partial<Pick<UIProduct, "price" | "discountPercent">>
//   ) => void;

//   /* NEW: ควบคุมการแสดงผลส่วนต่าง ๆ ของการ์ด */
//   visibleParts?: CardPartsVisibility;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const parts: CardPartsVisibility = { ...defaultCardPartsVisibility, ...(visibleParts ?? {}) };

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   // ===== IMAGE frame overlay helpers =====
//   const isImageFrame =
//     (frameRule?.frameMode ?? "draw") === "image" && !!frameRule?.frameImageUrl;
//   const inset = Math.max(0, Number(frameRule?.frameInsetPx ?? 0));
//   const opacity =
//     typeof frameRule?.frameOpacity === "number"
//       ? Math.max(0, Math.min(1, frameRule!.frameOpacity!))
//       : 1;
//   const objectFit =
//     frameRule?.frameObjectFit === "stretch"
//       ? ("fill" as React.CSSProperties["objectFit"])
//       : (frameRule?.frameObjectFit ?? "contain");

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* รูปสินค้า + กรอบ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             {/* รูปสินค้า (toggle) */}
//             {parts.image ? (
//               <Image
//                 src={item.image_url ?? "/placeholder.png"}
//                 alt={item.name}
//                 fill
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//                 className="object-cover"
//               />
//             ) : (
//               /* เก็บสัดส่วนไว้ แม้ปิดรูป */
//               <div className="absolute inset-0" />
//             )}

//             {/* FRAME OVERLAY (toggle แยก) */}
//             {parts.frame &&
//               (isImageFrame ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={frameRule!.frameImageUrl!}
//                   alt=""
//                   className="absolute pointer-events-none"
//                   style={{
//                     zIndex: 5,
//                     top: inset,
//                     left: inset,
//                     right: inset,
//                     bottom: inset,
//                     opacity,
//                     objectFit,
//                     width: "auto",
//                     height: "auto",
//                     maxWidth: "100%",
//                     maxHeight: "100%",
//                     borderRadius: "inherit",
//                   }}
//                   loading="lazy"
//                 />
//               ) : (
//                 <>
//                   {frameRule ? (
//                     <div
//                       className="pointer-events-none absolute inset-0 rounded-xl"
//                       style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//                     />
//                   ) : (
//                     <div
//                       className={[
//                         "pointer-events-none absolute inset-0 rounded-xl border-2",
//                         frameBorderClass(item.discountPercent),
//                       ].join(" ")}
//                       style={{ zIndex: 5 }}
//                     />
//                   )}
//                 </>
//               ))}

//             {/* ป้ายเปอร์เซ็นต์ส่วนลด */}
//             {parts.discountBadge && !!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 z-20 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {/* โลโก้แบรนด์ */}
//             {parts.brandLogo &&
//               (() => {
//                 const logo = brandLogoPath(item.brand);
//                 return logo ? (
//                   <div className="absolute top-2 right-2 z-10">
//                     <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img
//                         src={logo}
//                         alt={item.brand ?? "brand"}
//                         className="h-7 w-auto max-w-[72px] object-contain"
//                         onError={(e) => ((e.currentTarget.style.display = "none"))}
//                         loading="lazy"
//                       />
//                     </div>
//                   </div>
//                 ) : null;
//               })()}

//             {/* hidden flag */}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-20 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เลือกหลายรายการ (คงเดิม, ไม่อยู่ใน toggle) */}
//           {selectable && (
//             <label className="px-3 sm:px-4 mt-2 inline-flex items-center gap-2 text-xs">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4"
//                 checked={!!selected}
//                 onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
//               />
//               เลือก
//             </label>
//           )}

//           {/* เนื้อหาใต้รูป */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {/* ชื่อยี่ห้อ (ตัวหนังสือ) */}
//             {parts.brandName && item.brand && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
//                 {item.brand}
//               </div>
//             )}

//             {/* SKU */}
//             {parts.sku && item.sku && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>
//             )}

//             {/* ชื่อสินค้า */}
//             {parts.name && (
//               <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">
//                 {item.name}
//               </div>
//             )}

//             {/* Rating & Reviews */}
//             {parts.ratingReview && (item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {/* Category */}
//             {parts.category && categoryName && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>
//             )}

//             {/* ราคา / เดิม / หน่วย  */}
//             {!quickEdit ? (
//               (parts.price || (parts.originalPrice && originalPrice) || (parts.uom && item.uom)) && (
//                 <div className="mt-1 flex items-baseline gap-2">
//                   {parts.price && (
//                     <div
//                       className={
//                         originalPrice
//                           ? "text-destructive font-bold text-base sm:text-lg"
//                           : "text-primary font-bold text-base sm:text-lg"
//                       }
//                     >
//                       ฿{Math.round(item.price).toLocaleString("th-TH")}
//                     </div>
//                   )}
//                   {parts.originalPrice && originalPrice && (
//                     <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
//                       ฿{originalPrice.toLocaleString("th-TH")}
//                     </div>
//                   )}
//                   {parts.uom && item.uom && (
//                     <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>
//                   )}
//                 </div>
//               )
//             ) : (
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.price}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.discountPercent ?? 0}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, {
//                         discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// v.1.1.4 =================================================

// v.1.1.3 =================================================
// // src/app/admin/components/products/ProductCardAdmin.tsx

// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { brandLogoPath } from "./brand";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// export default function ProductCardAdmin({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
//   selectable,
//   selected,
//   onSelectToggle,
//   quickEdit,
//   onInlineChange,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;

//   selectable?: boolean;
//   selected?: boolean;
//   onSelectToggle?: (id: UIProduct["id"], checked: boolean) => void;

//   quickEdit?: boolean;
//   onInlineChange?: (
//     id: UIProduct["id"],
//     patch: Partial<Pick<UIProduct, "price" | "discountPercent">>
//   ) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   // ===== IMAGE frame overlay helpers =====
//   const isImageFrame =
//     (frameRule?.frameMode ?? "draw") === "image" && !!frameRule?.frameImageUrl;
//   const inset = Math.max(0, Number(frameRule?.frameInsetPx ?? 0));
//   const opacity =
//     typeof frameRule?.frameOpacity === "number"
//       ? Math.max(0, Math.min(1, frameRule!.frameOpacity!))
//       : 1;
//   const objectFit =
//     frameRule?.frameObjectFit === "stretch"
//       ? ("fill" as React.CSSProperties["objectFit"])
//       : (frameRule?.frameObjectFit ?? "contain");

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* รูปสินค้า + กรอบ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover"
//             />

//             {/* FRAME OVERLAY */}
//             {isImageFrame ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={frameRule!.frameImageUrl!}
//                 alt=""
//                 className="absolute pointer-events-none"
//                 style={{
//                   zIndex: 5,
//                   top: inset,
//                   left: inset,
//                   right: inset,
//                   bottom: inset,
//                   opacity,
//                   objectFit,
//                   width: "auto",
//                   height: "auto",
//                   maxWidth: "100%",
//                   maxHeight: "100%",
//                   borderRadius: "inherit",
//                 }}
//                 loading="lazy"
//               />
//             ) : (
//               <>
//                 {frameRule ? (
//                   <div
//                     className="pointer-events-none absolute inset-0 rounded-xl"
//                     style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//                   />
//                 ) : (
//                   <div
//                     className={[
//                       "pointer-events-none absolute inset-0 rounded-xl border-2",
//                       frameBorderClass(item.discountPercent),
//                     ].join(" ")}
//                     style={{ zIndex: 5 }}
//                   />
//                 )}
//               </>
//             )}

//             {/* ป้ายเปอร์เซ็นต์ส่วนลด — กลับไปมุมซ้ายบน */}
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 z-20 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {/* โลโก้แบรนด์ */}
//             {(() => {
//               const logo = brandLogoPath(item.brand);
//               return logo ? (
//                 <div className="absolute top-2 right-2 z-10">
//                   <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={logo}
//                       alt={item.brand ?? "brand"}
//                       className="h-7 w-auto max-w-[72px] object-contain"
//                       onError={(e) => ((e.currentTarget.style.display = "none"))}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {/* hidden flag */}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-20 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* บรรทัดเลือกหลายรายการ — ย้ายออกมาอยู่ใต้รูป */}
//           {selectable && (
//             <label className="px-3 sm:px-4 mt-2 inline-flex items-center gap-2 text-xs">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4"
//                 checked={!!selected}
//                 onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
//               />
//               เลือก
//             </label>
//           )}

//           {/* เนื้อหาใต้รูป */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
//                 {item.brand}
//               </div>
//             )}
//             {item.sku && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>
//             )}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>
//             )}

//             {!quickEdit ? (
//               <div className="mt-1 flex items-baseline gap-2">
//                 <div
//                   className={
//                     originalPrice
//                       ? "text-destructive font-bold text-base sm:text-lg"
//                       : "text-primary font-bold text-base sm:text-lg"
//                   }
//                 >
//                   ฿{Math.round(item.price).toLocaleString("th-TH")}
//                 </div>
//                 {originalPrice && (
//                   <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
//                     ฿{originalPrice.toLocaleString("th-TH")}
//                   </div>
//                 )}
//                 {item.uom && (
//                   <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>
//                 )}
//               </div>
//             ) : (
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.price}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.discountPercent ?? 0}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, {
//                         discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// v.1.1.3 =================================================


// v.1.1.2 =================================================
// // src/app/admin/components/products/ProductCardAdmin.tsx
// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { brandLogoPath } from "./brand";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// export default function ProductCardAdmin({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
//   selectable,
//   selected,
//   onSelectToggle,
//   quickEdit,
//   onInlineChange,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;

//   selectable?: boolean;
//   selected?: boolean;
//   onSelectToggle?: (id: UIProduct["id"], checked: boolean) => void;

//   quickEdit?: boolean;
//   onInlineChange?: (
//     id: UIProduct["id"],
//     patch: Partial<Pick<UIProduct, "price" | "discountPercent">>
//   ) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   // ===== IMAGE frame overlay helpers (เหมือนฝั่งแถว) =====
//   const isImageFrame =
//     (frameRule?.frameMode ?? "draw") === "image" && !!frameRule?.frameImageUrl;
//   const inset = Math.max(0, Number(frameRule?.frameInsetPx ?? 0));
//   const opacity =
//     typeof frameRule?.frameOpacity === "number"
//       ? Math.max(0, Math.min(1, frameRule!.frameOpacity!))
//       : 1;
//   const objectFit =
//     frameRule?.frameObjectFit === "stretch"
//       ? ("fill" as React.CSSProperties["objectFit"])
//       : (frameRule?.frameObjectFit ?? "contain");

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* รูปสินค้า + กรอบ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover"
//             />

//             {/* checkbox เลือกหลายรายการ */}
//             {selectable && (
//               <label className="absolute top-2 left-2 z-20 bg-white/90 rounded-md px-1.5 py-1 shadow-soft flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   className="h-4 w-4"
//                   checked={!!selected}
//                   onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
//                 />
//                 <span className="text-xs">เลือก</span>
//               </label>
//             )}

//             {/* FRAME OVERLAY */}
//             {isImageFrame ? (
//               <img
//                 src={frameRule!.frameImageUrl!}
//                 alt=""
//                 className="absolute pointer-events-none"
//                 style={{
//                   zIndex: 5,
//                   top: inset,
//                   left: inset,
//                   right: inset,
//                   bottom: inset,
//                   opacity,
//                   objectFit,
//                   width: "auto",
//                   height: "auto",
//                   maxWidth: "100%",
//                   maxHeight: "100%",
//                   borderRadius: "inherit",
//                 }}
//                 loading="lazy"
//               />
//             ) : (
//               <>
//                 {frameRule ? (
//                   <div
//                     className="pointer-events-none absolute inset-0 rounded-xl"
//                     style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//                   />
//                 ) : (
//                   <div
//                     className={[
//                       "pointer-events-none absolute inset-0 rounded-xl border-2",
//                       frameBorderClass(item.discountPercent),
//                     ].join(" ")}
//                     style={{ zIndex: 5 }}
//                   />
//                 )}
//               </>
//             )}

//             {/* badge ส่วนลด */}
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 translate-y-[34px] bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft z-10">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {/* โลโก้แบรนด์ */}
//             {(() => {
//               const logo = brandLogoPath(item.brand);
//               return logo ? (
//                 <div className="absolute top-2 right-2 z-10">
//                   <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
//                     <img
//                       src={logo}
//                       alt={item.brand ?? "brand"}
//                       className="h-7 w-auto max-w-[72px] object-contain"
//                       onError={(e) => ((e.currentTarget.style.display = "none"))}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {/* hidden flag */}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาใต้รูป */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
//                 {item.brand}
//               </div>
//             )}
//             {item.sku && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>
//             )}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>
//             )}

//             {!quickEdit ? (
//               <div className="mt-1 flex items-baseline gap-2">
//                 <div
//                   className={
//                     originalPrice
//                       ? "text-destructive font-bold text-base sm:text-lg"
//                       : "text-primary font-bold text-base sm:text-lg"
//                   }
//                 >
//                   ฿{Math.round(item.price).toLocaleString("th-TH")}
//                 </div>
//                 {originalPrice && (
//                   <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
//                     ฿{originalPrice.toLocaleString("th-TH")}
//                   </div>
//                 )}
//                 {item.uom && (
//                   <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>
//                 )}
//               </div>
//             ) : (
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.price}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.discountPercent ?? 0}
//                     onBlur={(e) =>
//                       onInlineChange?.(item.id, {
//                         discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }


// v.1.1.2 =================================================

// // src/app/admin/components/products/ProductCardAdmin.tsx

// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { brandLogoPath } from "./brand";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// export default function ProductCardAdmin({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
//   selectable,
//   selected,
//   onSelectToggle,
//   quickEdit,
//   onInlineChange,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;

//   selectable?: boolean;
//   selected?: boolean;
//   onSelectToggle?: (id: UIProduct["id"], checked: boolean) => void;

//   quickEdit?: boolean;
//   onInlineChange?: (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(item.id)}
//         onToggleVisible={() => onToggleVisible(item.id)}
//         onEdit={() => onEdit(item.id)}
//         visible={item.visible ?? true}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className={["relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//           isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5"].join(" ")}>

//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image src={item.image_url ?? "/placeholder.png"} alt={item.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw" className="object-cover" />

//             {selectable && (
//               <label className="absolute top-2 left-2 z-20 bg-white/90 rounded-md px-1.5 py-1 shadow-soft flex items-center gap-1">
//                 <input type="checkbox" className="h-4 w-4" checked={!!selected} onChange={(e) => onSelectToggle?.(item.id, e.target.checked)} />
//                 <span className="text-xs">เลือก</span>
//               </label>
//             )}

//             {frameRule ? (
//               <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }} />
//             ) : (
//               <div className={["pointer-events-none absolute inset-0 rounded-xl border-2", frameBorderClass(item.discountPercent)].join(" ")} />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 translate-y-[34px] bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {(() => {
//               const logo = brandLogoPath(item.brand);
//               return logo ? (
//                 <div className="absolute top-2 right-2 z-10">
//                   <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
//                     <img src={logo} alt={item.brand ?? "brand"} className="h-7 w-auto max-w-[72px] object-contain" onError={(e) => ((e.currentTarget.style.display = "none"))} loading="lazy" />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">HIDDEN</span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>}
//               </div>
//             )}

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             {!quickEdit ? (
//               <div className="mt-1 flex items-baseline gap-2">
//                 <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                   ฿{Math.round(item.price).toLocaleString("th-TH")}
//                 </div>
//                 {originalPrice && <div className="text-[11px] sm:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>}
//                 {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
//               </div>
//             ) : (
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                   <input type="number" step="0.01" className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                          defaultValue={item.price} onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })} />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                   <input type="number" min={0} max={100} className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                          defaultValue={item.discountPercent ?? 0} onBlur={(e) => onInlineChange?.(item.id, { discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }
