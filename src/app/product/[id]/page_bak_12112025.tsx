// v.1.1.2 ==========================================================
// // src/app/product/[id]/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Star, Heart, Share2, Plus, Minus, Shield, Truck, RotateCcw, ZoomIn, MapPin, Package,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { ShoppingCart } from "@/components/shopping-cart";

// /* ===== Types ===== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   rating?: number;
//   reviews?: number;
//   category_id?: number | string;
//   uom?: string;
//   // NEW: จาก API ขั้นตอนที่ 1
//   images?: Array<{ url: string; order: number; isPrimary?: boolean }>;
//   // NEW: sales conditions
//   conditions?: Array<
//     | { salesType: "CUT"; unit: string; minimumLength?: number }
//     | { salesType: "ROLL"; unit: string; rollLengths?: number[] }
//   >;

// };

// type DiscountRuleLite = {
//   id: string | number;
//   minPercent?: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   frameMode?: "image" | "draw";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;
//   frameObjectFit?: "contain" | "cover" | "stretch";
//   enabled?: boolean;
//   order?: number;
// };

// type FrameInfo =
//   | { mode: "image"; imageUrl: string; inset: number; opacity: number; objectFit: "contain" | "cover" | "fill" }
//   | { mode: "draw"; borderWidth: number; borderColorHex: string };

// type VisibleParts = Partial<{
//   image: boolean;
//   discountBadge: boolean;
//   brandLogo: boolean;
//   frame: boolean;
//   brandName: boolean;
//   sku: boolean;
//   name: boolean;
//   ratingReview: boolean;
//   category: boolean;
//   price: boolean;
//   originalPrice: boolean;
//   uom: boolean;
// }>;

// /* ===== Helpers ===== */
// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// const objectFit = (fit?: string): "contain" | "cover" | "fill" =>
//   fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

// const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? Math.max(0, Math.min(1, rule.frameOpacity)) : 1,
//       objectFit: objectFit(rule.frameObjectFit),
//     };
//   }
//   return {
//     mode: "draw",
//     borderWidth: Number(rule.borderWidth) || 2,
//     borderColorHex: String(rule.borderColorHex || "#000"),
//   };
// };

// const pickRuleFactory = (rules: DiscountRuleLite[]) => (percent?: number): DiscountRuleLite | null => {
//   if (percent == null) return null;
//   for (const r of rules) {
//     const lowerOk = percent >= (r.minPercent ?? 0);
//     const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//     if (lowerOk && upperOk) return r;
//   }
//   return null;
// };

// const brandToLogoUrl = (brand?: string) => {
//   // hardcode แบบปลอดภัย: เดาว่ามีโลโก้อยู่ที่ /uploads/brands/<slug>.png
//   if (!brand) return undefined;
//   const slug = brand.toLowerCase().replace(/\s+/g, "-");
//   return `/brand_logo/${slug}_logo.png`;
// };

// /* ===== Page ===== */
// export default function ProductDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params.id;

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [product, setProduct] = useState<UIProduct | null>(null);
//   const [images, setImages] = useState<Array<{ url: string; order: number; isPrimary?: boolean }>>([]);
//   const [selectedImage, setSelectedImage] = useState(0);

//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   const pickRule = useMemo(() => pickRuleFactory(rules), [rules]);

//   const [visibleParts, setVisibleParts] = useState<VisibleParts | undefined>(undefined);

//   const [quantity, setQuantity] = useState(1);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [showZoom, setShowZoom] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

//   // // Color/Storage (ยังคง mock UI เอาไว้ชั่วคราว)
//   // const [selectedColor, setSelectedColor] = useState("Cut");
//   // const [selectedStorage, setSelectedStorage] = useState("500 M.");

//   // Sales conditions state (derive from product.conditions)
//   const [hasConditions, setHasConditions] = useState(false);
//   const [unit, setUnit] = useState<string>("M.");
//   const [salesMode, setSalesMode] = useState<"CUT" | "ROLL" | null>(null);
//   const [cutLength, setCutLength] = useState<number | null>(null);      // สำหรับ CUT
//   const [rollLength, setRollLength] = useState<number | null>(null);    // สำหรับ ROLL

