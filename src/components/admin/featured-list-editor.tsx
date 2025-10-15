// v.1.1.4 ===============================================
// src/components/admin/featured-list-editor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import CreateFeaturedListDialog from "@/components/admin/create-featured-list-dialog";

type ProductLite = {
  id: number | string;
  name: string;
  sku?: string;
  brand?: string;
  image_url?: string;
};

type FeaturedListItem = { productId: string | number; order: number };
type FeaturedList = {
  key: string;
  title: string;
  subtitle?: string;
  items: FeaturedListItem[];
  limit?: number;
};

export default function FeaturedListEditor() {
  const [lists, setLists] = useState<FeaturedList[]>([]);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);        // ✅ แจ้งบันทึกสำเร็จ
  const [error, setError] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<FeaturedListItem[]>([]);

  // previews for items in the list
  const [previews, setPreviews] = useState<ProductLite[]>([]);

  // search (LEFT) + pagination
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProductLite[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const searchPageSize = 10;
  const [searchTotal, setSearchTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(searchTotal / searchPageSize));

  // create dialog
  const [createOpen, setCreateOpen] = useState(false);

  const currentList = useMemo(
    () => lists.find((l) => l.key === currentKey) || null,
    [lists, currentKey]
  );

  /* ====================== LOAD LISTS ====================== */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/mock/featured-lists", { cache: "no-store" });
        if (!res.ok) throw new Error("load lists failed");
        const data = await res.json();
        const got: FeaturedList[] = data?.items ?? [];
        if (!alive) return;
        setLists(got);
        if (got.length && !currentKey) setCurrentKey(got[0].key);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================== LOAD ONE LIST DETAILS ================== */
  useEffect(() => {
    if (!currentKey) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("load list failed");
        const list: FeaturedList = await res.json();
        if (!alive) return;
        const sorted = [...(list.items ?? [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        setTitle(list.title ?? "");
        setSubtitle(list.subtitle ?? "");
        setLimit(typeof list.limit === "number" ? list.limit : undefined);
        setItems(sorted);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [currentKey]);

  /* ============ LOAD PREVIEWS FOR ITEMS IN THE LIST ============ */
  useEffect(() => {
    if (!items.length) {
      setPreviews([]);
      return;
    }
    let alive = true;
    (async () => {
      const ids = items.map((it) => it.productId).join(",");
      const res = await fetch(
        `/api/mock/products/by-ids?ids=${encodeURIComponent(ids)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        if (alive) setPreviews([]);
        return;
      }
      const data = await res.json();
      const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        sku: p.sku,
        image_url: p.image_url,
      }));
      if (!alive) return;
      setPreviews(list);
    })();
    return () => {
      alive = false;
    };
  }, [items]);

  /* ====================== SEARCH (LEFT) ====================== */
  const runSearch = async (page = 1) => {
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(searchPageSize),
        q: q.trim(),
      });
      const res = await fetch(`/api/mock/products?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        image_url: p.image_url,
      }));
      setResults(list);
      setSearchPage(Number(data?.page ?? page));
      setSearchTotal(Number(data?.total ?? 0));
    } catch (e: any) {
      setError(e?.message ?? "search failed");
    } finally {
      setSearching(false);
    }
  };

  const onSearchSubmit = () => runSearch(1);

  /* ====================== LIST OPS ====================== */
  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
  };

  const moveDown = (idx: number) => {
    if (idx >= items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
  };

  const removeAt = (idx: number) => {
    const next = items
      .filter((_, i) => i !== idx)
      .map((it, i) => ({ ...it, order: i + 1 }));
    setItems(next);
  };

  const addProduct = (p: ProductLite) => {
    if (items.some((it) => String(it.productId) === String(p.id))) return;
    const next = [...items, { productId: p.id, order: items.length + 1 }];
    setItems(next);
  };

  const onSave = async () => {
    if (!currentKey) return;
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const res = await fetch(
        `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            limit: typeof limit === "number" ? limit : undefined,
            items,
          }),
        }
      );
      if (!res.ok) throw new Error("save failed");

      // reload left lists (update titles)
      const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
      const payload = await all.json();
      setLists(payload?.items ?? []);

      // ✅ show success
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 1800);
    } catch (e: any) {
      setError(e?.message ?? "save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ====================== CREATE DIALOG ====================== */
  const onCreateList = () => setCreateOpen(true);

  const handleCreated = async (created: { key: string }) => {
    const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
    const payload = await all.json();
    const got: FeaturedList[] = payload?.items ?? [];
    setLists(got);
    setCurrentKey(created.key);
  };

  const findPreview = (pid: string | number) =>
    previews.find((p) => String(p.id) === String(pid));

  /* ====================== RENDER ====================== */
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: pick list + create + search/add */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium">เลือกลิสต์</div>
              <div className="text-xs text-muted-foreground">
                จัดชุดสินค้าแนะนำ
              </div>
            </div>
            <Button size="sm" onClick={onCreateList}>+ เพิ่มลิสต์</Button>
          </div>

          <Select
            value={currentKey ?? undefined}
            onValueChange={(v) => setCurrentKey(v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading..." : "เลือกลิสต์"} />
            </SelectTrigger>
            <SelectContent>
              {lists.map((l) => (
                <SelectItem key={l.key} value={l.key}>
                  {l.title || l.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search & add (สูงเต็มจอ + pagination อยู่นอกสโครล) */}
          <div className="pt-2 border-t flex flex-col h-[calc(100vh-260px)]">
            <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าลิสต์</div>
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearchSubmit();
                }}
              />
              <Button onClick={onSearchSubmit} disabled={searching}>
                {searching ? "ค้นหา..." : "ค้นหา"}
              </Button>
            </div>

            {/* Scrollable results area */}
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1">
              {results.map((p) => (
                <div
                  key={String(p.id)}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {String(p.id)} {p.brand ? `• ${p.brand}` : ""} {p.sku ? `• ${p.sku}` : ""}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addProduct(p)}
                    disabled={items.some((it) => String(it.productId) === String(p.id))}
                  >
                    เพิ่ม
                  </Button>
                </div>
              ))}
            </div>

            {/* Sticky-ish footer: pagination outside the scroll area */}
            {searchTotal > 0 && (
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  หน้า {searchPage} / {totalPages} • ทั้งหมด {searchTotal} รายการ
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => runSearch(Math.max(1, searchPage - 1))}
                    disabled={searchPage <= 1 || searching}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => runSearch(Math.min(totalPages, searchPage + 1))}
                    disabled={searchPage >= totalPages || searching}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </Card>

        {/* RIGHT: meta form + list items */}
        <Card className="p-4 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-sm mb-1">ชื่อหัวข้อ</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น แนะนำประจำสัปดาห์"
              />
            </div>
            <div>
              <div className="text-sm mb-1">จำนวนสูงสุด (limit)</div>
              <Input
                type="number"
                min={1}
                value={typeof limit === "number" ? String(limit) : ""}
                onChange={(e) =>
                  setLimit(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="เว้นว่าง = ไม่จำกัด"
              />
            </div>
            <div className="md:col-span-3">
              <div className="text-sm mb-1">คำอธิบาย</div>
              <Input
                value={subtitle ?? ""}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="คำอธิบายสั้น ๆ"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">สินค้าในลิสต์ ({items.length})</div>
              <div className="flex items-center gap-2">
                {savedOk && (
                  <div className="text-xs px-2 py-1 rounded bg-emerald-600/10 text-emerald-700 border border-emerald-600/30">
                    บันทึกเรียบร้อย ✅
                  </div>
                )}
                <Button size="sm" onClick={onSave} disabled={saving || !currentKey}>
                  {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {items.map((it, idx) => {
                const pv = findPreview(it.productId);
                return (
                  <div
                    key={`${it.productId}`}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {pv?.image_url ? (
                          <Image
                            src={pv.image_url}
                            alt={pv.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium truncate">
                          #{it.order} — {pv?.name ?? `Product ID: ${it.productId}`}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {String(it.productId)}
                          {pv?.brand ? ` • ${pv.brand}` : ""}
                          {pv?.sku ? ` • ${pv.sku}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                      >
                        ขึ้น
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => moveDown(idx)}
                        disabled={idx === items.length - 1}
                      >
                        ลง
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAt(idx)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
                  ยังไม่มีสินค้าในลิสต์
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Dialog สำหรับสร้างลิสต์ใหม่ */}
      <CreateFeaturedListDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  );
}

// v.1.1.4 ===============================================

// v.1.1.3 ===============================================
// // src/components/admin/featured-list-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Card } from "@/components/ui/card";
// import CreateFeaturedListDialog from "@/components/admin/create-featured-list-dialog";

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
// };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export default function FeaturedListEditor() {
//   const [lists, setLists] = useState<FeaturedList[]>([]);
//   const [currentKey, setCurrentKey] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // form state
//   const [title, setTitle] = useState("");
//   const [subtitle, setSubtitle] = useState("");
//   const [limit, setLimit] = useState<number | undefined>(undefined);
//   const [items, setItems] = useState<FeaturedListItem[]>([]);

//   // previews for items in the list (ID, Name, SKU, Brand, image)
//   const [previews, setPreviews] = useState<ProductLite[]>([]);

//   // search (LEFT) + pagination
//   const [q, setQ] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searchPage, setSearchPage] = useState(1);
//   const searchPageSize = 10;
//   const [searchTotal, setSearchTotal] = useState(0);
//   const totalPages = Math.max(1, Math.ceil(searchTotal / searchPageSize));

//   // create dialog
//   const [createOpen, setCreateOpen] = useState(false);

//   const currentList = useMemo(
//     () => lists.find((l) => l.key === currentKey) || null,
//     [lists, currentKey]
//   );

//   /* ====================== LOAD LISTS ====================== */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//         if (!res.ok) throw new Error("load lists failed");
//         const data = await res.json();
//         const got: FeaturedList[] = data?.items ?? [];
//         if (!alive) return;
//         setLists(got);
//         if (got.length && !currentKey) setCurrentKey(got[0].key);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ================== LOAD ONE LIST DETAILS ================== */
//   useEffect(() => {
//     if (!currentKey) return;
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(
//           `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("load list failed");
//         const list: FeaturedList = await res.json();
//         if (!alive) return;
//         const sorted = [...(list.items ?? [])].sort(
//           (a, b) => (a.order ?? 0) - (b.order ?? 0)
//         );
//         setTitle(list.title ?? "");
//         setSubtitle(list.subtitle ?? "");
//         setLimit(typeof list.limit === "number" ? list.limit : undefined);
//         setItems(sorted);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [currentKey]);

//   /* ============ LOAD PREVIEWS FOR ITEMS IN THE LIST ============ */
//   useEffect(() => {
//     if (!items.length) {
//       setPreviews([]);
//       return;
//     }
//     let alive = true;
//     (async () => {
//       const ids = items.map((it) => it.productId).join(",");
//       const res = await fetch(
//         `/api/mock/products/by-ids?ids=${encodeURIComponent(ids)}`,
//         { cache: "no-store" }
//       );
//       if (!res.ok) {
//         if (alive) setPreviews([]);
//         return;
//       }
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         brand: p.brand,
//         sku: p.sku,
//         image_url: p.image_url,
//       }));
//       if (!alive) return;
//       setPreviews(list);
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [items]);

//   /* ====================== SEARCH (LEFT) ====================== */
//   const runSearch = async (page = 1) => {
//     setSearching(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(searchPageSize),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("search failed");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//       }));
//       setResults(list);
//       setSearchPage(Number(data?.page ?? page));
//       setSearchTotal(Number(data?.total ?? 0));
//     } catch (e: any) {
//       setError(e?.message ?? "search failed");
//     } finally {
//       setSearching(false);
//     }
//   };

//   const onSearchSubmit = () => runSearch(1);

//   /* ====================== LIST OPS ====================== */
//   const moveUp = (idx: number) => {
//     if (idx <= 0) return;
//     const next = [...items];
//     [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };

//   const moveDown = (idx: number) => {
//     if (idx >= items.length - 1) return;
//     const next = [...items];
//     [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };

//   const removeAt = (idx: number) => {
//     const next = items
//       .filter((_, i) => i !== idx)
//       .map((it, i) => ({ ...it, order: i + 1 }));
//     setItems(next);
//   };

//   const addProduct = (p: ProductLite) => {
//     if (items.some((it) => String(it.productId) === String(p.id))) return;
//     const next = [...items, { productId: p.id, order: items.length + 1 }];
//     setItems(next);
//   };

//   const onSave = async () => {
//     if (!currentKey) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(
//         `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             title,
//             subtitle,
//             limit: typeof limit === "number" ? limit : undefined,
//             items,
//           }),
//         }
//       );
//       if (!res.ok) throw new Error("save failed");

//       // reload left lists (update titles)
//       const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//       const payload = await all.json();
//       setLists(payload?.items ?? []);
//     } catch (e: any) {
//       setError(e?.message ?? "save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ====================== CREATE DIALOG ====================== */
//   const onCreateList = () => setCreateOpen(true);

//   const handleCreated = async (created: { key: string }) => {
//     const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//     const payload = await all.json();
//     const got: FeaturedList[] = payload?.items ?? [];
//     setLists(got);
//     setCurrentKey(created.key);
//   };

//   const findPreview = (pid: string | number) =>
//     previews.find((p) => String(p.id) === String(pid));

//   /* ====================== RENDER ====================== */
//   return (
//     <>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT: pick list + create + search/add */}
//         <Card className="p-4 space-y-4">
//           <div className="flex items-center justify-between gap-2">
//             <div>
//               <div className="text-sm font-medium">เลือกลิสต์</div>
//               <div className="text-xs text-muted-foreground">
//                 จัดชุดสินค้าแนะนำ
//               </div>
//             </div>
//             <Button size="sm" onClick={onCreateList}>+ เพิ่มลิสต์</Button>
//           </div>

//           <Select
//             value={currentKey ?? undefined}
//             onValueChange={(v) => setCurrentKey(v)}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder={loading ? "Loading..." : "เลือกลิสต์"} />
//             </SelectTrigger>
//             <SelectContent>
//               {lists.map((l) => (
//                 <SelectItem key={l.key} value={l.key}>
//                   {l.title || l.key}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           {/* Search & add (with pagination 10/pg) */}
//           <div className="pt-2 border-t">
//             <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าลิสต์</div>
//             <div className="flex gap-2">
//               <Input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") onSearchSubmit();
//                 }}
//               />
//               <Button onClick={onSearchSubmit} disabled={searching}>
//                 {searching ? "ค้นหา..." : "ค้นหา"}
//               </Button>
//             </div>

//             {/* Results */}
//             <div className="mt-3 space-y-2 max-h-72 overflow-auto">
//               {results.map((p) => (
//                 <div
//                   key={String(p.id)}
//                   className="flex items-center justify-between rounded-md border p-2"
//                 >
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="relative w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {p.image_url ? (
//                         <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">{p.name}</div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(p.id)} {p.brand ? `• ${p.brand}` : ""} {p.sku ? `• ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => addProduct(p)}
//                     disabled={items.some((it) => String(it.productId) === String(p.id))}
//                   >
//                     เพิ่ม
//                   </Button>
//                 </div>
//               ))}

//               {/* Pagination controls */}
//               {searchTotal > 0 && (
//                 <div className="flex items-center justify-between pt-2">
//                   <div className="text-xs text-muted-foreground">
//                     หน้า {searchPage} / {totalPages} • ทั้งหมด {searchTotal} รายการ
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       onClick={() => runSearch(Math.max(1, searchPage - 1))}
//                       disabled={searchPage <= 1 || searching}
//                     >
//                       ก่อนหน้า
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       onClick={() => runSearch(Math.min(totalPages, searchPage + 1))}
//                       disabled={searchPage >= totalPages || searching}
//                     >
//                       ถัดไป
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {error && <div className="text-sm text-destructive">{error}</div>}
//         </Card>

//         {/* RIGHT: meta form + list items */}
//         <Card className="p-4 lg:col-span-2">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="md:col-span-2">
//               <div className="text-sm mb-1">ชื่อหัวข้อ</div>
//               <Input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="เช่น แนะนำประจำสัปดาห์"
//               />
//             </div>
//             <div>
//               <div className="text-sm mb-1">จำนวนสูงสุด (limit)</div>
//               <Input
//                 type="number"
//                 min={1}
//                 value={typeof limit === "number" ? String(limit) : ""}
//                 onChange={(e) =>
//                   setLimit(e.target.value ? Number(e.target.value) : undefined)
//                 }
//                 placeholder="เว้นว่าง = ไม่จำกัด"
//               />
//             </div>
//             <div className="md:col-span-3">
//               <div className="text-sm mb-1">คำอธิบาย</div>
//               <Input
//                 value={subtitle ?? ""}
//                 onChange={(e) => setSubtitle(e.target.value)}
//                 placeholder="คำอธิบายสั้น ๆ"
//               />
//             </div>
//           </div>

//           {/* Items */}
//           <div className="mt-6">
//             <div className="flex items-center justify-between">
//               <div className="font-medium">สินค้าในลิสต์ ({items.length})</div>
//               <Button size="sm" onClick={onSave} disabled={saving || !currentKey}>
//                 {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
//               </Button>
//             </div>

//             <div className="mt-3 space-y-2">
//               {items.map((it, idx) => {
//                 const pv = findPreview(it.productId);
//                 return (
//                   <div
//                     key={`${it.productId}`}
//                     className="flex items-center justify-between rounded-md border p-2"
//                   >
//                     <div className="flex items-center gap-3 min-w-0">
//                       <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                         {pv?.image_url ? (
//                           <Image
//                             src={pv.image_url}
//                             alt={pv.name}
//                             fill
//                             className="object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full" />
//                         )}
//                       </div>
//                       <div className="truncate">
//                         <div className="text-sm font-medium truncate">
//                           #{it.order} — {pv?.name ?? `Product ID: ${it.productId}`}
//                         </div>
//                         <div className="text-xs text-muted-foreground truncate">
//                           ID: {String(it.productId)}
//                           {pv?.brand ? ` • ${pv.brand}` : ""}
//                           {pv?.sku ? ` • ${pv.sku}` : ""}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex gap-2 flex-shrink-0">
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => moveUp(idx)}
//                         disabled={idx === 0}
//                       >
//                         ขึ้น
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => moveDown(idx)}
//                         disabled={idx === items.length - 1}
//                       >
//                         ลง
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => removeAt(idx)}
//                       >
//                         ลบ
//                       </Button>
//                     </div>
//                   </div>
//                 );
//               })}
//               {items.length === 0 && (
//                 <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//                   ยังไม่มีสินค้าในลิสต์
//                 </div>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Dialog สำหรับสร้างลิสต์ใหม่ */}
//       <CreateFeaturedListDialog
//         open={createOpen}
//         onOpenChange={setCreateOpen}
//         onCreated={handleCreated}
//       />
//     </>
//   );
// }

