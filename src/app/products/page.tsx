// v.1.1.6 ===============================================================
// src/app/products/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ShoppingCart } from "@/components/shopping-cart";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List } from "lucide-react";
// ❌ ไม่ใช้แล้ว
// import PaginationBar from "@/components/pagination-bar";

/* ===== Types ===== */
type UIProduct = {
  id: number | string;
  name: string;
  price: number;
  discountPercent?: number;
  image_url?: string;
  rating?: number;
  reviews?: number;
  brand?: string;
  sku?: string;
  uom?: string;
  category_id?: number | string;
  slug?: string;
  order?: number;
};

type ApiListResponse = {
  items: UIProduct[];
  total: number;
  page: number;
  pageSize: number;
};

type CategoryLite = { id: number | string; name: string; slug?: string };

type VisibleParts = Partial<{
  image: boolean;
  discountBadge: boolean;
  brandLogo: boolean;
  frame: boolean;
  brandName: boolean;
  sku: boolean;
  name: boolean;
  ratingReview: boolean;
  category: boolean;
  price: boolean;
  originalPrice: boolean;
  uom: boolean;
}>;

type FrameInfo =
  | {
      mode: "image";
      imageUrl: string;
      inset: number;
      opacity: number;
      objectFit: "contain" | "cover" | "fill";
    }
  | { mode: "draw"; borderWidth: number; borderColorHex: string };

type DiscountRuleLite = {
  id: string | number;
  minPercent?: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  frameMode?: "image" | "draw";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number;
  frameObjectFit?: "contain" | "cover" | "stretch";
  enabled?: boolean;
  order?: number;
};

/* ===== Helpers ===== */
// function mapSortUiToApi(
//   v: string
// ): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" {
//   switch (v) {
//     case "price-low":
//       return "price_asc";
//     case "price-high":
//       return "price_desc";
//     case "newest":
//       return "newest";
//     case "rating":
//       return "rating_desc";
//     case "best-match":
//     default:
//       return "order";
//   }
// }

/* ===== Helpers ===== */
function mapSortUiToApi(
  v: string
): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" | "discount_asc" | "discount_desc" {
  switch (v) {
    case "price-low":
      return "price_asc";
    case "price-high":
      return "price_desc";
    case "newest":
      return "newest";
    case "rating":
      return "rating_desc";

    // ✅ เพิ่มสองอันนี้
    case "discount-high":
      return "discount_desc";
    case "discount-low":
      return "discount_asc";

    case "best-match":
    default:
      return "order";
  }
}




const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
  if (!rule) return null;
  if (rule.frameMode === "image" && rule.frameImageUrl) {
    const objFit: "contain" | "cover" | "fill" =
      rule.frameObjectFit === "stretch"
        ? "fill"
        : ((rule.frameObjectFit ?? "contain") as any);
    return {
      mode: "image",
      imageUrl: rule.frameImageUrl,
      inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
      opacity:
        typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
      objectFit: objFit,
    };
  }
  return {
    mode: "draw",
    borderWidth: Number(rule.borderWidth) || 2,
    borderColorHex: String(rule.borderColorHex || "#000"),
  };
};

const pickRuleFactory =
  (rules: DiscountRuleLite[]) => (percent?: number): DiscountRuleLite | null => {
    if (percent == null) return null;
    for (const r of rules) {
      const lowerOk = percent >= (r.minPercent ?? 0);
      const upperOk =
        typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
      if (lowerOk && upperOk) return r;
    }
    return null;
  };

const getOriginalPrice = (price: number, discountPercent?: number) => {
  if (!discountPercent || discountPercent <= 0) return undefined;
  const original = price / (1 - discountPercent / 100);
  return Math.round(original);
};

