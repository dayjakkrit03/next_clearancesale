// v.1.1.17 ===============================================
// src/app/admin/components/AdminProductGrid.tsx

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditable from "./AdminEditable";
import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LayoutGrid, List as ListIcon } from "lucide-react";

/* ================= Types ================= */
export type UIProduct = {
  id: number | string;
  name: string;
  brand?: string;
  sku?: string;
  price: number;
  discountPercent?: number; // 0..100
  image_url?: string;
  visible?: boolean;
  order?: number;

  rating?: number;
  reviews?: number;

  category_id?: number | string;
  uom?: string; // <<< หน่วยสินค้า
};

type UIMeta = { title: string; subtitle: string };
type UICategoryLite = { id: number | string; name: string; slug?: string };

// ใช้เฉพาะฟิลด์จำเป็นจาก discount rules
type DiscountRuleLite = {
  id: number | string;
  minPercent: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  enabled: boolean;
};

type ListResponse = {
  items: UIProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
  meta?: UIMeta;
};

const API_BASE = "/api/mock/products";
const CAT_API = "/api/mock/categories";
const RULES_API = "/api/mock/discount-rules";

/* =============== Helpers =============== */
function calcOriginalPrice(price: number, discountPercent?: number) {
  if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
  const original = Math.round(price / (1 - discountPercent / 100));
  return original > price ? original : undefined;
}

function frameBorderClass(p?: number) {
  if (!p || p < 10) return "border-transparent";
  if (p >= 90) return "border-red-500";
  if (p >= 80) return "border-yellow-500";
  if (p >= 70) return "border-amber-500";
  if (p >= 60) return "border-sky-500";
  return "border-slate-300";
}

function Stars({ rating = 0 }: { rating?: number }) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
            fill={filled ? "currentColor" : "none"}
            stroke={filled ? "none" : "currentColor"}
            strokeWidth={filled ? 0 : 1.3}
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
          </svg>
        );
      })}
    </div>
  );
}

function brandLogoPath(brand?: string): string | null {
  if (!brand) return null;
  const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const map: Record<string, string> = {
    commscope: "commscope",
    commscopee: "commscope",
    commscopex: "commscope",
    germanyrack: "germanyrack",
    link: "link",
    commscopee1: "commscope",
  };
  const slug = map[key] ?? key;
  return `/brand_logo/${slug}_logo.png`;
}

/* =============== Sortable Card (with selection & inline edit) =============== */
function SortableProduct({
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
  onInlineChange?: (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const isHidden = item.visible === false;
  const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

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
          <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
            <Image
              src={item.image_url ?? "/placeholder.png"}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {selectable && (
              <label className="absolute top-2 left-2 z-20 bg-white/90 rounded-md px-1.5 py-1 shadow-soft flex items-center gap-1">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!selected}
                  onChange={(e) => onSelectToggle?.(item.id, e.target.checked)}
                />
                <span className="text-xs">เลือก</span>
              </label>
            )}

            {/* กรอบ/ส่วนลด/โลโก้ */}
            {frameRule ? (
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
              />
            ) : (
              <div className={["pointer-events-none absolute inset-0 rounded-xl border-2", frameBorderClass(item.discountPercent)].join(" ")} />
            )}

            {!!item.discountPercent && item.discountPercent > 0 && (
              <span className="absolute top-2 left-2 translate-y-[34px] bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
                -{item.discountPercent}%
              </span>
            )}

            {(() => {
              const logo = brandLogoPath(item.brand);
              return logo ? (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
                    <img
                      src={logo}
                      alt={item.brand ?? "brand"}
                      className="h-7 w-auto max-w-[72px] object-contain"
                      onError={(e) => {
                        (e.currentTarget.style.display = "none");
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : null;
            })()}

            {isHidden && (
              <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
                HIDDEN
              </span>
            )}
          </div>

          <div className="p-3 sm:p-4 flex flex-col gap-1">
            {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
            {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

            <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
              {item.name}
            </div>

            {(item.rating || item.reviews) && (
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={item.rating} />
                {typeof item.reviews === "number" && <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>}
              </div>
            )}

            {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

            {!quickEdit ? (
              <div className="mt-1 flex items-baseline gap-2">
                <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
                  ฿{Math.round(item.price).toLocaleString("th-TH")}
                </div>
                {originalPrice && <div className="text-[11px] sm:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>}
                {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    defaultValue={item.price}
                    onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
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

/* =============== NEW: SortableProductRow (list view) =============== */
function SortableProductRow({
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
}: Parameters<typeof SortableProduct>[0]) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const isHidden = item.visible === false;
  const originalPrice = calcOriginalPrice(item.price, item.discountPercent);

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
          {/* checkbox */}
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

          {/* thumb */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
            <Image
              src={item.image_url ?? "/placeholder.png"}
              alt={item.name}
              fill
              sizes="96px"
              className="object-cover"
            />
            {frameRule ? (
              <div
                className="pointer-events-none absolute inset-0 rounded-lg"
                style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
              />
            ) : (
              <div className={["pointer-events-none absolute inset-0 rounded-lg border-2", frameBorderClass(item.discountPercent)].join(" ")} />
            )}
            {!!item.discountPercent && (
              <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft">
                -{item.discountPercent}%
              </span>
            )}
          </div>

          {/* content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="min-w-0">
                {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
                {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}
                <div className="font-medium text-sm sm:text-base line-clamp-2">{item.name}</div>

                {(item.rating || item.reviews) && (
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={item.rating} />
                    {typeof item.reviews === "number" && <span className="text-[11px] text-muted-foreground">({item.reviews})</span>}
                  </div>
                )}
                {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}
                {item.uom && <div className="text-[11px] text-muted-foreground">หน่วย: {item.uom}</div>}
              </div>

              {/* price / quick edit */}
              {!quickEdit ? (
                <div className="text-right shrink-0">
                  <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
                    ฿{Math.round(item.price).toLocaleString("th-TH")}
                  </div>
                  {originalPrice && (
                    <div className="text-xs text-muted-foreground line-through">
                      ฿{originalPrice.toLocaleString("th-TH")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 w-[240px] shrink-0">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">ราคา</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      defaultValue={item.price}
                      onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
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

/* ================= Main Grid ================= */
export default function AdminProductGrid({
  initial,
  initialMeta,
}: {
  initial: UIProduct[];
  initialMeta?: UIMeta;
}) {
  const [items, setItems] = useState<UIProduct[]>(initial);
  const [meta, setMeta] = useState<UIMeta>(
    initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
  );
  const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
  const [rules, setRules] = useState<DiscountRuleLite[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaSaving, setMetaSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
  const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
  const [creating, setCreating] = useState(false);

  // ====== ฟิลเตอร์/ค้นหา/เรียง/แบ่งหน้า ======
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [categoryId, setCategoryId] = useState<string | number | undefined>(undefined);
  const [includeHidden, setIncludeHidden] = useState<"all" | "visibleOnly">("all");

  const [sort, setSort] = useState<"order" | "price" | "name">("order");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [total, setTotal] = useState(0);

  // ====== Bulk select & Quick edit ======
  const [selected, setSelected] = useState<Set<UIProduct["id"]>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [quickEdit, setQuickEdit] = useState(false);

  // ====== NEW: view mode (grid | list) ======
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ====== Bulk change category ======
  const [bulkCat, setBulkCat] = useState<string>("");

  // debounce คำค้น
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => setItems(initial), [initial]);

  useEffect(() => {
    if (!initialMeta) {
      (async () => {
        try {
          const res = await fetch(API_BASE, { cache: "no-store" });
        if (!res.ok) return;
          const data: ListResponse = await res.json();
          if (data?.meta) setMeta(data.meta as UIMeta);
        } catch {}
      })();
    }

    (async () => {
      try {
        const res = await fetch(CAT_API, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
        const map: Record<string | number, UICategoryLite> = {};
        for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
        setCatMap(map);
      } catch {}
    })();

    (async () => {
      try {
        const res = await fetch(RULES_API, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: DiscountRuleLite[] = (data?.items ?? [])
          .filter((r: any) => r && r.enabled)
          .map((r: any) => ({
            id: r.id,
            minPercent: Number(r.minPercent) || 0,
            maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
            borderWidth: Number(r.borderWidth) || 2,
            borderColorHex: String(r.borderColorHex || "#000000"),
            enabled: !!r.enabled,
          }));
        setRules(list);
      } catch {}
    })();
  }, [initialMeta]);

  const categoryOptions = useMemo(() => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })), [catMap]);

  const pickRule = useMemo(() => {
    const active = rules;
    return (percent?: number): DiscountRuleLite | null => {
      if (percent == null) return null;
      for (const r of active) {
        const lowerOk = percent >= (r.minPercent ?? 0);
        const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
        if (lowerOk && upperOk) return r;
      }
      return null;
    };
  }, [rules]);

  const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
  const saveAbortRef = useRef<AbortController | null>(null);
  const reorderTimer = useRef<NodeJS.Timeout | null>(null);
  const metaTimer = useRef<NodeJS.Timeout | null>(null);
  const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

  // ====== โหลดรายการตามฟิลเตอร์ ======
  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (qDebounced) params.set("q", qDebounced);
      if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
      params.set("sort", sort);
      params.set("order", order);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("includeHidden", includeHidden === "all" ? "1" : "0");

      const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed");
      const data: ListResponse = await res.json();

      setItems(data.items ?? []);
      setTotal(data.total ?? (data.items?.length ?? 0));

      setSelected(new Set());
      setSelectMode(false);
    } catch (e: any) {
      setError(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, categoryId, sort, order, page, pageSize, includeHidden]);

  const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    lastOrdersRef.current = orders;
    reorderTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        setError(null);
        saveAbortRef.current?.abort();
        saveAbortRef.current = new AbortController();

        const res = await fetch(`${API_BASE}/reorder`, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ orders: lastOrdersRef.current }),
          signal: saveAbortRef.current.signal,
        });
        if (!res.ok) throw new Error("REORDER failed");
      } catch (e: any) {
        setError(e?.message ?? "Reorder failed");
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const patchMeta = (patch: Partial<UIMeta>) => {
    if (metaTimer.current) clearTimeout(metaTimer.current);
    setMeta((m) => ({ ...m, ...patch }));

    metaTimer.current = setTimeout(async () => {
      try {
        setMetaSaving(true);
        const res = await fetch(`${API_BASE}/meta`, {
          method: "PATCH",
          headers: jsonHeaders,
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Update meta failed");
      } catch {
      } finally {
        setMetaSaving(false);
      }
    }, 500);
  };

  const handleDelete = async (id: UIProduct["id"]) => {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
      fetchList();
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: UIProduct["id"]) => {
    const snapshot = items;
    const current = snapshot.find((x) => x.id === id);
    const nextVisible = !(current?.visible ?? true);

    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ visible: nextVisible }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
    setItems(next);
    postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
  };

  const saveCreate = async (values: ProductEditValues) => {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        ...values,
        visible: false,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Create failed");
    }
    await fetchList();
  };

  const saveEdit = async (values: ProductEditValues) => {
    if (!editingItem) return;
    const id = editingItem.id;

    const snapshot = items;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("PATCH failed");
      await fetchList();
    } catch (e: any) {
      setItems(snapshot);
      throw e;
    }
  };

  // ===== Quick edit: inline PATCH (optimistic) =====
  const handleInlineChange = async (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e) {
      await fetchList();
    }
  };

  // ===== Bulk actions =====
  const selectedCount = selected.size;
  const visibleIdsOnPage = items.map((i) => i.id);

  const toggleSelect = (id: UIProduct["id"], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectAllThisPage = () => {
    setSelected(new Set(visibleIdsOnPage));
    setSelectMode(true);
  };
  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
    setBulkCat("");
  };

  const bulkPatchVisible = async (visible: boolean) => {
    if (!selectedCount) return;
    setSaving(true);
    setError(null);
    try {
      const ids = Array.from(selected);
      // optimistic
      setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, visible } : x)));
      await Promise.allSettled(
        ids.map((id) =>
          fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify({ visible }),
          })
        )
      );
      await fetchList();
      clearSelection();
    } catch (e: any) {
      setError(e?.message ?? "Bulk update failed");
    } finally {
      setSaving(false);
    }
  };

  // แปลงค่าหมวดจาก string -> number|strings ตามที่ API รองรับ
  const parseCategoryValue = (v: string) => {
    if (v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && String(n) === v ? n : v;
  };

  const bulkChangeCategory = async () => {
    if (!selectedCount) return;
    const parsed = parseCategoryValue(bulkCat);
    if (typeof parsed === "undefined") return;

    setSaving(true);
    setError(null);
    try {
      const ids = Array.from(selected);

      // optimistic
      setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, category_id: parsed } : x)));

      await Promise.allSettled(
        ids.map((id) =>
          fetch(`${API_BASE}/${id}`, {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify({ category_id: parsed }),
          })
        )
      );

      await fetchList();
      clearSelection();
      setBulkCat("");
    } catch (e: any) {
      setError(e?.message ?? "Bulk change category failed");
    } finally {
      setSaving(false);
    }
  };

  // UI helpers
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <section className="py-4 relative">
      {(saving || metaSaving || loading) && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
          {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
          {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
          {loading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header + Add */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-2xl font-semibold mb-2">
            <input
              className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
              value={meta.title}
              onChange={(e) => patchMeta({ title: e.target.value })}
              aria-label="Title"
            />
          </div>
          <input
            className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
            value={meta.subtitle}
            onChange={(e) => patchMeta({ subtitle: e.target.value })}
            aria-label="Subtitle"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* view switch */}
          <div className="inline-flex rounded-md border overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setViewMode("grid")}
              title="มุมมองกริด"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setViewMode("list")}
              title="มุมมองรายการ"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm ${quickEdit ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setQuickEdit((v) => !v)}
          >
            {quickEdit ? "ปิด Quick edit" : "Quick edit"}
          </button>
          <button
            type="button"
            className={`rounded-md border px-3 py-2 text-sm ${selectMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setSelectMode((v) => !v)}
          >
            {selectMode ? "ปิดโหมดเลือก" : "เลือกหลายรายการ"}
          </button>
          <button
            type="button"
            className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
            onClick={() => setCreating(true)}
          >
            + เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Toolbar: ค้นหา / หมวด / แสดง / เรียง */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
        />

        <select
          value={String(categoryId ?? "")}
          onChange={(e) => {
            const v = e.target.value;
            const n = Number(v);
            setCategoryId(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categoryOptions.map((c) => (
            <option key={String(c.id)} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={includeHidden}
          onChange={(e) => {
            setIncludeHidden(e.target.value as "all" | "visibleOnly");
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">แสดงทั้งหมด</option>
          <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
        </select>

        <select
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
            setSort(s);
            setOrder(o);
            setPage(1);
          }}
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="order:asc">เรียงตามลำดับ</option>
          <option value="price:asc">ราคาต่ำ → สูง</option>
          <option value="price:desc">ราคาสูง → ต่ำ</option>
          <option value="name:asc">ชื่อ A → Z</option>
          <option value="name:desc">ชื่อ Z → A</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {selectMode && (
        <div className="mb-4 flex flex-col gap-3 rounded-md border px-3 py-2 bg-muted/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={selectAllThisPage}>
                เลือกทั้งหมดในหน้านี้
              </button>
              <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={clearSelection}>
                ล้างการเลือก
              </button>
              <span className="text-muted-foreground">เลือกแล้ว: {selectedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
                onClick={() => bulkPatchVisible(false)}
                disabled={!selectedCount}
              >
                ซ่อน (Bulk)
              </button>
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
                onClick={() => bulkPatchVisible(true)}
                disabled={!selectedCount}
              >
                แสดง (Bulk)
              </button>
              <button
                className="rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-white"
                onClick={async () => {
                  if (!selectedCount) return;
                  if (!confirm(`ยืนยันลบ ${selectedCount} รายการ?`)) return;
                  setSaving(true);
                  setError(null);
                  try {
                    const ids = Array.from(selected);
                    setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
                    await Promise.allSettled(ids.map((id) => fetch(`${API_BASE}/${id}`, { method: "DELETE" })));
                    await fetchList();
                    clearSelection();
                  } catch (e: any) {
                    setError(e?.message ?? "Bulk delete failed");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!selectedCount}
              >
                ลบ (Bulk)
              </button>
            </div>
          </div>

          {/* Bulk move category */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground">ย้ายหมวดหมู่:</label>
            <select
              className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 min-w-[220px]"
              value={bulkCat}
              onChange={(e) => setBulkCat(e.target.value)}
            >
              <option value="">— เลือกหมวดปลายทาง —</option>
              {categoryOptions.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
              onClick={bulkChangeCategory}
              disabled={!selectedCount || !bulkCat}
              title={!bulkCat ? "กรุณาเลือกหมวดปลายทาง" : ""}
            >
              ย้ายหมวด (Bulk)
            </button>
          </div>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
              {items.map((item) => {
                const rule = pickRule(item.discountPercent);
                return (
                  <SortableProduct
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onToggleVisible={handleToggle}
                    onEdit={(id) => setEditingId(id)}
                    categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
                    frameRule={rule}
                    selectable={selectMode}
                    selected={selected.has(item.id)}
                    onSelectToggle={toggleSelect}
                    quickEdit={quickEdit}
                    onInlineChange={handleInlineChange}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const rule = pickRule(item.discountPercent);
                return (
                  <SortableProductRow
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onToggleVisible={handleToggle}
                    onEdit={(id) => setEditingId(id)}
                    categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
                    frameRule={rule}
                    selectable={selectMode}
                    selected={selected.has(item.id)}
                    onSelectToggle={toggleSelect}
                    quickEdit={quickEdit}
                    onInlineChange={handleInlineChange}
                  />
                );
              })}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {/* Footer: จำนวน/หน้า + เปลี่ยน page/pageSize */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          แสดง {items.length.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า {page}/{Math.max(1, Math.ceil((total || 0) / pageSize))}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) || 24);
              setPage(1);
            }}
          >
            {[12, 24, 36, 48].map((n) => (
              <option key={n} value={n}>
                {n}/หน้า
              </option>
            ))}
          </select>
          <button
            className="rounded-md border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
          >
            ← ก่อนหน้า
          </button>
          <button
            className="rounded-md border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!canNext}
          >
            ถัดไป →
          </button>
        </div>
      </div>

      {/* Create */}
      <AdminProductEditDialog
        open={creating}
        initial={{
          name: "",
          brand: "",
          sku: "",
          price: 0,
          discountPercent: 0,
          image_url: undefined,
          category_id: undefined,
          rating: 0,
          reviews: 0,
          uom: "",
        }}
        onClose={() => setCreating(false)}
        onSave={async (vals) => {
          await saveCreate(vals);
          setCreating(false);
        }}
        mode="create"
        categories={categoryOptions}
      />

      {/* Edit */}
      <AdminProductEditDialog
        open={!!editingItem}
        initial={
          editingItem
            ? {
                name: editingItem.name,
                brand: editingItem.brand ?? "",
                sku: editingItem.sku ?? "",
                price: editingItem.price,
                discountPercent: editingItem.discountPercent ?? 0,
                image_url: editingItem.image_url,
                category_id: editingItem.category_id,
                rating: editingItem.rating ?? 0,
                reviews: editingItem.reviews ?? 0,
                uom: editingItem.uom ?? "",
              }
            : {
                name: "",
                brand: "",
                sku: "",
                price: 0,
                discountPercent: 0,
                category_id: undefined,
                rating: 0,
                reviews: 0,
                uom: "",
              }
        }
        onClose={() => setEditingId(null)}
        onSave={async (vals) => {
          await saveEdit(vals);
          setEditingId(null);
        }}
        mode="edit"
        categories={categoryOptions}
      />
    </section>
  );
}

// v.1.1.17 ===============================================


// v.1.1.16 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";


// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // ใช้เฉพาะฟิลด์จำเป็นจาก discount rules
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total?: number;
//   page?: number;
//   pageSize?: number;
//   meta?: UIMeta;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (with selection & inline edit) =============== */
// function SortableProduct({
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

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

//             {/* กรอบ/ส่วนลด/โลโก้ */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
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
//                     <img
//                       src={logo}
//                       alt={item.brand ?? "brand"}
//                       className="h-7 w-auto max-w-[72px] object-contain"
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
//               {item.name}
//             </div>

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
//                   <input
//                     type="number"
//                     step="0.01"
//                     className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                     defaultValue={item.price}
//                     onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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

// /* =============== NEW: SortableProductRow (list view) =============== */
// function SortableProductRow({
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
// }: Parameters<typeof SortableProduct>[0]) {
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
//         <div
//           className={[
//             "relative flex items-stretch gap-3 rounded-xl bg-card shadow-soft transition-all overflow-hidden p-3 sm:p-4",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* checkbox */}
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

//           {/* thumb */}
//           <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="96px"
//               className="object-cover"
//             />
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-lg"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div className={["pointer-events-none absolute inset-0 rounded-lg border-2", frameBorderClass(item.discountPercent)].join(" ")} />
//             )}
//             {!!item.discountPercent && (
//               <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 text-[10px] font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//           </div>

//           {/* content */}
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

//               {/* price / quick edit */}
//               {!quickEdit ? (
//                 <div className="text-right shrink-0">
//                   <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
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
//                       onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] text-muted-foreground mb-1">ส่วนลด (%)</label>
//                     <input
//                       type="number"
//                       min={0}
//                       max={100}
//                       className="w-full rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
//                       defaultValue={item.discountPercent ?? 0}
//                       onBlur={(e) =>
//                         onInlineChange?.(item.id, {
//                           discountPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
//                         })
//                       }
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                       }}
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

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   // ====== ฟิลเตอร์/ค้นหา/เรียง/แบ่งหน้า ======
//   const [q, setQ] = useState("");
//   const [qDebounced, setQDebounced] = useState("");
//   const [categoryId, setCategoryId] = useState<string | number | undefined>(undefined);
//   const [includeHidden, setIncludeHidden] = useState<"all" | "visibleOnly">("all");

//   const [sort, setSort] = useState<"order" | "price" | "name">("order");
//   const [order, setOrder] = useState<"asc" | "desc">("asc");

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const [total, setTotal] = useState(0);

//   // ====== Bulk select & Quick edit ======
//   const [selected, setSelected] = useState<Set<UIProduct["id"]>>(new Set());
//   const [selectMode, setSelectMode] = useState(false);
//   const [quickEdit, setQuickEdit] = useState(false);

//   // ====== NEW: view mode (grid | list) ======
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

//   // ====== Bulk change category ======
//   const [bulkCat, setBulkCat] = useState<string>("");

//   // debounce คำค้น
//   useEffect(() => {
//     const t = setTimeout(() => setQDebounced(q.trim()), 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//           const data: ListResponse = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const categoryOptions = useMemo(() => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })), [catMap]);

//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   // ====== โหลดรายการตามฟิลเตอร์ ======
//   async function fetchList() {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       if (qDebounced) params.set("q", qDebounced);
//       if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
//       params.set("sort", sort);
//       params.set("order", order);
//       params.set("page", String(page));
//       params.set("pageSize", String(pageSize));
//       params.set("includeHidden", includeHidden === "all" ? "1" : "0");

//       const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: "no-store" });
//       if (!res.ok) throw new Error("Fetch failed");
//       const data: ListResponse = await res.json();

//       setItems(data.items ?? []);
//       setTotal(data.total ?? (data.items?.length ?? 0));

//       setSelected(new Set());
//       setSelectMode(false);
//     } catch (e: any) {
//       setError(e?.message ?? "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [qDebounced, categoryId, sort, order, page, pageSize, includeHidden]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//       fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false,
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     await fetchList();
//   };

//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//       await fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   // ===== Quick edit: inline PATCH (optimistic) =====
//   const handleInlineChange = async (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => {
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(patch),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e) {
//       await fetchList();
//     }
//   };

//   // ===== Bulk actions =====
//   const selectedCount = selected.size;
//   const visibleIdsOnPage = items.map((i) => i.id);

//   const toggleSelect = (id: UIProduct["id"], checked: boolean) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   const selectAllThisPage = () => {
//     setSelected(new Set(visibleIdsOnPage));
//     setSelectMode(true);
//   };
//   const clearSelection = () => {
//     setSelected(new Set());
//     setSelectMode(false);
//     setBulkCat("");
//   };

//   const bulkPatchVisible = async (visible: boolean) => {
//     if (!selectedCount) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const ids = Array.from(selected);
//       // optimistic
//       setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, visible } : x)));
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`${API_BASE}/${id}`, {
//             method: "PATCH",
//             headers: jsonHeaders,
//             body: JSON.stringify({ visible }),
//           })
//         )
//       );
//       await fetchList();
//       clearSelection();
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // แปลงค่าหมวดจาก string -> number|strings ตามที่ API รองรับ
//   const parseCategoryValue = (v: string) => {
//     if (v === "") return undefined;
//     const n = Number(v);
//     return Number.isFinite(n) && String(n) === v ? n : v;
//   };

//   const bulkChangeCategory = async () => {
//     if (!selectedCount) return;
//     const parsed = parseCategoryValue(bulkCat);
//     if (typeof parsed === "undefined") return;

//     setSaving(true);
//     setError(null);
//     try {
//       const ids = Array.from(selected);

//       // optimistic
//       setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, category_id: parsed } : x)));

//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`${API_BASE}/${id}`, {
//             method: "PATCH",
//             headers: jsonHeaders,
//             body: JSON.stringify({ category_id: parsed }),
//           })
//         )
//       );

//       await fetchList();
//       clearSelection();
//       setBulkCat("");
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk change category failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // UI helpers
//   const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
//   const canPrev = page > 1;
//   const canNext = page < totalPages;

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving || loading) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
//           {loading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           {/* view switch */}
//           <div className="inline-flex rounded-md border overflow-hidden">
//             <button
//               className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//               onClick={() => setViewMode("grid")}
//               title="มุมมองกริด"
//             >
//               กริด
//             </button>
//             <button
//               className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//               onClick={() => setViewMode("list")}
//               title="มุมมองรายการ"
//             >
//               รายการ
//             </button>
//           </div>

//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${quickEdit ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setQuickEdit((v) => !v)}
//           >
//             {quickEdit ? "ปิด Quick edit" : "Quick edit"}
//           </button>
//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${selectMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setSelectMode((v) => !v)}
//           >
//             {selectMode ? "ปิดโหมดเลือก" : "เลือกหลายรายการ"}
//           </button>
//           <button
//             type="button"
//             className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//             onClick={() => setCreating(true)}
//           >
//             + เพิ่มสินค้า
//           </button>
//         </div>
//       </div>

//       {/* Toolbar: ค้นหา / หมวด / แสดง / เรียง */}
//       <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
//         <input
//           value={q}
//           onChange={(e) => {
//             setQ(e.target.value);
//             setPage(1);
//           }}
//           placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         />

//         <select
//           value={String(categoryId ?? "")}
//           onChange={(e) => {
//             const v = e.target.value;
//             const n = Number(v);
//             setCategoryId(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="">ทุกหมวดหมู่</option>
//           {categoryOptions.map((c) => (
//             <option key={String(c.id)} value={String(c.id)}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={includeHidden}
//           onChange={(e) => {
//             setIncludeHidden(e.target.value as "all" | "visibleOnly");
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="all">แสดงทั้งหมด</option>
//           <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
//         </select>

//         <select
//           value={`${sort}:${order}`}
//           onChange={(e) => {
//             const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
//             setSort(s);
//             setOrder(o);
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="order:asc">เรียงตามลำดับ</option>
//           <option value="price:asc">ราคาต่ำ → สูง</option>
//           <option value="price:desc">ราคาสูง → ต่ำ</option>
//           <option value="name:asc">ชื่อ A → Z</option>
//           <option value="name:desc">ชื่อ Z → A</option>
//         </select>
//       </div>

//       {/* Bulk actions bar */}
//       {selectMode && (
//         <div className="mb-4 flex flex-col gap-3 rounded-md border px-3 py-2 bg-muted/50">
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <div className="flex items-center gap-2 text-sm">
//               <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={selectAllThisPage}>
//                 เลือกทั้งหมดในหน้านี้
//               </button>
//               <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={clearSelection}>
//                 ล้างการเลือก
//               </button>
//               <span className="text-muted-foreground">เลือกแล้ว: {selectedCount}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={() => bulkPatchVisible(false)}
//                 disabled={!selectedCount}
//               >
//                 ซ่อน (Bulk)
//               </button>
//               <button
//                 className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={() => bulkPatchVisible(true)}
//                 disabled={!selectedCount}
//               >
//                 แสดง (Bulk)
//               </button>
//               <button
//                 className="rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={async () => {
//                   if (!selectedCount) return;
//                   if (!confirm(`ยืนยันลบ ${selectedCount} รายการ?`)) return;
//                   setSaving(true);
//                   setError(null);
//                   try {
//                     const ids = Array.from(selected);
//                     setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
//                     await Promise.allSettled(ids.map((id) => fetch(`${API_BASE}/${id}`, { method: "DELETE" })));
//                     await fetchList();
//                     clearSelection();
//                   } catch (e: any) {
//                     setError(e?.message ?? "Bulk delete failed");
//                   } finally {
//                     setSaving(false);
//                   }
//                 }}
//                 disabled={!selectedCount}
//               >
//                 ลบ (Bulk)
//               </button>
//             </div>
//           </div>

//           {/* Bulk move category */}
//           <div className="flex flex-wrap items-center gap-2">
//             <label className="text-sm text-muted-foreground">ย้ายหมวดหมู่:</label>
//             <select
//               className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 min-w-[220px]"
//               value={bulkCat}
//               onChange={(e) => setBulkCat(e.target.value)}
//             >
//               <option value="">— เลือกหมวดปลายทาง —</option>
//               {categoryOptions.map((c) => (
//                 <option key={String(c.id)} value={String(c.id)}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//             <button
//               className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//               onClick={bulkChangeCategory}
//               disabled={!selectedCount || !bulkCat}
//               title={!bulkCat ? "กรุณาเลือกหมวดปลายทาง" : ""}
//             >
//               ย้ายหมวด (Bulk)
//             </button>
//           </div>
//         </div>
//       )}

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           {viewMode === "grid" ? (
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//               {items.map((item) => {
//                 const rule = pickRule(item.discountPercent);
//                 return (
//                   <SortableProduct
//                     key={item.id}
//                     item={item}
//                     onDelete={handleDelete}
//                     onToggleVisible={handleToggle}
//                     onEdit={(id) => setEditingId(id)}
//                     categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                     frameRule={rule}
//                     selectable={selectMode}
//                     selected={selected.has(item.id)}
//                     onSelectToggle={toggleSelect}
//                     quickEdit={quickEdit}
//                     onInlineChange={handleInlineChange}
//                   />
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {items.map((item) => {
//                 const rule = pickRule(item.discountPercent);
//                 return (
//                   <SortableProductRow
//                     key={item.id}
//                     item={item}
//                     onDelete={handleDelete}
//                     onToggleVisible={handleToggle}
//                     onEdit={(id) => setEditingId(id)}
//                     categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                     frameRule={rule}
//                     selectable={selectMode}
//                     selected={selected.has(item.id)}
//                     onSelectToggle={toggleSelect}
//                     quickEdit={quickEdit}
//                     onInlineChange={handleInlineChange}
//                   />
//                 );
//               })}
//             </div>
//           )}
//         </SortableContext>
//       </DndContext>

//       {/* Footer: จำนวน/หน้า + เปลี่ยน page/pageSize */}
//       <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
//         <div className="text-muted-foreground">
//           แสดง {items.length.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า {page}/{Math.max(1, Math.ceil((total || 0) / pageSize))}
//         </div>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-md border px-2 py-1"
//             value={pageSize}
//             onChange={(e) => {
//               setPageSize(Number(e.target.value) || 24);
//               setPage(1);
//             }}
//           >
//             {[12, 24, 36, 48].map((n) => (
//               <option key={n} value={n}>
//                 {n}/หน้า
//               </option>
//             ))}
//           </select>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={!canPrev}
//           >
//             ← ก่อนหน้า
//           </button>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={!canNext}
//           >
//             ถัดไป →
//           </button>
//         </div>
//       </div>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.16 ===============================================

// v.1.1.15 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // ใช้เฉพาะฟิลด์จำเป็นจาก discount rules
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total?: number;
//   page?: number;
//   pageSize?: number;
//   meta?: UIMeta;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (with selection & inline edit) =============== */
// function SortableProduct({
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

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

//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
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
//                     <img
//                       src={logo}
//                       alt={item.brand ?? "brand"}
//                       className="h-7 w-auto max-w-[72px] object-contain"
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>}
//               </div>
//             )}

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             {!quickEdit ? (
//               <div className="mt-1 flex items-baseline gap-2">
//                 <div className={calcOriginalPrice(item.price, item.discountPercent) ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                   ฿{Math.round(item.price).toLocaleString("th-TH")}
//                 </div>
//                 {originalPrice && <div className="text-[11px] sm:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>}
//                 {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
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
//                     onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   // ====== ฟิลเตอร์/ค้นหา/เรียง/แบ่งหน้า ======
//   const [q, setQ] = useState("");
//   const [qDebounced, setQDebounced] = useState("");
//   const [categoryId, setCategoryId] = useState<string | number | undefined>(undefined);
//   const [includeHidden, setIncludeHidden] = useState<"all" | "visibleOnly">("all");

//   const [sort, setSort] = useState<"order" | "price" | "name">("order");
//   const [order, setOrder] = useState<"asc" | "desc">("asc");

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const [total, setTotal] = useState(0);

//   // ====== Bulk select & Quick edit ======
//   const [selected, setSelected] = useState<Set<UIProduct["id"]>>(new Set());
//   const [selectMode, setSelectMode] = useState(false);
//   const [quickEdit, setQuickEdit] = useState(false);

//   // ====== Bulk change category (NEW) ======
//   const [bulkCat, setBulkCat] = useState<string>(""); // เก็บค่าเป็น string ใน select

//   // debounce คำค้น
//   useEffect(() => {
//     const t = setTimeout(() => setQDebounced(q.trim()), 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data: ListResponse = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const categoryOptions = useMemo(() => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })), [catMap]);

//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   // ====== โหลดรายการตามฟิลเตอร์ ======
//   async function fetchList() {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       if (qDebounced) params.set("q", qDebounced);
//       if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
//       params.set("sort", sort);
//       params.set("order", order);
//       params.set("page", String(page));
//       params.set("pageSize", String(pageSize));
//       params.set("includeHidden", includeHidden === "all" ? "1" : "0");

//       const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: "no-store" });
//       if (!res.ok) throw new Error("Fetch failed");
//       const data: ListResponse = await res.json();

//       setItems(data.items ?? []);
//       setTotal(data.total ?? (data.items?.length ?? 0));

//       setSelected(new Set());
//       setSelectMode(false);
//     } catch (e: any) {
//       setError(e?.message ?? "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [qDebounced, categoryId, sort, order, page, pageSize, includeHidden]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//       fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false,
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     await fetchList();
//   };

//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//       await fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   // ===== Quick edit: inline PATCH (optimistic) =====
//   const handleInlineChange = async (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => {
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(patch),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e) {
//       await fetchList();
//     }
//   };

//   // ===== Bulk actions =====
//   const selectedCount = selected.size;
//   const visibleIdsOnPage = items.map((i) => i.id);

//   const toggleSelect = (id: UIProduct["id"], checked: boolean) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   const selectAllThisPage = () => {
//     setSelected(new Set(visibleIdsOnPage));
//     setSelectMode(true);
//   };
//   const clearSelection = () => {
//     setSelected(new Set());
//     setSelectMode(false);
//     setBulkCat("");
//   };

//   const bulkPatchVisible = async (visible: boolean) => {
//     if (!selectedCount) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const ids = Array.from(selected);
//       // optimistic
//       setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, visible } : x)));
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`${API_BASE}/${id}`, {
//             method: "PATCH",
//             headers: jsonHeaders,
//             body: JSON.stringify({ visible }),
//           })
//         )
//       );
//       await fetchList();
//       clearSelection();
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // แปลงค่าหมวดจาก string -> number|strings ตามที่ API รองรับ
//   const parseCategoryValue = (v: string) => {
//     if (v === "") return undefined;
//     const n = Number(v);
//     return Number.isFinite(n) && String(n) === v ? n : v;
//   };

//   const bulkChangeCategory = async () => {
//     if (!selectedCount) return;
//     const parsed = parseCategoryValue(bulkCat);
//     if (typeof parsed === "undefined") return; // ยังไม่เลือก

//     setSaving(true);
//     setError(null);
//     try {
//       const ids = Array.from(selected);

//       // optimistic
//       setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, category_id: parsed } : x)));

//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`${API_BASE}/${id}`, {
//             method: "PATCH",
//             headers: jsonHeaders,
//             body: JSON.stringify({ category_id: parsed }),
//           })
//         )
//       );

//       await fetchList();
//       clearSelection();
//       setBulkCat("");
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk change category failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // UI helpers
//   const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
//   const canPrev = page > 1;
//   const canNext = page < totalPages;

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving || loading) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//           {loading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${quickEdit ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setQuickEdit((v) => !v)}
//           >
//             {quickEdit ? "ปิด Quick edit" : "Quick edit"}
//           </button>
//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${selectMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setSelectMode((v) => !v)}
//           >
//             {selectMode ? "ปิดโหมดเลือก" : "เลือกหลายรายการ"}
//           </button>
//           <button
//             type="button"
//             className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//             onClick={() => setCreating(true)}
//           >
//             + เพิ่มสินค้า
//           </button>
//         </div>
//       </div>

//       {/* Toolbar: ค้นหา / หมวด / แสดง / เรียง */}
//       <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
//         <input
//           value={q}
//           onChange={(e) => {
//             setQ(e.target.value);
//             setPage(1);
//           }}
//           placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         />

//         <select
//           value={String(categoryId ?? "")}
//           onChange={(e) => {
//             const v = e.target.value;
//             const n = Number(v);
//             setCategoryId(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="">ทุกหมวดหมู่</option>
//           {categoryOptions.map((c) => (
//             <option key={String(c.id)} value={String(c.id)}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={includeHidden}
//           onChange={(e) => {
//             setIncludeHidden(e.target.value as "all" | "visibleOnly");
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="all">แสดงทั้งหมด</option>
//           <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
//         </select>

//         <select
//           value={`${sort}:${order}`}
//           onChange={(e) => {
//             const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
//             setSort(s);
//             setOrder(o);
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="order:asc">เรียงตามลำดับ</option>
//           <option value="price:asc">ราคาต่ำ → สูง</option>
//           <option value="price:desc">ราคาสูง → ต่ำ</option>
//           <option value="name:asc">ชื่อ A → Z</option>
//           <option value="name:desc">ชื่อ Z → A</option>
//         </select>
//       </div>

//       {/* Bulk actions bar */}
//       {selectMode && (
//         <div className="mb-4 flex flex-col gap-3 rounded-md border px-3 py-2 bg-muted/50">
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <div className="flex items-center gap-2 text-sm">
//               <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={selectAllThisPage}>
//                 เลือกทั้งหมดในหน้านี้
//               </button>
//               <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={clearSelection}>
//                 ล้างการเลือก
//               </button>
//               <span className="text-muted-foreground">เลือกแล้ว: {selectedCount}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={() => bulkPatchVisible(false)}
//                 disabled={!selectedCount}
//               >
//                 ซ่อน (Bulk)
//               </button>
//               <button
//                 className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={() => bulkPatchVisible(true)}
//                 disabled={!selectedCount}
//               >
//                 แสดง (Bulk)
//               </button>
//               <button
//                 className="rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-white"
//                 onClick={async () => {
//                   if (!selectedCount) return;
//                   if (!confirm(`ยืนยันลบ ${selectedCount} รายการ?`)) return;
//                   setSaving(true);
//                   setError(null);
//                   try {
//                     const ids = Array.from(selected);
//                     setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
//                     await Promise.allSettled(ids.map((id) => fetch(`${API_BASE}/${id}`, { method: "DELETE" })));
//                     await fetchList();
//                     clearSelection();
//                   } catch (e: any) {
//                     setError(e?.message ?? "Bulk delete failed");
//                   } finally {
//                     setSaving(false);
//                   }
//                 }}
//                 disabled={!selectedCount}
//               >
//                 ลบ (Bulk)
//               </button>
//             </div>
//           </div>

//           {/* NEW: Bulk move category */}
//           <div className="flex flex-wrap items-center gap-2">
//             <label className="text-sm text-muted-foreground">ย้ายหมวดหมู่:</label>
//             <select
//               className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 min-w-[220px]"
//               value={bulkCat}
//               onChange={(e) => setBulkCat(e.target.value)}
//             >
//               <option value="">— เลือกหมวดปลายทาง —</option>
//               {categoryOptions.map((c) => (
//                 <option key={String(c.id)} value={String(c.id)}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//             <button
//               className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
//               onClick={bulkChangeCategory}
//               disabled={!selectedCount || !bulkCat}
//               title={!bulkCat ? "กรุณาเลือกหมวดปลายทาง" : ""}
//             >
//               ย้ายหมวด (Bulk)
//             </button>
//           </div>
//         </div>
//       )}

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                   selectable={selectMode}
//                   selected={selected.has(item.id)}
//                   onSelectToggle={toggleSelect}
//                   quickEdit={quickEdit}
//                   onInlineChange={handleInlineChange}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Footer: จำนวน/หน้า + เปลี่ยน page/pageSize */}
//       <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
//         <div className="text-muted-foreground">
//           แสดง {items.length.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า {page}/{Math.max(1, Math.ceil((total || 0) / pageSize))}
//         </div>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-md border px-2 py-1"
//             value={pageSize}
//             onChange={(e) => {
//               setPageSize(Number(e.target.value) || 24);
//               setPage(1);
//             }}
//           >
//             {[12, 24, 36, 48].map((n) => (
//               <option key={n} value={n}>
//                 {n}/หน้า
//               </option>
//             ))}
//           </select>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={!canPrev}
//           >
//             ← ก่อนหน้า
//           </button>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={!canNext}
//           >
//             ถัดไป →
//           </button>
//         </div>
//       </div>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.15 ===============================================

// v.1.1.15 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // ใช้เฉพาะฟิลด์จำเป็นจาก discount rules
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total?: number;
//   page?: number;
//   pageSize?: number;
//   meta?: UIMeta;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill"
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (with selection & inline edit) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
//   // Bulk select
//   selectable,
//   selected,
//   onSelectToggle,
//   // Quick edit
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
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

//             {/* กรอบ overlay: ถ้ามี rule ใช้ค่าจาก rule, ไม่งั้น fallback ใช้ class เดิม */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={["pointer-events-none absolute inset-0 rounded-xl border-2", frameBorderClass(item.discountPercent)].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 translate-y-[34px] bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-xs sm:text-sm font-medium leading-tight line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && <span className="text-[10px] sm:text-[11px] text-muted-foreground">({item.reviews})</span>}
//               </div>
//             )}

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             {/* แสดงราคา/ส่วนลด ปกติ หรือ โหมด quick edit */}
//             {!quickEdit ? (
//               <div className="mt-1 flex items-baseline gap-2">
//                 <div className={calcOriginalPrice(item.price, item.discountPercent) ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                   ฿{Math.round(item.price).toLocaleString("th-TH")}
//                 </div>
//                 {originalPrice && <div className="text-[11px] sm:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>}
//                 {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
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
//                     onBlur={(e) => onInlineChange?.(item.id, { price: Number(e.target.value) || 0 })}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") (e.target as HTMLInputElement).blur();
//                     }}
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

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // rules ส่วนลด
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   // ====== ฟิลเตอร์/ค้นหา/เรียง/แบ่งหน้า ======
//   const [q, setQ] = useState("");
//   const [qDebounced, setQDebounced] = useState("");
//   const [categoryId, setCategoryId] = useState<string | number | undefined>(undefined);
//   const [includeHidden, setIncludeHidden] = useState<"all" | "visibleOnly">("all");

//   const [sort, setSort] = useState<"order" | "price" | "name">("order");
//   const [order, setOrder] = useState<"asc" | "desc">("asc");

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const [total, setTotal] = useState(0);

//   // ====== Bulk select & Quick edit ======
//   const [selected, setSelected] = useState<Set<UIProduct["id"]>>(new Set());
//   const [selectMode, setSelectMode] = useState(false);
//   const [quickEdit, setQuickEdit] = useState(false);

//   // debounce คำค้น
//   useEffect(() => {
//     const t = setTimeout(() => setQDebounced(q.trim()), 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//           const data: ListResponse = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // โหลดกฎส่วนลด
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // options สำหรับ Dialog
//   const categoryOptions = useMemo(() => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })), [catMap]);

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   // ====== โหลดรายการตามฟิลเตอร์ ======
//   async function fetchList() {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       if (qDebounced) params.set("q", qDebounced);
//       if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
//       params.set("sort", sort);
//       params.set("order", order);
//       params.set("page", String(page));
//       params.set("pageSize", String(pageSize));
//       params.set("includeHidden", includeHidden === "all" ? "1" : "0");

//       const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: "no-store" });
//       if (!res.ok) throw new Error("Fetch failed");
//       const data: ListResponse = await res.json();

//       setItems(data.items ?? []);
//       setTotal(data.total ?? (data.items?.length ?? 0));

//       // เมื่อมีการโหลดหน้ารายการใหม่ ให้ยกเลิกการเลือกทั้งหมดเพื่อกัน งง
//       setSelected(new Set());
//       setSelectMode(false);
//     } catch (e: any) {
//       setError(e?.message ?? "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // re-fetch เมื่อฟิลเตอร์/หน้าเปลี่ยน
//   useEffect(() => {
//     fetchList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [qDebounced, categoryId, sort, order, page, pageSize, includeHidden]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//       fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     await fetchList();
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//       await fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   // ===== Quick edit: inline PATCH (optimistic) =====
//   const handleInlineChange = async (id: UIProduct["id"], patch: Partial<Pick<UIProduct, "price" | "discountPercent">>) => {
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(patch),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e) {
//       // ถ้าพลาด รีเฟตช์ย้อนกลับให้ตรง server
//       await fetchList();
//     }
//   };

//   // ===== Bulk actions =====
//   const selectedCount = selected.size;
//   const visibleIdsOnPage = items.map((i) => i.id);

//   const toggleSelect = (id: UIProduct["id"], checked: boolean) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   const selectAllThisPage = () => {
//     setSelected(new Set(visibleIdsOnPage));
//     setSelectMode(true);
//   };
//   const clearSelection = () => {
//     setSelected(new Set());
//     setSelectMode(false);
//   };

//   const bulkPatchVisible = async (visible: boolean) => {
//     if (!selectedCount) return;
//     setSaving(true);
//     setError(null);
//     try {
//       // optimistic
//       const ids = Array.from(selected);
//       setItems((prev) => prev.map((x) => (ids.includes(x.id) ? { ...x, visible } : x)));
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`${API_BASE}/${id}`, {
//             method: "PATCH",
//             headers: jsonHeaders,
//             body: JSON.stringify({ visible }),
//           })
//         )
//       );
//       await fetchList();
//       clearSelection();
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const bulkDelete = async () => {
//     if (!selectedCount) return;
//     if (!confirm(`ยืนยันลบ ${selectedCount} รายการ?`)) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const ids = Array.from(selected);
//       // optimistic
//       setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
//       await Promise.allSettled(ids.map((id) => fetch(`${API_BASE}/${id}`, { method: "DELETE" })));
//       await fetchList();
//       clearSelection();
//     } catch (e: any) {
//       setError(e?.message ?? "Bulk delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // UI helpers
//   const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
//   const canPrev = page > 1;
//   const canNext = page < totalPages;

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving || loading) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//           {loading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           {/* โหมด Quick edit / เลือกหลายรายการ */}
//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${quickEdit ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setQuickEdit((v) => !v)}
//           >
//             {quickEdit ? "ปิด Quick edit" : "Quick edit"}
//           </button>
//           <button
//             type="button"
//             className={`rounded-md border px-3 py-2 text-sm ${selectMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
//             onClick={() => setSelectMode((v) => !v)}
//           >
//             {selectMode ? "ปิดโหมดเลือก" : "เลือกหลายรายการ"}
//           </button>
//           <button
//             type="button"
//             className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//             onClick={() => setCreating(true)}
//           >
//             + เพิ่มสินค้า
//           </button>
//         </div>
//       </div>

//       {/* Toolbar: ค้นหา / หมวด / แสดง / เรียง */}
//       <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
//         {/* ค้นหา */}
//         <input
//           value={q}
//           onChange={(e) => {
//             setQ(e.target.value);
//             setPage(1);
//           }}
//           placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         />

//         {/* หมวด */}
//         <select
//           value={String(categoryId ?? "")}
//           onChange={(e) => {
//             const v = e.target.value;
//             const n = Number(v);
//             setCategoryId(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="">ทุกหมวดหมู่</option>
//           {categoryOptions.map((c) => (
//             <option key={String(c.id)} value={String(c.id)}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         {/* แสดง: ทั้งหมด/เฉพาะที่ visible */}
//         <select
//           value={includeHidden}
//           onChange={(e) => {
//             setIncludeHidden(e.target.value as "all" | "visibleOnly");
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="all">แสดงทั้งหมด</option>
//           <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
//         </select>

//         {/* เรียง */}
//         <select
//           value={`${sort}:${order}`}
//           onChange={(e) => {
//             const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
//             setSort(s);
//             setOrder(o);
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="order:asc">เรียงตามลำดับ</option>
//           <option value="price:asc">ราคาต่ำ → สูง</option>
//           <option value="price:desc">ราคาสูง → ต่ำ</option>
//           <option value="name:asc">ชื่อ A → Z</option>
//           <option value="name:desc">ชื่อ Z → A</option>
//         </select>
//       </div>

//       {/* Bulk actions bar */}
//       {selectMode && (
//         <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2 bg-muted/50">
//           <div className="flex items-center gap-2 text-sm">
//             <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={selectAllThisPage}>
//               เลือกทั้งหมดในหน้านี้
//             </button>
//             <button className="rounded-md border px-2 py-1 hover:bg-white" onClick={clearSelection}>
//               ล้างการเลือก
//             </button>
//             <span className="text-muted-foreground">เลือกแล้ว: {selectedCount}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//               onClick={() => bulkPatchVisible(false)}
//               disabled={!selectedCount}
//             >
//               ซ่อน (Bulk)
//             </button>
//             <button
//               className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
//               onClick={() => bulkPatchVisible(true)}
//               disabled={!selectedCount}
//             >
//               แสดง (Bulk)
//             </button>
//             <button
//               className="rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-white"
//               onClick={bulkDelete}
//               disabled={!selectedCount}
//             >
//               ลบ (Bulk)
//             </button>
//           </div>
//         </div>
//       )}

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           {/* ปรับจำนวนคอลัมน์/ช่องว่างตาม breakpoint ให้เหมือนฝั่ง FE */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                   selectable={selectMode}
//                   selected={selected.has(item.id)}
//                   onSelectToggle={toggleSelect}
//                   quickEdit={quickEdit}
//                   onInlineChange={handleInlineChange}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Footer: จำนวน/หน้า + เปลี่ยน page/pageSize */}
//       <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
//         <div className="text-muted-foreground">
//           แสดง {items.length.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า {page}/{Math.max(1, Math.ceil((total || 0) / pageSize))}
//         </div>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-md border px-2 py-1"
//             value={pageSize}
//             onChange={(e) => {
//               setPageSize(Number(e.target.value) || 24);
//               setPage(1);
//             }}
//           >
//             {[12, 24, 36, 48].map((n) => (
//               <option key={n} value={n}>
//                 {n}/หน้า
//               </option>
//             ))}
//           </select>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page <= 1}
//           >
//             ← ก่อนหน้า
//           </button>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => p + 1)}
//             disabled={page >= Math.max(1, Math.ceil((total || 0) / pageSize))}
//           >
//             ถัดไป →
//           </button>
//         </div>
//       </div>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           // ฟิลด์ใหม่
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 // ฟิลด์ใหม่
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.15 ===============================================

// v.1.1.14 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// type ListResponse = {
//   items: UIProduct[];
//   total?: number;
//   page?: number;
//   pageSize?: number;
//   meta?: UIMeta;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill"
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={["pointer-events-none absolute inset-0 rounded-xl border-2", frameBorderClass(item.discountPercent)].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

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

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-[11px] sm:text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // rules ส่วนลด
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   // ====== ฟิลเตอร์/ค้นหา/เรียง/แบ่งหน้า ======
//   const [q, setQ] = useState("");
//   const [qDebounced, setQDebounced] = useState("");
//   const [categoryId, setCategoryId] = useState<string | number | undefined>(undefined);
//   const [includeHidden, setIncludeHidden] = useState<"all" | "visibleOnly">("all");

//   const [sort, setSort] = useState<"order" | "price" | "name">("order");
//   const [order, setOrder] = useState<"asc" | "desc">("asc");

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const [total, setTotal] = useState(0);

//   // debounce คำค้น
//   useEffect(() => {
//     const t = setTimeout(() => setQDebounced(q.trim()), 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data: ListResponse = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // โหลดกฎส่วนลด
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // options สำหรับ Dialog
//   const categoryOptions = useMemo(() => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })), [catMap]);

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   // ====== โหลดรายการตามฟิลเตอร์ ======
//   async function fetchList() {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       if (qDebounced) params.set("q", qDebounced);
//       if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));
//       params.set("sort", sort);
//       params.set("order", order);
//       params.set("page", String(page));
//       params.set("pageSize", String(pageSize));
//       params.set("includeHidden", includeHidden === "all" ? "1" : "0");

//       const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: "no-store" });
//       if (!res.ok) throw new Error("Fetch failed");
//       const data: ListResponse = await res.json();

//       setItems(data.items ?? []);
//       setTotal(data.total ?? (data.items?.length ?? 0));
//       if (data.meta) setMeta(data.meta);
//     } catch (e: any) {
//       setError(e?.message ?? "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // re-fetch เมื่อฟิลเตอร์/หน้าเปลี่ยน
//   useEffect(() => {
//     fetchList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [qDebounced, categoryId, sort, order, page, pageSize, includeHidden]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//       // ลบแล้ว อาจต้องอัปเดตรายการใหม่ (ให้สอดคล้อง total/page)
//       fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     // หลังสร้างเสร็จ re-fetch ตามฟิลเตอร์ปัจจุบัน
//     await fetchList();
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//       // ให้หน้า list sync กับ server อีกครั้ง
//       await fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   // UI helpers
//   const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
//   const canPrev = page > 1;
//   const canNext = page < totalPages;

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving || loading) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//           {loading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       {/* Toolbar: ค้นหา / หมวด / แสดง / เรียง */}
//       <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
//         {/* ค้นหา */}
//         <input
//           value={q}
//           onChange={(e) => {
//             setQ(e.target.value);
//             setPage(1);
//           }}
//           placeholder="ค้นหาชื่อ/แบรนด์/SKU…"
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         />

//         {/* หมวด */}
//         <select
//           value={String(categoryId ?? "")}
//           onChange={(e) => {
//             const v = e.target.value;
//             const n = Number(v);
//             setCategoryId(v === "" ? undefined : (Number.isFinite(n) && String(n) === v ? n : v));
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="">ทุกหมวดหมู่</option>
//           {categoryOptions.map((c) => (
//             <option key={String(c.id)} value={String(c.id)}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         {/* แสดง: ทั้งหมด/เฉพาะที่ visible */}
//         <select
//           value={includeHidden}
//           onChange={(e) => {
//             setIncludeHidden(e.target.value as "all" | "visibleOnly");
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="all">แสดงทั้งหมด</option>
//           <option value="visibleOnly">เฉพาะที่แสดงอยู่</option>
//         </select>

//         {/* เรียง */}
//         <select
//           value={`${sort}:${order}`}
//           onChange={(e) => {
//             const [s, o] = e.target.value.split(":") as [typeof sort, typeof order];
//             setSort(s);
//             setOrder(o);
//             setPage(1);
//           }}
//           className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//         >
//           <option value="order:asc">เรียงตามลำดับ</option>
//           <option value="price:asc">ราคาต่ำ → สูง</option>
//           <option value="price:desc">ราคาสูง → ต่ำ</option>
//           <option value="name:asc">ชื่อ A → Z</option>
//           <option value="name:desc">ชื่อ Z → A</option>
//         </select>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           {/* ปรับจำนวนคอลัมน์/ช่องว่างตาม breakpoint ให้เหมือนฝั่ง FE */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Footer: จำนวน/หน้า + เปลี่ยน page/pageSize */}
//       <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
//         <div className="text-muted-foreground">
//           แสดง {items.length.toLocaleString("th-TH")} รายการ • ทั้งหมด {total.toLocaleString("th-TH")} รายการ • หน้า{" "}
//           {page}/{totalPages}
//         </div>
//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-md border px-2 py-1"
//             value={pageSize}
//             onChange={(e) => {
//               setPageSize(Number(e.target.value) || 24);
//               setPage(1);
//             }}
//           >
//             {[12, 24, 36, 48].map((n) => (
//               <option key={n} value={n}>
//                 {n}/หน้า
//               </option>
//             ))}
//           </select>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={!canPrev}
//           >
//             ← ก่อนหน้า
//           </button>
//           <button
//             className="rounded-md border px-2 py-1 disabled:opacity-50"
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={!canNext}
//           >
//             ถัดไป →
//           </button>
//         </div>
//       </div>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           // ฟิลด์ใหม่
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 // ฟิลด์ใหม่
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.14 ===============================================

// v.1.1.13 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ดาว
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // โลโก้แบรนด์
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={[
//                   "pointer-events-none absolute inset-0 rounded-xl border-2",
//                   frameBorderClass(item.discountPercent),
//                 ].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

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
//                       onError={(e) => {
//                         (e.currentTarget as HTMLImageElement).style.display = "none";
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
//                 {item.brand}
//               </div>
//             )}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

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

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//               {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   // ------- NEW: ควบคุมการค้นหา/ฟิลเตอร์/เรียง/แบ่งหน้า -------
//   const [q, setQ] = useState("");
//   const [categoryId, setCategoryId] = useState<string | number | "">("");
//   const [visibleFilter, setVisibleFilter] = useState<"all" | "visible" | "hidden">("all");
//   const [sort, setSort] = useState<"order" | "newest" | "price_asc" | "price_desc" | "discount_desc" | "rating_desc">(
//     "order"
//   );
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(24);
//   const [total, setTotal] = useState<number | null>(null);
//   const [listLoading, setListLoading] = useState(false);

//   // ---------------------------------------------------------------
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // options สำหรับ Dialog
//   const categoryOptions = useMemo(
//     () => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })),
//     [catMap]
//   );

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   // ===== NEW: ดึงรายการด้วยเงื่อนไข (debounce search) =====
//   const fetchList = useRef(
//     (async (signal?: AbortSignal) => {
//       try {
//         setListLoading(true);
//         setError(null);

//         const sp = new URLSearchParams();
//         if (q.trim()) sp.set("q", q.trim());
//         if (categoryId !== "" && categoryId != null) sp.set("category_id", String(categoryId));
//         if (visibleFilter !== "all") sp.set("visible", visibleFilter === "visible" ? "true" : "false");
//         if (sort) sp.set("sort", sort);
//         sp.set("page", String(page));
//         sp.set("pageSize", String(pageSize));

//         const res = await fetch(`${API_BASE}?${sp.toString()}`, { cache: "no-store", signal });
//         if (!res.ok) throw new Error("Fetch list failed");
//         const data = await res.json();

//         const list: UIProduct[] = data?.items ?? [];
//         setItems(list);
//         if (typeof data?.total === "number") setTotal(data.total);
//       } catch (e: any) {
//         if (e?.name !== "AbortError") setError(e?.message ?? "Load failed");
//       } finally {
//         setListLoading(false);
//       }
//     }) as (signal?: AbortSignal) => Promise<void>
//   ).current;

//   // debounce: ยิงเมื่อ q/category/visible/sort/page/pageSize เปลี่ยน
//   useEffect(() => {
//     const ctrl = new AbortController();
//     const t = setTimeout(() => {
//       fetchList(ctrl.signal);
//     }, q ? 300 : 0); // พิมพ์ค้นหาให้หน่วงนิดหนึ่ง
//     return () => {
//       ctrl.abort();
//       clearTimeout(t);
//     };
//   }, [q, categoryId, visibleFilter, sort, page, pageSize, fetchList]);

//   // ====== Reorder ====
//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//       // หลังลบ: รีเฟรชหน้าเดิมเพื่อให้ total/page ถูกต้อง
//       fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     // หลังสร้าง: รีเฟรชรายการตามเงื่อนไขปัจจุบัน (ให้อัปเดต total/page)
//     await fetchList();
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//       // ไม่จำเป็นต้องรีเฟรชทั้งหน้า แต่ถ้าอยากชัวร์ uncomment:
//       // await fetchList();
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   const totalPages = useMemo(() => {
//     if (!total || total <= 0) return 1;
//     return Math.max(1, Math.ceil(total / pageSize));
//   }, [total, pageSize]);

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving || listLoading) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {listLoading && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Loading…</span>}
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-4 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       {/* ===== NEW: Toolbar ค้นหา/ฟิลเตอร์/เรียง/แบ่งหน้า ===== */}
//       <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-3">
//         <div className="lg:col-span-4">
//           <input
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//             placeholder="ค้นหาชื่อ/แบรนด์/sku…"
//             value={q}
//             onChange={(e) => {
//               setPage(1);
//               setQ(e.target.value);
//             }}
//           />
//         </div>

//         <div className="lg:col-span-3">
//           <select
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//             value={String(categoryId ?? "")}
//             onChange={(e) => {
//               const v = e.target.value;
//               const parsed = /^\d+$/.test(v) ? Number(v) : v;
//               setCategoryId(v === "" ? "" : parsed);
//               setPage(1);
//             }}
//           >
//             <option value="">— ทุกหมวดหมู่ —</option>
//             {Object.values(catMap).map((c) => (
//               <option key={String(c.id)} value={String(c.id)}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="lg:col-span-2">
//           <select
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//             value={visibleFilter}
//             onChange={(e) => {
//               setVisibleFilter(e.target.value as any);
//               setPage(1);
//             }}
//           >
//             <option value="all">แสดงทั้งหมด</option>
//             <option value="visible">เฉพาะที่โชว์อยู่</option>
//             <option value="hidden">เฉพาะที่ซ่อน</option>
//           </select>
//         </div>

//         <div className="lg:col-span-3">
//           <select
//             className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
//             value={sort}
//             onChange={(e) => {
//               setSort(e.target.value as any);
//               setPage(1);
//             }}
//           >
//             <option value="order">เรียงตามลำดับ</option>
//             <option value="newest">ใหม่ล่าสุด</option>
//             <option value="price_asc">ราคาต่ำ→สูง</option>
//             <option value="price_desc">ราคาสูง→ต่ำ</option>
//             <option value="discount_desc">ส่วนลดมาก→น้อย</option>
//             <option value="rating_desc">เรตติ้งสูง→ต่ำ</option>
//           </select>
//         </div>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* ===== NEW: Pagination ===== */}
//       <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="text-sm text-muted-foreground">
//           {typeof total === "number" ? (
//             <>
//               แสดง {items.length} รายการ • ทั้งหมด {total} รายการ • หน้า {page}/{totalPages}
//             </>
//           ) : (
//             <>แสดง {items.length} รายการ</>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <select
//             className="rounded-md border px-2 py-1 text-sm"
//             value={pageSize}
//             onChange={(e) => {
//               setPageSize(Number(e.target.value));
//               setPage(1);
//             }}
//           >
//             {[12, 24, 48, 96].map((n) => (
//               <option key={n} value={n}>
//                 {n}/หน้า
//               </option>
//             ))}
//           </select>

//           <button
//             className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page <= 1}
//           >
//             ← ก่อนหน้า
//           </button>
//           <button
//             className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={page >= totalPages}
//           >
//             ถัดไป →
//           </button>
//         </div>
//       </div>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.13 ===============================================

// v.1.1.12 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill"
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 20vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay: ถ้ามี rule ใช้ค่าจาก rule, ไม่งั้น fallback ใช้ class เดิม */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={[
//                   "pointer-events-none absolute inset-0 rounded-xl border-2",
//                   frameBorderClass(item.discountPercent),
//                 ].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wide">
//                 {item.brand}
//               </div>
//             )}
//             {item.sku && <div className="text-[10px] sm:text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

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

//             {categoryName && <div className="text-[10px] sm:text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold text-base sm:text-lg" : "text-primary font-bold text-base sm:text-lg"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-[11px] sm:text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//               {item.uom && <div className="text-[10px] sm:text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // rules ส่วนลด
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // โหลดกฎส่วนลด
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // options สำหรับ Dialog
//   const categoryOptions = useMemo(
//     () => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })),
//     [catMap]
//   );

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     // รวมค่าที่เพิ่งกรอกไว้เผื่อ API ฝั่ง mock ยังไม่คืนฟิลด์ใหม่ครบ
//     const item = { ...(values as any), ...(data?.item as any) } as UIProduct;
//     if (!item || item.id == null) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           {/* ปรับจำนวนคอลัมน์/ช่องว่างตาม breakpoint ให้เหมือนฝั่ง FE */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           // ฟิลด์ใหม่
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 // ฟิลด์ใหม่
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.12 ===============================================

// v.1.1.11 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill"
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay: ถ้ามี rule ใช้ค่าจาก rule, ไม่งั้น fallback ใช้ class เดิม */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={[
//                   "pointer-events-none absolute inset-0 rounded-xl border-2",
//                   frameBorderClass(item.discountPercent),
//                 ].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // rules ส่วนลด
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // โหลดกฎส่วนลด
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // options สำหรับ Dialog
//   const categoryOptions = useMemo(
//     () => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })),
//     [catMap]
//   );

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     // รวมค่าที่เพิ่งกรอกไว้เผื่อ API ฝั่ง mock ยังไม่คืนฟิลด์ใหม่ครบ
//     const item = { ...(values as any), ...(data?.item as any) } as UIProduct;
//     if (!item || item.id == null) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           // ฟิลด์ใหม่
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 // ฟิลด์ใหม่
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.11 ===============================================

// v.1.1.10 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill"
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay: ถ้ามี rule ใช้ค่าจาก rule, ไม่งั้น fallback ใช้ class เดิม */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={[
//                   "pointer-events-none absolute inset-0 rounded-xl border-2",
//                   frameBorderClass(item.discountPercent),
//                 ].join(" ")}
//               />
//             )}

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // ======= NEW: เก็บ discount rules =======
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // ===== NEW: fetch discount rules =====
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // NEW: ทำ options สำหรับ Dialog จาก catMap
//   const categoryOptions = useMemo(
//     () => Object.values(catMap).map((c) => ({ id: c.id, name: c.name })),
//     [catMap]
//   );

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules;
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{
//           name: "",
//           brand: "",
//           sku: "",
//           price: 0,
//           discountPercent: 0,
//           image_url: undefined,
//           // ฟิลด์ใหม่
//           category_id: undefined,
//           rating: 0,
//           reviews: 0,
//           uom: "",
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//         categories={categoryOptions}
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//                 // ฟิลด์ใหม่
//                 category_id: editingItem.category_id,
//                 rating: editingItem.rating ?? 0,
//                 reviews: editingItem.reviews ?? 0,
//                 uom: editingItem.uom ?? "",
//               }
//             : {
//                 name: "",
//                 brand: "",
//                 sku: "",
//                 price: 0,
//                 discountPercent: 0,
//                 // ฟิลด์ใหม่ (fallback)
//                 category_id: undefined,
//                 rating: 0,
//                 reviews: 0,
//                 uom: "",
//               }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//         categories={categoryOptions}
//       />
//     </section>
//   );
// }

// v.1.1.10 ===============================================

// v.1.1.9 ================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// // === ใช้เฉพาะฟิลด์จำเป็นจาก discount rules ===
// type DiscountRuleLite = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   enabled: boolean;
// };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";
// const RULES_API = "/api/mock/discount-rules";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด (fallback เมื่อไม่มี rule)
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   const map: Record<string, string> = {
//     commscope: "commscope",
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
//   frameRule, // <<-- เพิ่ม: rule ที่จับคู่ได้ (หรือ undefined ถ้าไม่มี)
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
//   frameRule?: DiscountRuleLite | null;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay: ถ้ามี rule ใช้ค่าจาก rule, ไม่งั้น fallback ใช้ class เดิม */}
//             {frameRule ? (
//               <div
//                 className="pointer-events-none absolute inset-0 rounded-xl"
//                 style={{ border: `${frameRule.borderWidth}px solid ${frameRule.borderColorHex}` }}
//               />
//             ) : (
//               <div
//                 className={[
//                   "pointer-events-none absolute inset-0 rounded-xl border-2",
//                   frameBorderClass(item.discountPercent),
//                 ].join(" ")}
//               />
//             )}

//             {/* ป้ายส่วนลด */}
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
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
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา (เดิมทั้งหมด) */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});
//   // ======= NEW: เก็บ discount rules =======
//   const [rules, setRules] = useState<DiscountRuleLite[]>([]);

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();

//     // ===== NEW: fetch discount rules =====
//     (async () => {
//       try {
//         const res = await fetch(RULES_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const list: DiscountRuleLite[] = (data?.items ?? [])
//           .filter((r: any) => r && r.enabled)
//           .map((r: any) => ({
//             id: r.id,
//             minPercent: Number(r.minPercent) || 0,
//             maxPercent: typeof r.maxPercent === "number" ? r.maxPercent : undefined,
//             borderWidth: Number(r.borderWidth) || 2,
//             borderColorHex: String(r.borderColorHex || "#000000"),
//             enabled: !!r.enabled,
//           }));
//         // เรียงตาม order หาก API ส่งมา (ถ้ามี) ไม่งั้นคงลำดับเดิม
//         setRules(list);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   // เลือกกฎที่ match ตามส่วนลด
//   const pickRule = useMemo(() => {
//     const active = rules; // rules ที่ enabled แล้ว
//     return (percent?: number): DiscountRuleLite | null => {
//       if (percent == null) return null;
//       for (const r of active) {
//         const lowerOk = percent >= (r.minPercent ?? 0);
//         const upperOk = typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
//         if (lowerOk && upperOk) return r;
//       }
//       return null;
//     };
//   }, [rules]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => {
//               const rule = pickRule(item.discountPercent);
//               return (
//                 <SortableProduct
//                   key={item.id}
//                   item={item}
//                   onDelete={handleDelete}
//                   onToggleVisible={handleToggle}
//                   onEdit={(id) => setEditingId(id)}
//                   categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//                   frameRule={rule}
//                 />
//               );
//             })}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.9 ================================================

// v.1.1.8 =================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// // หา path โลโก้จากชื่อ brand (ไฟล์อยู่ใน /public/brand_logo/{slug}_logo.png)
// function brandLogoPath(brand?: string): string | null {
//   if (!brand) return null;
//   const key = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
//   // ปรับแมปชื่อที่อาจสะกดต่างกันให้ตรงไฟล์
//   const map: Record<string, string> = {
//     commscope: "commscope",   // กันสะกดเพี้ยนจาก COMMSCOPE
//     commscopee: "commscope",
//     commscopex: "commscope",
//     germanyrack: "germanyrack",
//     link: "link",
//     // เผื่อกรณีชื่อถูกต้องตรง ๆ อยู่แล้ว
//     commscopee1: "commscope",
//   };
//   const slug = map[key] ?? key;
//   return `/brand_logo/${slug}_logo.png`;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด + โลโก้แบรนด์ */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay ครบ 4 ด้าน (บาง) */}
//             <div
//               className={[
//                 "pointer-events-none absolute inset-0 rounded-xl border-2",
//                 frameBorderClass(item.discountPercent),
//               ].join(" ")}
//             />

//             {/* ป้ายส่วนลด */}
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {/* โลโก้แบรนด์ (คงสัดส่วน, ซ่อนถ้าโหลดไม่ได้) */}
//             {(() => {
//               const logo = brandLogoPath(item.brand);
//               return logo ? (
//                 <div className="absolute top-2 right-2 z-10">
//                   <div className="bg-white/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-soft">
//                     <img
//                       src={logo}
//                       alt={item.brand ?? "brand"}
//                       className="h-7 w-auto max-w-[72px] object-contain"
//                       onError={(e) => {
//                         (e.currentTarget.style.display = "none");
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               ) : null;
//             })()}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา (เดิมทั้งหมด) */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }


// v.1.1.8 =================================================

// v.1.1.7 =================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // สีกรอบตามส่วนลด
// function frameBorderClass(p?: number) {
//   if (!p || p < 10) return "border-transparent";
//   if (p >= 90) return "border-red-500";
//   if (p >= 80) return "border-yellow-500";
//   if (p >= 70) return "border-amber-500";
//   if (p >= 60) return "border-sky-500";
//   return "border-slate-300";
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา + กรอบสีส่วนลด (ใหม่) */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-xl">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {/* กรอบ overlay ครบ 4 ด้าน (บาง) */}
//             <div
//               className={[
//                 "pointer-events-none absolute inset-0 rounded-xl border-2",
//                 frameBorderClass(item.discountPercent),
//               ].join(" ")}
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา (เดิมทั้งหมด) */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.7 =================================================

// v.1.1.6 =================================================
// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
//   uom?: string; // <<< เพิ่มหน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// // ปรับ SVG ให้ดาวที่ไม่ได้เลือก "ไม่มี fill" (แก้ปัญหาสีดำ)
// function Stars({ rating = 0 }: { rating?: number }) {
//   const full = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => {
//         const filled = i < full;
//         return (
//           <svg
//             key={i}
//             viewBox="0 0 20 20"
//             className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
//             fill={filled ? "currentColor" : "none"}
//             stroke={filled ? "none" : "currentColor"}
//             strokeWidth={filled ? 0 : 1.3}
//           >
//             <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//           </svg>
//         );
//       })}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพ + ป้ายลดราคา */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหา */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {categoryName && <div className="text-[11px] text-muted-foreground">{categoryName}</div>}

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//               {item.uom && <div className="text-[11px] text-muted-foreground">/ {item.uom}</div>}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string }> = data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.6 =================================================

// v.1.1.5 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx
// //  v.1.1.5 — show category + tags in edit dialog

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;

//   rating?: number;
//   reviews?: number;

//   category_id?: number | string;
// };

// type UIMeta = { title: string; subtitle: string };

// // สำหรับ categories ที่ดึงมาจาก mock
// type UICategoryLite = { id: number | string; name: string; slug?: string };

// const API_BASE = "/api/mock/products";
// const CAT_API = "/api/mock/categories";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// function Stars({ rating = 0 }: { rating?: number }) {
//   const stars = Math.max(0, Math.min(5, Math.floor(rating)));
//   return (
//     <div className="flex items-center gap-1">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <svg
//           key={i}
//           viewBox="0 0 20 20"
//           className={`h-3.5 w-3.5 ${i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
//         >
//           <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
//         </svg>
//       ))}
//     </div>
//   );
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
//   categoryName,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
//   categoryName?: string;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า + ป้ายลดราคา */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />
//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}
//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>}
//             {item.sku && <div className="text-[11px] text-muted-foreground">SKU: {item.sku}</div>}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{item.name}</div>

//             {/* Stars + reviews */}
//             {(item.rating || item.reviews) && (
//               <div className="mt-1 flex items-center gap-2">
//                 <Stars rating={item.rating} />
//                 {typeof item.reviews === "number" && (
//                   <span className="text-[11px] text-muted-foreground">({item.reviews})</span>
//                 )}
//               </div>
//             )}

//             {/* ชื่อหมวดหมู่ (มาจาก category map) */}
//             {categoryName && (
//               <div className="text-[11px] text-muted-foreground">{categoryName}</div>
//             )}

//             {/* ราคา / ราคาเดิม */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">฿{originalPrice.toLocaleString("th-TH")}</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" },
//   );

//   // โหลด categories มาแม็พ id -> name
//   const [catMap, setCatMap] = useState<Record<string | number, UICategoryLite>>({});

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     // โหลด meta products ถ้า server ไม่ได้ส่งมา
//     if (!initialMeta) {
//       (async () => {
//         try {
//           const res = await fetch(API_BASE, { cache: "no-store" });
//           if (!res.ok) return;
//           const data = await res.json();
//           if (data?.meta) setMeta(data.meta as UIMeta);
//         } catch {}
//       })();
//     }

//     // โหลด categories เพื่อทำ map
//     (async () => {
//       try {
//         const res = await fetch(CAT_API, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         const items: Array<{ id: number | string; name: string; slug?: string; visible?: boolean }> =
//           data?.items ?? [];
//         const map: Record<string | number, UICategoryLite> = {};
//         for (const c of items) map[c.id] = { id: c.id, name: c.name, slug: c.slug };
//         setCatMap(map);
//       } catch {}
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//                 categoryName={item.category_id != null ? catMap[item.category_id]?.name : undefined}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.5 ===============================================


// v.1.1.4 ===============================================
// // src/app/admin/components/AdminProductGrid.tsx
// // v.1.2.0 — show rating/reviews + SKU line + UOM next to price

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Star } from "lucide-react";
// import { cn } from "@/lib/utils";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   rating?: number;
//   reviews?: number;
//   uom?: string; // ⭐ หน่วยสินค้า
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}
//             {/* ⭐ SKU บรรทัดถัดจากยี่ห้อ */}
//             {item.sku && (
//               <div className="text-[11px] text-muted-foreground/80">SKU: {item.sku}</div>
//             )}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {/* Rating + reviews */}
//             {typeof item.rating === "number" && (
//               <div className="flex items-center gap-1 mb-1">
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "h-3.5 w-3.5",
//                         i < Math.floor(item.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   ({item.reviews ?? 0})
//                 </span>
//               </div>
//             )}

//             {/* ราคา + UOM */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//               {item.uom && (
//                 <span className="ml-1 text-xs text-muted-foreground">/ {item.uom}</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));
//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch { /* noop */ }
//       finally { setMetaSaving(false); }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally { setSaving(false); }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.4 ===============================================

// v.1.1.3 ===============================================  
// // src/app/admin/components/AdminProductGrid.tsx
// // v.1.1.3  — show rating/reviews on admin product card

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Star } from "lucide-react";
// import { cn } from "@/lib/utils";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   rating?: number;   // ⭐️ added
//   reviews?: number;  // ⭐️ added
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า: aspect-square + badge ส่วนลด */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}

//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             {/* ⭐️ rating + reviews */}
//             {typeof item.rating === "number" && (
//               <div className="flex items-center gap-1 mb-1">
//                 <div className="flex items-center">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={cn(
//                         "h-3.5 w-3.5",
//                         i < Math.floor(item.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//                       )}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-muted-foreground">
//                   ({item.reviews ?? 0})
//                 </span>
//               </div>
//             )}

//             {/* ราคา */}
//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch {
//         /* noop */
//       }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//         /* noop */
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================

// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0..100
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
//   // ถ้าภายหลังอยากโชว์เรตติ้งในแอดมิน เพิ่มสองบรรทัดนี้ใน _store ได้
//   rating?: number;
//   reviews?: number;
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* =============== Small helpers =============== */
// function calcOriginalPrice(price: number, discountPercent?: number) {
//   if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
//   const original = Math.round(price / (1 - discountPercent / 100));
//   return original > price ? original : undefined;
// }

// /* =============== Sortable Card (styled like frontend) =============== */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: item.id });
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
//         {/* การ์ดสไตล์เดียวกับ ProductCard (grid view) */}
//         <div
//           className={[
//             "relative flex flex-col rounded-xl bg-card shadow-soft transition-all overflow-hidden",
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-1 ring-amber-300" : "hover:-translate-y-0.5",
//           ].join(" ")}
//         >
//           {/* ภาพสินค้า: aspect-square + badge ส่วนลด */}
//           <div className="relative aspect-square overflow-hidden bg-muted/30">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               fill
//               sizes="(max-width: 1280px) 33vw, 16vw"
//               className="object-cover transition-transform duration-500 group-hover:scale-110"
//             />

//             {!!item.discountPercent && item.discountPercent > 0 && (
//               <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-soft">
//                 -{item.discountPercent}%
//               </span>
//             )}

//             {isHidden && (
//               <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//                 HIDDEN
//               </span>
//             )}
//           </div>

//           {/* เนื้อหาเหมือน ProductCard */}
//           <div className="p-3 sm:p-4 flex flex-col gap-1">
//             {item.brand && (
//               <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{item.brand}</div>
//             )}
//             <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">
//               {item.name}
//             </div>

//             <div className="mt-1 flex items-baseline gap-2">
//               <div className={originalPrice ? "text-destructive font-bold" : "text-primary font-bold"}>
//                 {/* แอดมินโชว์ราคาแบบเร็ว ๆ (ไม่มีสกุลเงิน formatter ก็ได้) */}
//                 ฿{Math.round(item.price).toLocaleString("th-TH")}
//               </div>
//               {originalPrice && (
//                 <div className="text-xs text-muted-foreground line-through">
//                   ฿{originalPrice.toLocaleString("th-TH")}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ================= Main Grid ================= */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;
//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch {
//         /* noop */
//       }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();

//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));

//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch {
//         /* noop */
//       } finally {
//         setMetaSaving(false);
//       }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);

//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);

//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;

//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));

//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>
//           )}
//           {metaSaving && (
//             <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => {
//           await saveCreate(vals);
//           setCreating(false);
//         }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => {
//           await saveEdit(vals);
//           setEditingId(null);
//         }}
//         mode="edit"
//       />
//     </section>
//   );
// }

// v.1.1.2 ===============================================


// // src/app/admin/components/AdminProductGrid.tsx

// "use client";

// import Image from "next/image";
// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminProductEditDialog, { ProductEditValues } from "./AdminProductEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type UIProduct = {
//   id: number | string;
//   name: string;
//   brand?: string;
//   sku?: string;
//   price: number;
//   discountPercent?: number; // 0, 60, 70, 80, 90
//   image_url?: string;
//   visible?: boolean;
//   order?: number;
// };

// type UIMeta = { title: string; subtitle: string };

// const API_BASE = "/api/mock/products";

// /* ---------- Sortable Card ---------- */
// function SortableProduct({
//   item,
//   onDelete,
//   onToggleVisible,
//   onEdit,
// }: {
//   item: UIProduct;
//   onDelete: (id: UIProduct["id"]) => void;
//   onToggleVisible: (id: UIProduct["id"]) => void;
//   onEdit: (id: UIProduct["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
//   const isHidden = item.visible === false;

//   // กรอบสีตามเปอร์เซ็นต์
//   const ringByDiscount =
//     item.discountPercent && item.discountPercent >= 90
//       ? "ring-red-500"
//       : item.discountPercent && item.discountPercent >= 80
//       ? "ring-yellow-500"
//       : item.discountPercent && item.discountPercent >= 70
//       ? "ring-amber-500"
//       : item.discountPercent && item.discountPercent >= 60
//       ? "ring-sky-500"
//       : "ring-transparent";

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
//             "relative flex flex-col p-4 rounded-xl bg-card shadow-soft transition-all",
//             "ring-2", ringByDiscount,
//             isHidden ? "opacity-60 grayscale bg-amber-50 ring-2 ring-amber-300" : "",
//           ].join(" ")}
//         >
//           {isHidden && (
//             <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 text-white text-[10px] px-2 py-0.5 tracking-wide">
//               HIDDEN
//             </span>
//           )}

//           {item.discountPercent ? (
//             <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-md bg-black/80 text-white text-[10px] px-2 py-0.5">
//               -{item.discountPercent}%
//             </span>
//           ) : null}

//           <div className="mb-3 flex items-center justify-center">
//             <Image
//               src={item.image_url ?? "/placeholder.png"}
//               alt={item.name}
//               width={96}
//               height={96}
//               className="w-24 h-24 object-cover rounded-lg shadow-soft"
//             />
//           </div>

//           <div className="text-xs text-muted-foreground">{item.brand}</div>
//           <div className="text-sm font-medium leading-tight line-clamp-2 h-10">{item.name}</div>
//           <div className="mt-1 text-primary font-semibold">฿{Math.round(item.price).toLocaleString("th-TH")}</div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminProductGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: UIProduct[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<UIProduct[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Products Management", subtitle: "หน้านี้เชื่อมกับ /api/mock/products" }
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [metaSaving, setMetaSaving] = useState(false);

//   // edit/create dialog
//   const [editingId, setEditingId] = useState<UIProduct["id"] | null>(null);
//   const editingItem = editingId != null ? items.find(i => i.id === editingId) ?? null : null;

//   const [creating, setCreating] = useState(false);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(API_BASE, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const saveAbortRef = useRef<AbortController | null>(null);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: UIProduct["id"]; order: number }>>([]);

//   const postReorder = (orders: Array<{ id: UIProduct["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         saveAbortRef.current?.abort();
//         saveAbortRef.current = new AbortController();
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//           signal: saveAbortRef.current.signal,
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 400);
//   };

//   const patchMeta = (patch: Partial<UIMeta>) => {
//     if (metaTimer.current) clearTimeout(metaTimer.current);
//     setMeta((m) => ({ ...m, ...patch }));
//     metaTimer.current = setTimeout(async () => {
//       try {
//         setMetaSaving(true);
//         const res = await fetch(`${API_BASE}/meta`, {
//           method: "PATCH",
//           headers: jsonHeaders,
//           body: JSON.stringify(patch),
//         });
//         if (!res.ok) throw new Error("Update meta failed");
//       } catch { /* noop */ }
//       finally { setMetaSaving(false); }
//     }, 500);
//   };

//   const handleDelete = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("DELETE failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Delete failed");
//     } finally { setSaving(false); }
//   };

//   const handleToggle = async (id: UIProduct["id"]) => {
//     const snapshot = items;
//     const current = snapshot.find((x) => x.id === id);
//     const nextVisible = !(current?.visible ?? true);
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, visible: nextVisible } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ visible: nextVisible }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order ?? 0 })));
//   };

//   // create
//   const saveCreate = async (values: ProductEditValues) => {
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify({
//         ...values,
//         visible: false, // default: ซ่อนก่อน
//       }),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as UIProduct | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: ProductEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;
//     setItems(prev => prev.map(x => x.id === id ? { ...x, ...values } : x));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       throw e;
//     }
//   };

//   return (
//     <section className="py-4 relative">
//       {(saving || metaSaving) && (
//         <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
//           {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
//           {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
//         </div>
//       )}

//       {error && (
//         <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//           {error}
//         </div>
//       )}

//       {/* Header + Add */}
//       <div className="mb-6 flex items-start justify-between gap-3">
//         <div className="flex-1">
//           <div className="text-2xl font-semibold mb-2">
//             <input
//               className="w-full bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/30 transition px-1"
//               value={meta.title}
//               onChange={(e) => patchMeta({ title: e.target.value })}
//               aria-label="Title"
//             />
//           </div>
//           <input
//             className="w-full text-muted-foreground bg-transparent outline-none focus:ring-0 border-b border-transparent focus:border-primary/20 transition px-1"
//             value={meta.subtitle}
//             onChange={(e) => patchMeta({ subtitle: e.target.value })}
//             aria-label="Subtitle"
//           />
//         </div>
//         <button
//           type="button"
//           className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
//           onClick={() => setCreating(true)}
//         >
//           + เพิ่มสินค้า
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//             {items.map((item) => (
//               <SortableProduct
//                 key={item.id}
//                 item={item}
//                 onDelete={handleDelete}
//                 onToggleVisible={handleToggle}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {/* Create */}
//       <AdminProductEditDialog
//         open={creating}
//         initial={{ name: "", brand: "", sku: "", price: 0, discountPercent: 0, image_url: undefined }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//         mode="create"
//       />

//       {/* Edit */}
//       <AdminProductEditDialog
//         open={!!editingItem}
//         initial={
//           editingItem
//             ? {
//                 name: editingItem.name,
//                 brand: editingItem.brand ?? "",
//                 sku: editingItem.sku ?? "",
//                 price: editingItem.price,
//                 discountPercent: editingItem.discountPercent ?? 0,
//                 image_url: editingItem.image_url,
//               }
//             : { name: "", brand: "", sku: "", price: 0, discountPercent: 0 }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//         mode="edit"
//       />
//     </section>
//   );
// }