//   // bootstrap: discount rules
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         const arr: DiscountRuleLite[] = (j?.items ?? [])
//           .filter((x: any) => x && (x.enabled ?? true))
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             frameMode: r.frameMode === "image" ? "image" : "draw",
//             frameImageUrl: r.frameMode === "image" ? r.frameImageUrl : undefined,
//             frameInsetPx: typeof r.frameInsetPx === "number" ? r.frameInsetPx : undefined,
//             frameOpacity:
//               typeof r.frameOpacity === "number" ? Math.max(0, Math.min(1, Number(r.frameOpacity))) : undefined,
//             frameObjectFit:
//               r.frameObjectFit === "cover" ? "cover" : r.frameObjectFit === "stretch" ? "stretch" : "contain",
//             enabled: r.enabled,
//             order: typeof r.order === "number" ? r.order : undefined,
//           }))
//           // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//           .sort((a: { order?: number }, b: { order?: number }) => (Number(a.order ?? 0) - Number(b.order ?? 0)));
//         if (!aborted) setRules(arr);
//       } catch {
//         if (!aborted) setRules([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   // bootstrap: products meta (โชว์/ซ่อนส่วนต่าง ๆ ให้เหมือนหน้า Listing)
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/products/meta", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         if (!aborted) setVisibleParts(j?.meta?.cardParts ?? undefined);
//       } catch {
//         if (!aborted) setVisibleParts(undefined);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   // fetch product by id
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`/api/mock/products/${id}`, { cache: "no-store" });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const item: UIProduct = await res.json();

//         // รูปทั้งหมด: ใช้ images จาก API (เรียงตาม order) หรือ fallback เป็น image_url/placeholder
//         let imgs = Array.isArray(item.images) ? [...item.images] : [];
//         imgs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         if (imgs.length === 0) {
//           const fallback = item.image_url || "/placeholder.png";
//           imgs = [{ url: fallback, order: 0, isPrimary: true }];
//         }
//         if (!aborted) {
//           setProduct(item);
//           setImages(imgs);
//           setSelectedImage(0);
//           // reset quantity ตาม stock? (ยังไม่มีฟิลด์ stock ใน DB — คงไว้ 1)
          
//           // === DEFAULT sales conditions ===
//           const conds = Array.isArray(item.conditions) ? item.conditions : [];
//           if (conds.length) {
//             setHasConditions(true);
//             // สมมติ: ใช้ record แรกเป็นค่าเริ่มต้น (หรือคุณจะเลือก logic อื่นภายหลังได้)
//             const first = conds[0] as any;
//             const unitStr = (first?.unit ?? "M.") as string;
//             setUnit(unitStr);

//             if (first?.salesType === "CUT") {
//               setSalesMode("CUT");
//               // ใช้ minimumLength เป็น default ถ้ามี ไม่มีก็ตั้ง 1
//               setCutLength(typeof first.minimumLength === "number" ? first.minimumLength : 1);
//               setRollLength(null);
//             } else if (first?.salesType === "ROLL") {
//               setSalesMode("ROLL");
//               // ใช้ rollLengths ตัวแรกเป็น default ถ้ามี
//               const rl = Array.isArray(first.rollLengths) ? first.rollLengths : [];
//               setRollLength(rl.length ? rl[0] : null);
//               setCutLength(null);
//             } else {
//               setSalesMode(null);
//               setCutLength(null);
//               setRollLength(null);
//             }
//           } else {
//             setHasConditions(false);
//             setSalesMode(null);
//             setCutLength(null);
//             setRollLength(null);
//             setUnit(product?.uom || "M."); // ถ้าไม่มีเงื่อนไข ใช้ uom เดิม
//           }

//           setQuantity(1);
//         }
//       } catch (e: any) {
//         if (!aborted) setError(e?.message ?? "โหลดสินค้าล้มเหลว");
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     })();
//     return () => { aborted = true; };
//   }, [id]);

//   // frame rule สำหรับสินค้าปัจจุบัน
//   const frameInfo: FrameInfo | null = useMemo(
//     () => toFrameInfo(pickRule(product?.discountPercent)),
//     [pickRule, product?.discountPercent]
//   );

//   const originalPrice = useMemo(
//     () => (product ? getOriginalPrice(product.price, product.discountPercent) : undefined),
//     [product]
//   );

//   const brandLogoUrl = useMemo(() => brandToLogoUrl(product?.brand), [product?.brand]);

//   // ความยาวต่อหนึ่งรายการ (ตามเงื่อนไขที่เลือก)
//   const lengthPerItem = useMemo(() => {
//     if (!hasConditions || !salesMode) return 1; // ไม่มีเงื่อนไข → ความยาวต่อรายการ = 1 หน่วย (ตีความว่า price เป็นราคาต่อชิ้น)
//     if (salesMode === "CUT") return Math.max(1, Number(cutLength ?? 1));
//     if (salesMode === "ROLL") return Math.max(1, Number(rollLength ?? 1));
//     return 1;
//   }, [hasConditions, salesMode, cutLength, rollLength]);

//   // ความยาวรวม = lengthPerItem × quantity
//   const totalLength = useMemo(() => {
//     return Math.max(1, Number(lengthPerItem)) * Math.max(1, Number(quantity));
//   }, [lengthPerItem, quantity]);

