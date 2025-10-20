// v.1.1.8 ===========================================
// src/components/admin/hero-banners/hero-banners-client.tsx

// src/components/admin/hero-banners/hero-banners-client.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
import HeroBannersListAdmin from "./hero-banners-list-admin";
import { type HeroBannerRow as ListRow } from "./hero-banner-row-admin";

// dnd-kit (สำหรับ list view)
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

type AlignX = "left" | "center" | "right";
type AlignY = "top" | "center" | "bottom";
type LayoutMode = "image" | "overlay" | "split";

export type HeroBanner = {
  id: string;
  isActive: boolean;
  order: number;
  startAt?: string;
  endAt?: string;
  layoutMode: LayoutMode;
  imageUrlDesktop: string;
  imageUrlMobile?: string;
  title?: string;
  subtitle?: string;
  textAlign?: { x: AlignX; y: AlignY };
  overlay?: { color: string; opacity: number };
  linkUrl?: string;
  altText?: string;
  locale?: string;
  ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
};

type Props = { initialItems?: HeroBanner[] };

const PAGE_SIZE_OPTIONS = [12, 24, 36, 48] as const;

export default function HeroBannersClient({ initialItems = [] }: Props) {
  const [items, setItems] = useState<HeroBanner[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(24);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const dragFrom = useRef<string | null>(null);
  const reorderAbortRef = useRef<AbortController | null>(null);
  const lastReqIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
        if (!res.ok) throw new Error("load failed");
        const data = await res.json();
        if (!alive) return;
        setItems((data?.items ?? []) as HeroBanner[]);
      } catch {
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== Card view: native drag reorder =====
  const onDragStart = (id: string) => {
    dragFrom.current = id;
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const postReorder = async (next: HeroBanner[]) => {
    if (reorderAbortRef.current) reorderAbortRef.current.abort();
    const ac = new AbortController();
    reorderAbortRef.current = ac;

    const reqId = ++lastReqIdRef.current;
    setSaving(true);
    try {
      const payload = { items: next.map((b) => ({ id: b.id, order: b.order })) };
      const res = await fetch("/api/mock/hero-banners/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      if (!res.ok) throw new Error("reorder failed");
      const data = await res.json().catch(() => ({}));
      if (reqId !== lastReqIdRef.current) return;
      if (Array.isArray(data?.items)) setItems(data.items as HeroBanner[]);
    } finally {
      if (reqId === lastReqIdRef.current) {
        setSaving(false);
        reorderAbortRef.current = null;
      }
    }
  };

  const onDrop = async (targetId: string) => {
    const fromId = dragFrom.current;
    dragFrom.current = null;
    if (!fromId || fromId === targetId) return;

    const before = items.map((x) => ({ ...x }));
    const current = [...items];
    const fromIdx = current.findIndex((x) => x.id === fromId);
    const toIdx = current.findIndex((x) => x.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const moved = current.splice(fromIdx, 1)[0];
    current.splice(toIdx, 0, moved);

    const optimistic = current.map((b, i) => ({ ...b, order: i }));
    setItems(optimistic);

    try {
      await postReorder(optimistic);
    } catch {
      setItems(before);
    }
  };

  // ===== List view: dnd-kit reorder =====
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onListDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;

    const current = [...items];
    const fromIdx = current.findIndex((x) => x.id === String(active.id));
    const toIdx = current.findIndex((x) => x.id === String(over.id));
    if (fromIdx < 0 || toIdx < 0) return;

    const newArr = arrayMove(current, fromIdx, toIdx).map((b, i) => ({ ...b, order: i }));
    setItems(newArr);
    postReorder(newArr).catch(() => setItems(current)); // rollback ถ้าพลาด
  };

  // ===== Filters =====
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      if (filterActive === "active" && !b.isActive) return false;
      if (filterActive === "inactive" && b.isActive) return false;
      if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
      if (!q) return true;
      const hay = `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, filterActive, filterMode]);

  // ===== Pagination derive =====
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pagedFiltered = filtered.slice(start, start + pageSize);

  // ถ้าเปลี่ยน filter/search/pageSize ให้กลับไปหน้า 1
  useEffect(() => {
    setPage(1);
  }, [search, filterActive, filterMode, pageSize]);

  // กันกรณี page เกิน/น้อยกว่า 1 หลังจาก total เปลี่ยน
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // ===== Data mapping (ใช้ pagedFiltered) =====
  const cards: HeroBannerCardData[] = pagedFiltered.map((b) => ({
    id: b.id,
    isActive: b.isActive,
    order: b.order,
    layoutMode: b.layoutMode,
    imageUrlDesktop: b.imageUrlDesktop,
    title: b.title,
    subtitle: b.subtitle,
    overlay: b.overlay,
    altText: b.altText,
  }));

  const rows: ListRow[] = pagedFiltered.map((b) => ({
    id: b.id,
    order: b.order,
    isActive: b.isActive,
    layoutMode: b.layoutMode,
    imageUrlDesktop: b.imageUrlDesktop,
    title: b.title,
    startAt: b.startAt,
    endAt: b.endAt,
  }));

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const bulkEnable = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const rollback = items;
    setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
    try {
      await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
          })
        )
      );
    } catch {
      setItems(rollback);
    }
  };
  const bulkDisable = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const rollback = items;
    setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
    try {
      await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      );
    } catch {
      setItems(rollback);
    }
  };
  const bulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const rollback = items;
    setItems(items.filter((x) => !selectedIds.has(x.id)));
    try {
      await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          })
        )
      );
      setSelectedIds(new Set());
    } catch {
      setItems(rollback);
      alert("ลบบางรายการไม่สำเร็จ");
    }
  };

  // ===== Pagination footer UI =====
  const PaginationFooter = () => (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">
        แสดง {pagedFiltered.length} รายการ • ทั้งหมด {total} รายการ • หน้า {page}/{totalPages}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-9 rounded-md border bg-background px-2 text-sm"
          title="จำนวนต่อหน้า"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}/หน้า
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded-md border bg-card px-3 h-9 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← ก่อนหน้า
        </button>
        <button
          type="button"
          className="rounded-md border bg-card px-3 h-9 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          ถัดไป →
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <HeroBannersToolbar
        total={items.length}
        loading={loading}
        saving={saving}
        view={view}
        onViewChange={(v) => {
          setView(v);
          if (v !== "list") setSelectedIds(new Set());
        }}
        onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
        search={search}
        onSearchChange={setSearch}
        filterActive={filterActive}
        onFilterActiveChange={setFilterActive}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        selectedCount={selectedIds.size}
        onBulkEnable={bulkEnable}
        onBulkDisable={bulkDisable}
        onBulkDelete={bulkDelete}
      />

      {view === "card" ? (
        filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            ไม่พบรายการตามเงื่อนไข
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((c) => (
                <HeroBannerCardAdmin
                  key={c.id}
                  data={c}
                  draggable
                  onDragStart={() => onDragStart(c.id)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(c.id)}
                  onToggleActive={() => {
                    const id = c.id;
                    const found = items.find((x) => x.id === id);
                    if (!found) return;
                    const optimistic = items.map((x) =>
                      x.id === id ? { ...x, isActive: !x.isActive } : x
                    );
                    const rollback = items;
                    setItems(optimistic);
                    fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isActive: !found.isActive }),
                    }).catch(() => setItems(rollback));
                  }}
                  onEdit={() => alert(`(placeholder) เปิด editor สำหรับ: ${c.id}`)}
                />
              ))}
            </div>
            <PaginationFooter />
          </>
        )
      ) : (
        // ===== List view with DndContext =====
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onListDragEnd}>
            <HeroBannersListAdmin
              rows={rows}
              selectable
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onEdit={(id) => alert(`(placeholder) เปิด editor สำหรับ: ${id}`)}
              onToggleActive={(id) => {
                const found = items.find((x) => x.id === id);
                if (!found) return;
                const optimistic = items.map((x) =>
                  x.id === id ? { ...x, isActive: !x.isActive } : x
                );
                const rollback = items;
                setItems(optimistic);
                fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: !found.isActive }),
                }).catch(() => setItems(rollback));
              }}
              onDelete={(id) => {
                const rollback = items;
                setItems(items.filter((x) => x.id !== id));
                fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
                  method: "DELETE",
                }).catch(() => {
                  setItems(rollback);
                  alert("ลบไม่สำเร็จ");
                });
              }}
            />
          </DndContext>
          <PaginationFooter />
        </>
      )}
    </div>
  );
}

// v.1.1.8 ===========================================

// v.1.1.7 ==========================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import HeroBannersListAdmin from "./hero-banners-list-admin";
// import { type HeroBannerRow as ListRow } from "./hero-banner-row-admin";

// // dnd-kit (สำหรับ list view)
// import {
//   DndContext,
//   DragEndEvent,
//   PointerSensor,
//   KeyboardSensor,
//   closestCenter,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = { initialItems?: HeroBanner[] };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [view, setView] = useState<ViewMode>("card");
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
//   const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const dragFrom = useRef<string | null>(null);
//   const reorderAbortRef = useRef<AbortController | null>(null);
//   const lastReqIdRef = useRef(0);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ===== Card view: native drag reorder =====
//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };
//   const onDragOver = (e: React.DragEvent) => e.preventDefault();

//   const postReorder = async (next: HeroBanner[]) => {
//     // cancel previous
//     if (reorderAbortRef.current) reorderAbortRef.current.abort();
//     const ac = new AbortController();
//     reorderAbortRef.current = ac;

//     const reqId = ++lastReqIdRef.current;
//     setSaving(true);
//     try {
//       const payload = { items: next.map((b) => ({ id: b.id, order: b.order })) };
//       const res = await fetch("/api/mock/hero-banners/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//         signal: ac.signal,
//       });
//       if (!res.ok) throw new Error("reorder failed");
//       const data = await res.json().catch(() => ({}));
//       if (reqId !== lastReqIdRef.current) return;
//       if (Array.isArray(data?.items)) setItems(data.items as HeroBanner[]);
//     } finally {
//       if (reqId === lastReqIdRef.current) {
//         setSaving(false);
//         reorderAbortRef.current = null;
//       }
//     }
//   };

//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const before = items.map((x) => ({ ...x }));
//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);

//     const optimistic = current.map((b, i) => ({ ...b, order: i }));
//     setItems(optimistic);

//     try {
//       await postReorder(optimistic);
//     } catch {
//       setItems(before);
//     }
//   };

//   // ===== List view: dnd-kit reorder =====
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   const onListDragEnd = (evt: DragEndEvent) => {
//     const { active, over } = evt;
//     if (!over || active.id === over.id) return;

//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === String(active.id));
//     const toIdx = current.findIndex((x) => x.id === String(over.id));
//     if (fromIdx < 0 || toIdx < 0) return;

//     const newArr = arrayMove(current, fromIdx, toIdx).map((b, i) => ({ ...b, order: i }));
//     setItems(newArr);
//     postReorder(newArr).catch(() => setItems(current)); // rollback ถ้าพลาด
//   };

//   // ===== Filters =====
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return items.filter((b) => {
//       if (filterActive === "active" && !b.isActive) return false;
//       if (filterActive === "inactive" && b.isActive) return false;
//       if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
//       if (!q) return true;
//       const hay = `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
//       return hay.includes(q);
//     });
//   }, [items, search, filterActive, filterMode]);

//   const cards: HeroBannerCardData[] = filtered.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   const rows: ListRow[] = filtered.map((b) => ({
//     id: b.id,
//     order: b.order,
//     isActive: b.isActive,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     startAt: b.startAt,
//     endAt: b.endAt,
//   }));

//   const handleToggleSelect = (id: string, checked: boolean) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   const bulkEnable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: true }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDisable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDelete = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems(items.filter((x) => !selectedIds.has(x.id)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "DELETE",
//           })
//         )
//       );
//       setSelectedIds(new Set());
//     } catch {
//       setItems(rollback);
//       alert("ลบบางรายการไม่สำเร็จ");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={(v) => {
//           setView(v);
//           if (v !== "list") setSelectedIds(new Set());
//         }}
//         onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
//         search={search}
//         onSearchChange={setSearch}
//         filterActive={filterActive}
//         onFilterActiveChange={setFilterActive}
//         filterMode={filterMode}
//         onFilterModeChange={setFilterMode}
//         selectedCount={selectedIds.size}
//         onBulkEnable={bulkEnable}
//         onBulkDisable={bulkDisable}
//         onBulkDelete={bulkDelete}
//       />

//       {view === "card" ? (
//         filtered.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ไม่พบรายการตามเงื่อนไข
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() => {
//                   const id = c.id;
//                   const found = items.find((x) => x.id === id);
//                   if (!found) return;
//                   const optimistic = items.map((x) =>
//                     x.id === id ? { ...x, isActive: !x.isActive } : x
//                   );
//                   const rollback = items;
//                   setItems(optimistic);
//                   fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//                     method: "PATCH",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ isActive: !found.isActive }),
//                   }).catch(() => setItems(rollback));
//                 }}
//                 onEdit={() => alert(`(placeholder) เปิด editor สำหรับ: ${c.id}`)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         // ===== List view with DndContext =====
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragEnd={onListDragEnd}
//         >
//           <HeroBannersListAdmin
//             rows={rows}
//             selectable
//             selectedIds={selectedIds}
//             onToggleSelect={handleToggleSelect}
//             onEdit={(id) => alert(`(placeholder) เปิด editor สำหรับ: ${id}`)}
//             onToggleActive={(id) => {
//               const found = items.find((x) => x.id === id);
//               if (!found) return;
//               const optimistic = items.map((x) =>
//                 x.id === id ? { ...x, isActive: !x.isActive } : x
//               );
//               const rollback = items;
//               setItems(optimistic);
//               fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//                 method: "PATCH",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ isActive: !found.isActive }),
//               }).catch(() => setItems(rollback));
//             }}
//             onDelete={(id) => {
//               const rollback = items;
//               setItems(items.filter((x) => x.id !== id));
//               fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//                 method: "DELETE",
//               }).catch(() => {
//                 setItems(rollback);
//                 alert("ลบไม่สำเร็จ");
//               });
//             }}
//           />
//         </DndContext>
//       )}
//     </div>
//   );
// }

// v.1.1.7 ==========================================

// v.1.1.6 ===========================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import HeroBannersListAdmin from "./hero-banners-list-admin";
// // ✅ ใช้ type จาก row component
// import { type HeroBannerRow as ListRow } from "./hero-banner-row-admin";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // view & filters
//   const [view, setView] = useState<ViewMode>("card");
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
//   const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

//   // selection (เฉพาะ list view)
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const dragFrom = useRef<string | null>(null);

//   // กัน reorder ซ้อนคำสั่ง
//   const reorderAbortRef = useRef<AbortController | null>(null);
//   const lastReqIdRef = useRef(0);

//   // fetch latest
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // ignore
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ===== Drag reorder (card view) =====
//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };
//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   // ⬇️ เรียก POST /api/mock/hero-banners/reorder ด้วยรูปแบบ { items: [...] }
//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const before = items.map((x) => ({ ...x })); // deep copy กัน drift
//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);

//     // optimistic UI
//     const optimistic = current.map((b, i) => ({ ...b, order: i }));
//     setItems(optimistic);

//     // ยกเลิกคำขอก่อนหน้า (ถ้ามี)
//     if (reorderAbortRef.current) reorderAbortRef.current.abort();
//     const ac = new AbortController();
//     reorderAbortRef.current = ac;

//     const reqId = ++lastReqIdRef.current;
//     setSaving(true);
//     try {
//       const payload = { items: optimistic.map((b) => ({ id: b.id, order: b.order })) };
//       const res = await fetch("/api/mock/hero-banners/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//         signal: ac.signal,
//       });
//       if (!res.ok) throw new Error("reorder failed");
//       const data = await res.json().catch(() => ({}));

//       // ปัด response เก่าทิ้งถ้ามีคำขอใหม่กว่า
//       if (reqId !== lastReqIdRef.current) return;

//       // ถ้าเซิร์ฟเวอร์ตอบกลับรายการล่าสุด ก็อัปเดตตามนั้น
//       if (Array.isArray(data?.items)) {
//         setItems(data.items as HeroBanner[]);
//       }
//     } catch (err: any) {
//       if (err?.name === "AbortError") {
//         // ถูกยกเลิกเพราะมีคำขอใหม่กว่า — ไม่ rollback
//         return;
//       }
//       // rollback เมื่อผิดพลาด
//       setItems(before);
//     } finally {
//       if (reqId === lastReqIdRef.current) {
//         setSaving(false);
//         reorderAbortRef.current = null;
//       }
//     }
//   };

//   // ===== Single actions =====
//   const toggleActive = async (id: string) => {
//     const found = items.find((x) => x.id === id);
//     if (!found) return;
//     const optimistic = items.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x));
//     const rollback = items;
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !found.isActive }),
//       });
//     } catch {
//       setItems(rollback);
//     }
//   };

//   const handleEdit = (id: string) => {
//     // TODO: ต่อ Drawer editor + live preview
//     alert(`(placeholder) เปิด editor สำหรับ: ${id}`);
//   };

//   const handleDelete = async (id: string) => {
//     const rollback = items;
//     setItems(items.filter((x) => x.id !== id));
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "DELETE",
//       });
//       setSelectedIds((prev) => {
//         const next = new Set(prev);
//         next.delete(id);
//         return next;
//       });
//     } catch {
//       setItems(rollback);
//       alert("ลบไม่สำเร็จ");
//     }
//   };

//   // ===== Filters =====
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return items.filter((b) => {
//       if (filterActive === "active" && !b.isActive) return false;
//       if (filterActive === "inactive" && b.isActive) return false;
//       if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
//       if (!q) return true;
//       const hay = `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
//       return hay.includes(q);
//     });
//   }, [items, search, filterActive, filterMode]);

//   // ===== Data mapping =====
//   const cards: HeroBannerCardData[] = filtered.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   const rows: ListRow[] = filtered.map((b) => ({
//     id: b.id,
//     order: b.order,
//     isActive: b.isActive,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     startAt: b.startAt,
//     endAt: b.endAt,
//   }));

//   // ===== Selection helpers (list view) =====
//   const handleToggleSelect = (id: string, checked: boolean) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   // ===== Bulk actions =====
//   const bulkEnable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: true }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDisable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDelete = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems(items.filter((x) => !selectedIds.has(x.id)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "DELETE",
//           })
//         )
//       );
//       setSelectedIds(new Set());
//     } catch {
//       setItems(rollback);
//       alert("ลบบางรายการไม่สำเร็จ");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={(v) => {
//           setView(v);
//           if (v !== "list") setSelectedIds(new Set());
//         }}
//         onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
//         search={search}
//         onSearchChange={setSearch}
//         filterActive={filterActive}
//         onFilterActiveChange={setFilterActive}
//         filterMode={filterMode}
//         onFilterModeChange={setFilterMode}
//         selectedCount={selectedIds.size}
//         onBulkEnable={bulkEnable}
//         onBulkDisable={bulkDisable}
//         onBulkDelete={bulkDelete}
//       />

//       {view === "card" ? (
//         filtered.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ไม่พบรายการตามเงื่อนไข
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() => toggleActive(c.id)}
//                 onEdit={() => handleEdit(c.id)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         <HeroBannersListAdmin
//           rows={rows}
//           selectable
//           selectedIds={selectedIds}
//           onToggleSelect={handleToggleSelect}
//           onEdit={handleEdit}
//           onToggleActive={toggleActive}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );
// }

// v.1.1.6 ===========================================

// v.1.1.5 ============================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import HeroBannersListAdmin from "./hero-banners-list-admin";
// // ✅ ใช้ type จาก row component
// import { type HeroBannerRow as ListRow } from "./hero-banner-row-admin";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // view & filters
//   const [view, setView] = useState<ViewMode>("card");
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
//   const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

//   // selection (เฉพาะ list view)
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const dragFrom = useRef<string | null>(null);

//   // fetch latest
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // ignore
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ===== Drag reorder (card view) =====
//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };
//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   // ⬇️ เปลี่ยนมาเรียก POST /api/mock/hero-banners/reorder ทีเดียว
//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const before = items; // สำหรับ rollback
//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);

//     // optimistic UI
//     const optimistic = current.map((b, i) => ({ ...b, order: i }));
//     setItems(optimistic);

//     setSaving(true);
//     try {
//       const res = await fetch("/api/mock/hero-banners/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(optimistic.map((b) => ({ id: b.id, order: b.order }))),
//       });
//       if (!res.ok) throw new Error("reorder failed");
//       const data = await res.json().catch(() => ({}));

//       // ถ้าเซิร์ฟเวอร์ตอบกลับรายการล่าสุด ก็อัปเดตตามนั้น
//       if (Array.isArray(data?.items)) {
//         setItems(data.items as HeroBanner[]);
//       }
//     } catch {
//       // rollback เมื่อผิดพลาด
//       setItems(before);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ===== Single actions =====
//   const toggleActive = async (id: string) => {
//     const found = items.find((x) => x.id === id);
//     if (!found) return;
//     const optimistic = items.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x));
//     const rollback = items;
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !found.isActive }),
//       });
//     } catch {
//       setItems(rollback);
//     }
//   };

//   const handleEdit = (id: string) => {
//     // TODO: ต่อ Drawer editor + live preview
//     alert(`(placeholder) เปิด editor สำหรับ: ${id}`);
//   };

//   const handleDelete = async (id: string) => {
//     const rollback = items;
//     setItems(items.filter((x) => x.id !== id));
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "DELETE",
//       });
//       setSelectedIds((prev) => {
//         const next = new Set(prev);
//         next.delete(id);
//         return next;
//       });
//     } catch {
//       setItems(rollback);
//       alert("ลบไม่สำเร็จ");
//     }
//   };

//   // ===== Filters =====
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return items.filter((b) => {
//       if (filterActive === "active" && !b.isActive) return false;
//       if (filterActive === "inactive" && b.isActive) return false;
//       if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
//       if (!q) return true;
//       const hay =
//         `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
//       return hay.includes(q);
//     });
//   }, [items, search, filterActive, filterMode]);

//   // ===== Data mapping =====
//   const cards: HeroBannerCardData[] = filtered.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   const rows: ListRow[] = filtered.map((b) => ({
//     id: b.id,
//     order: b.order,
//     isActive: b.isActive,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     startAt: b.startAt,
//     endAt: b.endAt,
//   }));

//   // ===== Selection helpers (list view) =====
//   const handleToggleSelect = (id: string, checked: boolean) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   // ===== Bulk actions =====
//   const bulkEnable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: true }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDisable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDelete = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems(items.filter((x) => !selectedIds.has(x.id)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "DELETE",
//           })
//         )
//       );
//       setSelectedIds(new Set());
//     } catch {
//       setItems(rollback);
//       alert("ลบบางรายการไม่สำเร็จ");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={(v) => {
//           setView(v);
//           if (v !== "list") setSelectedIds(new Set());
//         }}
//         onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
//         search={search}
//         onSearchChange={setSearch}
//         filterActive={filterActive}
//         onFilterActiveChange={setFilterActive}
//         filterMode={filterMode}
//         onFilterModeChange={setFilterMode}
//         selectedCount={selectedIds.size}
//         onBulkEnable={bulkEnable}
//         onBulkDisable={bulkDisable}
//         onBulkDelete={bulkDelete}
//       />

//       {view === "card" ? (
//         filtered.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ไม่พบรายการตามเงื่อนไข
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() => toggleActive(c.id)}
//                 onEdit={() => handleEdit(c.id)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         <HeroBannersListAdmin
//           rows={rows}
//           selectable
//           selectedIds={selectedIds}
//           onToggleSelect={handleToggleSelect}
//           onEdit={handleEdit}
//           onToggleActive={toggleActive}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );
// }

// v.1.1.5 ============================================


// v.1.1.4 =============================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import HeroBannersListAdmin from "./hero-banners-list-admin";
// // ✅ ใช้ type จาก row component
// import { type HeroBannerRow as ListRow } from "./hero-banner-row-admin";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // view & filters
//   const [view, setView] = useState<ViewMode>("card");
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
//   const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

//   // selection (เฉพาะ list view)
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const dragFrom = useRef<string | null>(null);

//   // fetch latest
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // ignore
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ===== Drag reorder (card view) =====
//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };
//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };
//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);
//     const normalized = current.map((b, i) => ({ ...b, order: i }));
//     setItems(normalized);

//     setSaving(true);
//     try {
//       await Promise.allSettled(
//         normalized.map((b) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ order: b.order }),
//           })
//         )
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ===== Single actions =====
//   const toggleActive = async (id: string) => {
//     const found = items.find((x) => x.id === id);
//     if (!found) return;
//     const optimistic = items.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x));
//     const rollback = items;
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !found.isActive }),
//       });
//     } catch {
//       setItems(rollback);
//     }
//   };

//   const handleEdit = (id: string) => {
//     // TODO: ต่อ Drawer editor + live preview
//     alert(`(placeholder) เปิด editor สำหรับ: ${id}`);
//   };

//   const handleDelete = async (id: string) => {
//     const rollback = items;
//     setItems(items.filter((x) => x.id !== id));
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "DELETE",
//       });
//       setSelectedIds((prev) => {
//         const next = new Set(prev);
//         next.delete(id);
//         return next;
//       });
//     } catch {
//       setItems(rollback);
//       alert("ลบไม่สำเร็จ");
//     }
//   };

//   // ===== Filters =====
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return items.filter((b) => {
//       if (filterActive === "active" && !b.isActive) return false;
//       if (filterActive === "inactive" && b.isActive) return false;
//       if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
//       if (!q) return true;
//       const hay =
//         `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
//       return hay.includes(q);
//     });
//   }, [items, search, filterActive, filterMode]);

//   // ===== Data mapping =====
//   const cards: HeroBannerCardData[] = filtered.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   const rows: ListRow[] = filtered.map((b) => ({
//     id: b.id,
//     order: b.order,
//     isActive: b.isActive,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     startAt: b.startAt,
//     endAt: b.endAt,
//   }));

//   // ===== Selection helpers (list view) =====
//   const handleToggleSelect = (id: string, checked: boolean) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (checked) next.add(id);
//       else next.delete(id);
//       return next;
//     });
//   };

//   // (ถ้าอยากมี “เลือกทั้งหมด/ยกเลิกทั้งหมด” สามารถทำใน Toolbar ของ list-view ได้ภายหลัง)

//   // ===== Bulk actions =====
//   const bulkEnable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: true }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDisable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDelete = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems(items.filter((x) => !selectedIds.has(x.id)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "DELETE",
//           })
//         )
//       );
//       setSelectedIds(new Set());
//     } catch {
//       setItems(rollback);
//       alert("ลบบางรายการไม่สำเร็จ");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={(v) => {
//           setView(v);
//           if (v !== "list") setSelectedIds(new Set());
//         }}
//         onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
//         search={search}
//         onSearchChange={setSearch}
//         filterActive={filterActive}
//         onFilterActiveChange={setFilterActive}
//         filterMode={filterMode}
//         onFilterModeChange={setFilterMode}
//         selectedCount={selectedIds.size}
//         onBulkEnable={bulkEnable}
//         onBulkDisable={bulkDisable}
//         onBulkDelete={bulkDelete}
//       />

//       {view === "card" ? (
//         filtered.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ไม่พบรายการตามเงื่อนไข
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() => toggleActive(c.id)}
//                 onEdit={() => handleEdit(c.id)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         <HeroBannersListAdmin
//           rows={rows}
//           selectable
//           selectedIds={selectedIds}
//           onToggleSelect={handleToggleSelect}
//           onEdit={handleEdit}
//           onToggleActive={toggleActive}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );
// }

// v.1.1.4 =============================================

// v.1.1.3 =============================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import HeroBannersListAdmin, { type Row as ListRow } from "./hero-banners-list-admin";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // view & filters
//   const [view, setView] = useState<ViewMode>("card");
//   const [search, setSearch] = useState("");
//   const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
//   const [filterMode, setFilterMode] = useState<"all" | "image" | "overlay" | "split">("all");

//   // selection (เฉพาะ list view)
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const dragFrom = useRef<string | null>(null);

//   // fetch latest
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // ignore
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   // ===== Drag reorder (card view) =====
//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };
//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };
//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);
//     const normalized = current.map((b, i) => ({ ...b, order: i }));
//     setItems(normalized);

//     setSaving(true);
//     try {
//       await Promise.allSettled(
//         normalized.map((b) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ order: b.order }),
//           })
//         )
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ===== Single actions =====
//   const toggleActive = async (id: string) => {
//     const found = items.find((x) => x.id === id);
//     if (!found) return;
//     const optimistic = items.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x));
//     const rollback = items;
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !found.isActive }),
//       });
//     } catch {
//       setItems(rollback);
//     }
//   };

