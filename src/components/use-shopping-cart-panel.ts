// v.1.1.6 ============================================
// src/components/use-shopping-cart-panel.ts
import { useEffect, useMemo, useState } from "react";
import type { CartItem as BackendCartItem } from "@/types/cart";
import { useCartStore } from "@/store/cart-store";

/** shape ที่ UI ใช้จริง */
export type UICartItem = {
  id: number;
  sku: string;
  name: string;
  brand?: string | null;
  categoryId?: number | null;

  price: number;
  originalPrice?: number | null;
  discountLabel?: string | null;
  discountPercent?: number | null;

  quantity: number;
  uom?: string | null;

  image: string;
  lineTotal: number; // price_amount

  freeShippingEligible?: boolean | null;
  freeShipMinimum?: number | null;
  warrantyMonths?: number | null;
  returnDays?: number | null;

  checked: boolean;
};

type BackendCartItemWithProduct = BackendCartItem & {
  productName?: string | null;
  productImageUrl?: string | null;
  productUom?: string | null;

  productBrand?: string | null;
  productCategoryId?: number | null;
  productOriginalPrice?: number | null;
  productDiscountLabel?: string | null;
  productClearanceSales?: boolean | null;
  productClearanceQuantity?: number | null;
  productFreeShippingEligible?: boolean | null;
  productFreeShipMinimum?: number | null;
  productWarrantyMonths?: number | null;
  productReturnDays?: number | null;
};

export type UseShoppingCartPanelResult = {
  items: UICartItem[];
  selectedItems: number[];
  loading: boolean;
  totalUniqueItems: number;
  selectedUniqueItems: number;
  selectedTotalPrice: number;
  toggleItemSelection: (id: number) => void;
  toggleAllItems: () => void;
  updateQuantity: (id: number, newQuantity: number) => void;
  deleteItem: (id: number) => void;
};