//   // ราคา (price) ใน DB คือ "ราคาต่อ 1 หน่วยความยาว" หรือ "ราคาต่อชิ้น"?
//   // - ถ้ามีเงื่อนไข: ตีความว่า price เป็น "ราคาต่อ 1 หน่วย (unit)"
//   // - ถ้าไม่มีเงื่อนไข: ตีความว่า price เป็น "ราคาต่อชิ้น"
//   const totalPrice = useMemo(() => {
//     if (hasConditions && salesMode) {
//       return totalLength * Number(product?.price ?? 0);
//     }
//     return Math.max(1, Number(quantity)) * Number(product?.price ?? 0);
//   }, [hasConditions, salesMode, totalLength, quantity, product?.price]);


//   // Scroll to top when id changes
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [id]);

//   const handleQuantityChange = (change: number) => {
//     const newQuantity = Math.max(1, quantity + change);
//     setQuantity(newQuantity);
//   };

//   const currentImageUrl = images[selectedImage]?.url || "/placeholder.png";

//   const handleMouseEnterImage = (e: React.MouseEvent<HTMLImageElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoomPosition({ x, y });
//     setShowZoom(true);
//   };

//   const handleMouseMoveImage = (e: React.MouseEvent<HTMLImageElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoomPosition({ x, y });
//   };

//   const handleMouseLeaveImage = () => setShowZoom(false);

//   if (loading && !product) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-8">
//           <div className="h-10 w-48 bg-muted/30 rounded mb-4 animate-pulse" />
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//             <div className="lg:col-span-2 space-y-4">
//               <div className="aspect-square bg-muted/30 rounded-lg animate-pulse" />
//               <div className="grid grid-cols-5 gap-2">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <div key={i} className="aspect-square bg-muted/30 rounded-lg animate-pulse" />
//                 ))}
//               </div>
//             </div>
//             <div className="lg:col-span-3 space-y-4">
//               <div className="h-8 bg-muted/30 rounded w-2/3 animate-pulse" />
//               <div className="h-6 bg-muted/30 rounded w-1/2 animate-pulse" />
//               <div className="h-24 bg-muted/30 rounded animate-pulse" />
//               <div className="h-10 bg-muted/30 rounded w-1/3 animate-pulse" />
//               <div className="h-32 bg-muted/30 rounded animate-pulse" />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-12">
//           <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error ?? "ไม่พบสินค้า"}</p>
//           <Button className="mt-4" onClick={() => router.push("/products")}>กลับไปหน้าสินค้า</Button>
//         </div>
//       </div>
//     );
//   }

//   const showDiscountBadge = (visibleParts?.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;
//   const showBrandLogo = (visibleParts?.brandLogo ?? true) && !!brandLogoUrl;
//   const showFrame = (visibleParts?.frame ?? true) && !!frameInfo;

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto max-w-screen-xl px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-8 overflow-hidden">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="hover:text-primary cursor-pointer" onClick={() => router.push("/")}>หน้าแรก</span>
//             <span>/</span>
//             <span className="hover:text-primary cursor-pointer" onClick={() => router.push("/products")}>สินค้า</span>
//             <span>/</span>
//             <span className="text-primary truncate">{product.name}</span>
//           </div>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-12">
//           {/* Product Images */}
//           <div className="lg:col-span-2 space-y-4 relative">
//             <div
//               className={[
//                 "aspect-square rounded-lg overflow-hidden relative bg-muted/30",
//                 showFrame && frameInfo?.mode === "draw" ? "border-solid" : "",
//               ].join(" ")}
//               style={
//                 showFrame && frameInfo?.mode === "draw"
//                   ? { borderWidth: (frameInfo as any).borderWidth, borderColor: (frameInfo as any).borderColorHex }
//                   : undefined
//               }
//             >

//               {showDiscountBadge && (
//                 <div className="absolute top-3 left-3 z-20">
//                   <Badge
//                     className="bg-sale text-sale-foreground text-base font-bold 
//                               px-5 py-2 rounded-lg shadow-lg"
//                   >
//                     -{product.discountPercent}%
//                   </Badge>
//                 </div>
//               )}


//               {showBrandLogo && (
//                 <div
//                   className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm 
//                             rounded-lg border border-gray-200 p-2 shadow-lg"
//                 >
//                   {/* ซ่อนโลโก้ ถ้าไฟล์ไม่พบ */}
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={brandLogoUrl}
//                     alt={product.brand || "brand"}
//                     className="h-12 w-auto object-contain drop-shadow-md"
//                     onError={(e) => {
//                       (e.currentTarget as HTMLImageElement).style.display = "none";
//                     }}
//                   />
//                 </div>
//               )}


//               {/* deco frame image (if mode === image) */}
//               {showFrame && frameInfo?.mode === "image" && (
//                 <div
//                   className="pointer-events-none absolute inset-2 z-10 rounded-lg"
//                   style={{
//                     opacity: (frameInfo as any).opacity ?? 1,
//                     padding: (frameInfo as any).inset ?? 0,
//                   }}
//                 >
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={(frameInfo as any).imageUrl}
//                     alt="frame"
//                     className="w-full h-full object-contain"
//                     style={{ objectFit: (frameInfo as any).objectFit }}
//                   />
//                 </div>
//               )}