/* ===== Page ===== */
export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categoryNameParam = searchParams.get("category") || "";
  const searchTextParam = searchParams.get("search") || "";
  const tagParam = searchParams.get("tag") || "";

  const discountMinParam = searchParams.get("discountMin");
  const discountMaxParam = searchParams.get("discountMax");

  const discountMin = useMemo(() => {
    if (discountMinParam == null || discountMinParam.trim() === "")
      return undefined;
    const n = Number(discountMinParam);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [discountMinParam]);

  const discountMax = useMemo(() => {
    if (discountMaxParam == null || discountMaxParam.trim() === "")
      return undefined;
    const n = Number(discountMaxParam);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [discountMaxParam]);

  useEffect(() => {
    const rawMin = discountMinParam;
    const rawMax = discountMaxParam;
    const badMin =
      rawMin != null &&
      rawMin !== "" &&
      Number.isFinite(Number(rawMin)) &&
      Number(rawMin) <= 0;
    const badMax =
      rawMax != null &&
      rawMax !== "" &&
      Number.isFinite(Number(rawMax)) &&
      Number(rawMax) <= 0;

    if (!badMin && !badMax) return;

    const params = new URLSearchParams(searchParams as any);
    if (badMin) params.delete("discountMin");
    if (badMax) params.delete("discountMax");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountMinParam, discountMaxParam, pathname, router, searchParams]);

  // UI
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("best-match");
  // const [sortBy, setSortBy] = useState("price-low");

  // Data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<
    (UIProduct & { frameInfo?: FrameInfo | null; categoryName?: string })[]
  >([]);
  const [total, setTotal] = useState(0);

  // ✅ Load more pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // กำหนดจำนวนตอการโหลด
  const [hasMore, setHasMore] = useState(true);

  // categories + rules + meta.cardParts
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [rules, setRules] = useState<DiscountRuleLite[]>([]);
  const [visibleParts, setVisibleParts] = useState<
    VisibleParts | undefined
  >(undefined);

  /* bootstrap: categories */
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/mock/categories", {
          cache: "no-store",
        });
        const j = await r.json().catch(() => ({}));
        if (!aborted)
          setCategories(Array.isArray(j?.items) ? j.items : []);
      } catch {
        if (!aborted) setCategories([]);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  /* bootstrap: rules */
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/mock/discount-rules", {
          cache: "no-store",
        });
        const j = await r.json().catch(() => ({}));
        const arr: DiscountRuleLite[] = (j?.items ?? [])
          .filter((x: any) => x && (x.enabled ?? true))
          .map((r: any) => ({
            id: r.id,
            minPercent: Number(r.minPercent) || 0,
            maxPercent:
              typeof r.maxPercent === "number" ? r.maxPercent : undefined,
            borderWidth: Number(r.borderWidth) || 2,
            borderColorHex: String(r.borderColorHex || "#000000"),
            frameMode: r.frameMode === "image" ? "image" : "draw",
            frameImageUrl:
              r.frameMode === "image" ? r.frameImageUrl : undefined,
            frameInsetPx:
              typeof r.frameInsetPx === "number"
                ? r.frameInsetPx
                : undefined,
            frameOpacity:
              typeof r.frameOpacity === "number"
                ? Math.max(0, Math.min(1, Number(r.frameOpacity)))
                : undefined,
            frameObjectFit:
              r.frameObjectFit === "cover"
                ? "cover"
                : r.frameObjectFit === "stretch"
                ? "stretch"
                : r.frameMode === "image"
                ? "contain"
                : undefined,
            enabled: r.enabled,
            order:
              typeof r.order === "number" ? r.order : undefined,
          }))
          .sort(
            (a: DiscountRuleLite, b: DiscountRuleLite) =>
              (a.order ?? 0) - (b.order ?? 0)
          );
        if (!aborted) setRules(arr);
      } catch {
        if (!aborted) setRules([]);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  /* bootstrap: meta.cardParts */
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/mock/products/meta", {
          cache: "no-store",
        });
        const j = await r.json().catch(() => ({}));
        if (!aborted) setVisibleParts(j?.meta?.cardParts ?? undefined);
      } catch {
        if (!aborted) setVisibleParts(undefined);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const pickRule = useMemo(
    () => pickRuleFactory(rules),
    [rules]
  );
  const catMap = useMemo(
    () => new Map(categories.map((c) => [String(c.id), c.name])),
    [categories]
  );

  const hasDiscountFilter =
    (typeof discountMin === "number" && discountMin > 0) ||
    (typeof discountMax === "number" && discountMax > 0);

  /* reset เมื่อ filter เปลี่ยน → กลับไปหน้า 1 และล้าง items */
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setItems([]);
  }, [
    categoryNameParam,
    searchTextParam,
    tagParam,
    sortBy,
    hasDiscountFilter,
  ]);

  /* fetch ตามหน้า + load more */
  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        // map ชื่อหมวด → id (ถ้ามี)
        let categoryId: string | number | undefined = undefined;
        if (categoryNameParam && categories.length) {
          const found = categories.find(
            (c) =>
              (c.name || "").toLowerCase() ===
              categoryNameParam.toLowerCase()
          );
          if (found) categoryId = found.id;
        }

        const url = new URL(
          "/api/mock/products",
          window.location.origin
        );
        if (searchTextParam.trim())
          url.searchParams.set("q", searchTextParam.trim());
        if (typeof categoryId !== "undefined")
          url.searchParams.set("category_id", String(categoryId));

        const sortFinal =
          tagParam === "new" ? "newest" : mapSortUiToApi(sortBy);
        url.searchParams.set("sort", sortFinal);
        url.searchParams.set("page", String(currentPage));
        url.searchParams.set("pageSize", String(pageSize));
        url.searchParams.set("visible", "true");

        if (typeof discountMin === "number" && discountMin > 0) {
          url.searchParams.set("min_discount", String(discountMin));
        }
        if (typeof discountMax === "number" && discountMax > 0) {
          url.searchParams.set("max_discount", String(discountMax));
        }

        const res = await fetch(url.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiListResponse = await res.json();

        const rawItems = data.items ?? [];
        const pageHasMore = rawItems.length === pageSize;

        let prepared = rawItems.map((p) => ({
          ...p,
          frameInfo: toFrameInfo(pickRule(p.discountPercent)),
          categoryName:
            p.category_id != null
              ? catMap.get(String(p.category_id))
              : undefined,
        }));

        // fallback filter ฝั่ง client
        if (hasDiscountFilter) {
          prepared = prepared.filter((p) => {
            const d =
              typeof p.discountPercent === "number"
                ? p.discountPercent
                : -1;
            const lowerOk =
              typeof discountMin === "number" && discountMin > 0
                ? d >= discountMin
                : true;
            const upperOk =
              typeof discountMax === "number" && discountMax > 0
                ? d <= discountMax
                : true;
            return lowerOk && upperOk;
          });
        }

        if (!aborted) {
          setItems((prev) => {
            const merged =
              currentPage === 1 ? prepared : [...prev, ...prepared];

            if (hasDiscountFilter) {
              const effectiveTotal = merged.length;
              setTotal(effectiveTotal);
              setHasMore(pageHasMore);
            } else {
              const serverTotal = data.total ?? merged.length;
              setTotal(serverTotal);
              setHasMore(merged.length < serverTotal && pageHasMore);
            }

            return merged;
          });
        }
      } catch (e: any) {
        if (!aborted)
          setError(e?.message ?? "โหลดสินค้าล้มเหลว");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [
    currentPage,
    pageSize,
    categoryNameParam,
    searchTextParam,
    tagParam,
    sortBy,
    categories,
    catMap,
    pickRule,
    discountMin,
    discountMax,
    hasDiscountFilter,
  ]);

  /* ===== Render ===== */
  const discountLabel = hasDiscountFilter
    ? ` • ส่วนลด${
        typeof discountMin === "number" && discountMin > 0
          ? `ตั้งแต่ ${discountMin}%`
          : ""
      }${
        typeof discountMax === "number" && discountMax > 0
          ? ` ถึง ${discountMax}%`
          : " ขึ้นไป"
      }`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <span
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push("/")}
          >
            หน้าแรก
          </span>
          {categoryNameParam && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">
                {categoryNameParam}
              </span>
            </>
          )}
          {searchTextParam && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">
                ค้นหา: "{searchTextParam}"
              </span>
            </>
          )}
          {tagParam && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">
                แท็ก: {tagParam}
              </span>
            </>
          )}
          {discountLabel && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">
                {discountLabel.replace(" • ", "")}
              </span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {categoryNameParam ||
              searchTextParam ||
              (tagParam === "new" ? "สินค้าใหม่" : "สินค้า")}
          </h1>
          <p className="text-muted-foreground">
            {loading && items.length === 0
              ? "กำลังโหลด…"
              : `${total.toLocaleString()} items found`}
            {categoryNameParam && ` for "${categoryNameParam}"`}
            {searchTextParam && ` for "${searchTextParam}"`}
            {discountLabel}
          </p>
        </div>

        {/* Sort & View */}
        {/* <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Sort By:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-match">
                  Best Match
                </SelectItem>
                <SelectItem value="price-low">
                  Price Low to High
                </SelectItem>
                <SelectItem value="price-high">
                  Price High to Low
                </SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Sort & View */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground">การจัดเรียง:</span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="เลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-match">Best Match</SelectItem>
                  <SelectItem value="price-low">ราคาต่ำ → สูง</SelectItem>
                  <SelectItem value="price-high">ราคาสูง → ต่ำ</SelectItem>
                  <SelectItem value="discount-high">ส่วนลดมาก → น้อย</SelectItem>
                  <SelectItem value="discount-low">ส่วนลดน้อย → มาก</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              View:
            </span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-destructive mb-6">
            เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
          </div>
        )}

        {/* Grid */}
        <div
          className={`grid mb-8 ${
            viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
              : "grid-cols-1 gap-4"
          }`}
        >
          {items.map((p, idx) => {
            const originalPrice = getOriginalPrice(
              p.price,
              p.discountPercent
            );
            return (
              <div
                key={`${p.id}-${idx}`}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${(idx % pageSize) * 0.06}s`,
                }}
              >
                <ProductCard
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  originalPrice={originalPrice}
                  discount={p.discountPercent}
                  rating={p.rating ?? 0}
                  reviews={p.reviews ?? 0}
                  image={p.image_url ?? "/placeholder.png"}
                  brand={p.brand}
                  sku={p.sku}
                  uom={p.uom}
                  categoryName={p.categoryName}
                  frameInfo={(p as any).frameInfo ?? null}
                  viewMode={viewMode}
                  onAddToCart={() => setIsCartOpen(true)}
                  visibleParts={visibleParts}
                />
              </div>
            );
          })}

          {loading && items.length === 0 &&
            Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-64 bg-muted/40 rounded-xl animate-pulse border border-muted/30"
              />
            ))}
        </div>

        {/* กำลังโหลดเพิ่ม (ตอนมีของเก่าแล้ว) */}
        {loading && items.length > 0 && (
          <div className="text-center text-muted-foreground mb-4">
            กำลังโหลดเพิ่มเติม...
          </div>
        )}

        {/* ✅ ปุ่มโหลดเพิ่ม */}
        {!loading && hasMore && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
            >
              โหลดเพิ่ม
            </Button>
          </div>
        )}

        {!loading && !hasMore && items.length > 0 && (
          <div className="text-center text-muted-foreground mb-8 text-xs">
            แสดงสินค้าครบทั้งหมดแล้ว
          </div>
        )}
      </div>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}

// v.1.1.6 ===============================================================

// v.1.1.5 ===============================================================
// // src/app/products/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { ProductCard } from "@/components/product-card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Grid3X3, List } from "lucide-react";
// import PaginationBar from "@/components/pagination-bar";

// /* ===== Types ===== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type ApiListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

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

// type FrameInfo =
//   | { mode: "image"; imageUrl: string; inset: number; opacity: number; objectFit: "contain" | "cover" | "fill" }
//   | { mode: "draw"; borderWidth: number; borderColorHex: string };

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

// /* ===== Helpers ===== */
// function mapSortUiToApi(v: string): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" {
//   switch (v) {
//     case "price-low":
//       return "price_asc";
//     case "price-high":
//       return "price_desc";
//     case "newest":
//       return "newest";
//     case "rating":
//       return "rating_desc";
//     case "best-match":
//     default:
//       return "order";
//   }
// }

// const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as any);
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return { mode: "draw", borderWidth: Number(rule.borderWidth) || 2, borderColorHex: String(rule.borderColorHex || "#000") };
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

// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// /* ===== Page ===== */
// export default function ProductListingPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();

//   const categoryNameParam = searchParams.get("category") || "";
//   const searchTextParam = searchParams.get("search") || "";
//   const tagParam = searchParams.get("tag") || "";

//   // ✅ อ่านช่วงส่วนลดจาก URL แบบ optional และ "นับเป็นตัวกรองเมื่อ > 0 เท่านั้น"
//   const discountMinParam = searchParams.get("discountMin");
//   const discountMaxParam = searchParams.get("discountMax");

//   const discountMin = useMemo(() => {
//     if (discountMinParam == null || discountMinParam.trim() === "") return undefined;
//     const n = Number(discountMinParam);
//     return Number.isFinite(n) && n > 0 ? n : undefined;
//   }, [discountMinParam]);

//   const discountMax = useMemo(() => {
//     if (discountMaxParam == null || discountMaxParam.trim() === "") return undefined;
//     const n = Number(discountMaxParam);
//     return Number.isFinite(n) && n > 0 ? n : undefined;
//   }, [discountMaxParam]);

//   // ✅ “ล้าง URL” ถ้ามีพารามิเตอร์ 0 หลงเหลือ (เช่นมาจากคลิกกรอบส่วนลดก่อนหน้า)
//   useEffect(() => {
//     const rawMin = discountMinParam;
//     const rawMax = discountMaxParam;
//     const badMin = rawMin != null && rawMin !== "" && Number.isFinite(Number(rawMin)) && Number(rawMin) <= 0;
//     const badMax = rawMax != null && rawMax !== "" && Number.isFinite(Number(rawMax)) && Number(rawMax) <= 0;

//     if (!badMin && !badMax) return;

//     const params = new URLSearchParams(searchParams as any);
//     if (badMin) params.delete("discountMin");
//     if (badMax) params.delete("discountMax");
//     const qs = params.toString();
//     router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
//     // ไม่ setState อะไรเพิ่ม ปล่อยให้รอบ render ถัดไปอ่านค่าที่สะอาดเอง
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [discountMinParam, discountMaxParam, pathname, router, searchParams]);

//   // UI
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState("best-match");

//   // Data
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [items, setItems] = useState<(UIProduct & { frameInfo?: FrameInfo | null; categoryName?: string })[]>([]);
//   const [total, setTotal] = useState(0);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   // categories + rules + meta.cardParts
//   const [categories, setCategories] = useState<CategoryLite[]>([]);
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   const [visibleParts, setVisibleParts] = useState<VisibleParts | undefined>(undefined);

//   /* bootstrap: categories */
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/categories", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         if (!aborted) setCategories(Array.isArray(j?.items) ? j.items : []);
//       } catch {
//         if (!aborted) setCategories([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: rules */
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
//               r.frameObjectFit === "cover"
//                 ? "cover"
//                 : r.frameObjectFit === "stretch"
//                 ? "stretch"
//                 : r.frameMode === "image"
//                 ? "contain"
//                 : undefined,
//             enabled: r.enabled,
//             order: typeof r.order === "number" ? r.order : undefined,
//           }))
//           .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));
//         if (!aborted) setRules(arr);
//       } catch {
//         if (!aborted) setRules([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: meta.cardParts */
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

//   const pickRule = useMemo(() => pickRuleFactory(rules), [rules]);
//   const catMap = useMemo(() => new Map(categories.map((c) => [String(c.id), c.name])), [categories]);

//   const hasDiscountFilter =
//     (typeof discountMin === "number" && discountMin > 0) ||
//     (typeof discountMax === "number" && discountMax > 0);

//   /* reset เมื่อ filter เปลี่ยน */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [categoryNameParam, searchTextParam, tagParam, sortBy, hasDiscountFilter]);

//   /* fetch ตามหน้า */
//   useEffect(() => {
//     let aborted = false;
//     const controller = new AbortController();

//     async function run() {
//       try {
//         setLoading(true);
//         setError(null);

//         // map ชื่อหมวด → id (ถ้ามี)
//         let categoryId: string | number | undefined = undefined;
//         if (categoryNameParam && categories.length) {
//           const found = categories.find(
//             (c) => (c.name || "").toLowerCase() === categoryNameParam.toLowerCase()
//           );
//           if (found) categoryId = found.id;
//         }

//         const url = new URL("/api/mock/products", window.location.origin);
//         if (searchTextParam.trim()) url.searchParams.set("q", searchTextParam.trim());
//         if (typeof categoryId !== "undefined") url.searchParams.set("category_id", String(categoryId));

//         const sortFinal = tagParam === "new" ? "newest" : mapSortUiToApi(sortBy);
//         url.searchParams.set("sort", sortFinal);
//         url.searchParams.set("page", String(currentPage));
//         url.searchParams.set("pageSize", String(pageSize));
//         url.searchParams.set("visible", "true");

//         // ✅ ส่งช่วงส่วนลดไปที่ API เฉพาะเมื่อมีจริง (> 0)
//         if (typeof discountMin === "number" && discountMin > 0) {
//           url.searchParams.set("min_discount", String(discountMin));
//         }
//         if (typeof discountMax === "number" && discountMax > 0) {
//           url.searchParams.set("max_discount", String(discountMax));
//         }

//         const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiListResponse = await res.json();

//         // เตรียมข้อมูล + ใส่ frame
//         let prepared = (data.items ?? []).map((p) => ({
//           ...p,
//           frameInfo: toFrameInfo(pickRule(p.discountPercent)),
//           categoryName: p.category_id != null ? catMap.get(String(p.category_id)) : undefined,
//         }));

//         // ✅ Fallback filter ฝั่ง client (กรณี API ยังไม่รองรับ min/max)
//         if (hasDiscountFilter) {
//           prepared = prepared.filter((p) => {
//             const d = typeof p.discountPercent === "number" ? p.discountPercent : -1;
//             const lowerOk = typeof discountMin === "number" && discountMin > 0 ? d >= discountMin : true;
//             const upperOk = typeof discountMax === "number" && discountMax > 0 ? d <= discountMax : true;
//             return lowerOk && upperOk;
//           });
//         }

//         if (!aborted) {
//           setItems(prepared);
//           setTotal(hasDiscountFilter ? prepared.length : (data.total ?? 0));
//         }
//       } catch (e: any) {
//         if (!aborted) setError(e?.message ?? "โหลดสินค้าล้มเหลว");
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     }

//     run();
//     return () => {
//       aborted = true;
//       controller.abort();
//     };
//   }, [
//     currentPage,
//     pageSize,
//     categoryNameParam,
//     searchTextParam,
//     tagParam,
//     sortBy,
//     categories,
//     catMap,
//     pickRule,
//     discountMin,
//     discountMax,
//     hasDiscountFilter,
//   ]);

//   /* ===== Render ===== */
//   const discountLabel =
//     hasDiscountFilter
//       ? ` • ส่วนลด${typeof discountMin === "number" && discountMin > 0 ? `ตั้งแต่ ${discountMin}%` : ""}${
//           typeof discountMax === "number" && discountMax > 0 ? ` ถึง ${discountMax}%` : " ขึ้นไป"
//         }`
//       : "";

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-4">
//           <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/")}>หน้าแรก</span>
//           {categoryNameParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">{categoryNameParam}</span></>)}
//           {searchTextParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">ค้นหา: "{searchTextParam}"</span></>)}
//           {tagParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">แท็ก: {tagParam}</span></>)}
//           {discountLabel && (<><span className="mx-2">/</span><span className="text-primary font-medium">{discountLabel.replace(" • ", "")}</span></>)}
//         </nav>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold mb-2">
//             {categoryNameParam || searchTextParam || (tagParam === "new" ? "สินค้าใหม่" : "สินค้า")}
//           </h1>
//           <p className="text-muted-foreground">
//             {loading && items.length === 0 ? "กำลังโหลด…" : `${total.toLocaleString()} items found`}
//             {categoryNameParam && ` for "${categoryNameParam}"`}
//             {searchTextParam && ` for "${searchTextParam}"`}
//             {discountLabel}
//           </p>
//         </div>

//         {/* Sort & View */}
//         <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
//           <div className="flex items-center gap-2 sm:gap-4">
//             <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="best-match">Best Match</SelectItem>
//                 <SelectItem value="price-low">Price Low to High</SelectItem>
//                 <SelectItem value="price-high">Price High to Low</SelectItem>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="rating">Top Rated</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
//             <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//             <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><List className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <div className="text-destructive mb-6">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</div>}

//         {/* Grid */}
//         <div
//           className={`grid mb-8 ${
//             viewMode === "grid"
//               ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//               : "grid-cols-1 gap-4"
//           }`}
//         >
//           {items.map((p, idx) => {
//             const originalPrice = getOriginalPrice(p.price, p.discountPercent);
//             return (
//               <div
//                 key={`${p.id}-${idx}`}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${(idx % pageSize) * 0.06}s` }}
//               >
//                 <ProductCard
//                   id={p.id}
//                   slug={p.slug}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={originalPrice}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   frameInfo={(p as any).frameInfo ?? null}
//                   viewMode={viewMode}
//                   onAddToCart={() => setIsCartOpen(true)}
//                   visibleParts={visibleParts}
//                 />
//               </div>
//             );
//           })}

//           {loading && items.length === 0 &&
//             Array.from({ length: pageSize }).map((_, i) => (
//               <div key={`sk-${i}`} className="h-64 bg-muted/40 rounded-xl animate-pulse border border-muted/30" />
//             ))
//           }
//         </div>

//         {/* Pagination */}
//         <div className="mt-6">
//           <PaginationBar
//             page={currentPage}
//             pageSize={pageSize}
//             total={total}
//             onChangePage={(p) => setCurrentPage(p)}
//             onChangePageSize={(s) => {
//               setPageSize(s);
//               setCurrentPage(1);
//             }}
//           />
//         </div>
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }

// v.1.1.5 ===============================================================

// v.1.1.4 ===============================================================
// // src/app/products/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { ProductCard } from "@/components/product-card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Grid3X3, List } from "lucide-react";
// import PaginationBar from "@/components/pagination-bar"; // ✅ ใช้คอมโพเนนต์เดียวกับฝั่งแอดมิน

// /* ===== Types ===== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type ApiListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

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

// type FrameInfo =
//   | { mode: "image"; imageUrl: string; inset: number; opacity: number; objectFit: "contain" | "cover" | "fill" }
//   | { mode: "draw"; borderWidth: number; borderColorHex: string };

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

// /* ===== Helpers ===== */
// function mapSortUiToApi(v: string): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" {
//   switch (v) {
//     case "price-low":
//       return "price_asc";
//     case "price-high":
//       return "price_desc";
//     case "newest":
//       return "newest";
//     case "rating":
//       return "rating_desc";
//     case "best-match":
//     default:
//       return "order";
//   }
// }

// const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as any);
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return { mode: "draw", borderWidth: Number(rule.borderWidth) || 2, borderColorHex: String(rule.borderColorHex || "#000") };
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

// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// /* ===== Page ===== */
// export default function ProductListingPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const categoryNameParam = searchParams.get("category") || "";
//   const searchTextParam = searchParams.get("search") || "";
//   const tagParam = searchParams.get("tag") || "";

//   // UI
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState("best-match");

//   // Data
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [items, setItems] = useState<(UIProduct & { frameInfo?: FrameInfo | null; categoryName?: string })[]>([]);
//   const [total, setTotal] = useState(0);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24); // ✅ ใช้ state เพื่อเปลี่ยนจำนวน/หน้าได้
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   // categories + rules + meta.cardParts
//   const [categories, setCategories] = useState<CategoryLite[]>([]);
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   const [visibleParts, setVisibleParts] = useState<VisibleParts | undefined>(undefined);

//   /* bootstrap: categories */
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/categories", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         if (!aborted) setCategories(Array.isArray(j?.items) ? j.items : []);
//       } catch {
//         if (!aborted) setCategories([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: rules */
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
//               r.frameObjectFit === "cover"
//                 ? "cover"
//                 : r.frameObjectFit === "stretch"
//                 ? "stretch"
//                 : r.frameMode === "image"
//                 ? "contain"
//                 : undefined,
//             enabled: r.enabled,
//             order: typeof r.order === "number" ? r.order : undefined,
//           }))
//           .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));
//         if (!aborted) setRules(arr);
//       } catch {
//         if (!aborted) setRules([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: meta.cardParts (ใช้กติกาเดียวกับหน้าแรก) */
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

//   const pickRule = useMemo(() => pickRuleFactory(rules), [rules]);
//   const catMap = useMemo(() => new Map(categories.map((c) => [String(c.id), c.name])), [categories]);

//   /* reset เมื่อ filter เปลี่ยน */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [categoryNameParam, searchTextParam, tagParam, sortBy]);

//   /* fetch ตามหน้า */
//   useEffect(() => {
//     let aborted = false;
//     const controller = new AbortController();

//     async function run() {
//       try {
//         setLoading(true);
//         setError(null);

//         // map ชื่อหมวด → id (ถ้ามี)
//         let categoryId: string | number | undefined = undefined;
//         if (categoryNameParam && categories.length) {
//           const found = categories.find(
//             (c) => (c.name || "").toLowerCase() === categoryNameParam.toLowerCase()
//           );
//           if (found) categoryId = found.id;
//         }

//         const url = new URL("/api/mock/products", window.location.origin);
//         if (searchTextParam.trim()) url.searchParams.set("q", searchTextParam.trim());
//         if (typeof categoryId !== "undefined") url.searchParams.set("category_id", String(categoryId));

//         const sortFinal = tagParam === "new" ? "newest" : mapSortUiToApi(sortBy);
//         url.searchParams.set("sort", sortFinal);
//         url.searchParams.set("page", String(currentPage));
//         url.searchParams.set("pageSize", String(pageSize)); // ✅ ใช้ค่า state
//         url.searchParams.set("visible", "true");

//         const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiListResponse = await res.json();

//         const prepared = (data.items ?? []).map((p) => ({
//           ...p,
//           frameInfo: toFrameInfo(pickRule(p.discountPercent)),
//           categoryName: p.category_id != null ? catMap.get(String(p.category_id)) : undefined,
//         }));

//         if (!aborted) {
//           setItems(prepared);
//           setTotal(data.total ?? 0);
//         }
//       } catch (e: any) {
//         if (!aborted) setError(e?.message ?? "โหลดสินค้าล้มเหลว");
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     }

//     run();
//     return () => {
//       aborted = true;
//       controller.abort();
//     };
//   }, [currentPage, pageSize, categoryNameParam, searchTextParam, tagParam, sortBy, categories, catMap, pickRule]);

//   /* ===== Render ===== */
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-4">
//           <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/")}>หน้าแรก</span>
//           {categoryNameParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">{categoryNameParam}</span></>)}
//           {searchTextParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">ค้นหา: "{searchTextParam}"</span></>)}
//           {tagParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">แท็ก: {tagParam}</span></>)}
//         </nav>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold mb-2">{categoryNameParam || searchTextParam || (tagParam === "new" ? "สินค้าใหม่" : "สินค้า")}</h1>
//           <p className="text-muted-foreground">
//             {loading && items.length === 0 ? "กำลังโหลด…" : `${total.toLocaleString()} items found`}
//             {categoryNameParam && ` for "${categoryNameParam}"`}
//             {searchTextParam && ` for "${searchTextParam}"`}
//           </p>
//         </div>

//         {/* Sort & View */}
//         <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
//           <div className="flex items-center gap-2 sm:gap-4">
//             <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="best-match">Best Match</SelectItem>
//                 <SelectItem value="price-low">Price Low to High</SelectItem>
//                 <SelectItem value="price-high">Price High to Low</SelectItem>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="rating">Top Rated</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
//             <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//             <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><List className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <div className="text-destructive mb-6">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</div>}

//         {/* Grid (ให้เหมือนหน้าแรก: 2 / 3 / 4 / 6 คอลัมน์) */}
//         <div
//           className={`grid mb-8 ${
//             viewMode === "grid"
//               ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//               : "grid-cols-1 gap-4"
//           }`}
//         >
//           {items.map((p, idx) => {
//             const originalPrice = getOriginalPrice(p.price, p.discountPercent);
//             return (
//               <div
//                 key={`${p.id}-${idx}`}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${(idx % pageSize) * 0.06}s` }}
//               >
//                 <ProductCard
//                   id={p.id}
//                   slug={p.slug}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={originalPrice}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   frameInfo={(p as any).frameInfo ?? null}
//                   viewMode={viewMode}
//                   onAddToCart={() => setIsCartOpen(true)}
//                   visibleParts={visibleParts}
//                 />
//               </div>
//             );
//           })}

//           {loading && items.length === 0 &&
//             Array.from({ length: pageSize }).map((_, i) => (
//               <div key={`sk-${i}`} className="h-64 bg-muted/40 rounded-xl animate-pulse border border-muted/30" />
//             ))
//           }
//         </div>

//         {/* Pagination — ใช้คอมโพเนนต์เดียวกับแอดมิน */}
//         <div className="mt-6">
//           <PaginationBar
//             page={currentPage}
//             pageSize={pageSize}
//             total={total}
//             onChangePage={(p) => setCurrentPage(p)}
//             onChangePageSize={(s) => {
//               setPageSize(s);
//               setCurrentPage(1);
//             }}
//           />
//         </div>
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }

// v.1.1.4 ===============================================================

// v.1.1.3 ===============================================================
// // src/app/products/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { ProductCard } from "@/components/product-card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
// import { useIsMobile } from "@/hooks/use-mobile";

// /* ===== Types ===== */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type ApiListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

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

// type FrameInfo =
//   | { mode: "image"; imageUrl: string; inset: number; opacity: number; objectFit: "contain" | "cover" | "fill" }
//   | { mode: "draw"; borderWidth: number; borderColorHex: string };

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

// /* ===== Helpers ===== */
// function mapSortUiToApi(v: string): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" {
//   switch (v) {
//     case "price-low":
//       return "price_asc";
//     case "price-high":
//       return "price_desc";
//     case "newest":
//       return "newest";
//     case "rating":
//       return "rating_desc";
//     case "best-match":
//     default:
//       return "order";
//   }
// }

// const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as any);
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return { mode: "draw", borderWidth: Number(rule.borderWidth) || 2, borderColorHex: String(rule.borderColorHex || "#000") };
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

// const getOriginalPrice = (price: number, discountPercent?: number) => {
//   if (!discountPercent || discountPercent <= 0) return undefined;
//   const original = price / (1 - discountPercent / 100);
//   return Math.round(original);
// };

// /* ===== Page ===== */
// export default function ProductListingPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const isMobile = useIsMobile();

//   const categoryNameParam = searchParams.get("category") || "";
//   const searchTextParam = searchParams.get("search") || "";
//   const tagParam = searchParams.get("tag") || "";

//   // UI
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState("best-match");

//   // Data
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [items, setItems] = useState<(UIProduct & { frameInfo?: FrameInfo | null; categoryName?: string })[]>([]);
//   const [total, setTotal] = useState(0);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   // const pageSize = 24;
//   const [pageSize, setPageSize] = useState(24);
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   // aux
//   const cartItemCount = 4;

//   // categories + rules + meta.cardParts
//   const [categories, setCategories] = useState<CategoryLite[]>([]);
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   const [visibleParts, setVisibleParts] = useState<VisibleParts | undefined>(undefined);

//   /* bootstrap: categories */
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/categories", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         if (!aborted) setCategories(Array.isArray(j?.items) ? j.items : []);
//       } catch {
//         if (!aborted) setCategories([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: rules */
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
//               r.frameObjectFit === "cover"
//                 ? "cover"
//                 : r.frameObjectFit === "stretch"
//                 ? "stretch"
//                 : r.frameMode === "image"
//                 ? "contain"
//                 : undefined,
//             enabled: r.enabled,
//             order: typeof r.order === "number" ? r.order : undefined,
//           }))
//           .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));
//           // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
//         if (!aborted) setRules(arr);
//       } catch {
//         if (!aborted) setRules([]);
//       }
//     })();
//     return () => { aborted = true; };
//   }, []);

//   /* bootstrap: meta.cardParts (ใช้กติกาเดียวกับหน้าแรก) */
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

//   const pickRule = useMemo(() => pickRuleFactory(rules), [rules]);
//   const catMap = useMemo(() => new Map(categories.map((c) => [String(c.id), c.name])), [categories]);

//   /* reset เมื่อ filter เปลี่ยน */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [categoryNameParam, searchTextParam, tagParam, sortBy]);

//   /* fetch ตามหน้า */
//   useEffect(() => {
//     let aborted = false;
//     const controller = new AbortController();

//     async function run() {
//       try {
//         setLoading(true);
//         setError(null);

//         // map ชื่อหมวด → id (ถ้ามี)
//         let categoryId: string | number | undefined = undefined;
//         if (categoryNameParam && categories.length) {
//           const found = categories.find(
//             (c) => (c.name || "").toLowerCase() === categoryNameParam.toLowerCase()
//           );
//           if (found) categoryId = found.id;
//         }

//         const url = new URL("/api/mock/products", window.location.origin);
//         if (searchTextParam.trim()) url.searchParams.set("q", searchTextParam.trim());
//         if (typeof categoryId !== "undefined") url.searchParams.set("category_id", String(categoryId));

//         const sortFinal = tagParam === "new" ? "newest" : mapSortUiToApi(sortBy);
//         url.searchParams.set("sort", sortFinal);
//         url.searchParams.set("page", String(currentPage));
//         url.searchParams.set("pageSize", String(pageSize));
//         url.searchParams.set("visible", "true");


//         const res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiListResponse = await res.json();

//         const prepared = (data.items ?? []).map((p) => ({
//           ...p,
//           frameInfo: toFrameInfo(pickRule(p.discountPercent)),
//           categoryName: p.category_id != null ? catMap.get(String(p.category_id)) : undefined,
//         }));

//         if (!aborted) {
//           setItems(prepared);
//           setTotal(data.total ?? 0);
//         }
//       } catch (e: any) {
//         if (!aborted) setError(e?.message ?? "โหลดสินค้าล้มเหลว");
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     }

//     run();
//     return () => {
//       aborted = true;
//       controller.abort();
//     };
//   }, [currentPage, categoryNameParam, searchTextParam, tagParam, sortBy, categories, catMap, pickRule]);

//   /* ===== Render ===== */
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-4">
//           <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/")}>หน้าแรก</span>
//           {categoryNameParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">{categoryNameParam}</span></>)}
//           {searchTextParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">ค้นหา: "{searchTextParam}"</span></>)}
//           {tagParam && (<><span className="mx-2">/</span><span className="text-primary font-medium">แท็ก: {tagParam}</span></>)}
//         </nav>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold mb-2">{categoryNameParam || searchTextParam || (tagParam === "new" ? "สินค้าใหม่" : "สินค้า")}</h1>
//           <p className="text-muted-foreground">
//             {loading && items.length === 0 ? "กำลังโหลด…" : `${total.toLocaleString()} items found`}
//             {categoryNameParam && ` for "${categoryNameParam}"`}
//             {searchTextParam && ` for "${searchTextParam}"`}
//           </p>
//         </div>

//         {/* Sort & View */}
//         <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
//           <div className="flex items-center gap-2 sm:gap-4">
//             <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9"><SelectValue /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="best-match">Best Match</SelectItem>
//                 <SelectItem value="price-low">Price Low to High</SelectItem>
//                 <SelectItem value="price-high">Price High to Low</SelectItem>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="rating">Top Rated</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
//             <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//             <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 sm:h-9 sm:w-9 p-0"><List className="h-3 w-3 sm:h-4 sm:w-4" /></Button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && <div className="text-destructive mb-6">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</div>}

//         {/* Grid (ให้เหมือนหน้าแรก: 2 / 3 / 4 / 6 คอลัมน์) */}
//         <div
//           className={`grid mb-8 ${
//             viewMode === "grid"
//               ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
//               : "grid-cols-1 gap-4"
//           }`}
//         >
//           {items.map((p, idx) => {
//             const originalPrice = getOriginalPrice(p.price, p.discountPercent);
//             return (
//               <div
//                 key={`${p.id}-${idx}`}
//                 className="opacity-0 animate-fade-in"
//                 style={{ animationDelay: `${(idx % pageSize) * 0.06}s` }}
//               >
//                 <ProductCard
//                   id={p.id}
//                   slug={p.slug}
//                   name={p.name}
//                   price={p.price}
//                   originalPrice={originalPrice}
//                   discount={p.discountPercent}
//                   rating={p.rating ?? 0}
//                   reviews={p.reviews ?? 0}
//                   image={p.image_url ?? "/placeholder.png"}
//                   brand={p.brand}
//                   sku={p.sku}
//                   uom={p.uom}
//                   categoryName={p.categoryName}
//                   frameInfo={(p as any).frameInfo ?? null}
//                   viewMode={viewMode}
//                   onAddToCart={() => setIsCartOpen(true)}
//                   visibleParts={visibleParts}           
//                 />
//               </div>
//             );
//           })}

//           {loading && items.length === 0 &&
//             Array.from({ length: 8 }).map((_, i) => (
//               <div key={`sk-${i}`} className="h-64 bg-muted/40 rounded-xl animate-pulse border border-muted/30" />
//             ))
//           }
//         </div>

//         {/* Pagination */}
//         <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//             className="text-xs sm:text-sm px-2 sm:px-3"
//           >
//             <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
//           </Button>

//           <div className="flex gap-1 sm:gap-2">
//             {(isMobile ? [1,2,3] : [1,2,3,4,5]).map((p) => (
//               <Button
//                 key={p}
//                 variant={p === currentPage ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setCurrentPage(p)}
//                 disabled={p > totalPages}
//                 className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
//               >
//                 {p}
//               </Button>
//             ))}
//           </div>

//           <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">...</span>
//           <Button
//             variant={currentPage === totalPages ? "default" : "outline"}
//             size="sm"
//             onClick={() => setCurrentPage(totalPages)}
//             className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
//           >
//             {totalPages}
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//             className="text-xs sm:text-sm px-2 sm:px-3"
//           >
//             <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
//           </Button>
//         </div>
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }

// v.1.1.3 ===============================================================


// v.1.1.2 ===============================================================
// // src/app/products/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { ProductCard } from "@/components/product-card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
// import { useIsMobile } from "@/hooks/use-mobile";

// /* ================= Types (สอดคล้องกับ API จริง) ================= */
// type UIProduct = {
//   id: number | string;
//   name: string;
//   price: number;
//   discountPercent?: number;
//   image_url?: string;
//   rating?: number;
//   reviews?: number;
//   brand?: string;
//   sku?: string;
//   uom?: string;
//   category_id?: number | string;
//   slug?: string;
//   order?: number;
// };

// type ApiListResponse = {
//   items: UIProduct[];
//   total: number;
//   page: number;
//   pageSize: number;
// };

// type CategoryLite = { id: number | string; name: string; slug?: string };

// type FrameInfo =
//   | {
//       mode: "image";
//       imageUrl: string;
//       inset: number; // px
//       opacity: number; // 0..1
//       objectFit: "contain" | "cover" | "fill";
//     }
//   | {
//       mode: "draw";
//       borderWidth: number; // px
//       borderColorHex: string; // #RRGGBB
//     };

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

// /* ============== Utils: map sort UI -> API, frame rules เหมือนหน้าแรก ============== */
// function mapSortUiToApi(v: string): "order" | "price_asc" | "price_desc" | "newest" | "rating_desc" {
//   switch (v) {
//     case "price-low":
//       return "price_asc";
//     case "price-high":
//       return "price_desc";
//     case "newest":
//       return "newest";
//     case "rating":
//       return "rating_desc";
//     case "best-match":
//     default:
//       return "order";
//   }
// }

// const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
//   if (!rule) return null;
//   if (rule.frameMode === "image" && rule.frameImageUrl) {
//     const objFit: "contain" | "cover" | "fill" =
//       rule.frameObjectFit === "stretch" ? "fill" : ((rule.frameObjectFit ?? "contain") as any);
//     return {
//       mode: "image",
//       imageUrl: rule.frameImageUrl,
//       inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
//       opacity: typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1,
//       objectFit: objFit,
//     };
//   }
//   return {
//     mode: "draw",
//     borderWidth: Number(rule.borderWidth) || 2,
//     borderColorHex: String(rule.borderColorHex || "#000000"),
//   };
// };

// const pickRuleFactory = (rules: DiscountRuleLite[]) => {
//   return (percent?: number): DiscountRuleLite | null => {
//     if (percent == null) return null;
//     for (const r of rules) {
//       const lowerOk = percent >= (r.minPercent ?? 0);
//       const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//       if (lowerOk && upperOk) return r;
//     }
//     return null;
//   };
// };

// /* ============================= Page Component ============================= */
// export default function ProductListingPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const isMobile = useIsMobile();

//   // query จาก URL
//   const categoryNameParam = searchParams.get("category") || "";
//   const searchTextParam = searchParams.get("search") || "";

//   // UI states
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState("best-match");
//   const [currentPage, setCurrentPage] = useState(1);