// v.1.1.3 ===============================================


// v.1.1.2 ================================================
// // src/components/admin/featured-list-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Card } from "@/components/ui/card";

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
// };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export default function FeaturedListEditor() {
//   const [lists, setLists] = useState<FeaturedList[]>([]);
//   const [currentKey, setCurrentKey] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // form state
//   const [title, setTitle] = useState("");
//   const [subtitle, setSubtitle] = useState("");
//   const [limit, setLimit] = useState<number | undefined>(undefined);
//   const [items, setItems] = useState<FeaturedListItem[]>([]);

//   // previews for items in the list (ID, Name, SKU, Brand, image)
//   const [previews, setPreviews] = useState<ProductLite[]>([]);

//   // search (moved to LEFT) + pagination
//   const [q, setQ] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searchPage, setSearchPage] = useState(1);
//   const searchPageSize = 10;
//   const [searchTotal, setSearchTotal] = useState(0);
//   const totalPages = Math.max(1, Math.ceil(searchTotal / searchPageSize));

//   const currentList = useMemo(
//     () => lists.find((l) => l.key === currentKey) || null,
//     [lists, currentKey]
//   );

//   /* ====================== LOAD LISTS ====================== */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//         if (!res.ok) throw new Error("load lists failed");
//         const data = await res.json();
//         const got: FeaturedList[] = data?.items ?? [];
//         if (!alive) return;
//         setLists(got);
//         if (got.length && !currentKey) setCurrentKey(got[0].key);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ================== LOAD ONE LIST DETAILS ================== */
//   useEffect(() => {
//     if (!currentKey) return;
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(
//           `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("load list failed");
//         const list: FeaturedList = await res.json();
//         if (!alive) return;
//         const sorted = [...(list.items ?? [])].sort(
//           (a, b) => (a.order ?? 0) - (b.order ?? 0)
//         );
//         setTitle(list.title ?? "");
//         setSubtitle(list.subtitle ?? "");
//         setLimit(typeof list.limit === "number" ? list.limit : undefined);
//         setItems(sorted);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [currentKey]);

//   /* ============ LOAD PREVIEWS FOR ITEMS IN THE LIST ============ */
//   useEffect(() => {
//     if (!items.length) {
//       setPreviews([]);
//       return;
//     }
//     let alive = true;
//     (async () => {
//       const ids = items.map((it) => it.productId).join(",");
//       const res = await fetch(
//         `/api/mock/products/by-ids?ids=${encodeURIComponent(ids)}`,
//         { cache: "no-store" }
//       );
//       if (!res.ok) {
//         if (alive) setPreviews([]);
//         return;
//       }
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         brand: p.brand,
//         sku: p.sku,
//         image_url: p.image_url,
//       }));
//       if (!alive) return;
//       setPreviews(list);
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [items]);