//               {/* main image */}
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={currentImageUrl}
//                 alt={product.name}
//                 className="w-full h-full object-cover cursor-zoom-in"
//                 onMouseEnter={handleMouseEnterImage}
//                 onMouseMove={handleMouseMoveImage}
//                 onMouseLeave={handleMouseLeaveImage}
//               />

//               {/* zoom hint */}
//               {showZoom && (
//                 <div className="absolute inset-0 pointer-events-none">
//                   <ZoomIn className="absolute top-4 right-4 h-6 w-6 text-white/80" />
//                 </div>
//               )}
//             </div>

//             {/* Zoom overlay - desktop only */}
//             {showZoom && (
//               <div
//                 className="hidden lg:block absolute top-0 left-full ml-4 w-96 h-96 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                 style={{
//                   backgroundImage: `url(${currentImageUrl})`,
//                   backgroundSize: "200%",
//                   backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//                   backgroundRepeat: "no-repeat",
//                 }}
//               />
//             )}

//             {/* Thumbnails */}
//             <div className="w-full">
//               <Carousel className="w-full">
//                 <CarouselContent className="-ml-2">
//                   {images.map((im, index) => (
//                     <CarouselItem key={`${im.url}-${index}`} className="pl-2 basis-1/4 sm:basis-1/5">
//                       <button
//                         onMouseEnter={() => setSelectedImage(index)}
//                         onClick={() => setSelectedImage(index)}
//                         className={[
//                           "aspect-square rounded-lg overflow-hidden border-2 transition-colors w-full relative bg-muted/20",
//                           selectedImage === index ? "border-primary" : "border-muted hover:border-primary/50",
//                         ].join(" ")}
//                       >
//                         {/* ถ้าต้องการโชว์ frame ที่ thumbnail ด้วย (optional) */}
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img src={im.url} alt={`thumb ${index + 1}`} className="w-full h-full object-cover" />
//                         {im.isPrimary && (
//                           <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
//                             main
//                           </span>
//                         )}
//                       </button>
//                     </CarouselItem>
//                   ))}
//                 </CarouselContent>
//                 <CarouselPrevious className="left-0" />
//                 <CarouselNext className="right-0" />
//               </Carousel>
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="lg:col-span-3 space-y-4 lg:space-y-6">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">
//                 {product.name}
//               </h1>
//               <p className="text-muted-foreground text-sm md:text-base break-words">
//                 {visibleParts?.brandName !== false && <>Brand: {product.brand || "-"}</>}{" "}
//                 {visibleParts?.sku !== false && <> | Model (SKU): {product.sku || "-"}</>}{" "}
//                 {visibleParts?.uom !== false && <> | หน่วยสินค้า: {product.uom || "BX."}</>}
//               </p>
//             </div>

//             {/* Rating */}
//             {visibleParts?.ratingReview !== false && (
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-1">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-5 w-5 ${
//                         i < Math.floor(product.rating ?? 0)
//                           ? "text-warning fill-current"
//                           : "text-gray-300"
//                       }`}
//                     />
//                   ))}
//                   <span className="ml-2 text-lg font-medium">{(product.rating ?? 0).toFixed(1)}</span>
//                 </div>
//                 <Separator orientation="vertical" className="h-6" />
//                 <span className="text-muted-foreground">{product.reviews ?? 0} รีวิว</span>
//               </div>
//             )}

//             {/* Price */}
//             <div className="space-y-2">
//               <div className="flex flex-wrap items-center gap-3">

//                 {visibleParts?.price !== false && (
//                   <span className="text-2xl md:text-3xl font-bold text-sale">
//                     ฿{product.price.toLocaleString()}{hasConditions && salesMode ? ` / ${unit}` : ""}
//                   </span>
//                 )}

//                 {visibleParts?.originalPrice !== false && originalPrice && (
//                   <span className="text-lg md:text-xl text-muted-foreground line-through">
//                     ฿{originalPrice.toLocaleString()}
//                   </span>
//                 )}
//                 {showDiscountBadge && (
//                   <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//                     ประหยัด {product.discountPercent}%
//                   </Badge>
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//             </div>

//             {/* Return & Warranty (fixed for now) */}
//             <div className="flex flex-wrap items-start gap-2">
//               <span className="text-muted-foreground font-medium text-sm md:text-base">Return & Warranty:</span>
//               <div className="flex items-center gap-2">
//                 <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
//                 <span className="text-sm break-words">Change of Mind • 7 Days Free Return • Warranty not available</span>
//               </div>
//             </div>