export function useShoppingCartPanel(
  isOpen: boolean,
): UseShoppingCartPanelResult {
  const [items, setItems] = useState<UICartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 🛒 อัปเดต summary ให้ header ผ่าน Zustand
  const setSummary = useCartStore((s) => s.setSummary);

  // 🔹 helper สำหรับยิง API toggle-check (ใช้ทั้งติ๊กทีละอัน และเลือกทั้งหมด)
  const persistCheckChanges = async (
    changes: { id: number; checked: boolean }[],
  ) => {
    try {
      if (!changes.length) return;

      const res = await fetch("/api/cart/toggle-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: changes }),
      });

      if (!res.ok) {
        console.error("[ShoppingCart] toggle-check API failed", res.status);
      }
    } catch (e) {
      console.error("[ShoppingCart] toggle-check API error", e);
    }
  };

  // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadCart = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/cart/list", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("[ShoppingCart] Failed to load cart", res.status);
          return;
        }

        const data = await res.json();
        const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

        console.log("[ShoppingCart] raw items from API:", apiItems);

        const mapped: UICartItem[] = apiItems.map((item) => {
          const sku = item.product;
          const imageUrlFromApi = item.productImageUrl ?? null;
          const nameFromApi = item.productName ?? null;
          const brandFromApi = item.productBrand ?? null;

          const categoryIdFromApi =
            typeof item.productCategoryId === "number"
              ? item.productCategoryId
              : item.productCategoryId != null
              ? Number(item.productCategoryId)
              : null;

          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          const lineTotalRaw =
            item.price_amount != null
              ? Number(item.price_amount)
              : price * quantity;

          const originalPrice =
            item.productOriginalPrice != null
              ? Number(item.productOriginalPrice)
              : null;

          const discountLabel = item.productDiscountLabel ?? null;

          let discountPercent: number | null = null;
          if (discountLabel) {
            const m = String(discountLabel).match(/(\d+(?:\.\d+)?)/);
            if (m) {
              const n = Number(m[1]);
              if (Number.isFinite(n)) {
                discountPercent = Math.round(n);
              }
            }
          } else if (originalPrice && originalPrice > price) {
            discountPercent = Math.round((1 - price / originalPrice) * 100);
          }

          const freeShipMinRaw =
            item.productFreeShipMinimum != null
              ? Number(item.productFreeShipMinimum)
              : null;

          const warrantyMonthsRaw =
            item.productWarrantyMonths != null
              ? Number(item.productWarrantyMonths)
              : null;

          const returnDaysRaw =
            item.productReturnDays != null
              ? Number(item.productReturnDays)
              : null;

          const mappedItem: UICartItem = {
            id: Number(item.id),
            sku: sku,
            name: nameFromApi || sku || "สินค้า",
            brand: brandFromApi,
            categoryId: categoryIdFromApi,
            price,
            originalPrice,
            discountLabel,
            discountPercent,
            quantity,
            uom: item.productUom ?? item.uom ?? undefined,
            image: imageUrlFromApi || "/placeholder.png",
            lineTotal: lineTotalRaw,
            freeShippingEligible: item.productFreeShippingEligible ?? null,
            freeShipMinimum: freeShipMinRaw,
            warrantyMonths: warrantyMonthsRaw,
            returnDays: returnDaysRaw,
            checked: item.check_product ?? true,
          };

          console.log("[ShoppingCart] mapped UI item:", mappedItem);

          return mappedItem;
        });

        if (cancelled) return;

        setItems(mapped);
        setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));

        // 🟢 อัปเดต summary ให้ header
        // ถ้า backend ส่ง summary มา → ใช้เลย
        if (data?.summary) {
          setSummary(data.summary);
        } else {
          // fallback: คำนวณเอง (ให้ totalQuantity = จำนวนแถว)
          const fallbackTotalQuantity = mapped.length;
          const fallbackTotalAmount = mapped.reduce(
            (sum, item) => sum + item.lineTotal,
            0,
          );

          setSummary({
            totalQuantity: fallbackTotalQuantity,
            totalAmount: fallbackTotalAmount,
          });
        }
      } catch (e) {
        console.error("[ShoppingCart] error loading cart", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [isOpen, setSummary]);

  const totalUniqueItems = items.length;
  const selectedUniqueItems = selectedItems.length;

  const selectedTotalPrice = useMemo(
    () =>
      items
        .filter((item) => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.lineTotal, 0),
    [items, selectedItems],
  );

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const isSelected = prev.includes(itemId);
      const next = isSelected
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // ยิง API เก็บ check_product
      void persistCheckChanges([{ id: itemId, checked: !isSelected }]);

      return next;
    });
  };

  const toggleAllItems = () => {
    const allSelected = selectedItems.length === items.length;
    const nextChecked = !allSelected;

    const changes = items.map((item) => ({
      id: item.id,
      checked: nextChecked,
    }));

    setSelectedItems(nextChecked ? items.map((item) => item.id) : []);

    // ยิง API เก็บทั้งหมดตาม nextChecked
    void persistCheckChanges(changes);
  };

  // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ใช้ต่อยอดทีหลังได้)
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((sid) => sid !== id));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: newQuantity,
                lineTotal: item.price * newQuantity,
              }
            : item,
        ),
      );
    }
  };

  // ⭐ ฟังก์ชันลบ item จริงใน DB + ลบออกจาก state + อัปเดต summary header
  const deleteItem = (id: number) => {
    // optimistic update ก่อน
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((sid) => sid !== id));

    (async () => {
      try {
        const res = await fetch("/api/cart/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          console.error("[ShoppingCart] remove API failed", res.status);
          return;
        }

        const json = await res.json();
        if (json?.summary) {
          // 🟢 ใช้ summary จาก backend อัปเดต header ให้ตรงจริง
          setSummary(json.summary);
        }
      } catch (e) {
        console.error("[ShoppingCart] remove API error", e);
      }
    })();
  };

  return {
    items,
    selectedItems,
    loading,
    totalUniqueItems,
    selectedUniqueItems,
    selectedTotalPrice,
    toggleItemSelection,
    toggleAllItems,
    updateQuantity,
    deleteItem,
  };
}

// v.1.1.6 ============================================

// v.1.1.5 ============================================
// // src/components/use-shopping-cart-panel.ts
// import { useEffect, useMemo, useState } from "react";
// import type { CartItem as BackendCartItem } from "@/types/cart";
// import { useCartStore } from "@/store/cart-store";

// /** shape ที่ UI ใช้จริง */
// export type UICartItem = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   categoryId?: number | null;

//   price: number;
//   originalPrice?: number | null;
//   discountLabel?: string | null;
//   discountPercent?: number | null;

//   quantity: number;
//   uom?: string | null;

//   image: string;
//   lineTotal: number; // price_amount

//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   checked: boolean;
// };