//   /* ====================== SEARCH (LEFT) ====================== */
//   const runSearch = async (page = 1) => {
//     setSearching(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(searchPageSize),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("search failed");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//       }));
//       setResults(list);
//       setSearchPage(Number(data?.page ?? page));
//       setSearchTotal(Number(data?.total ?? 0));
//     } catch (e: any) {
//       setError(e?.message ?? "search failed");
//     } finally {
//       setSearching(false);
//     }
//   };

//   const onSearchSubmit = () => runSearch(1);

//   /* ====================== LIST OPS ====================== */
//   const moveUp = (idx: number) => {
//     if (idx <= 0) return;
//     const next = [...items];
//     [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };

//   const moveDown = (idx: number) => {
//     if (idx >= items.length - 1) return;
//     const next = [...items];
//     [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };

//   const removeAt = (idx: number) => {
//     const next = items
//       .filter((_, i) => i !== idx)
//       .map((it, i) => ({ ...it, order: i + 1 }));
//     setItems(next);
//   };

//   const addProduct = (p: ProductLite) => {
//     if (items.some((it) => String(it.productId) === String(p.id))) return;
//     const next = [...items, { productId: p.id, order: items.length + 1 }];
//     setItems(next);
//   };

//   const onSave = async () => {
//     if (!currentKey) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(
//         `/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             title,
//             subtitle,
//             limit: typeof limit === "number" ? limit : undefined,
//             items,
//           }),
//         }
//       );
//       if (!res.ok) throw new Error("save failed");

//       // reload left lists (update titles)
//       const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//       const payload = await all.json();
//       setLists(payload?.items ?? []);
//     } catch (e: any) {
//       setError(e?.message ?? "save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onCreateList = async () => {
//     const key = (prompt("ระบุ key ลิสต์ใหม่ (เช่น home_weekly_2)") || "").trim();
//     if (!key) return;
//     const titleInput = (prompt("ระบุชื่อหัวข้อ (เว้นว่าง = ใช้ key)") || "").trim();

//     try {
//       const res = await fetch("/api/mock/featured-lists", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           key,
//           title: titleInput || undefined,
//           items: [],
//         }),
//       });
//       if (res.status === 409) {
//         alert(`ลิสต์ key "${key}" มีอยู่แล้ว`);
//         return;
//       }
//       if (!res.ok) throw new Error("create failed");

//       // reload all lists and focus the new one
//       const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//       const payload = await all.json();
//       const got: FeaturedList[] = payload?.items ?? [];
//       setLists(got);
//       setCurrentKey(key);
//     } catch (e: any) {
//       alert(e?.message ?? "create failed");
//     }
//   };

//   const findPreview = (pid: string | number) =>
//     previews.find((p) => String(p.id) === String(pid));

//   /* ====================== RENDER ====================== */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* LEFT: pick list + create + search/add */}
//       <Card className="p-4 space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <div>
//             <div className="text-sm font-medium">เลือกลิสต์</div>
//             <div className="text-xs text-muted-foreground">
//               จัดชุดสินค้าแนะนำ
//             </div>
//           </div>
//           <Button size="sm" onClick={onCreateList}>+ เพิ่มลิสต์</Button>
//         </div>