//             {/* Sales Type */}
//             {hasConditions && salesMode && (
//               <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                 <span className="text-muted-foreground font-medium text-sm md:text-base">ประเภทการขาย:</span>
//                 <div className="flex flex-wrap items-center gap-3">
//                   <span
//                     className="inline-flex items-center rounded-lg border border-muted px-3 py-1.5
//                               text-sm bg-white shadow-sm"
//                   >
//                     {salesMode === "CUT" ? "ตัดแบ่งขาย (Cut)" : "ขายยกม้วน (Roll)"}
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Length Selector */}
//             {hasConditions && salesMode === "CUT" && (
//               <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                 <span className="text-muted-foreground font-medium text-sm md:text-base">ความยาวขั้นต่ำ:</span>
//                 <div className="flex items-center gap-3">
//                   <span
//                     className="inline-flex items-center rounded-lg border border-muted
//                               px-3 py-2 text-sm bg-muted/20"
//                     title="ความยาวขั้นต่ำในการตัดขาย"
//                   >
//                     {Number(cutLength ?? 1).toLocaleString()} {unit}
//                   </span>
//                   <span className="text-xs text-muted-foreground">(ค่าเริ่มต้น / ไม่สามารถแก้ไขได้)</span>
//                 </div>
//               </div>
//             )}

//             {hasConditions && salesMode === "ROLL" && (
//               <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//                 <span className="text-muted-foreground font-medium text-sm md:text-base">ความยาวม้วน:</span>
//                 <div className="flex flex-wrap items-center gap-3">
//                   {(product?.conditions ?? [])
//                     .filter((c: any) => c.salesType === "ROLL")
//                     .flatMap((c: any) => (Array.isArray(c.rollLengths) ? c.rollLengths : []))
//                     .map((len: number) => (
//                       <button
//                         key={len}
//                         onClick={() => setRollLength(len)}
//                         className={[
//                           "cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm",
//                           rollLength === len ? "border-primary text-primary" : "border-muted"
//                         ].join(" ")}
//                       >
//                         {len.toLocaleString()} {unit}
//                       </button>
//                     ))}
//                   <span className="text-sm text-muted-foreground">
//                     {rollLength ? `(${rollLength.toLocaleString()} ${unit})` : ""}
//                   </span>
//                 </div>
//               </div>
//             )}


//             {/* Stock Status (ยังไม่มีฟิลด์ stock จริงใน DB) */}
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-success rounded-full"></div>
//               <span className="text-success font-medium">มีสินค้าในสต็อก</span>
//             </div>

//             {/* Quantity & Actions */}
//             <div className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <span className="font-medium text-muted-foreground">Quantity:</span>
//                 <div className="flex items-center border rounded-lg">
//                   <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} className="h-10 w-10 p-0">
//                     <Minus className="h-4 w-4" />
//                   </Button>
//                   <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
//                   <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} className="h-10 w-10 p-0">
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               {/* Summary: total length & total price */}
//               <div className="text-sm text-muted-foreground space-y-1">
//                 {hasConditions && salesMode ? (
//                   <>
//                     <div>ความยาวรวม: <span className="font-medium text-foreground">{totalLength.toLocaleString()} {unit}</span></div>
//                     <div>ราคารวม: <span className="font-bold text-foreground">฿{totalPrice.toLocaleString()}</span></div>
//                     <div className="text-xs">({quantity.toLocaleString()} × {Number(lengthPerItem).toLocaleString()} {unit} × ฿{Number(product.price).toLocaleString()}/{unit})</div>
//                   </>
//                 ) : (
//                   <>
//                     <div>ราคารวม: <span className="font-bold text-foreground">฿{totalPrice.toLocaleString()}</span></div>
//                     <div className="text-xs">({quantity.toLocaleString()} × ฿{Number(product.price).toLocaleString()} / ชิ้น)</div>
//                   </>
//                 )}
//               </div>


//               <div className="flex gap-3">
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//                   onClick={() => router.push("/checkout")}
//                 >
//                   Buy Now
//                 </Button>
//                 <Button
//                   size="lg"
//                   className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//                   onClick={() => setIsCartOpen(true)}
//                 >
//                   Add to Cart
//                 </Button>
//               </div>
//             </div>

//             {/* Service Features */}
//             <Card>
//               <CardContent className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="flex items-center gap-3">
//                     <Truck className="h-5 w-5 text-success" />
//                     <div>
//                       <p className="font-medium text-sm">ส่งฟรี</p>
//                       <p className="text-xs text-muted-foreground">สั่งซื้อขั้นต่ำ 5,000฿</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Shield className="h-5 w-5 text-primary" />
//                     <div>
//                       <p className="font-medium text-sm">รับประกัน</p>
//                       <p className="text-xs text-muted-foreground">3 ปี</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <RotateCcw className="h-5 w-5 text-warning" />
//                     <div>
//                       <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
//                       <p className="text-xs text-muted-foreground">ภายใน 7 วัน</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }

// v.1.1.2 ==========================================================

// // src/app/product/[id]/page.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Star, Heart, Share2, ShoppingCart as ShoppingCartIcon, Plus, Minus, Shield, Truck, RotateCcw, ZoomIn, MapPin, Package } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// // import { Header } from "@/components/header";
// // import { Footer } from "@/components/footer";
// import { ShoppingCart } from "@/components/shopping-cart";
// // import { MessageChat } from "@/components/message-chat";

// // Mock product data (in a real app, this would be fetched from an API using the id)
// const mockProduct = {
//   id: 1,
//   name: "CAT 6 UTP (250 MHz) w/Cross Filler, 24 AWG, CM , UL Blue 305 M./Reelex",
//   price: 2390,
//   originalPrice: 2990,
//   discount: 20,
//   rating: 4.5,
//   reviews: 128,
//   stock: 15,
//   brand: "Link",
//   model: "US-9106A",
//   images: [
//     "/assets/lan-cable-1.jpg",
//     "/assets/lan-cable-2.jpg",
//     "/assets/lan-cable-3.jpg",
//     "/assets/lan-cable-4.jpg",
//     "/assets/lan-cable-5.jpg"
//   ],
//   description: "Kingston FURY Beast DDR4 delivers the reliable high-performance needed to power desktops with the latest AMD and Intel CPUs. The aggressive look with bold heat spreaders will level up the look of your rig.",
//   specifications: {
//     "Memory Type": "DDR4",
//     "Capacity": "16GB (2x8GB)",
//     "Speed": "3200MHz",
//     "CAS Latency": "CL16",
//     "Voltage": "1.35V",
//     "Form Factor": "DIMM",
//     "Pin Configuration": "288-pin"
//   },
//   features: [
//     "Intel XMP Ready",
//     "Plug N Play functionality",
//     "Aggressive styling with bold heat spreaders", 
//     "Available in multiple speeds"
//   ]
// };

// export default function ProductDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params.id;

//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [showZoom, setShowZoom] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [selectedColor, setSelectedColor] = useState("Silver");
//   const [selectedStorage, setSelectedStorage] = useState("512GB");

//   const product = mockProduct; // In a real app, you would fetch product data using the id

//   // Scroll to top when component mounts or id changes
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [id]);

//   const handleQuantityChange = (change: number) => {
//     const newQuantity = quantity + change;
//     if (newQuantity >= 1 && newQuantity <= product.stock) {
//       setQuantity(newQuantity);
//     }
//   };

//   const handleMouseEnterImage = (e: React.MouseEvent<HTMLImageElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoomPosition({ x, y });
//     setShowZoom(true);
//   };

//   const handleMouseMoveImage = (e: React.MouseEvent<HTMLImageElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoomPosition({ x, y });
//   };

//   const handleMouseLeaveImage = () => {
//     setShowZoom(false);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* <Header onCartClick={() => setIsCartOpen(true)} /> */}
      
//       <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-8 overflow-hidden">
//           <div className="flex flex-wrap items-center gap-2">
//             <span 
//               className="hover:text-primary cursor-pointer" 
//               onClick={() => router.push('/')}
//             >
//               หน้าแรก
//             </span>
//             <span>/</span>
//             <span 
//               className="hover:text-primary cursor-pointer"
//               onClick={() => router.push('/products')}
//             >
//               สินค้า
//             </span>
//             <span>/</span>
//             <span className="text-primary truncate">{product.name}</span>
//           </div>
//         </nav>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-12">
//           {/* Product Images */}
//           <div className="lg:col-span-2 space-y-4 relative">
//             <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden relative">
//               <img
//                 src={product.images[selectedImage]}
//                 alt={product.name}
//                 className="w-full h-full object-cover cursor-zoom-in"
//                 onMouseEnter={handleMouseEnterImage}
//                 onMouseMove={handleMouseMoveImage}
//                 onMouseLeave={handleMouseLeaveImage}
//               />
//               {showZoom && (
//                 <div className="absolute inset-0 pointer-events-none">
//                   <ZoomIn className="absolute top-4 right-4 h-6 w-6 text-white/80" />
//                 </div>
//               )}
//             </div>
            
//             {/* Zoom overlay - Only show on desktop */}
//             {showZoom && (
//               <div 
//                 className="hidden lg:block absolute top-0 left-full ml-4 w-96 h-96 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                 style={{
//                   backgroundImage: `url(${product.images[selectedImage]})`,
//                   backgroundSize: '200%',
//                   backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//                   backgroundRepeat: 'no-repeat'
//                 }}
//               />
//             )}