// type BackendCartItemWithProduct = BackendCartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export type UseShoppingCartPanelResult = {
//   items: UICartItem[];
//   selectedItems: number[];
//   loading: boolean;
//   totalUniqueItems: number;
//   selectedUniqueItems: number;
//   selectedTotalPrice: number;
//   toggleItemSelection: (id: number) => void;
//   toggleAllItems: () => void;
//   updateQuantity: (id: number, newQuantity: number) => void;
//   deleteItem: (id: number) => void;
// };

// export function useShoppingCartPanel(isOpen: boolean): UseShoppingCartPanelResult {
//   const [items, setItems] = useState<UICartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // 🛒 อัปเดต summary ให้ header ผ่าน Zustand
//   const setSummary = useCartStore((s) => s.setSummary);

//   // 🔹 helper สำหรับยิง API toggle-check (ใช้ทั้งติ๊กทีละอัน และเลือกทั้งหมด)
//   const persistCheckChanges = async (
//     changes: { id: number; checked: boolean }[],
//   ) => {
//     try {
//       if (!changes.length) return;

//       const res = await fetch("/api/cart/toggle-check", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ items: changes }),
//       });

//       if (!res.ok) {
//         console.error(
//           "[ShoppingCart] toggle-check API failed",
//           res.status,
//         );
//       }
//     } catch (e) {
//       console.error("[ShoppingCart] toggle-check API error", e);
//     }
//   };

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;

//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

//         console.log("[ShoppingCart] raw items from API:", apiItems);

//         const mapped: UICartItem[] = apiItems.map((item) => {
//           const sku = item.product;
//           const imageUrlFromApi = item.productImageUrl ?? null;
//           const nameFromApi = item.productName ?? null;
//           const brandFromApi = item.productBrand ?? null;

//           const categoryIdFromApi =
//             typeof item.productCategoryId === "number"
//               ? item.productCategoryId
//               : item.productCategoryId != null
//               ? Number(item.productCategoryId)
//               : null;

//           const price = Number(item.price) || 0;
//           const quantity = Number(item.quantity) || 0;
//           const lineTotalRaw =
//             item.price_amount != null
//               ? Number(item.price_amount)
//               : price * quantity;

//           const originalPrice =
//             item.productOriginalPrice != null
//               ? Number(item.productOriginalPrice)
//               : null;

//           const discountLabel = item.productDiscountLabel ?? null;

//           let discountPercent: number | null = null;
//           if (discountLabel) {
//             const m = String(discountLabel).match(/(\d+(?:\.\d+)?)/);
//             if (m) {
//               const n = Number(m[1]);
//               if (Number.isFinite(n)) {
//                 discountPercent = Math.round(n);
//               }
//             }
//           } else if (originalPrice && originalPrice > price) {
//             discountPercent = Math.round((1 - price / originalPrice) * 100);
//           }

//           const freeShipMinRaw =
//             item.productFreeShipMinimum != null
//               ? Number(item.productFreeShipMinimum)
//               : null;

//           const warrantyMonthsRaw =
//             item.productWarrantyMonths != null
//               ? Number(item.productWarrantyMonths)
//               : null;

//           const returnDaysRaw =
//             item.productReturnDays != null
//               ? Number(item.productReturnDays)
//               : null;

//           const mappedItem: UICartItem = {
//             id: Number(item.id),
//             sku: sku,
//             name: nameFromApi || sku || "สินค้า",
//             brand: brandFromApi,
//             categoryId: categoryIdFromApi,
//             price,
//             originalPrice,
//             discountLabel,
//             discountPercent,
//             quantity,
//             uom: item.productUom ?? item.uom ?? undefined,
//             image: imageUrlFromApi || "/placeholder.png",
//             lineTotal: lineTotalRaw,
//             freeShippingEligible: item.productFreeShippingEligible ?? null,
//             freeShipMinimum: freeShipMinRaw,
//             warrantyMonths: warrantyMonthsRaw,
//             returnDays: returnDaysRaw,
//             checked: item.check_product ?? true,
//           };

//           console.log("[ShoppingCart] mapped UI item:", mappedItem);

//           return mappedItem;
//         });

//         if (cancelled) return;

//         setItems(mapped);
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));

//         // 🟢 อัปเดต summary ให้ header จากรายการที่โหลดได้
//         const totalQuantity = mapped.reduce(
//           (sum, item) => sum + item.quantity,
//           0,
//         );
//         const totalAmount = mapped.reduce(
//           (sum, item) => sum + item.lineTotal,
//           0,
//         );

