// v.1.1.4 ===============================================
// src/app/admin/components/products/ProductRowAdmin.tsx
"use client";

import Image from "next/image";
import AdminEditable from "../AdminEditable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Stars from "./Stars";
import { calcOriginalPrice, frameBorderClass } from "./price";
import type { UIProduct, DiscountRuleLite } from "./types";

/* NEW: settings การแสดงผลของแถว/การ์ด */
import {
  type CardPartsVisibility,
  defaultCardPartsVisibility,
} from "./cardSettings";

export default function ProductRowAdmin(props: {
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

  /* NEW: ควบคุมการแสดงผลส่วนต่าง ๆ */
  visibleParts?: CardPartsVisibility;
}) {
  const {
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
  } = props;

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
            "relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft transition-all overflow-hidden p-3 sm:p-4",
            isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
          ].join(" ")}
        >
          {selectable && (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selected}
                onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
              />
            </div>
          )}

          {/* รูปสินค้า + กรอบ (ตาม toggle) */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
            {parts.image ? (
              <Image
                src={item.image_url ?? "/placeholder.png"}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
                priority={false}
              />
            ) : (
              // รักษากรอบสี่เหลี่ยมแม้ปิดรูป
              <div className="absolute inset-0 bg-muted/20" />
            )}

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
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
                    />
                  ) : (
                    <div
                      className={[
                        "pointer-events-none absolute inset-0 rounded-lg border-2",
                        frameBorderClass(item.discountPercent),
                      ].join(" ")}
                      style={{ zIndex: 5 }}
                    />
                  )}
                </>
              ))}

            {parts.discountBadge && !!item.discountPercent && (
              <span className="absolute top-1 left-1 z-20 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft">
                -{item.discountPercent}%
              </span>
            )}

            {/* ซ่อนแสดงสถานะ HIDDEN เหมือนบนการ์ด */}
            {isHidden && (
              <span className="absolute top-1 right-1 z-20 rounded-md bg-amber-500/90 text-white text-[10px] px-1.5 py-0.5 tracking-wide">
                HIDDEN
              </span>
            )}
          </div>

          {/* เนื้อหา */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                {parts.brandName && item.brand && (
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {item.brand}
                  </div>
                )}

                {parts.sku && item.sku && (
                  <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>
                )}

                {parts.name && (
                  <div className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</div>
                )}

                {parts.ratingReview && (item.rating || item.reviews) && (
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={item.rating} />
                    {typeof item.reviews === "number" && (
                      <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
                    )}
                  </div>
                )}

                {parts.category && categoryName && (
                  <div className="text-[11px] text-muted-foreground">{categoryName}</div>
                )}

                {parts.uom && item.uom && (
                  <div className="text-[11px] text-muted-foreground">หน่วย: {item.uom}</div>
                )}
              </div>

              {!quickEdit ? (
                (parts.price || (parts.originalPrice && originalPrice)) && (
                  <div className="text-right shrink-0">
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
                      <div className="text-xs text-muted-foreground line-through">
                        ฿{originalPrice.toLocaleString("th-TH")}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
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
                    <label className="block text-[10px] text-muted-foreground mb-1">
                      ส่วนลด (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      defaultValue={item.discountPercent ?? 0}
                      onBlur={(e) =>
                        onInlineChange?.(item.id, {
                          discountPercent: Math.max(
                            0,
                            Math.min(100, Number(e.target.value) || 0)
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminEditable>
    </div>
  );
}

// v.1.1.4 ===============================================


// v.1.1.3 ===============================================
// // src/app/admin/components/products/ProductRowAdmin.tsx

// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// /* NEW: settings การแสดงผลของแถว/การ์ด */
// import {
//   type CardPartsVisibility,
//   defaultCardPartsVisibility,
// } from "./cardSettings";

// export default function ProductRowAdmin(props: {
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

//   /* NEW: ควบคุมการแสดงผลส่วนต่าง ๆ */
//   visibleParts?: CardPartsVisibility;
// }) {
//   const {
//     item,
//     onDelete,
//     onToggleVisible,
//     onEdit,
//     categoryName,
//     frameRule,
//     selectable,
//     selected,
//     onSelectToggle,
//     quickEdit,
//     onInlineChange,
//     visibleParts,
//   } = props;

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
//             "relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft transition-all overflow-hidden p-3 sm:p-4",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {selectable && (
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4"
//                 checked={!!selected}
//                 onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
//               />
//             </div>
//           )}

//           {/* รูปสินค้า + กรอบ (ตาม toggle) */}
//           <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
//             {parts.image ? (
//               <Image
//                 src={item.image_url ?? "/placeholder.png"}
//                 alt={item.name}
//                 fill
//                 sizes="96px"
//                 className="object-cover"
//               />
//             ) : (
//               <div className="absolute inset-0" />
//             )}

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
//                       className="pointer-events-none absolute inset-0 rounded-lg"
//                       style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//                     />
//                   ) : (
//                     <div
//                       className={[
//                         "pointer-events-none absolute inset-0 rounded-lg border-2",
//                         frameBorderClass(item.discountPercent),
//                       ].join(" ")}
//                       style={{ zIndex: 5 }}
//                     />
//                   )}
//                 </>
//               ))}

//             {parts.discountBadge && !!item.discountPercent && (
//               <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft z-10">
//                 -{item.discountPercent}%
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="flex-1 min-w-0">
//             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
//               <div className="min-w-0">
//                 {parts.brandName && item.brand && (
//                   <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
//                     {item.brand}
//                   </div>
//                 )}

//                 {parts.sku && item.sku && (
//                   <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>
//                 )}

//                 {parts.name && (
//                   <div className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</div>
//                 )}

//                 {parts.ratingReview && (item.rating || item.reviews) && (
//                   <div className="mt-1 flex items-center gap-2">
//                     <Stars rating={item.rating} />
//                     {typeof item.reviews === "number" && (
//                       <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                     )}
//                   </div>
//                 )}

//                 {parts.category && categoryName && (
//                   <div className="text-[11px] text-muted-foreground">{categoryName}</div>
//                 )}

//                 {parts.uom && item.uom && (
//                   <div className="text-[11px] text-muted-foreground">หน่วย: {item.uom}</div>
//                 )}
//               </div>

//               {!quickEdit ? (
//                 (parts.price || (parts.originalPrice && originalPrice)) && (
//                   <div className="text-right shrink-0">
//                     {parts.price && (
//                       <div
//                         className={
//                           originalPrice
//                             ? "text-destructive font-bold text-base sm:text-lg"
//                             : "text-primary font-bold text-base sm:text-lg"
//                         }
//                       >
//                         ฿{Math.round(item.price).toLocaleString("th-TH")}
//                       </div>
//                     )}
//                     {parts.originalPrice && originalPrice && (
//                       <div className="text-xs text-muted-foreground line-through">
//                         ฿{originalPrice.toLocaleString("th-TH")}
//                       </div>
//                     )}
//                   </div>
//                 )
//               ) : (
//                 <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                       defaultValue={item.price}
//                       onBlur={(e) =>
//                         onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">
//                       ส่วนลด (%)
//                     </label>
//                     <input
//                       type="number"
//                       min={0}
//                       max={100}
//                       className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                       defaultValue={item.discountPercent ?? 0}
//                       onBlur={(e) =>
//                         onInlineChange?.(item.id, {
//                           discountPercent: Math.max(
//                             0,
//                             Math.min(100, Number(e.target.value) || 0)
//                           ),
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ================================================
// // src/app/admin/components/products/ProductRowAdmin.tsx

// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// export default function ProductRowAdmin(props: {
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
//   const {
//     item,
//     onDelete,
//     onToggleVisible,
//     onEdit,
//     categoryName,
//     frameRule,
//     selectable,
//     selected,
//     onSelectToggle,
//     quickEdit,
//     onInlineChange,
//   } = props;

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
//             "relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft transition-all overflow-hidden p-3 sm:p-4",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {selectable && (
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4"
//                 checked={!!selected}
//                 onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
//               />
//             </div>
//           )}

//           {/* รูปสินค้า + กรอบ */}
//           <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="96px"
//               className="object-cover"
//             />

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
//                     className="pointer-events-none absolute inset-0 rounded-lg"
//                     style={{ zIndex: 5, border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//                   />
//                 ) : (
//                   <div
//                     className={["pointer-events-none absolute inset-0 rounded-lg border-2", frameBorderClass(item.discountPercent)].join(" ")}
//                     style={{ zIndex: 5 }}
//                   />
//                 )}
//               </>
//             )}

//             {!!item.discountPercent && (
//               <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft z-10">
//                 -{item.discountPercent}%
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="flex-1 min-w-0">
//             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
//               <div className="min-w-0">
//                 {item.brand && (
//                   <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
//                     {item.brand}
//                   </div>
//                 )}
//                 {item.sku && (
//                   <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>
//                 )}
//                 <div className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</div>

//                 {(item.rating || item.reviews) && (
//                   <div className="mt-1 flex items-center gap-2">
//                     <Stars rating={item.rating} />
//                     {typeof item.reviews === "number" && (
//                       <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                     )}
//                   </div>
//                 )}

//                 {categoryName && (
//                   <div className="text-[11px] text-muted-foreground">{categoryName}</div>
//                 )}
//                 {item.uom && (
//                   <div className="text-[11px] text-muted-foreground">หน่วย: {item.uom}</div>
//                 )}
//               </div>

//               {!quickEdit ? (
//                 <div className="text-right shrink-0">
//                   <div
//                     className={
//                       originalPrice
//                         ? "text-destructive font-bold text-base sm:text-lg"
//                         : "text-primary font-bold text-base sm:text-lg"
//                     }
//                   >
//                     ฿{Math.round(item.price).toLocaleString("th-TH")}
//                   </div>
//                   {originalPrice && (
//                     <div className="text-xs text-muted-foreground line-through">
//                       ฿{originalPrice.toLocaleString("th-TH")}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                       defaultValue={item.price}
//                       onBlur={(e) =>
//                         onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">
//                       ส่วนลด (%)
//                     </label>
//                     <input
//                       type="number"
//                       min={0}
//                       max={100}
//                       className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                       defaultValue={item.discountPercent ?? 0}
//                       onBlur={(e) =>
//                         onInlineChange?.(item.id, {
//                           discountPercent: Math.max(
//                             0,
//                             Math.min(100, Number(e.target.value) || 0)
//                           ),
//                         })
//                       }
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // src/app/admin/components/products/ProductRowAdmin.tsx

// "use client";

// import Image from "next/image";
// import AdminEditable from "../AdminEditable";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// import Stars from "./Stars";
// import { calcOriginalPrice, frameBorderClass } from "./price";
// import type { UIProduct, DiscountRuleLite } from "./types";

// export default function ProductRowAdmin(props: {
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
//   const { item, onDelete, onToggleVisible, onEdit, categoryName, frameRule, selectable, selected, onSelectToggle, quickEdit, onInlineChange } = props;

//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isHidden = item.visible === false;
//   const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable onDelete={() => onDelete(item.id)} onToggleVisible={() => onToggleVisible(item.id)} onEdit={() => onEdit(item.id)} visible={item.visible ?? true} dragHandleProps={{ ...attributes, ...listeners }}>
//         <div className={["relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft transition-all overflow-hidden p-3 sm:p-4",
//           isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5"].join(" ")}>

//           {selectable && (
//             <div className="flex items-center">
//               <input type="checkbox" className="h-4 w-4" checked={!!selected} onChange={(e) => onSelectToggle?.(item.id, e.target.checked)} />
//             </div>
//           )}

//           <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
//             <Image src={item.image_url ?? "/placeholder.png"} alt={item.name} fill sizes="96px" className="object-cover" />
//             {frameRule ? (
//               <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }} />
//             ) : (
//               <div className={["pointer-events-none absolute inset-0 rounded-lg border-2", frameBorderClass(item.discountPercent)].join(" ")} />
//             )}
//             {!!item.discountPercent && (
//               <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft">-{item.discountPercent}%</span>
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
//               <div className="min-w-0">
//                 {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//                 {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}
//                 <div className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</div>

//                 {(item.rating || item.reviews) && (
//                   <div className="mt-1 flex items-center gap-2">
//                     <Stars rating={item.rating} />
//                     {typeof item.reviews === "number" && <span className="text-[11px] text-muted-foreground">({item.reviews})</span>}
//                   </div>
//                 )}
//                 {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}
//                 {item.uom && <div className="text-[11px] text-muted-foreground">หน่วย: {item.uom}</div>}
//               </div>

//               {!quickEdit ? (
//                 <div className="text-right shrink-0">
//                   <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                     ฿{Math.round(item.price).toLocaleString("th-TH")}
//                   </div>
//                   {originalPrice && <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
//                     <input type="number" step="0.01" className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                            defaultValue={item.price} onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })} />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                     <input type="number" min={0} max={100} className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                            defaultValue={item.discountPercent ?? 0} onBlur={(e) => onInlineChange?.(item.id, { discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }
