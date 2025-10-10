// v.1.1.5 ================================================
// src/app/admin/components/AdminDiscountRulesGrid.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminEditable from "./AdminEditable";
// ✅ แยก default component ออกมาชัด ๆ และ import type แบบ type-only
import AdminDiscountRuleEditDialog from "./AdminDiscountRuleEditDialog";
import type { DiscountRuleEditValues } from "./AdminDiscountRuleEditDialog";

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= Types ================= */
export type DiscountRule = {
  id: number | string;
  minPercent: number;
  maxPercent?: number;
  borderWidth: number;
  borderColorHex: string;
  badgeBgHex?: string;
  badgeTextHex?: string;
  order: number;
  enabled: boolean;

  // NEW: frame options (เก็บในฐาน)
  frameMode?: "draw" | "image";
  frameImageUrl?: string;
  frameInsetPx?: number;
  frameOpacity?: number;                 // 0..1
  frameObjectFit?: "contain" | "cover" | "stretch";
};

type UIMeta = { title: string; subtitle: string; updatedAt?: string };

const API_BASE = "/api/mock/discount-rules";

/* ---------- Small helpers ---------- */
function labelRangeOf(r: DiscountRule) {
  const min = r.minPercent ?? 0;
  const max = typeof r.maxPercent === "number" ? r.maxPercent : undefined;
  return max != null ? `${min}% – ${max}%` : `${min}%+`;
}

/** clamp helper */
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** แปลงค่าจาก Dialog -> payload ที่ backend คาดหวัง (ยึดโค้ดเดิมเป็นหลัก) */
function normalize(values: DiscountRuleEditValues): Partial<DiscountRule> {
  const frameMode = (values.frameMode === "image" ? "image" : "draw") as "draw" | "image";

  return {
    minPercent: Number(values.minPercent),
    maxPercent:
      values.maxPercent === "" || values.maxPercent == null
        ? undefined
        : Number(values.maxPercent),

    borderWidth: Number(values.borderWidth),
    borderColorHex: values.borderColorHex,
    badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
    badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
    enabled: !!values.enabled,

    // NEW: map ชื่อฟิลด์จาก Dialog (frameImage*) -> ฟิลด์ที่เราบันทึก (frame*)
    frameMode,
    frameImageUrl:
      frameMode === "image" && values.frameImageUrl?.trim()
        ? values.frameImageUrl.trim()
        : undefined,
    frameInsetPx:
      frameMode === "image" ? Math.max(0, Number(values.frameImageInsetPx) || 0) : undefined,
    frameOpacity:
      frameMode === "image"
        ? clamp(Number(values.frameImageOpacity ?? 1) || 1, 0, 1)
        : undefined,
    frameObjectFit:
      frameMode === "image"
        ? (values.frameImageFit as "contain" | "cover" | "stretch") ?? "contain"
        : undefined,
  };
}