//         setSummary({
//           totalQuantity,
//           totalAmount,
//         });
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen, setSummary]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;

//   const selectedTotalPrice = useMemo(
//     () =>
//       items
//         .filter((item) => selectedItems.includes(item.id))
//         .reduce((sum, item) => sum + item.lineTotal, 0),
//     [items, selectedItems],
//   );

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) => {
//       const isSelected = prev.includes(itemId);
//       const next = isSelected
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId];

//       // ยิง API เก็บ check_product
//       void persistCheckChanges([{ id: itemId, checked: !isSelected }]);

//       return next;
//     });
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     const nextChecked = !allSelected;

//     const changes = items.map((item) => ({
//       id: item.id,
//       checked: nextChecked,
//     }));

//     setSelectedItems(nextChecked ? items.map((item) => item.id) : []);

//     // ยิง API เก็บทั้งหมดตาม nextChecked
//     void persistCheckChanges(changes);
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ใช้ต่อยอดทีหลังได้)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id
//             ? {
//                 ...item,
//                 quantity: newQuantity,
//                 lineTotal: item.price * newQuantity,
//               }
//             : item,
//         ),
//       );
//     }
//   };

//   // ⭐ ฟังก์ชันลบ item จริงใน DB + ลบออกจาก state + อัปเดต summary header
//   const deleteItem = (id: number) => {
//     // optimistic update ก่อน
//     setItems((prev) => prev.filter((item) => item.id !== id));
//     setSelectedItems((prev) => prev.filter((sid) => sid !== id));

//     (async () => {
//       try {
//         const res = await fetch("/api/cart/remove", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id }),
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] remove API failed", res.status);
//           return;
//         }

//         const json = await res.json();
//         if (json?.summary) {
//           // 🟢 ใช้ summary จาก backend อัปเดต header ให้ตรงจริง
//           setSummary(json.summary);
//         }
//       } catch (e) {
//         console.error("[ShoppingCart] remove API error", e);
//       }
//     })();
//   };

//   return {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//     deleteItem,
//   };
// }

// v.1.1.5 ============================================

// v.1.1.4 =============================================
// // src/components/use-shopping-cart-panel.ts
// import { useEffect, useMemo, useState } from "react";
// import type { CartItem as BackendCartItem } from "@/types/cart";

// /** shape ที่ UI ใช้จริง */
// export type UICartItem = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   categoryId?: number | null;

//   price: number;
//   originalPrice?: number | null;
//   discountLabel?: string | null;
//   discountPercent?: number | null;

//   quantity: number;
//   uom?: string | null;

//   image: string;
//   lineTotal: number; // price_amount

//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   checked: boolean;
// };

// type BackendCartItemWithProduct = BackendCartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export type UseShoppingCartPanelResult = {
//   items: UICartItem[];
//   selectedItems: number[];
//   loading: boolean;
//   totalUniqueItems: number;
//   selectedUniqueItems: number;
//   selectedTotalPrice: number;
//   toggleItemSelection: (id: number) => void;
//   toggleAllItems: () => void;
//   updateQuantity: (id: number, newQuantity: number) => void;
//   deleteItem: (id: number) => void; // ⭐ เพิ่ม
// };

// export function useShoppingCartPanel(
//   isOpen: boolean,
// ): UseShoppingCartPanelResult {
//   const [items, setItems] = useState<UICartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // 🔹 helper สำหรับยิง API toggle-check (ใช้ทั้งติ๊กทีละอัน และเลือกทั้งหมด)
//   const persistCheckChanges = async (
//     changes: { id: number; checked: boolean }[],
//   ) => {
//     try {
//       if (!changes.length) return;

//       const res = await fetch("/api/cart/toggle-check", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ items: changes }),
//       });

//       if (!res.ok) {
//         console.error(
//           "[ShoppingCart] toggle-check API failed",
//           res.status,
//         );
//       }
//     } catch (e) {
//       console.error("[ShoppingCart] toggle-check API error", e);
//     }
//   };

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;

//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

//         console.log("[ShoppingCart] raw items from API:", apiItems);

//         const mapped: UICartItem[] = apiItems.map((item) => {
//           const sku = item.product;
//           const imageUrlFromApi = item.productImageUrl ?? null;
//           const nameFromApi = item.productName ?? null;
//           const brandFromApi = item.productBrand ?? null;