//             {/* Thumbnail Carousel */}
//             <div className="w-full">
//               <Carousel className="w-full">
//                 <CarouselContent className="-ml-2">
//                   {product.images.map((image, index) => (
//                     <CarouselItem key={index} className="pl-2 basis-1/4 sm:basis-1/5">
//                       <button
//                         onMouseEnter={() => setSelectedImage(index)}
//                         onClick={() => setSelectedImage(index)}
//                         className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors w-full ${
//                           selectedImage === index 
//                             ? 'border-primary' 
//                             : 'border-muted hover:border-primary/50'
//                         }`}
//                       >
//                         <img
//                           src={image}
//                           alt={`${product.name} ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       </button>
//                     </CarouselItem>
//                   ))}
//                 </CarouselContent>
//                 <CarouselPrevious className="left-0" />
//                 <CarouselNext className="right-0" />
//               </Carousel>
//             </div>
//           </div>

//           {/* Product Info */}
//           <div className="lg:col-span-3 space-y-4 lg:space-y-6">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{product.name}</h1>
//               <p className="text-muted-foreground text-sm md:text-base break-words">Brand: {product.brand} | Model (SKU): {product.model} | หน่วยสินค้า: BX.</p>
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-1">
//                 {[...Array(5)].map((_, i) => (
//                   <Star
//                     key={i}
//                     className={`h-5 w-5 ${
//                       i < Math.floor(product.rating)
//                         ? "text-warning fill-current"
//                         : "text-gray-300"
//                     }`}
//                   />
//                 ))}
//                 <span className="ml-2 text-lg font-medium">{product.rating}</span>
//               </div>
//               <Separator orientation="vertical" className="h-6" />
//               <span className="text-muted-foreground">{product.reviews} รีวิว</span>
//             </div>

//             {/* Price */}
//             <div className="space-y-2">
//               <div className="flex flex-wrap items-center gap-3">
//                 <span className="text-2xl md:text-3xl font-bold text-sale">
//                   ฿{product.price.toLocaleString()}
//                 </span>
//                 {product.originalPrice && (
//                   <span className="text-lg md:text-xl text-muted-foreground line-through">
//                     ฿{product.originalPrice.toLocaleString()}
//                   </span>
//                 )}
//                 {product.discount && (
//                   <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
//                     ประหยัด {product.discount}%
//                   </Badge>
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
//             </div>

//             {/* Promotions */}
//             <div className="space-y-4">
//               <div className="flex flex-wrap items-center gap-2">
//                 <span className="text-muted-foreground font-medium text-sm md:text-base">Promotions:</span>
//                 <Badge className="bg-primary text-primary-foreground">B2</Badge>
//                 <Badge variant="outline" className="text-primary border-primary text-xs md:text-sm">
//                   Buy 2, get 3% off. Buy 4, get 5% off.
//                 </Badge>
//               </div>
//             </div>

//             {/* Delivery Options */}
//             <div className="space-y-3">
//               <h3 className="text-muted-foreground font-medium text-sm md:text-base">Delivery Options:</h3>
//               <div className="space-y-2">
//                 <div className="flex flex-wrap items-start gap-2">
//                   <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
//                   <span className="text-sm flex-1 break-words">กรุงเทพมหานคร/ Bangkok, วังทองหลาง/ Wang Thonglang, 10310</span>
//                   <Button variant="link" className="text-primary text-sm p-0 h-auto whitespace-nowrap">CHANGE</Button>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Package className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">Guaranteed by 8 Aug</span>
//                 </div>
//                 <p className="text-sm text-muted-foreground pl-6">Standard, with shipping fee ฿29.00</p>
//               </div>
//             </div>

//             {/* Return & Warranty */}
//             <div className="flex flex-wrap items-start gap-2">
//               <span className="text-muted-foreground font-medium text-sm md:text-base">Return & Warranty:</span>
//               <div className="flex items-center gap-2">
//                 <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
//                 <span className="text-sm break-words">Change of Mind • 7 Days Free Return • Warranty not available</span>
//               </div>
//             </div>

//             {/* Color Family */}
//             <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//               <span className="text-muted-foreground font-medium text-sm md:text-base">Color Family:</span>
//               <div className="flex flex-wrap items-center gap-3">
//                 <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex gap-3">
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="Black" id="black" />
//                     <Label htmlFor="black" className="flex items-center gap-2 cursor-pointer">
//                       <div className="w-6 h-6 bg-black rounded border"></div>
//                       Black
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="Silver" id="silver" />
//                     <Label htmlFor="silver" className="flex items-center gap-2 cursor-pointer">
//                       <div className="w-6 h-6 bg-gray-300 rounded border"></div>
//                       Silver
//                     </Label>
//                   </div>
//                 </RadioGroup>
//                 <span className="text-sm text-muted-foreground">({selectedColor})</span>
//               </div>
//             </div>