//         <Select
//           value={currentKey ?? undefined}
//           onValueChange={(v) => setCurrentKey(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loading ? "Loading..." : "เลือกลิสต์"} />
//           </SelectTrigger>
//           <SelectContent>
//             {lists.map((l) => (
//               <SelectItem key={l.key} value={l.key}>
//                 {l.title || l.key}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {/* Search & add (with pagination 10/pg) */}
//         <div className="pt-2 border-t">
//           <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าลิสต์</div>
//           <div className="flex gap-2">
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") onSearchSubmit();
//               }}
//             />
//             <Button onClick={onSearchSubmit} disabled={searching}>
//               {searching ? "ค้นหา..." : "ค้นหา"}
//             </Button>
//           </div>

//           {/* Results */}
//           <div className="mt-3 space-y-2 max-h-72 overflow-auto">
//             {results.map((p) => (
//               <div
//                 key={String(p.id)}
//                 className="flex items-center justify-between rounded-md border p-2"
//               >
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div className="relative w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                     {p.image_url ? (
//                       <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                     ) : (
//                       <div className="w-full h-full" />
//                     )}
//                   </div>
//                   <div className="truncate">
//                     <div className="text-sm font-medium truncate">{p.name}</div>
//                     <div className="text-xs text-muted-foreground truncate">
//                       ID: {String(p.id)} {p.brand ? `• ${p.brand}` : ""} {p.sku ? `• ${p.sku}` : ""}
//                     </div>
//                   </div>
//                 </div>
//                 <Button
//                   size="sm"
//                   onClick={() => addProduct(p)}
//                   disabled={items.some((it) => String(it.productId) === String(p.id))}
//                 >
//                   เพิ่ม
//                 </Button>
//               </div>
//             ))}