/* ---------- Sortable Row ---------- */
function SortableRule({
  rule,
  onDelete,
  onToggleEnabled,
  onEdit,
}: {
  rule: DiscountRule;
  onDelete: (id: DiscountRule["id"]) => void;
  onToggleEnabled: (id: DiscountRule["id"]) => void;
  onEdit: (id: DiscountRule["id"]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  const isImageMode = (rule.frameMode ?? "draw") === "image";
  const inset = rule.frameInsetPx ?? 0;
  const opacity = typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1;
  const objFit = rule.frameObjectFit === "stretch" ? ("fill" as any) : (rule.frameObjectFit ?? "contain");

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
      <AdminEditable
        onDelete={() => onDelete(rule.id)}
        onToggleVisible={() => onToggleEnabled(rule.id)}
        onEdit={() => onEdit(rule.id)}
        // ใช้ visible icon เป็น toggle-enabled แทน
        visible={rule.enabled}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <div className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-center gap-4">
          {/* Preview box: ใช้กล่องเทาแทนรูปสินค้า เพื่อตัดปัญหา 404 ของ /placeholder.png */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
            {/* ชั้นพื้นหลังแทนสินค้า */}
            <div className="absolute inset-0 bg-slate-200/60" />
            {/* frame */}
            {isImageMode && rule.frameImageUrl ? (
              <img
                src={rule.frameImageUrl}
                alt=""
                className="absolute pointer-events-none"
                style={{
                  top: inset,
                  left: inset,
                  right: inset,
                  bottom: inset,
                  opacity,
                  objectFit: objFit,
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            ) : (
              <div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{ border: `${rule.borderWidth}px solid ${rule.borderColorHex}` }}
                title={`Border ${rule.borderWidth}px ${rule.borderColorHex}`}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium">{labelRangeOf(rule)}</div>

              <span className="text-xs text-muted-foreground">Mode:</span>
              <code className="text-xs uppercase">{(rule.frameMode ?? "draw").toUpperCase()}</code>

              {((rule.frameMode ?? "draw") === "draw") ? (
                <>
                  <span className="text-xs text-muted-foreground">• Border</span>
                  <code className="text-xs">{rule.borderWidth}px</code>
                  <span className="text-xs text-muted-foreground">• Color</span>
                  <span className="text-xs" style={{ color: rule.borderColorHex }}>{rule.borderColorHex}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">• Image</span>
                  <code className="text-xs">{rule.frameImageUrl ? "✓" : "–"}</code>
                  <span className="text-xs text-muted-foreground">• Inset</span>
                  <code className="text-xs">{inset}px</code>
                  <span className="text-xs text-muted-foreground">• Opacity</span>
                  <code className="text-xs">{opacity}</code>
                  <span className="text-xs text-muted-foreground">• Fit</span>
                  <code className="text-xs">{rule.frameObjectFit ?? "contain"}</code>
                </>
              )}

              {rule.badgeBgHex && (
                <>
                  <span className="text-xs text-muted-foreground">• Badge</span>
                  <span className="text-xs" style={{ color: rule.badgeBgHex }}>{rule.badgeBgHex}</span>
                  {rule.badgeTextHex && (
                    <>
                      <span className="text-xs text-muted-foreground">/</span>
                      <span className="text-xs" style={{ color: rule.badgeTextHex }}>{rule.badgeTextHex}</span>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Order: {rule.order} • {rule.enabled ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      </AdminEditable>
    </div>
  );
}

/* ---------- Main Grid ---------- */
export default function AdminDiscountRulesGrid({
  initial,
  initialMeta,
}: {
  initial: DiscountRule[];
  initialMeta?: UIMeta;
}) {
  const [items, setItems] = useState<DiscountRule[]>(initial);
  const [meta, setMeta] = useState<UIMeta>(
    initialMeta ?? { title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
  );

  const [saving, setSaving] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<DiscountRule["id"] | null>(null);
  const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;

  // ป้องกัน hydration mismatch: render ส่วน dnd เฉพาะหลัง mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => setItems(initial), [initial]);

  useEffect(() => {
    if (initialMeta) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/meta`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.meta) setMeta(data.meta as UIMeta);
      } catch { /* noop */ }
    })();
  }, [initialMeta]);

  const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
  // ถ้าไม่อยากพึ่ง NodeJS.Timeout ใน client: ใช้ ReturnType<typeof setTimeout>
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOrdersRef = useRef<Array<{ id: DiscountRule["id"]; order: number }>>([]);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const postReorder = (orders: Array<{ id: DiscountRule["id"]; order: number }>) => {
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    lastOrdersRef.current = orders;
    reorderTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        setError(null);
        const res = await fetch(`${API_BASE}/reorder`, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ orders: lastOrdersRef.current }),
        });
        if (!res.ok) throw new Error("REORDER failed");
      } catch (e: any) {
        setError(e?.message ?? "Reorder failed");
      } finally {
        setSaving(false);
      }
    }, 350);
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
      } catch { /* noop */ }
      finally { setMetaSaving(false); }
    }, 400);
  };

  const onDragEnd = (ev: DragEndEvent) => {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
    setItems(next);
    postReorder(next.map((x) => ({ id: x.id, order: x.order })));
  };

  const handleDelete = async (id: DiscountRule["id"]) => {
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Delete failed");
    } finally { setSaving(false); }
  };

  const handleToggleEnabled = async (id: DiscountRule["id"]) => {
    const snapshot = items;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify({ toggleEnabled: true }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e: any) {
      setItems(snapshot);
      setError(e?.message ?? "Update failed");
    } finally { setSaving(false); }
  };

  // create
  const saveCreate = async (values: DiscountRuleEditValues) => {
    const payload = normalize(values);
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Create failed");
    }
    const data = await res.json();
    const item = data?.item as DiscountRule | undefined;
    if (!item) throw new Error("No item returned");
    setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  };

  // edit
  const saveEdit = async (values: DiscountRuleEditValues) => {
    if (!editingItem) return;
    const id = editingItem.id;
    const snapshot = items;
    const payload = normalize(values);

    // optimistic UI
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch (e: any) {
      setItems(snapshot);
      throw e;
    }
  };

  return (
    <section className="py-4 relative">
      {(saving || metaSaving) && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end pr-2 pt-2 gap-2">
          {saving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving…</span>}
          {metaSaving && <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground shadow">Saving title…</span>}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header + Add */}
      <div className="mb-6 flex items-start justify-between gap-3">
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
        <button
          type="button"
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
          onClick={() => setCreating(true)}
        >
          + เพิ่มกฎ
        </button>
      </div>

      {/* ส่วนที่พึ่ง dnd-kit & dialogs: แสดงหลัง mount เท่านั้น */}
      {mounted && (
        <>
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((rule) => (
                  <SortableRule
                    key={rule.id}
                    rule={rule}
                    onDelete={handleDelete}
                    onToggleEnabled={handleToggleEnabled}
                    onEdit={(id) => setEditingId(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Create */}
          <AdminDiscountRuleEditDialog
            key={creating ? "create" : "create-closed"}
            open={creating}
            initial={{
              minPercent: 0,
              maxPercent: "",

              frameMode: "draw",
              borderWidth: 2,
              borderColorHex: "#0ea5e9",

              frameImageUrl: "",
              frameImageInsetPx: 0,
              frameImageOpacity: 1,
              frameImageFit: "contain",

              badgeBgHex: "",
              badgeTextHex: "",
              enabled: true,
            }}
            onClose={() => setCreating(false)}
            onSave={async (vals: DiscountRuleEditValues) => { await saveCreate(vals); setCreating(false); }}
            mode="create"
          />

          {/* Edit */}
          <AdminDiscountRuleEditDialog
            key={editingId ?? "edit-closed"}
            open={!!editingItem}
            initial={
              editingItem
                ? {
                    minPercent: editingItem.minPercent,
                    maxPercent: editingItem.maxPercent ?? "",

                    frameMode: editingItem.frameMode ?? "draw",
                    borderWidth: editingItem.borderWidth,
                    borderColorHex: editingItem.borderColorHex,

                    frameImageUrl: editingItem.frameImageUrl ?? "",
                    frameImageInsetPx: editingItem.frameInsetPx ?? 0,
                    frameImageOpacity: typeof editingItem.frameOpacity === "number" ? editingItem.frameOpacity : 1,
                    frameImageFit: editingItem.frameObjectFit ?? "contain",

                    badgeBgHex: editingItem.badgeBgHex ?? "",
                    badgeTextHex: editingItem.badgeTextHex ?? "",
                    enabled: editingItem.enabled,
                  }
                : {
                    minPercent: 60, maxPercent: 69,

                    frameMode: "draw",
                    borderWidth: 2,
                    borderColorHex: "#0ea5e9",

                    frameImageUrl: "",
                    frameImageInsetPx: 0,
                    frameImageOpacity: 1,
                    frameImageFit: "contain",

                    badgeBgHex: "",
                    badgeTextHex: "",
                    enabled: true,
                  }
            }
            onClose={() => setEditingId(null)}
            onSave={async (vals: DiscountRuleEditValues) => { await saveEdit(vals); setEditingId(null); }}
            mode="edit"
          />
        </>
      )}
    </section>
  );
}

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/app/admin/components/AdminDiscountRulesGrid.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminDiscountRuleEditDialog, { DiscountRuleEditValues } from "./AdminDiscountRuleEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type DiscountRule = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   order: number;
//   enabled: boolean;

//   // NEW: frame options (เก็บในฐาน)
//   frameMode?: "draw" | "image";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;                 // 0..1
//   frameObjectFit?: "contain" | "cover" | "stretch";
// };

// type UIMeta = { title: string; subtitle: string; updatedAt?: string };

// const API_BASE = "/api/mock/discount-rules";

// /* ---------- Small helpers ---------- */
// function labelRangeOf(r: DiscountRule) {
//   const min = r.minPercent ?? 0;
//   const max = typeof r.maxPercent === "number" ? r.maxPercent : undefined;
//   return max != null ? `${min}% – ${max}%` : `${min}%+`;
// }

// /** clamp helper */
// const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// /** แปลงค่าจาก Dialog -> payload ที่ backend คาดหวัง (ยึดโค้ดเดิมเป็นหลัก) */
// function normalize(values: DiscountRuleEditValues): Partial<DiscountRule> {
//   const frameMode = (values.frameMode === "image" ? "image" : "draw") as "draw" | "image";

//   return {
//     minPercent: Number(values.minPercent),
//     maxPercent:
//       values.maxPercent === "" || values.maxPercent == null
//         ? undefined
//         : Number(values.maxPercent),

//     borderWidth: Number(values.borderWidth),
//     borderColorHex: values.borderColorHex,
//     badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//     badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
//     enabled: !!values.enabled,

//     // NEW: map ชื่อฟิลด์จาก Dialog (frameImage*) -> ฟิลด์ที่เราบันทึก (frame*)
//     frameMode,
//     frameImageUrl:
//       frameMode === "image" && values.frameImageUrl?.trim()
//         ? values.frameImageUrl.trim()
//         : undefined,
//     frameInsetPx:
//       frameMode === "image" ? Math.max(0, Number(values.frameImageInsetPx) || 0) : undefined,
//     frameOpacity:
//       frameMode === "image"
//         ? clamp(Number(values.frameImageOpacity ?? 1) || 1, 0, 1)
//         : undefined,
//     frameObjectFit:
//       frameMode === "image"
//         ? (values.frameImageFit as "contain" | "cover" | "stretch") ?? "contain"
//         : undefined,
//   };
// }

// /* ---------- Sortable Row ---------- */
// function SortableRule({
//   rule,
//   onDelete,
//   onToggleEnabled,
//   onEdit,
// }: {
//   rule: DiscountRule;
//   onDelete: (id: DiscountRule["id"]) => void;
//   onToggleEnabled: (id: DiscountRule["id"]) => void;
//   onEdit: (id: DiscountRule["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isImageMode = (rule.frameMode ?? "draw") === "image";
//   const inset = rule.frameInsetPx ?? 0;
//   const opacity = typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1;
//   const objFit = rule.frameObjectFit === "stretch" ? ("fill" as any) : (rule.frameObjectFit ?? "contain");

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(rule.id)}
//         onToggleVisible={() => onToggleEnabled(rule.id)}
//         onEdit={() => onEdit(rule.id)}
//         // ใช้ visible icon เป็น toggle-enabled แทน
//         visible={rule.enabled}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-center gap-4">
//           {/* Preview box: ใช้กล่องเทาแทนรูปสินค้า เพื่อตัดปัญหา 404 ของ /placeholder.png */}
//           <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
//             {/* ชั้นพื้นหลังแทนสินค้า */}
//             <div className="absolute inset-0 bg-slate-200/60" />
//             {/* frame */}
//             {isImageMode && rule.frameImageUrl ? (
//               <img
//                 src={rule.frameImageUrl}
//                 alt=""
//                 className="absolute pointer-events-none"
//                 style={{
//                   top: inset,
//                   left: inset,
//                   right: inset,
//                   bottom: inset,
//                   opacity,
//                   objectFit: objFit,
//                   width: "auto",
//                   height: "auto",
//                   maxWidth: "100%",
//                   maxHeight: "100%",
//                 }}
//               />
//             ) : (
//               <div
//                 className="absolute inset-0 rounded-lg pointer-events-none"
//                 style={{ border: `${rule.borderWidth}px solid ${rule.borderColorHex}` }}
//                 title={`Border ${rule.borderWidth}px ${rule.borderColorHex}`}
//               />
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex flex-wrap items-center gap-2">
//               <div className="text-sm font-medium">{labelRangeOf(rule)}</div>

//               <span className="text-xs text-muted-foreground">Mode:</span>
//               <code className="text-xs uppercase">{(rule.frameMode ?? "draw").toUpperCase()}</code>

//               {((rule.frameMode ?? "draw") === "draw") ? (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Border</span>
//                   <code className="text-xs">{rule.borderWidth}px</code>
//                   <span className="text-xs text-muted-foreground">• Color</span>
//                   <span className="text-xs" style={{ color: rule.borderColorHex }}>{rule.borderColorHex}</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Image</span>
//                   <code className="text-xs">{rule.frameImageUrl ? "✓" : "–"}</code>
//                   <span className="text-xs text-muted-foreground">• Inset</span>
//                   <code className="text-xs">{inset}px</code>
//                   <span className="text-xs text-muted-foreground">• Opacity</span>
//                   <code className="text-xs">{opacity}</code>
//                   <span className="text-xs text-muted-foreground">• Fit</span>
//                   <code className="text-xs">{rule.frameObjectFit ?? "contain"}</code>
//                 </>
//               )}

//               {rule.badgeBgHex && (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Badge</span>
//                   <span className="text-xs" style={{ color: rule.badgeBgHex }}>{rule.badgeBgHex}</span>
//                   {rule.badgeTextHex && (
//                     <>
//                       <span className="text-xs text-muted-foreground">/</span>
//                       <span className="text-xs" style={{ color: rule.badgeTextHex }}>{rule.badgeTextHex}</span>
//                     </>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="text-xs text-muted-foreground">
//               Order: {rule.order} • {rule.enabled ? "Enabled" : "Disabled"}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminDiscountRulesGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: DiscountRule[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<DiscountRule[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
//   );

//   const [saving, setSaving] = useState(false);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [creating, setCreating] = useState(false);
//   const [editingId, setEditingId] = useState<DiscountRule["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;

//   // ป้องกัน hydration mismatch: render ส่วน dnd เฉพาะหลัง mount
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE}/meta`, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: DiscountRule["id"]; order: number }>>([]);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);

//   const postReorder = (orders: Array<{ id: DiscountRule["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 350);
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
//     }, 400);
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order })));
//   };

//   const handleDelete = async (id: DiscountRule["id"]) => {
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

//   const handleToggleEnabled = async (id: DiscountRule["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ toggleEnabled: true }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   // create
//   const saveCreate = async (values: DiscountRuleEditValues) => {
//     const payload = normalize(values);
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as DiscountRule | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: DiscountRuleEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;
//     const payload = normalize(values);

//     // optimistic UI
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(payload),
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

//       {/* Header + Add (คงไว้เหมือนเดิม และเรนเดอร์ได้ตั้งแต่ SSR) */}
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
//           + เพิ่มกฎ
//         </button>
//       </div>

//       {/* ส่วนที่พึ่ง dnd-kit & dialogs: แสดงหลัง mount เท่านั้น */}
//       {mounted && (
//         <>
//           <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//             <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {items.map((rule) => (
//                   <SortableRule
//                     key={rule.id}
//                     rule={rule}
//                     onDelete={handleDelete}
//                     onToggleEnabled={handleToggleEnabled}
//                     onEdit={(id) => setEditingId(id)}
//                   />
//                 ))}
//               </div>
//             </SortableContext>
//           </DndContext>

//           {/* Create */}
//           <AdminDiscountRuleEditDialog
//             key={creating ? "create" : "create-closed"}
//             open={creating}
//             initial={{
//               minPercent: 0,
//               maxPercent: "",

//               // โหมดเริ่มต้น DRAW
//               frameMode: "draw",
//               borderWidth: 2,
//               borderColorHex: "#0ea5e9",

//               // ค่า default ของโหมด IMAGE (ไม่ใช้ก็เก็บไว้ได้)
//               frameImageUrl: "",
//               frameImageInsetPx: 0,
//               frameImageOpacity: 1,
//               frameImageFit: "contain",

//               badgeBgHex: "",
//               badgeTextHex: "",
//               enabled: true,
//             }}
//             onClose={() => setCreating(false)}
//             onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//             mode="create"
//           />

//           {/* Edit */}
//           <AdminDiscountRuleEditDialog
//             key={editingId ?? "edit-closed"}
//             open={!!editingItem}
//             initial={
//               editingItem
//                 ? {
//                     minPercent: editingItem.minPercent,
//                     maxPercent: editingItem.maxPercent ?? "",

//                     frameMode: editingItem.frameMode ?? "draw",
//                     borderWidth: editingItem.borderWidth,
//                     borderColorHex: editingItem.borderColorHex,

//                     frameImageUrl: editingItem.frameImageUrl ?? "",
//                     frameImageInsetPx: editingItem.frameInsetPx ?? 0,
//                     frameImageOpacity: typeof editingItem.frameOpacity === "number" ? editingItem.frameOpacity : 1,
//                     frameImageFit: editingItem.frameObjectFit ?? "contain",

//                     badgeBgHex: editingItem.badgeBgHex ?? "",
//                     badgeTextHex: editingItem.badgeTextHex ?? "",
//                     enabled: editingItem.enabled,
//                   }
//                 : {
//                     minPercent: 60, maxPercent: 69,

//                     frameMode: "draw",
//                     borderWidth: 2,
//                     borderColorHex: "#0ea5e9",

//                     frameImageUrl: "",
//                     frameImageInsetPx: 0,
//                     frameImageOpacity: 1,
//                     frameImageFit: "contain",

//                     badgeBgHex: "",
//                     badgeTextHex: "",
//                     enabled: true,
//                   }
//             }
//             onClose={() => setEditingId(null)}
//             onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//             mode="edit"
//           />
//         </>
//       )}
//     </section>
//   );
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/app/admin/components/AdminDiscountRulesGrid.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminDiscountRuleEditDialog, { DiscountRuleEditValues } from "./AdminDiscountRuleEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ================= Types ================= */
// export type DiscountRule = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   order: number;
//   enabled: boolean;

//   // NEW: frame options
//   frameMode?: "draw" | "image";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number;                 // 0..1
//   frameObjectFit?: "contain" | "cover";
// };

// type UIMeta = { title: string; subtitle: string; updatedAt?: string };

// const API_BASE = "/api/mock/discount-rules";

// /* ---------- Small helpers ---------- */
// function labelRangeOf(r: DiscountRule) {
//   const min = r.minPercent ?? 0;
//   const max = typeof r.maxPercent === "number" ? r.maxPercent : undefined;
//   return max != null ? `${min}% – ${max}%` : `${min}%+`;
// }

// /** clamp helper */
// const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// /** แปลงค่าจาก Dialog -> payload ที่ backend คาดหวัง (ยึดโค้ดเดิมเป็นหลัก) */
// function normalize(values: DiscountRuleEditValues): Partial<DiscountRule> {
//   const frameMode = (values.frameMode === "image" ? "image" : "draw") as "draw" | "image";

//   return {
//     minPercent: Number(values.minPercent),
//     maxPercent:
//       values.maxPercent === "" || values.maxPercent == null
//         ? undefined
//         : Number(values.maxPercent),

//     borderWidth: Number(values.borderWidth),
//     borderColorHex: values.borderColorHex,
//     badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//     badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
//     enabled: !!values.enabled,

//     // NEW
//     frameMode,
//     frameImageUrl:
//       frameMode === "image" && values.frameImageUrl?.trim()
//         ? values.frameImageUrl.trim()
//         : undefined,
//     frameInsetPx:
//       frameMode === "image" ? Math.max(0, Number(values.frameInsetPx) || 0) : undefined,
//     frameOpacity:
//       frameMode === "image"
//         ? clamp(Number(values.frameOpacity ?? 1) || 1, 0, 1)
//         : undefined,
//     frameObjectFit:
//       frameMode === "image"
//         ? (values.frameObjectFit === "cover" ? "cover" : "contain")
//         : undefined,
//   };
// }

// /* ---------- Sortable Row ---------- */
// function SortableRule({
//   rule,
//   onDelete,
//   onToggleEnabled,
//   onEdit,
// }: {
//   rule: DiscountRule;
//   onDelete: (id: DiscountRule["id"]) => void;
//   onToggleEnabled: (id: DiscountRule["id"]) => void;
//   onEdit: (id: DiscountRule["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   const isImageMode = (rule.frameMode ?? "draw") === "image";
//   const inset = rule.frameInsetPx ?? 0;
//   const opacity = typeof rule.frameOpacity === "number" ? rule.frameOpacity : 1;

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(rule.id)}
//         onToggleVisible={() => onToggleEnabled(rule.id)}
//         onEdit={() => onEdit(rule.id)}
//         // ใช้ visible icon เป็น toggle-enabled แทน
//         visible={rule.enabled}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-center gap-4">
//           {/* Preview box (ปรับให้โชว์รูปกรอบได้) */}
//           <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
//             {/* dummy product image */}
//             <img src="/placeholder.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
//             {/* frame */}
//             {isImageMode && rule.frameImageUrl ? (
//               <img
//                 src={rule.frameImageUrl}
//                 alt=""
//                 className="absolute pointer-events-none"
//                 style={{
//                   top: inset,
//                   left: inset,
//                   right: inset,
//                   bottom: inset,
//                   opacity,
//                   objectFit: rule.frameObjectFit ?? "contain",
//                 }}
//               />
//             ) : (
//               <div
//                 className="absolute inset-0 rounded-lg pointer-events-none"
//                 style={{ border: `${rule.borderWidth}px solid ${rule.borderColorHex}` }}
//                 title={`Border ${rule.borderWidth}px ${rule.borderColorHex}`}
//               />
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex flex-wrap items-center gap-2">
//               <div className="text-sm font-medium">{labelRangeOf(rule)}</div>

//               <span className="text-xs text-muted-foreground">Mode:</span>
//               <code className="text-xs uppercase">{rule.frameMode ?? "draw"}</code>

//               {((rule.frameMode ?? "draw") === "draw") ? (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Border</span>
//                   <code className="text-xs">{rule.borderWidth}px</code>
//                   <span className="text-xs text-muted-foreground">• Color</span>
//                   <span className="text-xs" style={{ color: rule.borderColorHex }}>{rule.borderColorHex}</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Image</span>
//                   <code className="text-xs">{rule.frameImageUrl ? "✓" : "–"}</code>
//                   <span className="text-xs text-muted-foreground">• Inset</span>
//                   <code className="text-xs">{inset}px</code>
//                   <span className="text-xs text-muted-foreground">• Opacity</span>
//                   <code className="text-xs">{opacity}</code>
//                 </>
//               )}

//               {rule.badgeBgHex && (
//                 <>
//                   <span className="text-xs text-muted-foreground">• Badge</span>
//                   <span className="text-xs" style={{ color: rule.badgeBgHex }}>{rule.badgeBgHex}</span>
//                   {rule.badgeTextHex && (
//                     <>
//                       <span className="text-xs text-muted-foreground">/</span>
//                       <span className="text-xs" style={{ color: rule.badgeTextHex }}>{rule.badgeTextHex}</span>
//                     </>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="text-xs text-muted-foreground">
//               Order: {rule.order} • {rule.enabled ? "Enabled" : "Disabled"}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminDiscountRulesGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: DiscountRule[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<DiscountRule[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
//   );

//   const [saving, setSaving] = useState(false);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [creating, setCreating] = useState(false);
//   const [editingId, setEditingId] = useState<DiscountRule["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;

//   // ป้องกัน hydration mismatch: render ส่วน dnd เฉพาะหลัง mount
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE}/meta`, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: DiscountRule["id"]; order: number }>>([]);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);

//   const postReorder = (orders: Array<{ id: DiscountRule["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 350);
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
//     }, 400);
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order })));
//   };

//   const handleDelete = async (id: DiscountRule["id"]) => {
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

//   const handleToggleEnabled = async (id: DiscountRule["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ toggleEnabled: true }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   // create
//   const saveCreate = async (values: DiscountRuleEditValues) => {
//     const payload = normalize(values);
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as DiscountRule | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: DiscountRuleEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;
//     const payload = normalize(values);

//     // optimistic UI
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(payload),
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

//       {/* Header + Add (คงไว้เหมือนเดิม และเรนเดอร์ได้ตั้งแต่ SSR) */}
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
//           + เพิ่มกฎ
//         </button>
//       </div>

//       {/* ส่วนที่พึ่ง dnd-kit & dialogs: แสดงหลัง mount เท่านั้น */}
//       {mounted && (
//         <>
//           <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//             <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {items.map((rule) => (
//                   <SortableRule
//                     key={rule.id}
//                     rule={rule}
//                     onDelete={handleDelete}
//                     onToggleEnabled={handleToggleEnabled}
//                     onEdit={(id) => setEditingId(id)}
//                   />
//                 ))}
//               </div>
//             </SortableContext>
//           </DndContext>

//           {/* Create */}
//           <AdminDiscountRuleEditDialog
//             key={creating ? "create" : "create-closed"}
//             open={creating}
//             initial={{
//               minPercent: 0,
//               maxPercent: "",
//               borderWidth: 2,
//               borderColorHex: "#0ea5e9",
//               badgeBgHex: "",
//               badgeTextHex: "",
//               enabled: true,
//               // NEW defaults
//               frameMode: "draw",
//               frameImageUrl: "",
//               frameInsetPx: 0,
//               frameOpacity: 1,
//               frameObjectFit: "contain",
//             }}
//             onClose={() => setCreating(false)}
//             onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//             mode="create"
//           />

//           {/* Edit */}
//           <AdminDiscountRuleEditDialog
//             key={editingId ?? "edit-closed"}
//             open={!!editingItem}
//             initial={
//               editingItem
//                 ? {
//                     minPercent: editingItem.minPercent,
//                     maxPercent: editingItem.maxPercent ?? "",
//                     borderWidth: editingItem.borderWidth,
//                     borderColorHex: editingItem.borderColorHex,
//                     badgeBgHex: editingItem.badgeBgHex ?? "",
//                     badgeTextHex: editingItem.badgeTextHex ?? "",
//                     enabled: editingItem.enabled,
//                     // NEW fields mapping
//                     frameMode: editingItem.frameMode ?? "draw",
//                     frameImageUrl: editingItem.frameImageUrl ?? "",
//                     frameInsetPx: editingItem.frameInsetPx ?? 0,
//                     frameOpacity: typeof editingItem.frameOpacity === "number" ? editingItem.frameOpacity : 1,
//                     frameObjectFit: editingItem.frameObjectFit ?? "contain",
//                   }
//                 : {
//                     minPercent: 60, maxPercent: 69, borderWidth: 2, borderColorHex: "#0ea5e9",
//                     badgeBgHex: "", badgeTextHex: "", enabled: true,
//                     frameMode: "draw", frameImageUrl: "", frameInsetPx: 0, frameOpacity: 1, frameObjectFit: "contain",
//                   }
//             }
//             onClose={() => setEditingId(null)}
//             onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//             mode="edit"
//           />
//         </>
//       )}
//     </section>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/components/AdminDiscountRulesGrid.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminDiscountRuleEditDialog, { DiscountRuleEditValues } from "./AdminDiscountRuleEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type DiscountRule = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   order: number;
//   enabled: boolean;
// };

// type UIMeta = { title: string; subtitle: string; updatedAt?: string };

// const API_BASE = "/api/mock/discount-rules";

// /* ---------- Small helpers ---------- */
// function labelRangeOf(r: DiscountRule) {
//   const min = r.minPercent ?? 0;
//   const max = typeof r.maxPercent === "number" ? r.maxPercent : undefined;
//   return max != null ? `${min}% – ${max}%` : `${min}%+`;
// }

// /** แปลงค่าจาก Dialog -> ชนิด DiscountRule ให้ถูกต้องเสมอ */
// function normalize(values: DiscountRuleEditValues): Partial<DiscountRule> {
//   return {
//     minPercent: Number(values.minPercent),
//     maxPercent:
//       values.maxPercent === "" || values.maxPercent == null
//         ? undefined
//         : Number(values.maxPercent),
//     borderWidth: Number(values.borderWidth),
//     borderColorHex: values.borderColorHex,
//     badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//     badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
//     enabled: !!values.enabled,
//   };
// }

// /* ---------- Sortable Row ---------- */
// function SortableRule({
//   rule,
//   onDelete,
//   onToggleEnabled,
//   onEdit,
// }: {
//   rule: DiscountRule;
//   onDelete: (id: DiscountRule["id"]) => void;
//   onToggleEnabled: (id: DiscountRule["id"]) => void;
//   onEdit: (id: DiscountRule["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(rule.id)}
//         onToggleVisible={() => onToggleEnabled(rule.id)}
//         onEdit={() => onEdit(rule.id)}
//         // ใช้ visible icon เป็น toggle-enabled แทน
//         visible={rule.enabled}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-center gap-4">
//           {/* Preview box */}
//           <div
//             className="w-16 h-16 rounded-lg flex-shrink-0"
//             style={{
//               border: `${rule.borderWidth}px solid ${rule.borderColorHex}`,
//               background:
//                 rule.badgeBgHex && rule.badgeTextHex
//                   ? `linear-gradient(135deg, ${rule.badgeBgHex}22 0%, transparent 60%)`
//                   : "transparent",
//             }}
//             title={`Border ${rule.borderWidth}px ${rule.borderColorHex}`}
//           />

//           <div className="flex-1 min-w-0">
//             <div className="flex flex-wrap items-center gap-2">
//               <div className="text-sm font-medium">{labelRangeOf(rule)}</div>
//               <span className="text-xs text-muted-foreground">Border:</span>
//               <code className="text-xs">{rule.borderWidth}px</code>
//               <span className="text-xs text-muted-foreground">Color:</span>
//               <span className="text-xs" style={{ color: rule.borderColorHex }}>{rule.borderColorHex}</span>
//               {rule.badgeBgHex && (
//                 <>
//                   <span className="text-xs text-muted-foreground">Badge:</span>
//                   <span className="text-xs" style={{ color: rule.badgeBgHex }}>{rule.badgeBgHex}</span>
//                   {rule.badgeTextHex && (
//                     <>
//                       <span className="text-xs text-muted-foreground">/</span>
//                       <span className="text-xs" style={{ color: rule.badgeTextHex }}>{rule.badgeTextHex}</span>
//                     </>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="text-xs text-muted-foreground">
//               Order: {rule.order} • {rule.enabled ? "Enabled" : "Disabled"}
//             </div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminDiscountRulesGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: DiscountRule[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<DiscountRule[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
//   );

//   const [saving, setSaving] = useState(false);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [creating, setCreating] = useState(false);
//   const [editingId, setEditingId] = useState<DiscountRule["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;

//   // ป้องกัน hydration mismatch: render ส่วน dnd เฉพาะหลัง mount
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE}/meta`, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: DiscountRule["id"]; order: number }>>([]);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);

//   const postReorder = (orders: Array<{ id: DiscountRule["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 350);
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
//     }, 400);
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order })));
//   };