//           const categoryIdFromApi =
//             typeof item.productCategoryId === "number"
//               ? item.productCategoryId
//               : item.productCategoryId != null
//               ? Number(item.productCategoryId)
//               : null;

//           const price = Number(item.price) || 0;
//           const quantity = Number(item.quantity) || 0;
//           const lineTotalRaw =
//             item.price_amount != null
//               ? Number(item.price_amount)
//               : price * quantity;

//           const originalPrice =
//             item.productOriginalPrice != null
//               ? Number(item.productOriginalPrice)
//               : null;

//           const discountLabel = item.productDiscountLabel ?? null;

//           let discountPercent: number | null = null;
//           if (discountLabel) {
//             const m = String(discountLabel).match(/(\d+(?:\.\d+)?)/);
//             if (m) {
//               const n = Number(m[1]);
//               if (Number.isFinite(n)) {
//                 discountPercent = Math.round(n);
//               }
//             }
//           } else if (originalPrice && originalPrice > price) {
//             discountPercent = Math.round((1 - price / originalPrice) * 100);
//           }

//           const freeShipMinRaw =
//             item.productFreeShipMinimum != null
//               ? Number(item.productFreeShipMinimum)
//               : null;

//           const warrantyMonthsRaw =
//             item.productWarrantyMonths != null
//               ? Number(item.productWarrantyMonths)
//               : null;

//           const returnDaysRaw =
//             item.productReturnDays != null
//               ? Number(item.productReturnDays)
//               : null;

//           const mappedItem: UICartItem = {
//             id: Number(item.id),
//             sku: sku,
//             name: nameFromApi || sku || "สินค้า",
//             brand: brandFromApi,
//             categoryId: categoryIdFromApi,
//             price,
//             originalPrice,
//             discountLabel,
//             discountPercent,
//             quantity,
//             uom: item.productUom ?? item.uom ?? undefined,
//             image: imageUrlFromApi || "/placeholder.png",
//             lineTotal: lineTotalRaw,
//             freeShippingEligible: item.productFreeShippingEligible ?? null,
//             freeShipMinimum: freeShipMinRaw,
//             warrantyMonths: warrantyMonthsRaw,
//             returnDays: returnDaysRaw,
//             checked: item.check_product ?? true,
//           };

//           console.log("[ShoppingCart] mapped UI item:", mappedItem);

//           return mappedItem;
//         });

//         if (cancelled) return;

//         setItems(mapped);
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;

//   const selectedTotalPrice = useMemo(
//     () =>
//       items
//         .filter((item) => selectedItems.includes(item.id))
//         .reduce((sum, item) => sum + item.lineTotal, 0),
//     [items, selectedItems],
//   );

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) => {
//       const isSelected = prev.includes(itemId);
//       const next = isSelected
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId];

//       // ยิง API เก็บ check_product
//       void persistCheckChanges([{ id: itemId, checked: !isSelected }]);

//       return next;
//     });
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     const nextChecked = !allSelected;

//     const changes = items.map((item) => ({
//       id: item.id,
//       checked: nextChecked,
//     }));

//     setSelectedItems(nextChecked ? items.map((item) => item.id) : []);

//     // ยิง API เก็บทั้งหมดตาม nextChecked
//     void persistCheckChanges(changes);
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ใช้ต่อยอดทีหลังได้)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id
//             ? {
//                 ...item,
//                 quantity: newQuantity,
//                 lineTotal: item.price * newQuantity,
//               }
//             : item,
//         ),
//       );
//     }
//   };

//   // ⭐ ฟังก์ชันลบ item จริงใน DB + ลบออกจาก state
//   const deleteItem = (id: number) => {
//     // optimistic update ก่อน
//     setItems((prev) => prev.filter((item) => item.id !== id));
//     setSelectedItems((prev) => prev.filter((sid) => sid !== id));

//     (async () => {
//       try {
//         const res = await fetch("/api/cart/remove", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id }),
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] remove API failed", res.status);
//         }
//       } catch (e) {
//         console.error("[ShoppingCart] remove API error", e);
//       }
//     })();
//   };

//   return {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//     deleteItem,
//   };
// }

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/use-shopping-cart-panel.ts

// import { useEffect, useMemo, useState } from "react";
// import type { CartItem as BackendCartItem } from "@/types/cart";

// /** shape ที่ UI ใช้จริง */
// export type UICartItem = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   categoryId?: number | null;

//   price: number; // ราคาต่อหน่วย (ในตะกร้า)
//   originalPrice?: number | null; // ราคาเดิมจาก products_clearance
//   discountLabel?: string | null;
//   discountPercent?: number | null;