//             {/* Storage Capacity */}
//             <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
//               <span className="text-muted-foreground font-medium text-sm md:text-base">Storage Capacity:</span>
//               <div className="flex flex-wrap items-center gap-3">
//                 <RadioGroup value={selectedStorage} onValueChange={setSelectedStorage} className="flex flex-wrap gap-3">
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="512GB" id="512gb" />
//                     <Label htmlFor="512gb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
//                       512GB
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="1TB" id="1tb" />
//                     <Label htmlFor="1tb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
//                       1TB
//                     </Label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="2TB" id="2tb" />
//                     <Label htmlFor="2tb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
//                       2TB
//                     </Label>
//                   </div>
//                 </RadioGroup>
//                 <span className="text-sm text-muted-foreground">({selectedStorage})</span>
//               </div>
//             </div>

//             {/* Stock Status */}
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-success rounded-full"></div>
//               <span className="text-success font-medium">มีสินค้าในสต็อก ({product.stock} ชิ้น)</span>
//             </div>

//             {/* Quantity Selector */}
//             <div className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <span className="font-medium text-muted-foreground">Quantity:</span>
//                 <div className="flex items-center border rounded-lg">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleQuantityChange(-1)}
//                     disabled={quantity <= 1}
//                     className="h-10 w-10 p-0"
//                   >
//                     <Minus className="h-4 w-4" />
//                   </Button>
//                   <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleQuantityChange(1)}
//                     disabled={quantity >= product.stock}
//                     className="h-10 w-10 p-0"
//                   >
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <Button 
//                   variant="outline"
//                   size="lg" 
//                   className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
//                   onClick={() => router.push('/checkout')}
//                 >
//                   Buy Now
//                 </Button>
//                 <Button 
//                   size="lg" 
//                   className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
//                   onClick={() => setIsCartOpen(true)}
//                 >
//                   Add to Cart
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="lg"
//                   onClick={() => setIsLiked(!isLiked)}
//                   className={`${isLiked ? "text-sale border-sale" : ""} p-3`}
//                 >
//                   <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
//                 </Button>
//                 <Button variant="outline" size="lg" className="p-3">
//                   <Share2 className="h-5 w-5" />
//                 </Button>
//               </div>
//             </div>

//             {/* Service Features */}
//             <Card>
//               <CardContent className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="flex items-center gap-3">
//                     <Truck className="h-5 w-5 text-success" />
//                     <div>
//                       <p className="font-medium text-sm">ส่งฟรี</p>
//                       <p className="text-xs text-muted-foreground">สั่งซื้อขั้นต่ำ 1,000฿</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Shield className="h-5 w-5 text-primary" />
//                     <div>
//                       <p className="font-medium text-sm">รับประกัน</p>
//                       <p className="text-xs text-muted-foreground">3 ปี</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <RotateCcw className="h-5 w-5 text-warning" />
//                     <div>
//                       <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
//                       <p className="text-xs text-muted-foreground">ภายใน 7 วัน</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Product Details Tabs */}
//         <Tabs defaultValue="description" className="mb-12">
//           <TabsList className="grid w-full grid-cols-3 text-sm">
//             <TabsTrigger value="description" className="text-xs sm:text-sm">รายละเอียด</TabsTrigger>
//             <TabsTrigger value="specifications" className="text-xs sm:text-sm">สเปค</TabsTrigger>
//             <TabsTrigger value="reviews" className="text-xs sm:text-sm">รีวิว ({product.reviews})</TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="description" className="space-y-4">
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="text-xl font-semibold mb-4">รายละเอียดสินค้า</h3>
//                 <p className="text-muted-foreground leading-relaxed mb-6">
//                   {product.description}
//                 </p>
//                 <h4 className="font-semibold mb-3">คุณสมบัติเด่น:</h4>
//                 <ul className="space-y-2">
//                   {product.features.map((feature, index) => (
//                     <li key={index} className="flex items-start gap-2">
//                       <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
//                       <span className="text-muted-foreground">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           </TabsContent>
          
//           <TabsContent value="specifications">
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="text-xl font-semibold mb-4">สเปคสินค้า</h3>
//                 <div className="space-y-3">
//                   {Object.entries(product.specifications).map(([key, value]) => (
//                     <div key={key} className="flex justify-between py-2 border-b border-muted/30">
//                       <span className="font-medium">{key}</span>
//                       <span className="text-muted-foreground">{value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
          
//           <TabsContent value="reviews">
//             <Card>
//               <CardContent className="p-6">
//                 <h3 className="text-xl font-semibold mb-4">รีวิวลูกค้า</h3>
//                 <div className="text-center py-12 text-muted-foreground">
//                   <p>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
//                   <p className="text-sm mt-2">เป็นคนแรกที่ให้รีวิวสินค้านี้</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* <Footer /> */}
//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//       {/* <MessageChat /> */}
//     </div>
//   );
// }