//   const handleDelete = async (id: DiscountRule["id"]) => {
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

//   const handleToggleEnabled = async (id: DiscountRule["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ toggleEnabled: true }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   // create
//   const saveCreate = async (values: DiscountRuleEditValues) => {
//     const payload = normalize(values);
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as DiscountRule | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: DiscountRuleEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;
//     const payload = normalize(values);

//     // optimistic UI
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(payload),
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

//       {/* Header + Add (คงไว้เหมือนเดิม และเรนเดอร์ได้ตั้งแต่ SSR) */}
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
//           + เพิ่มกฎ
//         </button>
//       </div>

//       {/* ส่วนที่พึ่ง dnd-kit & dialogs: แสดงหลัง mount เท่านั้น */}
//       {mounted && (
//         <>
//           <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//             <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {items.map((rule) => (
//                   <SortableRule
//                     key={rule.id}
//                     rule={rule}
//                     onDelete={handleDelete}
//                     onToggleEnabled={handleToggleEnabled}
//                     onEdit={(id) => setEditingId(id)}
//                   />
//                 ))}
//               </div>
//             </SortableContext>
//           </DndContext>

//           {/* Create */}
//           <AdminDiscountRuleEditDialog
//             key={creating ? "create" : "create-closed"}
//             open={creating}
//             initial={{
//               minPercent: 0,
//               maxPercent: "",
//               borderWidth: 2,
//               borderColorHex: "#0ea5e9",
//               badgeBgHex: "",
//               badgeTextHex: "",
//               enabled: true,
//             }}
//             onClose={() => setCreating(false)}
//             onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//             mode="create"
//           />

//           {/* Edit */}
//           <AdminDiscountRuleEditDialog
//             key={editingId ?? "edit-closed"}
//             open={!!editingItem}
//             initial={
//               editingItem
//                 ? {
//                     minPercent: editingItem.minPercent,
//                     maxPercent: editingItem.maxPercent ?? "",
//                     borderWidth: editingItem.borderWidth,
//                     borderColorHex: editingItem.borderColorHex,
//                     badgeBgHex: editingItem.badgeBgHex ?? "",
//                     badgeTextHex: editingItem.badgeTextHex ?? "",
//                     enabled: editingItem.enabled,
//                   }
//                 : { minPercent: 60, maxPercent: 69, borderWidth: 2, borderColorHex: "#0ea5e9", badgeBgHex: "", badgeTextHex: "", enabled: true }
//             }
//             onClose={() => setEditingId(null)}
//             onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//             mode="edit"
//           />
//         </>
//       )}
//     </section>
//   );
// }

// v.1.1.2 ================================================

// // src/app/admin/components/AdminDiscountRulesGrid.tsx

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import AdminEditable from "./AdminEditable";
// import AdminDiscountRuleEditDialog, { DiscountRuleEditValues } from "./AdminDiscountRuleEditDialog";
// import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
// import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// export type DiscountRule = {
//   id: number | string;
//   minPercent: number;
//   maxPercent?: number;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   order: number;
//   enabled: boolean;
// };