//   quantity: number;
//   uom?: string | null;

//   image: string;
//   lineTotal: number; // price_amount

//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   checked: boolean;
// };

// type BackendCartItemWithProduct = BackendCartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export type UseShoppingCartPanelResult = {
//   items: UICartItem[];
//   selectedItems: number[];
//   loading: boolean;
//   totalUniqueItems: number;
//   selectedUniqueItems: number;
//   selectedTotalPrice: number;
//   toggleItemSelection: (id: number) => void;
//   toggleAllItems: () => void;
//   updateQuantity: (id: number, newQuantity: number) => void;
// };

// export function useShoppingCartPanel(
//   isOpen: boolean,
// ): UseShoppingCartPanelResult {
//   const [items, setItems] = useState<UICartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;

//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

//         console.log("[ShoppingCart] raw items from API:", apiItems);

//         const mapped: UICartItem[] = apiItems.map((item) => {
//           const sku = item.product;
//           const imageUrlFromApi = item.productImageUrl ?? null;
//           const nameFromApi = item.productName ?? null;
//           const brandFromApi = item.productBrand ?? null;

//           const categoryIdFromApi =
//             typeof item.productCategoryId === "number"
//               ? item.productCategoryId
//               : item.productCategoryId != null
//               ? Number(item.productCategoryId)
//               : null;

//           const price = Number(item.price) || 0;
//           const quantity = Number(item.quantity) || 0;
//           const lineTotalRaw =
//             item.price_amount != null
//               ? Number(item.price_amount)
//               : price * quantity;

//           const originalPrice =
//             item.productOriginalPrice != null
//               ? Number(item.productOriginalPrice)
//               : null;

//           const discountLabel = item.productDiscountLabel ?? null;

//           let discountPercent: number | null = null;
//           if (discountLabel) {
//             const m = String(discountLabel).match(/(\d+(?:\.\d+)?)/);
//             if (m) {
//               const n = Number(m[1]);
//               if (Number.isFinite(n)) {
//                 discountPercent = Math.round(n);
//               }
//             }
//           } else if (originalPrice && originalPrice > price) {
//             discountPercent = Math.round((1 - price / originalPrice) * 100);
//           }

//           const freeShipMinRaw =
//             item.productFreeShipMinimum != null
//               ? Number(item.productFreeShipMinimum)
//               : null;

//           const warrantyMonthsRaw =
//             item.productWarrantyMonths != null
//               ? Number(item.productWarrantyMonths)
//               : null;

//           const returnDaysRaw =
//             item.productReturnDays != null
//               ? Number(item.productReturnDays)
//               : null;

//           const mappedItem: UICartItem = {
//             id: Number(item.id),
//             sku: sku,
//             name: nameFromApi || sku || "สินค้า",
//             brand: brandFromApi,
//             categoryId: categoryIdFromApi,
//             price,
//             originalPrice,
//             discountLabel,
//             discountPercent,
//             quantity,
//             uom: item.productUom ?? item.uom ?? undefined,
//             image: imageUrlFromApi || "/placeholder.png",
//             lineTotal: lineTotalRaw,
//             freeShippingEligible: item.productFreeShippingEligible ?? null,
//             freeShipMinimum: freeShipMinRaw,
//             warrantyMonths: warrantyMonthsRaw,
//             returnDays: returnDaysRaw,
//             checked: item.check_product ?? true,
//           };

//           console.log("[ShoppingCart] mapped UI item:", mappedItem);

//           return mappedItem;
//         });

//         if (cancelled) return;

//         setItems(mapped);
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;

//   const selectedTotalPrice = useMemo(
//     () =>
//       items
//         .filter((item) => selectedItems.includes(item.id))
//         .reduce((sum, item) => sum + item.lineTotal, 0),
//     [items, selectedItems],
//   );

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId],
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map((item) => item.id));
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ยังไม่ยิง /api/cart/update)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, quantity: newQuantity } : item,
//         ),
//       );
//     }
//   };

//   return {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   };
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/use-shopping-cart-panel.ts
// import { useEffect, useMemo, useState } from "react";
// import type { CartItem as BackendCartItem } from "@/types/cart";

// /** shape ที่ UI ใช้จริง */
// export type UICartItem = {
//   id: number;
//   sku: string;
//   name: string;
//   brand?: string | null;
//   categoryId?: number | null;