//   // Data states
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [products, setProducts] = useState<(UIProduct & { frameInfo?: FrameInfo | null; categoryName?: string })[]>(
//     []
//   );
//   const [total, setTotal] = useState(0);
//   const [categories, setCategories] = useState<CategoryLite[]>([]);

//   // Config
//   const pageSize = 24;
//   const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
//   const cartItemCount = 4;

//   // โหลดรายการหมวดเพื่อนำมา resolve id และใส่ชื่อหมวดให้สินค้า
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/categories", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         const items: CategoryLite[] = Array.isArray(j?.items) ? j.items : [];
//         if (!aborted) setCategories(items);
//       } catch {
//         if (!aborted) setCategories([]);
//       }
//     })();
//     return () => {
//       aborted = true;
//     };
//   }, []);

//   // โหลดกติกา frame (เพื่อให้การ์ดเหมือนหน้าแรก)
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);
//   useEffect(() => {
//     let aborted = false;
//     (async () => {
//       try {
//         const r = await fetch("/api/mock/discount-rules", { cache: "no-store" });
//         const j = await r.json().catch(() => ({}));
//         const items: DiscountRuleLite[] = (j?.items ?? [])
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
//               r.frameObjectFit === "cover"
//                 ? "cover"
//                 : r.frameObjectFit === "stretch"
//                 ? "stretch"
//                 : r.frameMode === "image"
//                 ? "contain"
//                 : undefined,
//             enabled: r.enabled,
//             order: typeof r.order === "number" ? r.order : undefined,
//           }))
//           .sort((a: DiscountRuleLite, b: DiscountRuleLite) => (a.order ?? 0) - (b.order ?? 0));
//         if (!aborted) setRules(items);
//       } catch {
//         if (!aborted) setRules([]);
//       }
//     })();
//     return () => {
//       aborted = true;
//     };
//   }, []);