// type UIMeta = { title: string; subtitle: string; updatedAt?: string };

// const API_BASE = "/api/mock/discount-rules";

// /* ---------- Small helpers ---------- */
// function labelRangeOf(r: DiscountRule) {
//   const min = r.minPercent ?? 0;
//   const max = typeof r.maxPercent === "number" ? r.maxPercent : undefined;
//   return max != null ? `${min}% – ${max}%` : `${min}%+`;
// }

// /** แปลงค่าจาก Dialog -> ชนิด DiscountRule ให้ถูกต้องเสมอ */
// function normalize(values: DiscountRuleEditValues): Partial<DiscountRule> {
//   return {
//     minPercent: Number(values.minPercent),
//     maxPercent:
//       values.maxPercent === "" || values.maxPercent == null
//         ? undefined
//         : Number(values.maxPercent),
//     borderWidth: Number(values.borderWidth),
//     borderColorHex: values.borderColorHex,
//     badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//     badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
//     enabled: !!values.enabled,
//   };
// }

// /* ---------- Sortable Row ---------- */
// function SortableRule({
//   rule,
//   onDelete,
//   onToggleEnabled,
//   onEdit,
// }: {
//   rule: DiscountRule;
//   onDelete: (id: DiscountRule["id"]) => void;
//   onToggleEnabled: (id: DiscountRule["id"]) => void;
//   onEdit: (id: DiscountRule["id"]) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
//   const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