//   price: number;                // ราคาต่อหน่วย (ในตะกร้า)
//   originalPrice?: number | null; // ราคาเดิมจาก products_clearance
//   discountLabel?: string | null;
//   discountPercent?: number | null;

//   quantity: number;
//   uom?: string | null;

//   image: string;
//   lineTotal: number; // price_amount

//   freeShippingEligible?: boolean | null;
//   freeShipMinimum?: number | null;
//   warrantyMonths?: number | null;
//   returnDays?: number | null;

//   checked: boolean;
// };

// type BackendCartItemWithProduct = BackendCartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;

//   productBrand?: string | null;
//   productCategoryId?: number | null;
//   productOriginalPrice?: number | null;
//   productDiscountLabel?: string | null;
//   productClearanceSales?: boolean | null;
//   productClearanceQuantity?: number | null;
//   productFreeShippingEligible?: boolean | null;
//   productFreeShipMinimum?: number | null;
//   productWarrantyMonths?: number | null;
//   productReturnDays?: number | null;
// };

// export type UseShoppingCartPanelResult = {
//   items: UICartItem[];
//   selectedItems: number[];
//   loading: boolean;
//   totalUniqueItems: number;
//   selectedUniqueItems: number;
//   selectedTotalPrice: number;
//   toggleItemSelection: (id: number) => void;
//   toggleAllItems: () => void;
//   updateQuantity: (id: number, newQuantity: number) => void;
// };

// export function useShoppingCartPanel(
//   isOpen: boolean,
// ): UseShoppingCartPanelResult {
//   const [items, setItems] = useState<UICartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // โหลดข้อมูลจาก /api/cart/list ทุกครั้งที่เปิดแผงตะกร้า
//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;

//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

//         console.log("[ShoppingCart] raw items from API:", apiItems);

//         const mapped: UICartItem[] = apiItems.map((item) => {
//           const sku = item.product;
//           const imageUrlFromApi = item.productImageUrl ?? null;
//           const nameFromApi = item.productName ?? null;
//           const brandFromApi = item.productBrand ?? null;

//           const categoryIdFromApi =
//             typeof item.productCategoryId === "number"
//               ? item.productCategoryId
//               : item.productCategoryId != null
//               ? Number(item.productCategoryId)
//               : null;

//           const price = Number(item.price) || 0;
//           const quantity = Number(item.quantity) || 0;
//           const lineTotalRaw =
//             item.price_amount != null
//               ? Number(item.price_amount)
//               : price * quantity;

//           const originalPrice =
//             item.productOriginalPrice != null
//               ? Number(item.productOriginalPrice)
//               : null;

//           const discountLabel = item.productDiscountLabel ?? null;

//           let discountPercent: number | null = null;
//           if (discountLabel) {
//             const m = String(discountLabel).match(/(\d+(?:\.\d+)?)/);
//             if (m) {
//               const n = Number(m[1]);
//               if (Number.isFinite(n)) {
//                 discountPercent = Math.round(n);
//               }
//             }
//           } else if (originalPrice && originalPrice > price) {
//             discountPercent = Math.round((1 - price / originalPrice) * 100);
//           }

//           const freeShipMinRaw =
//             item.productFreeShipMinimum != null
//               ? Number(item.productFreeShipMinimum)
//               : null;

//           const warrantyMonthsRaw =
//             item.productWarrantyMonths != null
//               ? Number(item.productWarrantyMonths)
//               : null;

//           const returnDaysRaw =
//             item.productReturnDays != null
//               ? Number(item.productReturnDays)
//               : null;

//           const mappedItem: UICartItem = {
//             id: Number(item.id),
//             sku: sku,
//             name: nameFromApi || sku || "สินค้า",
//             brand: brandFromApi,
//             categoryId: categoryIdFromApi,
//             price,
//             originalPrice,
//             discountLabel,
//             discountPercent,
//             quantity,
//             uom: item.productUom ?? item.uom ?? undefined,
//             image: imageUrlFromApi || "/placeholder.png",
//             lineTotal: lineTotalRaw,
//             freeShippingEligible: item.productFreeShippingEligible ?? null,
//             freeShipMinimum: freeShipMinRaw,
//             warrantyMonths: warrantyMonthsRaw,
//             returnDays: returnDaysRaw,
//             checked: item.check_product ?? true,
//           };

//           console.log("[ShoppingCart] mapped UI item:", mappedItem);