//   // ดึงสินค้าจริงจาก API ทุกครั้งที่พารามิเตอร์เปลี่ยน
//   useEffect(() => {
//     let aborted = false;
//     const controller = new AbortController();

//     async function load() {
//       setLoading(true);
//       setError(null);

//       try {
//         // 1) resolve category name -> id (ถ้ามี)
//         let categoryId: string | number | undefined = undefined;
//         if (categoryNameParam && categories.length) {
//           const found = categories.find((c) => (c.name || "").toLowerCase() === categoryNameParam.toLowerCase());
//           if (found) categoryId = found.id;
//         }

//         // 2) สร้าง URL เรียก API
//         const url = new URL("/api/mock/products", window.location.origin);
//         // คำค้นหา
//         if (searchTextParam.trim()) url.searchParams.set("q", searchTextParam.trim());
//         // หมวด (ใช้ id ถ้า resolve ได้; ถ้าไม่ได้ก็ไม่ต้องส่ง ปล่อยให้ q ช่วยค้น)
//         if (typeof categoryId !== "undefined") url.searchParams.set("category_id", String(categoryId));
//         // เรียงลำดับ
//         url.searchParams.set("sort", mapSortUiToApi(sortBy));
//         // แบ่งหน้า
//         url.searchParams.set("page", String(currentPage));
//         url.searchParams.set("pageSize", String(pageSize));
//         // ให้ฝั่ง DB/route เลือกเฉพาะที่มองเห็น
//         url.searchParams.set("visible", "true");

//         const r = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
//         if (!r.ok) throw new Error(`HTTP ${r.status}`);
//         const data: ApiListResponse & { meta?: any } = await r.json();

//         // 3) ใส่ frameInfo และชื่อหมวด (เหมือนหน้าแรก)
//         const pickRule = pickRuleFactory(rules);
//         const catMap = new Map(categories.map((c) => [String(c.id), c.name]));
//         const prepared = (data.items ?? []).map((p) => {
//           const rule = pickRule(p.discountPercent);
//           const frameInfo = toFrameInfo(rule);
//           const categoryName =
//             p.category_id != null ? catMap.get(String(p.category_id)) : undefined;

//           return {
//             ...p,
//             frameInfo,
//             categoryName,
//           };
//         });

//         if (!aborted) {
//           setProducts(prepared);
//           setTotal(data.total ?? prepared.length);
//         }
//       } catch (e: any) {
//         if (!aborted) {
//           setError(e?.message ?? "โหลดสินค้าล้มเหลว");
//           setProducts([]);
//           setTotal(0);
//         }
//       } finally {
//         if (!aborted) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       aborted = true;
//       controller.abort();
//     };
//   }, [categoryNameParam, searchTextParam, sortBy, currentPage, pageSize, categories, rules]);

//   // เมื่อเปลี่ยน sort ให้กลับไปหน้า 1
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [sortBy, categoryNameParam, searchTextParam]);

//   /* ============================= Render ============================= */
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-4">
//           <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/")}>
//             หน้าแรก
//           </span>
//           {categoryNameParam && (
//             <>
//               <span className="mx-2">/</span>
//               <span className="text-primary font-medium">{categoryNameParam}</span>
//             </>
//           )}
//           {searchTextParam && (
//             <>
//               <span className="mx-2">/</span>
//               <span className="text-primary font-medium">ค้นหา: "{searchTextParam}"</span>
//             </>
//           )}
//         </nav>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold mb-2">{categoryNameParam || searchTextParam || "สินค้า"}</h1>
//           <p className="text-muted-foreground">
//             {loading ? "กำลังค้นหา…" : `${total.toLocaleString()} items found`}
//             {categoryNameParam && ` for "${categoryNameParam}"`}
//             {searchTextParam && ` for "${searchTextParam}"`}
//           </p>
//         </div>

//         {/* Sort & View */}
//         <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
//           <div className="flex items-center gap-2 sm:gap-4">
//             <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="best-match">Best Match</SelectItem>
//                 <SelectItem value="price-low">Price Low to High</SelectItem>
//                 <SelectItem value="price-high">Price High to Low</SelectItem>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="rating">Top Rated</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
//             <Button
//               variant={viewMode === "grid" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setViewMode("grid")}
//               className="h-8 w-8 sm:h-9 sm:w-9 p-0"
//             >
//               <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
//             </Button>
//             <Button
//               variant={viewMode === "list" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setViewMode("list")}
//               className="h-8 w-8 sm:h-9 sm:w-9 p-0"
//             >
//               <List className="h-3 w-3 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Loading / Error / Empty */}
//         {error && (
//           <div className="text-destructive mb-6">
//             เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
//           </div>
//         )}

//         {/* Products Grid (ใช้การ์ดเดียวกับหน้าแรก + frame/brand/discount ครบ) */}
//         <div
//           className={`grid mb-8 ${
//             viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" : "grid-cols-1 gap-4"
//           }`}
//         >
//           {!loading &&
//             !error &&
//             products.map((p) => (
//               <ProductCard
//                 key={p.id}
//                 id={p.id}
//                 slug={p.slug}
//                 name={p.name}
//                 price={p.price}
//                 discount={p.discountPercent}
//                 rating={p.rating ?? 0}
//                 reviews={p.reviews ?? 0}
//                 image={p.image_url ?? "/placeholder.png"}
//                 brand={p.brand}
//                 sku={p.sku}
//                 uom={p.uom}
//                 categoryName={p.categoryName}
//                 frameInfo={p.frameInfo ?? null}
//                 viewMode={viewMode}
//                 onAddToCart={() => setIsCartOpen(true)}
//               />
//             ))}