//   return (
//     <div ref={setNodeRef} style={style} className={isDragging ? "opacity-70" : ""}>
//       <AdminEditable
//         onDelete={() => onDelete(rule.id)}
//         onToggleVisible={() => onToggleEnabled(rule.id)}
//         onEdit={() => onEdit(rule.id)}
//         // ใช้ visible icon เป็น toggle-enabled แทน
//         visible={rule.enabled}
//         dragHandleProps={{ ...attributes, ...listeners }}
//       >
//         <div className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-center gap-4">
//           {/* Preview box */}
//           <div
//             className="w-16 h-16 rounded-lg flex-shrink-0"
//             style={{
//               border: `${rule.borderWidth}px solid ${rule.borderColorHex}`,
//               background:
//                 rule.badgeBgHex && rule.badgeTextHex
//                   ? `linear-gradient(135deg, ${rule.badgeBgHex}22 0%, transparent 60%)`
//                   : "transparent",
//             }}
//             title={`Border ${rule.borderWidth}px ${rule.borderColorHex}`}
//           />

//           <div className="flex-1 min-w-0">
//             <div className="flex flex-wrap items-center gap-2">
//               <div className="text-sm font-medium">{labelRangeOf(rule)}</div>
//               <span className="text-xs text-muted-foreground">Border:</span>
//               <code className="text-xs">{rule.borderWidth}px</code>
//               <span className="text-xs text-muted-foreground">Color:</span>
//               <span className="text-xs" style={{ color: rule.borderColorHex }}>{rule.borderColorHex}</span>
//               {rule.badgeBgHex && (
//                 <>
//                   <span className="text-xs text-muted-foreground">Badge:</span>
//                   <span className="text-xs" style={{ color: rule.badgeBgHex }}>{rule.badgeBgHex}</span>
//                   {rule.badgeTextHex && (
//                     <>
//                       <span className="text-xs text-muted-foreground">/</span>
//                       <span className="text-xs" style={{ color: rule.badgeTextHex }}>{rule.badgeTextHex}</span>
//                     </>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="text-xs text-muted-foreground">Order: {rule.order} • {rule.enabled ? "Enabled" : "Disabled"}</div>
//           </div>
//         </div>
//       </AdminEditable>
//     </div>
//   );
// }

// /* ---------- Main Grid ---------- */
// export default function AdminDiscountRulesGrid({
//   initial,
//   initialMeta,
// }: {
//   initial: DiscountRule[];
//   initialMeta?: UIMeta;
// }) {
//   const [items, setItems] = useState<DiscountRule[]>(initial);
//   const [meta, setMeta] = useState<UIMeta>(
//     initialMeta ?? { title: "Discount styling rules", subtitle: "กำหนดสี/ความหนาตามเปอร์เซ็นต์ส่วนลด" },
//   );

//   const [saving, setSaving] = useState(false);
//   const [metaSaving, setMetaSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [creating, setCreating] = useState(false);
//   const [editingId, setEditingId] = useState<DiscountRule["id"] | null>(null);
//   const editingItem = editingId != null ? items.find((i) => i.id === editingId) ?? null : null;

//   useEffect(() => setItems(initial), [initial]);

//   useEffect(() => {
//     if (initialMeta) return;
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE}/meta`, { cache: "no-store" });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (data?.meta) setMeta(data.meta as UIMeta);
//       } catch { /* noop */ }
//     })();
//   }, [initialMeta]);

//   const jsonHeaders = useMemo(() => ({ "Content-Type": "application/json" }), []);
//   const reorderTimer = useRef<NodeJS.Timeout | null>(null);
//   const lastOrdersRef = useRef<Array<{ id: DiscountRule["id"]; order: number }>>([]);
//   const metaTimer = useRef<NodeJS.Timeout | null>(null);

//   const postReorder = (orders: Array<{ id: DiscountRule["id"]; order: number }>) => {
//     if (reorderTimer.current) clearTimeout(reorderTimer.current);
//     lastOrdersRef.current = orders;
//     reorderTimer.current = setTimeout(async () => {
//       try {
//         setSaving(true);
//         setError(null);
//         const res = await fetch(`${API_BASE}/reorder`, {
//           method: "POST",
//           headers: jsonHeaders,
//           body: JSON.stringify({ orders: lastOrdersRef.current }),
//         });
//         if (!res.ok) throw new Error("REORDER failed");
//       } catch (e: any) {
//         setError(e?.message ?? "Reorder failed");
//       } finally {
//         setSaving(false);
//       }
//     }, 350);
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
//     }, 400);
//   };

//   const onDragEnd = (ev: DragEndEvent) => {
//     const { active, over } = ev;
//     if (!over || active.id === over.id) return;
//     const oldIndex = items.findIndex((i) => i.id === active.id);
//     const newIndex = items.findIndex((i) => i.id === over.id);
//     const next = arrayMove(items, oldIndex, newIndex).map((x, i) => ({ ...x, order: i }));
//     setItems(next);
//     postReorder(next.map((x) => ({ id: x.id, order: x.order })));
//   };

//   const handleDelete = async (id: DiscountRule["id"]) => {
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

//   const handleToggleEnabled = async (id: DiscountRule["id"]) => {
//     const snapshot = items;
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify({ toggleEnabled: true }),
//       });
//       if (!res.ok) throw new Error("PATCH failed");
//     } catch (e: any) {
//       setItems(snapshot);
//       setError(e?.message ?? "Update failed");
//     } finally { setSaving(false); }
//   };

//   // create
//   const saveCreate = async (values: DiscountRuleEditValues) => {
//     const payload = normalize(values);
//     const res = await fetch(`${API_BASE}`, {
//       method: "POST",
//       headers: jsonHeaders,
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(t || "Create failed");
//     }
//     const data = await res.json();
//     const item = data?.item as DiscountRule | undefined;
//     if (!item) throw new Error("No item returned");
//     setItems((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
//   };

//   // edit
//   const saveEdit = async (values: DiscountRuleEditValues) => {
//     if (!editingItem) return;
//     const id = editingItem.id;
//     const snapshot = items;

//     const payload = normalize(values);

//     // optimistic UI
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...payload } : x)));
//     try {
//       const res = await fetch(`${API_BASE}/${id}`, {
//         method: "PATCH",
//         headers: jsonHeaders,
//         body: JSON.stringify(payload),
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
//           + เพิ่มกฎ
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
//         <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {items.map((rule) => (
//               <SortableRule
//                 key={rule.id}
//                 rule={rule}
//                 onDelete={handleDelete}
//                 onToggleEnabled={handleToggleEnabled}
//                 onEdit={(id) => setEditingId(id)}
//               />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//         {/* Create */}
//         <AdminDiscountRuleEditDialog
//         key={creating ? 'create' : 'create-closed'}
//         open={creating}
//         initial={{
//             minPercent: 0,
//             maxPercent: "",
//             borderWidth: 2,
//             borderColorHex: "#0ea5e9",
//             badgeBgHex: "",
//             badgeTextHex: "",
//             enabled: true,
//         }}
//         onClose={() => setCreating(false)}
//         onSave={async (vals) => { await saveCreate(vals); setCreating(false); }}
//         mode="create"
//         />

//         {/* Edit */}
//         <AdminDiscountRuleEditDialog
//         key={editingId ?? 'edit-closed'}
//         open={!!editingItem}
//         initial={
//             editingItem
//             ? {
//                 minPercent: editingItem.minPercent,
//                 // ส่งเป็น "" ถ้าไม่มี เพื่อให้ input เป็นค่าว่างได้
//                 maxPercent: editingItem.maxPercent ?? "",
//                 borderWidth: editingItem.borderWidth,
//                 borderColorHex: editingItem.borderColorHex,
//                 badgeBgHex: editingItem.badgeBgHex ?? "",
//                 badgeTextHex: editingItem.badgeTextHex ?? "",
//                 enabled: editingItem.enabled,
//                 }
//             : { minPercent: 60, maxPercent: 69, borderWidth: 2, borderColorHex: "#0ea5e9", badgeBgHex: "", badgeTextHex: "", enabled: true }
//         }
//         onClose={() => setEditingId(null)}
//         onSave={async (vals) => { await saveEdit(vals); setEditingId(null); }}
//         mode="edit"
//         />


//     </section>
//   );
// }