//             {/* Pagination controls */}
//             {searchTotal > 0 && (
//               <div className="flex items-center justify-between pt-2">
//                 <div className="text-xs text-muted-foreground">
//                   หน้า {searchPage} / {totalPages} • ทั้งหมด {searchTotal} รายการ
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => runSearch(Math.max(1, searchPage - 1))}
//                     disabled={searchPage <= 1 || searching}
//                   >
//                     ก่อนหน้า
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => runSearch(Math.min(totalPages, searchPage + 1))}
//                     disabled={searchPage >= totalPages || searching}
//                   >
//                     ถัดไป
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {error && <div className="text-sm text-destructive">{error}</div>}
//       </Card>

//       {/* RIGHT: meta form + list items */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <div className="text-sm mb-1">ชื่อหัวข้อ</div>
//             <Input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="เช่น แนะนำประจำสัปดาห์"
//             />
//           </div>
//           <div>
//             <div className="text-sm mb-1">จำนวนสูงสุด (limit)</div>
//             <Input
//               type="number"
//               min={1}
//               value={typeof limit === "number" ? String(limit) : ""}
//               onChange={(e) =>
//                 setLimit(e.target.value ? Number(e.target.value) : undefined)
//               }
//               placeholder="เว้นว่าง = ไม่จำกัด"
//             />
//           </div>
//           <div className="md:col-span-3">
//             <div className="text-sm mb-1">คำอธิบาย</div>
//             <Input
//               value={subtitle ?? ""}
//               onChange={(e) => setSubtitle(e.target.value)}
//               placeholder="คำอธิบายสั้น ๆ"
//             />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="mt-6">
//           <div className="flex items-center justify-between">
//             <div className="font-medium">สินค้าในลิสต์ ({items.length})</div>
//             <Button size="sm" onClick={onSave} disabled={saving || !currentKey}>
//               {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
//             </Button>
//           </div>