//           return mappedItem;
//         });

//         if (cancelled) return;

//         setItems(mapped);
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;

//   const selectedTotalPrice = useMemo(
//     () =>
//       items
//         .filter((item) => selectedItems.includes(item.id))
//         .reduce((sum, item) => sum + item.lineTotal, 0),
//     [items, selectedItems],
//   );

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId],
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map((item) => item.id));
//   };

//   // ตอนนี้ยังเป็นแค่แก้ state ฝั่ง UI ก่อน (ยังไม่ยิง /api/cart/update)
//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, quantity: newQuantity } : item,
//         ),
//       );
//     }
//   };

//   return {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   };
// }

// v.1.1.2 =============================================

// // src/components/use-shopping-cart-panel.ts

// import { useEffect, useMemo, useState } from "react";
// import type { CartItem as BackendCartItem } from "@/types/cart";
// // import { getProductMainImageUrl } from "@/lib/image-path-helper"; // ⛔ ไม่ใช้แล้ว

// /** shape ที่ UI ใช้จริง */
// export type UICartItem = {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   checked: boolean;
// };

// type BackendCartItemWithProduct = BackendCartItem & {
//   productName?: string | null;
//   productImageUrl?: string | null;
//   productUom?: string | null;
// };

// export type UseShoppingCartPanelResult = {
//   items: UICartItem[];
//   selectedItems: number[];
//   loading: boolean;
//   totalUniqueItems: number;
//   selectedUniqueItems: number;
//   selectedTotalPrice: number;
//   toggleItemSelection: (id: number) => void;
//   toggleAllItems: () => void;
//   updateQuantity: (id: number, newQuantity: number) => void;
// };

// export function useShoppingCartPanel(isOpen: boolean): UseShoppingCartPanelResult {
//   const [items, setItems] = useState<UICartItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;

//     let cancelled = false;

//     const loadCart = async () => {
//       try {
//         setLoading(true);

//         const res = await fetch("/api/cart/list", {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           cache: "no-store",
//         });

//         if (!res.ok) {
//           console.error("[ShoppingCart] Failed to load cart", res.status);
//           return;
//         }

//         const data = await res.json();
//         const apiItems: BackendCartItemWithProduct[] = data.items ?? [];

//         console.log("[ShoppingCart] raw items from API:", apiItems);

//         const mapped: UICartItem[] = apiItems.map((item) => {
//           const sku = item.product;
//           const imageUrlFromApi = item.productImageUrl ?? null;
//           const nameFromApi = item.productName ?? null;

//           console.log("[ShoppingCart] image path from API:", {
//             sku,
//             product_id: item.id,
//             productName: nameFromApi,
//             productImageUrl: imageUrlFromApi,
//           });

//           return {
//             id: Number(item.id),
//             name: nameFromApi || sku || "สินค้า",
//             price: Number(item.price) || 0,
//             quantity: Number(item.quantity) || 0,
//             image: imageUrlFromApi || "/placeholder.png",
//             checked: item.check_product ?? true,
//           };
//         });

//         if (cancelled) return;

//         setItems(mapped);
//         setSelectedItems(mapped.filter((i) => i.checked).map((i) => i.id));
//       } catch (e) {
//         console.error("[ShoppingCart] error loading cart", e);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     loadCart();

//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen]);

//   const totalUniqueItems = items.length;
//   const selectedUniqueItems = selectedItems.length;

//   const selectedTotalPrice = useMemo(
//     () =>
//       items
//         .filter((item) => selectedItems.includes(item.id))
//         .reduce((sum, item) => sum + item.price * item.quantity, 0),
//     [items, selectedItems],
//   );

//   const toggleItemSelection = (itemId: number) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId],
//     );
//   };

//   const toggleAllItems = () => {
//     const allSelected = selectedItems.length === items.length;
//     setSelectedItems(allSelected ? [] : items.map((item) => item.id));
//   };

//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       setItems((prev) => prev.filter((item) => item.id !== id));
//       setSelectedItems((prev) => prev.filter((sid) => sid !== id));
//     } else {
//       setItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? { ...item, quantity: newQuantity } : item,
//         ),
//       );
//     }
//   };

//   return {
//     items,
//     selectedItems,
//     loading,
//     totalUniqueItems,
//     selectedUniqueItems,
//     selectedTotalPrice,
//     toggleItemSelection,
//     toggleAllItems,
//     updateQuantity,
//   };
// }