//   const handleEdit = (id: string) => {
//     // TODO: ต่อ Drawer editor + live preview
//     alert(`(placeholder) เปิด editor สำหรับ: ${id}`);
//   };

//   const handleDelete = async (id: string) => {
//     const rollback = items;
//     setItems(items.filter((x) => x.id !== id));
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//         method: "DELETE",
//       });
//       setSelectedIds((prev) => {
//         const next = new Set(prev);
//         next.delete(id);
//         return next;
//       });
//     } catch {
//       setItems(rollback);
//       alert("ลบไม่สำเร็จ");
//     }
//   };

//   // ===== Filters =====
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return items.filter((b) => {
//       if (filterActive === "active" && !b.isActive) return false;
//       if (filterActive === "inactive" && b.isActive) return false;
//       if (filterMode !== "all" && b.layoutMode !== filterMode) return false;
//       if (!q) return true;
//       const hay =
//         `${b.id} ${b.title ?? ""} ${b.subtitle ?? ""} ${b.imageUrlDesktop}`.toLowerCase();
//       return hay.includes(q);
//     });
//   }, [items, search, filterActive, filterMode]);

//   // ===== Data mapping =====
//   const cards: HeroBannerCardData[] = filtered.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   const rows: ListRow[] = filtered.map((b) => ({
//     id: b.id,
//     order: b.order,
//     isActive: b.isActive,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     startAt: b.startAt,
//     endAt: b.endAt,
//   }));

//   // ===== Selection helpers (list view) =====
//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };
//   const toggleSelectAll = (checked: boolean, idsOnPage: string[]) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       idsOnPage.forEach((id) => {
//         if (checked) next.add(id);
//         else next.delete(id);
//       });
//       return next;
//     });
//   };

//   // ===== Bulk actions =====
//   const bulkEnable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: true } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: true }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDisable = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems((prev) => prev.map((x) => (selectedIds.has(x.id) ? { ...x, isActive: false } : x)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ isActive: false }),
//           })
//         )
//       );
//     } catch {
//       setItems(rollback);
//     }
//   };
//   const bulkDelete = async () => {
//     const ids = [...selectedIds];
//     if (!ids.length) return;
//     const rollback = items;
//     setItems(items.filter((x) => !selectedIds.has(x.id)));
//     try {
//       await Promise.allSettled(
//         ids.map((id) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(id)}`, {
//             method: "DELETE",
//           })
//         )
//       );
//       setSelectedIds(new Set());
//     } catch {
//       setItems(rollback);
//       alert("ลบบางรายการไม่สำเร็จ");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={(v) => {
//           setView(v);
//           // เคลียร์ selection เมื่อสลับโหมด
//           if (v !== "list") setSelectedIds(new Set());
//         }}
//         onCreate={() => alert("(placeholder) สร้างแบนเนอร์ใหม่")}
//         search={search}
//         onSearchChange={setSearch}
//         filterActive={filterActive}
//         onFilterActiveChange={setFilterActive}
//         filterMode={filterMode}
//         onFilterModeChange={setFilterMode}
//         selectedCount={selectedIds.size}
//         onBulkEnable={bulkEnable}
//         onBulkDisable={bulkDisable}
//         onBulkDelete={bulkDelete}
//       />

//       {view === "card" ? (
//         filtered.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ไม่พบรายการตามเงื่อนไข
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() => toggleActive(c.id)}
//                 onEdit={() => handleEdit(c.id)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         <HeroBannersListAdmin
//           rows={rows}
//           selectedIds={selectedIds}
//           onToggleSelect={toggleSelect}
//           onToggleSelectAll={toggleSelectAll}
//           onEdit={handleEdit}
//           onToggleActive={toggleActive}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );
// }

// v.1.1.3 =============================================

// v.1.1.2 =============================================
// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import HeroBannersToolbar, { type ViewMode } from "./hero-banners-toolbar";
// import HeroBannerCardAdmin, { type HeroBannerCardData } from "./hero-banner-card-admin";
// import { Button } from "@/components/ui/button";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [view, setView] = useState<ViewMode>("card"); // สลับการ์ด/รายการ
//   const dragFrom = useRef<string | null>(null);

//   // โหลดซ้ำจาก API เผื่อหน้า SSR เก่า
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // เงียบไว้
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };

//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     // optimistic reorder
//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);
//     const normalized = current.map((b, i) => ({ ...b, order: i }));
//     setItems(normalized);

//     setSaving(true);
//     try {
//       await Promise.allSettled(
//         normalized.map((b) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ order: b.order }),
//           })
//         )
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleActive = async (b: HeroBanner) => {
//     const optimistic = items.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x));
//     const rollback = items;
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !b.isActive }),
//       });
//     } catch {
//       setItems(rollback);
//     }
//   };

//   const handleEdit = (b: HeroBanner) => {
//     // TODO: ต่อ drawer editor + live preview ในสเต็ปถัดไป
//     alert(`(placeholder) เปิด editor สำหรับ: ${b.id}`);
//   };

//   const handleCreate = () => {
//     // TODO: ต่อ drawer editor โหมดสร้างใหม่
//     alert("(placeholder) สร้างแบนเนอร์ใหม่");
//   };

//   const gridCls = useMemo(
//     () => "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
//     []
//   );

//   // แปลงข้อมูลสำหรับการ์ด
//   const cards: HeroBannerCardData[] = items.map((b) => ({
//     id: b.id,
//     isActive: b.isActive,
//     order: b.order,
//     layoutMode: b.layoutMode,
//     imageUrlDesktop: b.imageUrlDesktop,
//     title: b.title,
//     subtitle: b.subtitle,
//     overlay: b.overlay,
//     altText: b.altText,
//   }));