//           <div className="mt-3 space-y-2">
//             {items.map((it, idx) => {
//               const pv = findPreview(it.productId);
//               return (
//                 <div
//                   key={`${it.productId}`}
//                   className="flex items-center justify-between rounded-md border p-2"
//                 >
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {pv?.image_url ? (
//                         <Image
//                           src={pv.image_url}
//                           alt={pv.name}
//                           fill
//                           className="object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">
//                         #{it.order} — {pv?.name ?? `Product ID: ${it.productId}`}
//                       </div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(it.productId)}
//                         {pv?.brand ? ` • ${pv.brand}` : ""}
//                         {pv?.sku ? ` • ${pv.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 flex-shrink-0">
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveUp(idx)}
//                       disabled={idx === 0}
//                     >
//                       ขึ้น
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveDown(idx)}
//                       disabled={idx === items.length - 1}
//                     >
//                       ลง
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeAt(idx)}
//                     >
//                       ลบ
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}
//             {items.length === 0 && (
//               <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//                 ยังไม่มีสินค้าในลิสต์
//               </div>
//             )}
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // src/components/admin/featured-list-editor.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Card } from "@/components/ui/card";

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
// };

// type FeaturedListItem = { productId: string | number; order: number };
// type FeaturedList = {
//   key: string;
//   title: string;
//   subtitle?: string;
//   items: FeaturedListItem[];
//   limit?: number;
// };

// export default function FeaturedListEditor() {
//   const [lists, setLists] = useState<FeaturedList[]>([]);
//   const [currentKey, setCurrentKey] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // form state
//   const [title, setTitle] = useState("");
//   const [subtitle, setSubtitle] = useState("");
//   const [limit, setLimit] = useState<number | undefined>(undefined);
//   const [items, setItems] = useState<FeaturedListItem[]>([]);

//   // product search
//   const [q, setQ] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [results, setResults] = useState<ProductLite[]>([]);

//   const currentList = useMemo(() => lists.find((l) => l.key === currentKey) || null, [lists, currentKey]);

//   // load all lists
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//         if (!res.ok) throw new Error("load lists failed");
//         const data = await res.json();
//         const got: FeaturedList[] = data?.items ?? [];
//         if (!alive) return;
//         setLists(got);
//         if (got.length && !currentKey) setCurrentKey(got[0].key);
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []); // initial only

//   // when currentKey changes → load its details (GET ?key=...)
//   useEffect(() => {
//     if (!currentKey) return;
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch(`/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`, { cache: "no-store" });
//         if (!res.ok) throw new Error("load list failed");
//         const list: FeaturedList = await res.json();
//         if (!alive) return;
//         setTitle(list.title ?? "");
//         setSubtitle(list.subtitle ?? "");
//         setLimit(typeof list.limit === "number" ? list.limit : undefined);
//         setItems(
//           [...(list.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//         );
//       } catch (e: any) {
//         if (alive) setError(e?.message ?? "load failed");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [currentKey]);

//   const moveUp = (idx: number) => {
//     if (idx <= 0) return;
//     const next = [...items];
//     [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };
//   const moveDown = (idx: number) => {
//     if (idx >= items.length - 1) return;
//     const next = [...items];
//     [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
//     setItems(next.map((it, i) => ({ ...it, order: i + 1 })));
//   };
//   const removeAt = (idx: number) => {
//     const next = items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i + 1 }));
//     setItems(next);
//   };

//   const onSearch = async () => {
//     setSearching(true);
//     setError(null);
//     try {
//       // ค้นหาแบบง่าย ๆ ใน mock products
//       const params = new URLSearchParams({
//         page: "1",
//         pageSize: "20",
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, { cache: "no-store" });
//       if (!res.ok) throw new Error("search failed");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//       }));
//       setResults(list);
//     } catch (e: any) {
//       setError(e?.message ?? "search failed");
//     } finally {
//       setSearching(false);
//     }
//   };