//           {loading &&
//             Array.from({ length: 8 }).map((_, i) => (
//               <div
//                 key={`sk-${i}`}
//                 className="h-64 bg-muted/40 rounded-xl animate-pulse border border-muted/30"
//               />
//             ))}

//           {!loading && !error && products.length === 0 && (
//             <div className="col-span-full text-center text-muted-foreground py-12">
//               ไม่พบสินค้า
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {!loading && total > 0 && (
//           <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
//             <Button
//               variant="outline"
//               size="sm"
//               disabled={currentPage === 1}
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               className="text-xs sm:text-sm px-2 sm:px-3"
//             >
//               <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
//             </Button>

//             <div className="flex gap-1 sm:gap-2">
//               {(isMobile ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((page) => (
//                 <Button
//                   key={page}
//                   variant={page === currentPage ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setCurrentPage(page)}
//                   className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
//                   disabled={page > totalPages}
//                 >
//                   {page}
//                 </Button>
//               ))}
//             </div>

//             <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">...</span>
//             <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 min-w-[36px]">
//               {totalPages}
//             </Button>

//             <Button
//               variant="outline"
//               size="sm"
//               disabled={currentPage >= totalPages}
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               className="text-xs sm:text-sm px-2 sm:px-3"
//             >
//               <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
//             </Button>
//           </div>
//         )}
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }

// v.1.1.2 ===============================================================

// // src/app/products/page.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { ShoppingCart } from "@/components/shopping-cart";
// import { ProductFilters } from "@/components/product-filters";
// import { ProductCard } from "@/components/product-card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
// import { useIsMobile } from "@/hooks/use-mobile";

// export default function ProductListingPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const isMobile = useIsMobile();
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState("best-match");
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const category = searchParams.get("category") || "";
//   const search = searchParams.get("search") || "";
//   const cartItemCount = 4;

//   // Scroll to top when component mounts
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }, []);

//   // Mock data for demonstration
//   const totalItems = 2552;
//   const itemsPerPage = 24;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const mockProducts = [
//     {
//       id: 1,
//       name: "US-9015LSZH CAT 5E UTP Cable LSZH 305m",
//       price: 4837.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-lszh.jpg",
//       rating: 4.8,
//       reviews: 156,
//       discount: null,
//       isInterlinkMall: true,
//       badge: "InterlinkMall"
//     },
//     {
//       id: 2,
//       name: "US-9025LSZH CAT 5E STRAND Cable 305m",
//       price: 6046.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-strand.jpg",
//       rating: 4.6,
//       reviews: 89,
//       discount: null,
//       isFreeShipping: true,
//       badge: "InterlinkMall"
//     },
//     {
//       id: 3,
//       name: "US-9055E CAT 5E UTP Cable Outdoor 305m",
//       price: 37771.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-reel.jpg",
//       rating: 4.9,
//       reviews: 234,
//       discount: null,
//       badge: "สินค้าแนะนำ"
//     },
//     {
//       id: 4,
//       name: "US-9035 CAT 5E UTP Cable Indoor 305m",
//       price: 6094.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-box.jpg",
//       rating: 4.7,
//       reviews: 178,
//       discount: null,
//       badge: "สินค้าแนะนำ"
//     },
//     {
//       id: 5,
//       name: "US-9045 CAT 5E UTP Cable Plenum 305m",
//       price: 5896.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-plenum.jpg",
//       rating: 4.5,
//       reviews: 123,
//       discount: null,
//       badge: null
//     },
//     {
//       id: 6,
//       name: "US-9015M CAT 5E UTP Cable Premium 305m",
//       price: 6420.00,
//       originalPrice: null,
//       image: "/assets/lan-cat5e-premium.jpg",
//       rating: 4.6,
//       reviews: 145,
//       discount: null,
//       isClearanceSale: false,
//       badge: "InterlinkMall"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-background">
      
//       <div className="container mx-auto px-2 sm:px-4 py-6">
//         {/* Breadcrumb */}
//         <nav className="text-sm text-muted-foreground mb-4">
//           <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/')}>หน้าแรก</span>
//           {category && (
//             <>
//               <span className="mx-2">/</span>
//               <span className="text-primary font-medium">{category}</span>
//             </>
//           )}
//           {search && (
//             <>
//               <span className="mx-2">/</span>
//               <span className="text-primary font-medium">ค้นหา: "{search}"</span>
//             </>
//           )}
//         </nav>

//         <div className="flex flex-col lg:flex-row gap-6">

//           {/* Main Content */}
//           <div className="flex-1 min-w-0">
//             {/* Header */}
//             <div className="mb-6">
//               <h1 className="text-2xl font-bold mb-2">
//                 {category || search || "Network Components"}
//               </h1>
//               <p className="text-muted-foreground">
//                 {totalItems.toLocaleString()} items found {category && `for "${category}"`}
//                 {search && `for "${search}"`}
//               </p>
//             </div>

//             {/* Sort and View Options */}
//             <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
//               <div className="flex items-center gap-2 sm:gap-4">
//                 <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
//                 <Select value={sortBy} onValueChange={setSortBy}>
//                   <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="best-match">Best Match</SelectItem>
//                     <SelectItem value="price-low">Price Low to High</SelectItem>
//                     <SelectItem value="price-high">Price High to Low</SelectItem>
//                     <SelectItem value="newest">Newest</SelectItem>
//                     <SelectItem value="rating">Top Rated</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex items-center gap-1 sm:gap-2">
//                 <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
//                 <Button
//                   variant={viewMode === "grid" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setViewMode("grid")}
//                   className="h-8 w-8 sm:h-9 sm:w-9 p-0"
//                 >
//                   <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
//                 </Button>
//                 <Button
//                   variant={viewMode === "list" ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setViewMode("list")}
//                   className="h-8 w-8 sm:h-9 sm:w-9 p-0"
//                 >
//                   <List className="h-3 w-3 sm:h-4 sm:w-4" />
//                 </Button>
//               </div>
//             </div>

//             {/* Products Grid */}
//             <div className={`grid mb-8 ${
//               viewMode === "grid" 
//                 ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
//                 : "grid-cols-1 gap-4"
//             }`}>
//               {mockProducts.map((product) => (
//                 <ProductCard
//                   key={product.id}
//                   id={product.id}
//                   name={product.name}
//                   price={product.price}
//                   // originalPrice={product.originalPrice}
//                   // discount={product.discount as number | undefined}
//                   rating={product.rating}
//                   reviews={product.reviews}
//                   image={product.image}
//                   isFreeShipping={product.isFreeShipping}
//                   isInterlinkMall={product.isInterlinkMall}
//                   isClearanceSale={product.isClearanceSale}
//                   viewMode={viewMode}
//                   onAddToCart={() => setIsCartOpen(true)}
//                 />
//               ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(currentPage - 1)}
//                 className="text-xs sm:text-sm px-2 sm:px-3"
//               >
//                 <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
//               </Button>
              
//               <div className="flex gap-1 sm:gap-2">
//                 {(isMobile ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((page) => (
//                   <Button
//                     key={page}
//                     variant={page === currentPage ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setCurrentPage(page)}
//                     className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
//                   >
//                     {page}
//                   </Button>
//                 ))}
//               </div>
              
//               <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">...</span>
//               <Button 
//                 variant="outline" 
//                 size="sm"
//                 className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
//               >
//                 {totalPages}
//               </Button>
              
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage(currentPage + 1)}
//                 className="text-xs sm:text-sm px-2 sm:px-3"
//               >
//                 <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//     </div>
//   );
// }