//   return (
//     <div className="space-y-4">
//       {/* Toolbar */}
//       <HeroBannersToolbar
//         total={items.length}
//         loading={loading}
//         saving={saving}
//         view={view}
//         onViewChange={setView}
//         onCreate={handleCreate}
//       />

//       {/* Content */}
//       {view === "card" ? (
//         items.length === 0 ? (
//           <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//             ยังไม่มีแบนเนอร์ — กด “เพิ่มแบนเนอร์”
//           </div>
//         ) : (
//           <div className={gridCls}>
//             {cards.map((c) => (
//               <HeroBannerCardAdmin
//                 key={c.id}
//                 data={c}
//                 draggable
//                 onDragStart={() => onDragStart(c.id)}
//                 onDragOver={onDragOver}
//                 onDrop={() => onDrop(c.id)}
//                 onToggleActive={() =>
//                   toggleActive(items.find((x) => x.id === c.id)!)
//                 }
//                 onEdit={() => handleEdit(items.find((x) => x.id === c.id)!)}
//               />
//             ))}
//           </div>
//         )
//       ) : (
//         // List view (ตาราง) จะทำในสเต็ปถัดไป
//         <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//           โหมด “รายการ” (List view) กำลังพัฒนา — จะตามให้ในขั้นตอนถัดไปครับ
//         </div>
//       )}
//     </div>
//   );
// }

// v.1.1.2 =============================================

// // src/components/admin/hero-banners/hero-banners-client.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";

// type AlignX = "left" | "center" | "right";
// type AlignY = "top" | "center" | "bottom";
// type LayoutMode = "image" | "overlay" | "split";

// export type HeroBanner = {
//   id: string;
//   isActive: boolean;
//   order: number;
//   startAt?: string;
//   endAt?: string;
//   layoutMode: LayoutMode;
//   imageUrlDesktop: string;
//   imageUrlMobile?: string;
//   title?: string;
//   subtitle?: string;
//   textAlign?: { x: AlignX; y: AlignY };
//   overlay?: { color: string; opacity: number };
//   linkUrl?: string;
//   altText?: string;
//   locale?: string;
//   ctas?: Array<{ label: string; href: string; variant?: "primary" | "outline" | "ghost" }>;
// };

// type Props = {
//   initialItems?: HeroBanner[];
// };

// export default function HeroBannersClient({ initialItems = [] }: Props) {
//   const [items, setItems] = useState<HeroBanner[]>(initialItems);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const dragFrom = useRef<string | null>(null);

//   // โหลดซ้ำจาก API เผื่อหน้า SSR เก่า
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/mock/hero-banners", { cache: "no-store" });
//         if (!res.ok) throw new Error("load failed");
//         const data = await res.json();
//         if (!alive) return;
//         setItems((data?.items ?? []) as HeroBanner[]);
//       } catch {
//         // เงียบไว้ก่อน
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const onDragStart = (id: string) => {
//     dragFrom.current = id;
//   };

//   const onDragOver = (e: React.DragEvent) => {
//     e.preventDefault(); // allow drop
//   };

//   const onDrop = async (targetId: string) => {
//     const fromId = dragFrom.current;
//     dragFrom.current = null;
//     if (!fromId || fromId === targetId) return;

//     const current = [...items];
//     const fromIdx = current.findIndex((x) => x.id === fromId);
//     const toIdx = current.findIndex((x) => x.id === targetId);
//     if (fromIdx < 0 || toIdx < 0) return;

//     // reorder ใน UI แบบ optimistic
//     const moved = current.splice(fromIdx, 1)[0];
//     current.splice(toIdx, 0, moved);
//     const normalized = current.map((b, i) => ({ ...b, order: i }));
//     setItems(normalized);

//     // PATCH orders ทั้งชุด (ง่ายสุดใน mock)
//     setSaving(true);
//     try {
//       await Promise.allSettled(
//         normalized.map((b) =>
//           fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ order: b.order }),
//           })
//         )
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleActive = async (b: HeroBanner) => {
//     const optimistic = items.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x));
//     setItems(optimistic);
//     try {
//       await fetch(`/api/mock/hero-banners?id=${encodeURIComponent(b.id)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ isActive: !b.isActive }),
//       });
//     } catch {
//       // rollback (ง่าย ๆ)
//       setItems(items);
//     }
//   };

//   const handleEdit = (b: HeroBanner) => {
//     // TODO: สเต็ปถัดไปจะเปิด Drawer/Editor + Live preview
//     alert(`(placeholder) เปิด editor สำหรับ: ${b.id}`);
//   };

//   const handleCreate = () => {
//     // TODO: สเต็ปถัดไปจะเปิด Drawer/Editor โหมดสร้างใหม่
//     alert("(placeholder) สร้างแบนเนอร์ใหม่");
//   };

//   const gridCls = useMemo(
//     () =>
//       "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
//     []
//   );

//   return (
//     <div className="space-y-4">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between">
//         <div className="text-sm text-muted-foreground">
//           ทั้งหมด {items.length} รายการ {loading ? "• กำลังโหลด..." : ""} {saving ? "• บันทึกการเรียงลำดับ..." : ""}
//         </div>
//         <Button onClick={handleCreate}>+ เพิ่มแบนเนอร์</Button>
//       </div>

//       {/* Grid (Visual) */}
//       {items.length === 0 ? (
//         <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
//           ยังไม่มีแบนเนอร์ — กด “เพิ่มแบนเนอร์”
//         </div>
//       ) : (
//         <div className={gridCls}>
//           {items.map((b) => (
//             <div
//               key={b.id}
//               className="group relative rounded-xl border bg-card shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
//               draggable
//               onDragStart={() => onDragStart(b.id)}
//               onDragOver={onDragOver}
//               onDrop={() => onDrop(b.id)}
//             >
//               {/* หัวการ์ด */}
//               <div className="flex items-center justify-between px-3 py-2 border-b">
//                 <div className="flex items-center gap-2">
//                   <span className="cursor-grab select-none text-muted-foreground" title="ลากเพื่อจัดลำดับ">⋮⋮</span>
//                   <span className="text-xs font-mono text-muted-foreground">#{b.order}</span>
//                   <span className="text-sm font-medium">{b.layoutMode}</span>
//                   <span
//                     className={[
//                       "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
//                       b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
//                     ].join(" ")}
//                   >
//                     {b.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Button size="sm" variant="secondary" onClick={() => toggleActive(b)}>
//                     {b.isActive ? "ปิด" : "เปิด"}
//                   </Button>
//                   <Button size="sm" onClick={() => handleEdit(b)}>แก้ไข</Button>
//                 </div>
//               </div>

//               {/* พรีวิวภาพ (Desktop) */}
//               <div className="relative h-44 md:h-52">
                
//                 <Image
//                   src={b.imageUrlDesktop || "/placeholder.png"}
//                   alt={b.altText || b.title || b.id}
//                   fill
//                   className="object-cover"
//                   sizes="(max-width: 768px) 100vw, 33vw"
//                 />
//                 {/* overlay indicator (ถ้าโหมด overlay) */}
//                 {b.layoutMode === "overlay" && b.overlay && (
//                   <div
//                     className="absolute inset-0"
//                     style={{ backgroundColor: b.overlay.color, opacity: b.overlay.opacity ?? 0.35 }}
//                   />
//                 )}
//                 {/* title preview */}
//                 {(b.title || b.subtitle) && (
//                   <div className="absolute inset-0 p-3 md:p-4 flex">
//                     <div
//                       className={[
//                         "mt-auto rounded-md bg-black/35 text-white backdrop-blur-[1px] px-3 py-2",
//                         "max-w-[80%] text-xs md:text-sm",
//                       ].join(" ")}
//                     >
//                       {b.title && <div className="font-semibold leading-tight truncate">{b.title}</div>}
//                       {b.subtitle && <div className="opacity-90 leading-tight truncate">{b.subtitle}</div>}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* ฟุตการ์ด */}
//               <div className="px-3 py-2 text-xs text-muted-foreground border-t">
//                 <div className="truncate">
//                   <span className="font-medium text-foreground">{b.id}</span>
//                   <span className="mx-2">·</span>
//                   <span className="truncate inline-block max-w-[60%] align-bottom">{b.imageUrlDesktop}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