//   const addProduct = (p: ProductLite) => {
//     if (items.some((it) => String(it.productId) === String(p.id))) return;
//     const next = [...items, { productId: p.id, order: items.length + 1 }];
//     setItems(next);
//   };

//   const onSave = async () => {
//     if (!currentKey) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/featured-lists?key=${encodeURIComponent(currentKey)}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title,
//           subtitle,
//           limit: typeof limit === "number" ? limit : undefined,
//           items,
//         }),
//       });
//       if (!res.ok) throw new Error("save failed");
//       // รีโหลดรายการลิสต์ด้านซ้าย เพื่อสะท้อน title/subtitle ใหม่
//       const all = await fetch("/api/mock/featured-lists", { cache: "no-store" });
//       const payload = await all.json();
//       setLists(payload?.items ?? []);
//     } catch (e: any) {
//       setError(e?.message ?? "save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Left panel: lists */}
//       <Card className="p-4">
//         <div className="text-sm font-medium mb-3">เลือกลิสต์</div>
//         <Select
//           value={currentKey ?? undefined}
//           onValueChange={(v) => setCurrentKey(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loading ? "Loading..." : "เลือกลิสต์"} />
//           </SelectTrigger>
//           <SelectContent>
//             {lists.map((l) => (
//               <SelectItem key={l.key} value={l.key}>
//                 {l.title || l.key}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         {error && (
//           <div className="mt-3 text-sm text-destructive">{error}</div>
//         )}
//       </Card>

//       {/* Middle: meta form */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <div className="text-sm mb-1">ชื่อหัวข้อ</div>
//             <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น แนะนำประจำสัปดาห์" />
//           </div>
//           <div>
//             <div className="text-sm mb-1">จำนวนสูงสุด (limit)</div>
//             <Input
//               type="number"
//               min={1}
//               value={typeof limit === "number" ? String(limit) : ""}
//               onChange={(e) => setLimit(e.target.value ? Number(e.target.value) : undefined)}
//               placeholder="เว้นว่าง = ไม่จำกัด"
//             />
//           </div>
//           <div className="md:col-span-3">
//             <div className="text-sm mb-1">คำอธิบาย</div>
//             <Input value={subtitle ?? ""} onChange={(e) => setSubtitle(e.target.value)} placeholder="คำอธิบายสั้น ๆ" />
//           </div>
//         </div>

//         {/* Items */}
//         <div className="mt-6">
//           <div className="flex items-center justify-between">
//             <div className="font-medium">สินค้าในลิสต์ ({items.length})</div>
//             <Button size="sm" onClick={onSave} disabled={saving || !currentKey}>
//               {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
//             </Button>
//           </div>

//           <div className="mt-3 space-y-2">
//             {items.map((it, idx) => {
//               const pid = it.productId;
//               return (
//                 <div key={`${pid}`} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="text-sm">#{it.order} — Product ID: {String(pid)}</div>
//                   <div className="flex gap-2">
//                     <Button variant="secondary" size="sm" onClick={() => moveUp(idx)} disabled={idx === 0}>
//                       ขึ้น
//                     </Button>
//                     <Button variant="secondary" size="sm" onClick={() => moveDown(idx)} disabled={idx === items.length - 1}>
//                       ลง
//                     </Button>
//                     <Button variant="destructive" size="sm" onClick={() => removeAt(idx)}>
//                       ลบ
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}
//             {items.length === 0 && (
//               <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//                 ยังไม่มีสินค้าในลิสต์
//               </div>
//             )}
//           </div>

//           {/* Search & add */}
//           <div className="mt-6">
//             <div className="font-medium mb-2">เพิ่มสินค้าเข้าลิสต์</div>
//             <div className="flex gap-2">
//               <Input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") onSearch();
//                 }}
//               />
//               <Button onClick={onSearch} disabled={searching}>
//                 {searching ? "ค้นหา..." : "ค้นหา"}
//               </Button>
//             </div>

//             <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-auto">
//               {results.map((p) => (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="text-sm truncate">
//                     <div className="font-medium truncate">{p.name}</div>
//                     <div className="text-xs text-muted-foreground">
//                       {p.brand ? `${p.brand} — ` : ""}{p.sku || `#${p.id}`}
//                     </div>
//                   </div>
//                   <Button size="sm" onClick={() => addProduct(p)} disabled={items.some((it) => String(it.productId) === String(p.id))}>
//                     เพิ่ม
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }
