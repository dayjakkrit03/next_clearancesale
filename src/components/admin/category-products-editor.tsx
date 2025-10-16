// v.1.1.5 ================================================
// src/components/admin/category-products-editor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type CategoryLite = {
  id: number | string;
  name: string;
  slug?: string;
  visible?: boolean;
  order?: number;
  image_url?: string;
};

type ProductLite = {
  id: number | string;
  name: string;
  sku?: string;
  brand?: string;
  image_url?: string;
  order?: number; // ใช้สำหรับสลับลำดับ
};

interface CategoryProductsEditorProps {
  initialCategoryId?: string | number;
  pageSizeInCategory?: number;
  pageSizeSearch?: number;
  heading?: string;
}

export default function CategoryProductsEditor({
  initialCategoryId,
  pageSizeInCategory = 24,
  pageSizeSearch = 10,
  heading,
}: CategoryProductsEditorProps) {
  /* ============ category list ============ */
  const [cats, setCats] = useState<CategoryLite[]>([]);
  const [currentCatId, setCurrentCatId] = useState<string | number | null>(
    initialCategoryId ?? null
  );
  const [loadingCats, setLoadingCats] = useState(false);

  const currentCat = useMemo(
    () => cats.find((c) => String(c.id) === String(currentCatId)) || null,
    [cats, currentCatId]
  );

  /* ============ left: search products ============ */
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const searchTotalPages = Math.max(1, Math.ceil(searchTotal / pageSizeSearch));

  /* ============ right: products in category ============ */
  const [catItems, setCatItems] = useState<ProductLite[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catPage, setCatPage] = useState(1);
  const [catTotal, setCatTotal] = useState(0);
  const catTotalPages = Math.max(1, Math.ceil(catTotal / pageSizeInCategory));

  // สำหรับ save reorder
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ============ selection (multi) ============ */
  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());

  /* ============ misc ============ */
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const showInfo = (msg: string) => {
    setInfo(msg);
    setTimeout(() => setInfo(null), 1800);
  };

  /* ---------- helpers สำหรับ Set ---------- */
  const toKey = (id: string | number) => String(id);

  const toggleInSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string | number
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      const k = toKey(id);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const setAllInSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    ids: (string | number)[]
  ) => {
    setter(new Set(ids.map(toKey)));
  };

  const clearSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    setter(new Set());
  };

  /* ============ load categories ============ */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCats(true);
        const res = await fetch("/api/mock/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
        const data = await res.json();
        const list: CategoryLite[] = (data?.items ?? [])
          .filter((c: any) => c.visible !== false)
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        if (!alive) return;
        setCats(list);
        if (!initialCategoryId && list.length && !currentCatId) {
          setCurrentCatId(list[0].id);
        }
      } catch (e: any) {
        setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
      } finally {
        setLoadingCats(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============ load products in current category ============ */
  const loadCatItems = async (page = 1) => {
    if (!currentCatId) return;
    try {
      setCatLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSizeInCategory),
        category_id: String(currentCatId),
        sort: "order",
      });
      const res = await fetch(`/api/mock/products?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("โหลดสินค้าในหมวดล้มเหลว");
      const data = await res.json();
      const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        image_url: p.image_url,
        order: p.order,
      }));
      setCatItems(list);
      setCatPage(Number(data?.page ?? page));
      setCatTotal(Number(data?.total ?? 0));
      setDirty(false);
      clearSet(setRightSelected);
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดสินค้าในหมวด");
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    if (!currentCatId) return;
    loadCatItems(1);
    clearSet(setLeftSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCatId]);

  /* ============ search ops ============ */
  const runSearch = async (page = 1) => {
    try {
      setSearching(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSizeSearch),
        q: q.trim(),
      });
      const res = await fetch(`/api/mock/products?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("ค้นหาล้มเหลว");
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
      clearSet(setLeftSelected);
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setSearching(false);
    }
  };
  const onSearchSubmit = () => runSearch(1);

  /* ============ mutations: add/remove (single) ============ */
  const markBusy = (id: string | number, v: boolean) =>
    setBusy((m) => ({ ...m, [String(id)]: v }));

  const addToCategory = async (pid: string | number) => {
    if (!currentCatId) return;
    markBusy(pid, true);
    setError(null);
    try {
      const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: currentCatId }),
      });
      if (!res.ok) throw new Error("เพิ่มสินค้าเข้าหมวดไม่สำเร็จ");
      await loadCatItems(catPage);
      showInfo("เพิ่มสินค้าเข้าหมวดแล้ว");
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มสินค้า");
    } finally {
      markBusy(pid, false);
    }
  };

  const removeFromCategory = async (pid: string | number) => {
    markBusy(pid, true);
    setError(null);
    try {
      const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: "" }),
      });
      if (!res.ok) throw new Error("นำสินค้าออกจากหมวดไม่สำเร็จ");
      const nextCount = catItems.length - 1;
      const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
      await loadCatItems(nextPage);
      showInfo("นำสินค้าออกจากหมวดแล้ว");
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำสินค้าออก");
    } finally {
      markBusy(pid, false);
    }
  };

  /* ============ BULK add/remove (multi) ============ */
  const bulkAdd = async () => {
    if (!currentCatId || leftSelected.size === 0) return;
    setError(null);
    const existMap = new Set(catItems.map((p) => toKey(p.id)));
    const ids = [...leftSelected].filter((id) => !existMap.has(id));
    if (ids.length === 0) {
      showInfo("สินค้าในหน้าที่เลือก อยู่ในหมวดครบแล้ว");
      return;
    }
    try {
      const res = await fetch("/api/mock/products/bulk-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, category_id: currentCatId }),
      });
      if (!res.ok) throw new Error("เพิ่มสินค้าหลายรายการไม่สำเร็จ");
      clearSet(setLeftSelected);
      await loadCatItems(catPage);
      showInfo(`เพิ่มแล้ว ${ids.length} รายการ`);
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มหลายรายการ");
    }
  };

  const bulkRemove = async () => {
    if (rightSelected.size === 0) return;
    setError(null);
    const ids = [...rightSelected];
    try {
      const res = await fetch("/api/mock/products/bulk-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, category_id: "" }),
      });
      if (!res.ok) throw new Error("นำสินค้าหลายรายการออกไม่สำเร็จ");
      clearSet(setRightSelected);
      const nextCount = catItems.length - ids.length;
      const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
      await loadCatItems(nextPage);
      showInfo(`นำออกแล้ว ${ids.length} รายการ`);
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำออกหลายรายการ");
    }
  };

  /* ============ reorder (local first → save) ============ */
  const swapLocal = (i: number, j: number) => {
    setCatItems((arr) => {
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((p, idx) => ({ ...p, order: idx }));
    });
    setDirty(true);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    swapLocal(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index >= catItems.length - 1) return;
    swapLocal(index, index + 1);
  };

  const saveReorder = async () => {
    if (!currentCatId || !dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const allParams = new URLSearchParams({
        page: "1",
        pageSize: "10000",
        category_id: String(currentCatId),
        sort: "order",
      });
      const allRes = await fetch(`/api/mock/products?${allParams.toString()}`, {
        cache: "no-store",
      });
      if (!allRes.ok) throw new Error("โหลดสินค้าทั้งหมวดไม่สำเร็จ");
      const allData = await allRes.json();
      const fullList: ProductLite[] = (allData?.items ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        image_url: p.image_url,
        order: p.order,
      }));

      const start = (catPage - 1) * pageSizeInCategory;
      const nextFull = [...fullList];
      for (let i = 0; i < catItems.length; i++) nextFull[start + i] = catItems[i];

      const orders = nextFull.map((p, idx) => ({ id: p.id, order: idx }));

      const res = await fetch("/api/mock/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error("บันทึกการจัดเรียงลำดับไม่สำเร็จ");

      await loadCatItems(catPage);
      setDirty(false);
      showInfo("บันทึกการเปลี่ยนแปลงเรียบร้อย");
    } catch (e: any) {
      setError(e?.message ?? "เกิดข้อผิดพลาดขณะบันทึกลำดับ");
    } finally {
      setSaving(false);
    }
  };

  const isInCategory = (pid: string | number) =>
    catItems.some((p) => String(p.id) === String(pid));

  /* ============ render ============ */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT */}
      <Card className="p-4 space-y-4">
        {heading && <h2 className="text-lg font-semibold">{heading}</h2>}

        <div>
          <div className="text-sm font-medium">เลือกหมวดหมู่</div>
          <div className="text-xs text-muted-foreground">เลือกหมวดที่จะเพิ่ม/ลบสินค้า</div>
        </div>

        <Select
          value={currentCatId != null ? String(currentCatId) : undefined}
          onValueChange={(v) => setCurrentCatId(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCats ? "Loading..." : "เลือกหมวดหมู่"} />
          </SelectTrigger>
          <SelectContent>
            {cats.map((c) => (
              <SelectItem key={String(c.id)} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2 mt-2">
            <div className="font-medium">เพิ่มสินค้าเข้าหมวด</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setAllInSet(setLeftSelected, results.map((r) => r.id))}
                disabled={results.length === 0}
                title="เลือกทั้งหมดในหน้านี้"
              >
                เลือกหน้านี้
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => clearSet(setLeftSelected)}
                disabled={leftSelected.size === 0}
                title="ล้างการเลือกฝั่งซ้าย"
              >
                ยกเลิกเลือก
              </Button>
              <Button
                size="sm"
                onClick={bulkAdd}
                disabled={!currentCatId || leftSelected.size === 0 || searching}
                title="เพิ่มหลายรายการ"
              >
                เพิ่มที่เลือก ({leftSelected.size || 0})
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
            />
            <Button onClick={onSearchSubmit} disabled={searching}>
              {searching ? "ค้นหา..." : "ค้นหา"}
            </Button>
          </div>

          {/* search results */}
          <div className="mt-3 max-h-[calc(100vh-380px)] overflow-auto space-y-2">
            {results.map((p) => {
              const inCat = isInCategory(p.id);
              const b = !!busy[String(p.id)];
              const chosen = leftSelected.has(toKey(p.id));
              return (
                <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={chosen}
                      onCheckedChange={() => toggleInSet(setLeftSelected, p.id)}
                      className="mr-1"
                    />
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
                        ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCategory(p.id)}
                    disabled={!currentCatId || inCat || b}
                  >
                    {inCat ? "อยู่แล้ว" : b ? "กำลังเพิ่ม..." : "เพิ่ม"}
                  </Button>
                </div>
              );
            })}

            {searchTotal > 0 && (
              <div className="sticky bottom-0 bg-card/80 backdrop-blur mt-2 pt-2 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  หน้า {searchPage} / {searchTotalPages} • ทั้งหมด {searchTotal} รายการ
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
                    onClick={() => runSearch(Math.min(searchTotalPages, searchPage + 1))}
                    disabled={searchPage >= searchTotalPages || searching}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
        {info && <div className="text-sm text-primary">{info}</div>}
      </Card>

      {/* RIGHT */}
      <Card className="p-4 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">หมวดที่เลือก</div>
            <div className="text-lg font-semibold">{currentCat?.name ?? "—"}</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAllInSet(setRightSelected, catItems.map((c) => c.id))}
              disabled={catItems.length === 0}
              title="เลือกทั้งหมดในหน้านี้"
            >
              เลือกหน้านี้
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => clearSet(setRightSelected)}
              disabled={rightSelected.size === 0}
              title="ล้างการเลือกฝั่งขวา"
            >
              ยกเลิกเลือก
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={bulkRemove}
              disabled={rightSelected.size === 0 || catLoading}
              title="นำออกหลายรายการ"
            >
              นำออกที่เลือก ({rightSelected.size || 0})
            </Button>
            <Button
              onClick={saveReorder}
              disabled={!dirty || saving || catLoading || catItems.length === 0}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {catLoading && <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>}

          {!catLoading &&
            catItems.map((p, idx) => {
              const b = !!busy[String(p.id)];
              const chosen = rightSelected.has(toKey(p.id));
              return (
                <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={chosen}
                      onCheckedChange={() => toggleInSet(setRightSelected, p.id)}
                      className="mr-1"
                    />
                    <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0 || b}
                    >
                      ขึ้น
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveDown(idx)}
                      disabled={idx === catItems.length - 1 || b}
                    >
                      ลง
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCategory(p.id)}
                      disabled={b}
                    >
                      {b ? "กำลังนำออก..." : "นำออก"}
                    </Button>
                  </div>
                </div>
              );
            })}

          {!catLoading && catItems.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
              ยังไม่มีสินค้าในหมวดนี้
            </div>
          )}
        </div>

        {catTotal > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              หน้า {catPage} / {catTotalPages} • ทั้งหมด {catTotal} รายการ
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => loadCatItems(Math.max(1, catPage - 1))}
                disabled={catPage <= 1 || catLoading}
              >
                ก่อนหน้า
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => loadCatItems(Math.min(catTotalPages, catPage + 1))}
                disabled={catPage >= catTotalPages || catLoading}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/components/admin/category-products-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";

// type CategoryLite = {
//   id: number | string;
//   name: string;
//   slug?: string;
//   visible?: boolean;
//   order?: number;
//   image_url?: string;
// };

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
//   order?: number; // ใช้สำหรับสลับลำดับ
// };

// interface CategoryProductsEditorProps {
//   initialCategoryId?: string | number;
//   pageSizeInCategory?: number;
//   pageSizeSearch?: number;
//   heading?: string;
// }

// export default function CategoryProductsEditor({
//   initialCategoryId,
//   pageSizeInCategory = 24,
//   pageSizeSearch = 10,
//   heading,
// }: CategoryProductsEditorProps) {
//   /* ============ category list ============ */
//   const [cats, setCats] = useState<CategoryLite[]>([]);
//   const [currentCatId, setCurrentCatId] = useState<string | number | null>(
//     initialCategoryId ?? null
//   );
//   const [loadingCats, setLoadingCats] = useState(false);

//   const currentCat = useMemo(
//     () => cats.find((c) => String(c.id) === String(currentCatId)) || null,
//     [cats, currentCatId]
//   );

//   /* ============ left: search products ============ */
//   const [q, setQ] = useState("");
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searching, setSearching] = useState(false);
//   const [searchPage, setSearchPage] = useState(1);
//   const [searchTotal, setSearchTotal] = useState(0);
//   const searchTotalPages = Math.max(1, Math.ceil(searchTotal / pageSizeSearch));

//   /* ============ right: products in category ============ */
//   const [catItems, setCatItems] = useState<ProductLite[]>([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catPage, setCatPage] = useState(1);
//   const [catTotal, setCatTotal] = useState(0);
//   const catTotalPages = Math.max(1, Math.ceil(catTotal / pageSizeInCategory));

//   // สำหรับ save reorder
//   const [dirty, setDirty] = useState(false);
//   const [saving, setSaving] = useState(false);

//   /* ============ selection (multi) ============ */
//   const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
//   const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());

//   /* ============ misc ============ */
//   const [busy, setBusy] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const showInfo = (msg: string) => {
//     setInfo(msg);
//     setTimeout(() => setInfo(null), 1800);
//   };

//   /* ---------- helpers สำหรับ Set ---------- */
//   const toKey = (id: string | number) => String(id);

//   const toggleInSet = (
//     setter: React.Dispatch<React.SetStateAction<Set<string>>>,
//     id: string | number
//   ) => {
//     setter((prev) => {
//       const next = new Set(prev);
//       const k = toKey(id);
//       next.has(k) ? next.delete(k) : next.add(k);
//       return next;
//     });
//   };

//   const setAllInSet = (
//     setter: React.Dispatch<React.SetStateAction<Set<string>>>,
//     ids: (string | number)[]
//   ) => {
//     setter(new Set(ids.map(toKey)));
//   };

//   const clearSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
//     setter(new Set());
//   };

//   /* ============ load categories ============ */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingCats(true);
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
//         const data = await res.json();
//         const list: CategoryLite[] = (data?.items ?? [])
//           .filter((c: any) => c.visible !== false)
//           .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
//         if (!alive) return;
//         setCats(list);
//         if (!initialCategoryId && list.length && !currentCatId) {
//           setCurrentCatId(list[0].id);
//         }
//       } catch (e: any) {
//         setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
//       } finally {
//         setLoadingCats(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ============ load products in current category ============ */
//   const loadCatItems = async (page = 1) => {
//     if (!currentCatId) return;
//     try {
//       setCatLoading(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeInCategory),
//         category_id: String(currentCatId),
//         sort: "order",
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("โหลดสินค้าในหมวดล้มเหลว");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//         order: p.order,
//       }));
//       setCatItems(list);
//       setCatPage(Number(data?.page ?? page));
//       setCatTotal(Number(data?.total ?? 0));
//       setDirty(false);
//       clearSet(setRightSelected);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดสินค้าในหมวด");
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!currentCatId) return;
//     loadCatItems(1);
//     clearSet(setLeftSelected);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentCatId]);

//   /* ============ search ops ============ */
//   const runSearch = async (page = 1) => {
//     try {
//       setSearching(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeSearch),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("ค้นหาล้มเหลว");
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
//       clearSet(setLeftSelected);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการค้นหา");
//     } finally {
//       setSearching(false);
//     }
//   };
//   const onSearchSubmit = () => runSearch(1);

//   /* ============ mutations: add/remove (single) ============ */
//   const markBusy = (id: string | number, v: boolean) =>
//     setBusy((m) => ({ ...m, [String(id)]: v }));

//   const addToCategory = async (pid: string | number) => {
//     if (!currentCatId) return;
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: currentCatId }),
//       });
//       if (!res.ok) throw new Error("เพิ่มสินค้าเข้าหมวดไม่สำเร็จ");
//       await loadCatItems(catPage);
//       showInfo("เพิ่มสินค้าเข้าหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มสินค้า");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   const removeFromCategory = async (pid: string | number) => {
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: "" }),
//       });
//       if (!res.ok) throw new Error("นำสินค้าออกจากหมวดไม่สำเร็จ");
//       const nextCount = catItems.length - 1;
//       const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
//       await loadCatItems(nextPage);
//       showInfo("นำสินค้าออกจากหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำสินค้าออก");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   /* ============ BULK add/remove (multi) ============ */
//   const bulkAdd = async () => {
//     if (!currentCatId || leftSelected.size === 0) return;
//     setError(null);
//     const existMap = new Set(catItems.map((p) => toKey(p.id)));
//     const ids = [...leftSelected].filter((id) => !existMap.has(id));
//     if (ids.length === 0) {
//       showInfo("สินค้าในหน้าที่เลือก อยู่ในหมวดครบแล้ว");
//       return;
//     }
//     try {
//       const res = await fetch("/api/mock/products/bulk-category", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids, category_id: currentCatId }),
//       });
//       if (!res.ok) throw new Error("เพิ่มสินค้าหลายรายการไม่สำเร็จ");
//       clearSet(setLeftSelected);
//       await loadCatItems(catPage);
//       showInfo(`เพิ่มแล้ว ${ids.length} รายการ`);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มหลายรายการ");
//     }
//   };

//   const bulkRemove = async () => {
//     if (rightSelected.size === 0) return;
//     setError(null);
//     const ids = [...rightSelected];
//     try {
//       const res = await fetch("/api/mock/products/bulk-category", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids, category_id: "" }),
//       });
//       if (!res.ok) throw new Error("นำสินค้าหลายรายการออกไม่สำเร็จ");
//       clearSet(setRightSelected);
//       const nextCount = catItems.length - ids.length;
//       const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
//       await loadCatItems(nextPage);
//       showInfo(`นำออกแล้ว ${ids.length} รายการ`);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำออกหลายรายการ");
//     }
//   };

//   /* ============ reorder (local first → save) ============ */
//   const swapLocal = (i: number, j: number) => {
//     setCatItems((arr) => {
//       const next = [...arr];
//       [next[i], next[j]] = [next[j], next[i]];
//       return next.map((p, idx) => ({ ...p, order: idx }));
//     });
//     setDirty(true);
//   };

//   const moveUp = (index: number) => {
//     if (index <= 0) return;
//     swapLocal(index, index - 1);
//   };

//   const moveDown = (index: number) => {
//     if (index >= catItems.length - 1) return;
//     swapLocal(index, index + 1);
//   };

//   const saveReorder = async () => {
//     if (!currentCatId || !dirty || saving) return;
//     setSaving(true);
//     setError(null);
//     try {
//       const allParams = new URLSearchParams({
//         page: "1",
//         pageSize: "10000",
//         category_id: String(currentCatId),
//         sort: "order",
//       });
//       const allRes = await fetch(`/api/mock/products?${allParams.toString()}`, {
//         cache: "no-store",
//       });
//       if (!allRes.ok) throw new Error("โหลดสินค้าทั้งหมวดไม่สำเร็จ");
//       const allData = await allRes.json();
//       const fullList: ProductLite[] = (allData?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//         order: p.order,
//       }));

//       const start = (catPage - 1) * pageSizeInCategory;
//       const nextFull = [...fullList];
//       for (let i = 0; i < catItems.length; i++) nextFull[start + i] = catItems[i];

//       const orders = nextFull.map((p, idx) => ({ id: p.id, order: idx }));

//       const res = await fetch("/api/mock/products/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ orders }),
//       });
//       if (!res.ok) throw new Error("บันทึกการจัดเรียงลำดับไม่สำเร็จ");

//       await loadCatItems(catPage);
//       setDirty(false);
//       showInfo("บันทึกการเปลี่ยนแปลงเรียบร้อย");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะบันทึกลำดับ");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isInCategory = (pid: string | number) =>
//     catItems.some((p) => String(p.id) === String(pid));

//   /* ============ render ============ */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* LEFT */}
//       <Card className="p-4 space-y-4">
//         {heading && <h2 className="text-lg font-semibold">{heading}</h2>}

//         <div>
//           <div className="text-sm font-medium">เลือกหมวดหมู่</div>
//           <div className="text-xs text-muted-foreground">เลือกหมวดที่จะเพิ่ม/ลบสินค้า</div>
//         </div>

//         <Select
//           value={currentCatId != null ? String(currentCatId) : undefined}
//           onValueChange={(v) => setCurrentCatId(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loadingCats ? "Loading..." : "เลือกหมวดหมู่"} />
//           </SelectTrigger>
//           <SelectContent>
//             {cats.map((c) => (
//               <SelectItem key={String(c.id)} value={String(c.id)}>
//                 {c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="pt-2 border-t">
//           <div className="flex items-center justify-between mb-2 mt-2">
//             <div className="font-medium">เพิ่มสินค้าเข้าหมวด</div>
//             <div className="flex items-center gap-2">
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => setAllInSet(setLeftSelected, results.map((r) => r.id))}
//                 disabled={results.length === 0}
//                 title="เลือกทั้งหมดในหน้านี้"
//               >
//                 เลือกหน้านี้
//               </Button>
//               <Button
//                 size="sm"
//                 onClick={bulkAdd}
//                 disabled={!currentCatId || leftSelected.size === 0 || searching}
//                 title="เพิ่มหลายรายการ"
//               >
//                 เพิ่มที่เลือก ({leftSelected.size || 0})
//               </Button>
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//               onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
//             />
//             <Button onClick={onSearchSubmit} disabled={searching}>
//               {searching ? "ค้นหา..." : "ค้นหา"}
//             </Button>
//           </div>

//           {/* search results */}
//           <div className="mt-3 max-h-[calc(100vh-380px)] overflow-auto space-y-2">
//             {results.map((p) => {
//               const inCat = isInCategory(p.id);
//               const b = !!busy[String(p.id)];
//               const chosen = leftSelected.has(toKey(p.id));
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <Checkbox
//                       checked={chosen}
//                       onCheckedChange={() => toggleInSet(setLeftSelected, p.id)}
//                       className="mr-1"
//                     />
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
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => addToCategory(p.id)}
//                     disabled={!currentCatId || inCat || b}
//                   >
//                     {inCat ? "อยู่แล้ว" : b ? "กำลังเพิ่ม..." : "เพิ่ม"}
//                   </Button>
//                 </div>
//               );
//             })}

//             {searchTotal > 0 && (
//               <div className="sticky bottom-0 bg-card/80 backdrop-blur mt-2 pt-2 border-t flex items-center justify-between">
//                 <div className="text-xs text-muted-foreground">
//                   หน้า {searchPage} / {searchTotalPages} • ทั้งหมด {searchTotal} รายการ
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
//                     onClick={() => runSearch(Math.min(searchTotalPages, searchPage + 1))}
//                     disabled={searchPage >= searchTotalPages || searching}
//                   >
//                     ถัดไป
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {error && <div className="text-sm text-destructive">{error}</div>}
//         {info && <div className="text-sm text-primary">{info}</div>}
//       </Card>

//       {/* RIGHT */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <div className="text-sm text-muted-foreground">หมวดที่เลือก</div>
//             <div className="text-lg font-semibold">{currentCat?.name ?? "—"}</div>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               variant="secondary"
//               onClick={() => setAllInSet(setRightSelected, catItems.map((c) => c.id))}
//               disabled={catItems.length === 0}
//               title="เลือกทั้งหมดในหน้านี้"
//             >
//               เลือกหน้านี้
//             </Button>
//             <Button
//               size="sm"
//               variant="destructive"
//               onClick={bulkRemove}
//               disabled={rightSelected.size === 0 || catLoading}
//               title="นำออกหลายรายการ"
//             >
//               นำออกที่เลือก ({rightSelected.size || 0})
//             </Button>
//             <Button
//               onClick={saveReorder}
//               disabled={!dirty || saving || catLoading || catItems.length === 0}
//             >
//               {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
//             </Button>
//           </div>
//         </div>

//         <div className="space-y-2">
//           {catLoading && <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>}

//           {!catLoading &&
//             catItems.map((p, idx) => {
//               const b = !!busy[String(p.id)];
//               const chosen = rightSelected.has(toKey(p.id));
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <Checkbox
//                       checked={chosen}
//                       onCheckedChange={() => toggleInSet(setRightSelected, p.id)}
//                       className="mr-1"
//                     />
//                     <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {p.image_url ? (
//                         <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">
//                         {p.name}
//                       </div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 flex-shrink-0">
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveUp(idx)}
//                       disabled={idx === 0 || b}
//                     >
//                       ขึ้น
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveDown(idx)}
//                       disabled={idx === catItems.length - 1 || b}
//                     >
//                       ลง
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeFromCategory(p.id)}
//                       disabled={b}
//                     >
//                       {b ? "กำลังนำออก..." : "นำออก"}
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}

//           {!catLoading && catItems.length === 0 && (
//             <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//               ยังไม่มีสินค้าในหมวดนี้
//             </div>
//           )}
//         </div>

//         {catTotal > 0 && (
//           <div className="mt-3 flex items-center justify-between">
//             <div className="text-xs text-muted-foreground">
//               หน้า {catPage} / {catTotalPages} • ทั้งหมด {catTotal} รายการ
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.max(1, catPage - 1))}
//                 disabled={catPage <= 1 || catLoading}
//               >
//                 ก่อนหน้า
//               </Button>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.min(catTotalPages, catPage + 1))}
//                 disabled={catPage >= catTotalPages || catLoading}
//               >
//                 ถัดไป
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// // src/components/admin/category-products-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// type CategoryLite = {
//   id: number | string;
//   name: string;
//   slug?: string;
//   visible?: boolean;
//   order?: number;
//   image_url?: string;
// };

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
//   order?: number; // ใช้สำหรับสลับลำดับ
// };

// interface CategoryProductsEditorProps {
//   initialCategoryId?: string | number;
//   pageSizeInCategory?: number;
//   pageSizeSearch?: number;
//   heading?: string;
// }

// export default function CategoryProductsEditor({
//   initialCategoryId,
//   pageSizeInCategory = 24,
//   pageSizeSearch = 10,
//   heading,
// }: CategoryProductsEditorProps) {
//   /* ============ category list ============ */
//   const [cats, setCats] = useState<CategoryLite[]>([]);
//   const [currentCatId, setCurrentCatId] = useState<string | number | null>(
//     initialCategoryId ?? null
//   );
//   const [loadingCats, setLoadingCats] = useState(false);

//   const currentCat = useMemo(
//     () => cats.find((c) => String(c.id) === String(currentCatId)) || null,
//     [cats, currentCatId]
//   );

//   /* ============ left: search products ============ */
//   const [q, setQ] = useState("");
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searching, setSearching] = useState(false);
//   const [searchPage, setSearchPage] = useState(1);
//   const [searchTotal, setSearchTotal] = useState(0);
//   const searchTotalPages = Math.max(1, Math.ceil(searchTotal / pageSizeSearch));

//   /* ============ right: products in category ============ */
//   const [catItems, setCatItems] = useState<ProductLite[]>([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catPage, setCatPage] = useState(1);
//   const [catTotal, setCatTotal] = useState(0);
//   const catTotalPages = Math.max(1, Math.ceil(catTotal / pageSizeInCategory));

//   // สำหรับ save reorder
//   const [dirty, setDirty] = useState(false);
//   const [saving, setSaving] = useState(false);

//   /* ============ misc ============ */
//   const [busy, setBusy] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const showInfo = (msg: string) => {
//     setInfo(msg);
//     setTimeout(() => setInfo(null), 1800);
//   };

//   /* ============ load categories ============ */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingCats(true);
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
//         const data = await res.json();
//         const list: CategoryLite[] = (data?.items ?? [])
//           .filter((c: any) => c.visible !== false)
//           .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
//         if (!alive) return;
//         setCats(list);
//         if (!initialCategoryId && list.length && !currentCatId) {
//           setCurrentCatId(list[0].id);
//         }
//       } catch (e: any) {
//         setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
//       } finally {
//         setLoadingCats(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ============ load products in current category ============ */
//   const loadCatItems = async (page = 1) => {
//     if (!currentCatId) return;
//     try {
//       setCatLoading(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeInCategory),
//         category_id: String(currentCatId), // filter ตามหมวด
//         sort: "order",
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("โหลดสินค้าในหมวดล้มเหลว");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//         order: p.order,
//       }));
//       setCatItems(list);
//       setCatPage(Number(data?.page ?? page));
//       setCatTotal(Number(data?.total ?? 0));
//       setDirty(false); // รีเซ็ตสถานะแก้ไขเมื่อรีโหลดจากเซิร์ฟเวอร์
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดสินค้าในหมวด");
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!currentCatId) return;
//     loadCatItems(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentCatId]);

//   /* ============ search ops ============ */
//   const runSearch = async (page = 1) => {
//     try {
//       setSearching(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeSearch),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("ค้นหาล้มเหลว");
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
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการค้นหา");
//     } finally {
//       setSearching(false);
//     }
//   };
//   const onSearchSubmit = () => runSearch(1);

//   /* ============ mutations: add/remove ============ */
//   const markBusy = (id: string | number, v: boolean) =>
//     setBusy((m) => ({ ...m, [String(id)]: v }));

//   const addToCategory = async (pid: string | number) => {
//     if (!currentCatId) return;
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: currentCatId }),
//       });
//       if (!res.ok) throw new Error("เพิ่มสินค้าเข้าหมวดไม่สำเร็จ");
//       await loadCatItems(catPage);
//       showInfo("เพิ่มสินค้าเข้าหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มสินค้า");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   const removeFromCategory = async (pid: string | number) => {
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: "" }), // ล้างค่า
//       });
//       if (!res.ok) throw new Error("นำสินค้าออกจากหมวดไม่สำเร็จ");
//       const nextCount = catItems.length - 1;
//       const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
//       await loadCatItems(nextPage);
//       showInfo("นำสินค้าออกจากหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำสินค้าออก");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   /* ============ reorder (local first → save) ============ */
//   const swapLocal = (i: number, j: number) => {
//     setCatItems((arr) => {
//       const next = [...arr];
//       [next[i], next[j]] = [next[j], next[i]];
//       // อัปเดตเลข order ชั่วคราวตาม index ปัจจุบัน (0..n-1)
//       return next.map((p, idx) => ({ ...p, order: p.order ?? idx }));
//     });
//     setDirty(true);
//   };

//   const moveUp = (index: number) => {
//     if (index <= 0) return;
//     swapLocal(index, index - 1);
//   };

//   const moveDown = (index: number) => {
//     if (index >= catItems.length - 1) return;
//     swapLocal(index, index + 1);
//   };

//   const saveReorder = async () => {
//     if (!currentCatId || !dirty || saving) return;
//     setSaving(true);
//     setError(null);
//     try {
//       // 1) โหลด "ทั้งหมวด" ด้วย pageSize ใหญ่ เพื่อประกอบลำดับใหม่
//       const allParams = new URLSearchParams({
//         page: "1",
//         pageSize: "10000",
//         category_id: String(currentCatId),
//         sort: "order",
//       });
//       const allRes = await fetch(`/api/mock/products?${allParams.toString()}`, {
//         cache: "no-store",
//       });
//       if (!allRes.ok) throw new Error("โหลดสินค้าทั้งหมวดไม่สำเร็จ");
//       const allData = await allRes.json();
//       const fullList: ProductLite[] = (allData?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//         order: p.order,
//       }));

//       // 2) แทนที่ช่วงของหน้าปัจจุบันด้วยลำดับที่แก้ไข local
//       const start = (catPage - 1) * pageSizeInCategory;
//       const nextFull = [...fullList];
//       for (let i = 0; i < catItems.length; i++) {
//         nextFull[start + i] = catItems[i];
//       }

//       // 3) สร้าง orders = id → order (0..N-1)
//       const orders = nextFull.map((p, idx) => ({ id: p.id, order: idx }));

//       // 4) ส่งไปยัง API
//       const res = await fetch("/api/mock/products/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ orders }),
//       });
//       if (!res.ok) throw new Error("บันทึกการจัดเรียงลำดับไม่สำเร็จ");

//       // 5) รีโหลดหน้าปัจจุบัน
//       await loadCatItems(catPage);
//       setDirty(false);
//       showInfo("บันทึกการเปลี่ยนแปลงเรียบร้อย");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะบันทึกลำดับ");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isInCategory = (pid: string | number) =>
//     catItems.some((p) => String(p.id) === String(pid));

//   /* ============ render ============ */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* LEFT */}
//       <Card className="p-4 space-y-4">
//         {heading && <h2 className="text-lg font-semibold">{heading}</h2>}

//         <div>
//           <div className="text-sm font-medium">เลือกหมวดหมู่</div>
//           <div className="text-xs text-muted-foreground">เลือกหมวดที่จะเพิ่ม/ลบสินค้า</div>
//         </div>

//         <Select
//           value={currentCatId != null ? String(currentCatId) : undefined}
//           onValueChange={(v) => setCurrentCatId(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loadingCats ? "Loading..." : "เลือกหมวดหมู่"} />
//           </SelectTrigger>
//           <SelectContent>
//             {cats.map((c) => (
//               <SelectItem key={String(c.id)} value={String(c.id)}>
//                 {c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="pt-2 border-t">
//           <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าหมวด</div>
//           <div className="flex gap-2">
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//               onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
//             />
//             <Button onClick={onSearchSubmit} disabled={searching}>
//               {searching ? "ค้นหา..." : "ค้นหา"}
//             </Button>
//           </div>

//           {/* search results with its own scroll; footer pagination sticks */}
//           <div className="mt-3 max-h-[calc(100vh-380px)] overflow-auto space-y-2">
//             {results.map((p) => {
//               const inCat = isInCategory(p.id);
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
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
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => addToCategory(p.id)}
//                     disabled={!currentCatId || inCat || b}
//                   >
//                     {inCat ? "อยู่แล้ว" : b ? "กำลังเพิ่ม..." : "เพิ่ม"}
//                   </Button>
//                 </div>
//               );
//             })}

//             {searchTotal > 0 && (
//               <div className="sticky bottom-0 bg-card/80 backdrop-blur mt-2 pt-2 border-t flex items-center justify-between">
//                 <div className="text-xs text-muted-foreground">
//                   หน้า {searchPage} / {searchTotalPages} • ทั้งหมด {searchTotal} รายการ
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
//                     onClick={() => runSearch(Math.min(searchTotalPages, searchPage + 1))}
//                     disabled={searchPage >= searchTotalPages || searching}
//                   >
//                     ถัดไป
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {error && <div className="text-sm text-destructive">{error}</div>}
//         {info && <div className="text-sm text-primary">{info}</div>}
//       </Card>

//       {/* RIGHT */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <div className="text-sm text-muted-foreground">หมวดที่เลือก</div>
//             <div className="text-lg font-semibold">{currentCat?.name ?? "—"}</div>
//           </div>

//           <Button
//             onClick={saveReorder}
//             disabled={!dirty || saving || catLoading || catItems.length === 0}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
//           </Button>
//         </div>

//         <div className="space-y-2">
//           {catLoading && <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>}

//           {!catLoading &&
//             catItems.map((p, idx) => {
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {p.image_url ? (
//                         <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">{p.name}</div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 flex-shrink-0">
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveUp(idx)}
//                       disabled={idx === 0 || b}
//                     >
//                       ขึ้น
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveDown(idx)}
//                       disabled={idx === catItems.length - 1 || b}
//                     >
//                       ลง
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeFromCategory(p.id)}
//                       disabled={b}
//                     >
//                       {b ? "กำลังนำออก..." : "นำออก"}
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}

//           {!catLoading && catItems.length === 0 && (
//             <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//               ยังไม่มีสินค้าในหมวดนี้
//             </div>
//           )}
//         </div>

//         {catTotal > 0 && (
//           <div className="mt-3 flex items-center justify-between">
//             <div className="text-xs text-muted-foreground">
//               หน้า {catPage} / {catTotalPages} • ทั้งหมด {catTotal} รายการ
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.max(1, catPage - 1))}
//                 disabled={catPage <= 1 || catLoading}
//               >
//                 ก่อนหน้า
//               </Button>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.min(catTotalPages, catPage + 1))}
//                 disabled={catPage >= catTotalPages || catLoading}
//               >
//                 ถัดไป
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/components/admin/category-products-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// type CategoryLite = {
//   id: number | string;
//   name: string;
//   slug?: string;
//   visible?: boolean;
//   order?: number;
//   image_url?: string;
// };

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
//   order?: number; // ⬅️ ใช้สำหรับสลับลำดับ
// };

// interface CategoryProductsEditorProps {
//   initialCategoryId?: string | number;
//   pageSizeInCategory?: number;
//   pageSizeSearch?: number;
//   heading?: string;
// }

// export default function CategoryProductsEditor({
//   initialCategoryId,
//   pageSizeInCategory = 24,
//   pageSizeSearch = 10,
//   heading,
// }: CategoryProductsEditorProps) {
//   /* ============ category list ============ */
//   const [cats, setCats] = useState<CategoryLite[]>([]);
//   const [currentCatId, setCurrentCatId] = useState<string | number | null>(
//     initialCategoryId ?? null
//   );
//   const [loadingCats, setLoadingCats] = useState(false);

//   const currentCat = useMemo(
//     () => cats.find((c) => String(c.id) === String(currentCatId)) || null,
//     [cats, currentCatId]
//   );

//   /* ============ left: search products ============ */
//   const [q, setQ] = useState("");
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searching, setSearching] = useState(false);
//   const [searchPage, setSearchPage] = useState(1);
//   const [searchTotal, setSearchTotal] = useState(0);
//   const searchTotalPages = Math.max(1, Math.ceil(searchTotal / pageSizeSearch));

//   /* ============ right: products in category ============ */
//   const [catItems, setCatItems] = useState<ProductLite[]>([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catPage, setCatPage] = useState(1);
//   const [catTotal, setCatTotal] = useState(0);
//   const catTotalPages = Math.max(1, Math.ceil(catTotal / pageSizeInCategory));

//   /* ============ misc ============ */
//   const [busy, setBusy] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const showInfo = (msg: string) => {
//     setInfo(msg);
//     setTimeout(() => setInfo(null), 1800);
//   };

//   /* ============ load categories ============ */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingCats(true);
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
//         const data = await res.json();
//         const list: CategoryLite[] = (data?.items ?? [])
//           .filter((c: any) => c.visible !== false)
//           .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
//         if (!alive) return;
//         setCats(list);
//         if (!initialCategoryId && list.length && !currentCatId) {
//           setCurrentCatId(list[0].id);
//         }
//       } catch (e: any) {
//         setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
//       } finally {
//         setLoadingCats(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ============ load products in current category ============ */
//   const loadCatItems = async (page = 1) => {
//     if (!currentCatId) return;
//     try {
//       setCatLoading(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeInCategory),
//         category_id: String(currentCatId), // ⬅️ filter ตามหมวด
//         sort: "order",
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("โหลดสินค้าในหมวดล้มเหลว");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//         order: p.order, // ⬅️ เก็บ order มาใช้สลับ
//       }));
//       setCatItems(list);
//       setCatPage(Number(data?.page ?? page));
//       setCatTotal(Number(data?.total ?? 0));
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดสินค้าในหมวด");
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!currentCatId) return;
//     loadCatItems(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentCatId]);

//   /* ============ search ops ============ */
//   const runSearch = async (page = 1) => {
//     try {
//       setSearching(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeSearch),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("ค้นหาล้มเหลว");
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
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการค้นหา");
//     } finally {
//       setSearching(false);
//     }
//   };
//   const onSearchSubmit = () => runSearch(1);

//   /* ============ mutations ============ */
//   const markBusy = (id: string | number, v: boolean) =>
//     setBusy((m) => ({ ...m, [String(id)]: v }));

//   const addToCategory = async (pid: string | number) => {
//     if (!currentCatId) return;
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: currentCatId }),
//       });
//       if (!res.ok) throw new Error("เพิ่มสินค้าเข้าหมวดไม่สำเร็จ");
//       await loadCatItems(catPage);
//       showInfo("เพิ่มสินค้าเข้าหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มสินค้า");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   const removeFromCategory = async (pid: string | number) => {
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: "" }), // ล้างค่า
//       });
//       if (!res.ok) throw new Error("นำสินค้าออกจากหมวดไม่สำเร็จ");
//       const nextCount = catItems.length - 1;
//       const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
//       await loadCatItems(nextPage);
//       showInfo("นำสินค้าออกจากหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำสินค้าออก");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   // ⬇️⬆️ สลับลำดับในหมวด (ใช้ /reorder)
//   const moveUp = async (index: number) => {
//     if (index <= 0) return;
//     const a = catItems[index - 1];
//     const b = catItems[index];
//     if (!a || !b) return;

//     setBusy((m) => ({ ...m, [String(a.id)]: true, [String(b.id)]: true }));
//     try {
//       const res = await fetch("/api/mock/products/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           orders: [
//             { id: a.id, order: b.order ?? index }, // สลับ order กัน
//             { id: b.id, order: a.order ?? index - 1 },
//           ],
//         }),
//       });
//       if (!res.ok) throw new Error("สลับลำดับไม่สำเร็จ");
//       await loadCatItems(catPage);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะสลับลำดับ");
//     } finally {
//       setBusy((m) => ({ ...m, [String(a.id)]: false, [String(b.id)]: false }));
//     }
//   };

//   const moveDown = async (index: number) => {
//     if (index >= catItems.length - 1) return;
//     const a = catItems[index];
//     const b = catItems[index + 1];
//     if (!a || !b) return;

//     setBusy((m) => ({ ...m, [String(a.id)]: true, [String(b.id)]: true }));
//     try {
//       const res = await fetch("/api/mock/products/reorder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           orders: [
//             { id: a.id, order: b.order ?? index + 1 },
//             { id: b.id, order: a.order ?? index },
//           ],
//         }),
//       });
//       if (!res.ok) throw new Error("สลับลำดับไม่สำเร็จ");
//       await loadCatItems(catPage);
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะสลับลำดับ");
//     } finally {
//       setBusy((m) => ({ ...m, [String(a.id)]: false, [String(b.id)]: false }));
//     }
//   };

//   const isInCategory = (pid: string | number) =>
//     catItems.some((p) => String(p.id) === String(pid));

//   /* ============ render ============ */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* LEFT */}
//       <Card className="p-4 space-y-4">
//         {heading && <h2 className="text-lg font-semibold">{heading}</h2>}

//         <div>
//           <div className="text-sm font-medium">เลือกหมวดหมู่</div>
//           <div className="text-xs text-muted-foreground">เลือกหมวดที่จะเพิ่ม/ลบสินค้า</div>
//         </div>

//         <Select
//           value={currentCatId != null ? String(currentCatId) : undefined}
//           onValueChange={(v) => setCurrentCatId(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loadingCats ? "Loading..." : "เลือกหมวดหมู่"} />
//           </SelectTrigger>
//           <SelectContent>
//             {cats.map((c) => (
//               <SelectItem key={String(c.id)} value={String(c.id)}>
//                 {c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="pt-2 border-t">
//           <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าหมวด</div>
//           <div className="flex gap-2">
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//               onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
//             />
//             <Button onClick={onSearchSubmit} disabled={searching}>
//               {searching ? "ค้นหา..." : "ค้นหา"}
//             </Button>
//           </div>

//           {/* search results with its own scroll; footer pagination sticks */}
//           <div className="mt-3 max-h-[calc(100vh-380px)] overflow-auto space-y-2">
//             {results.map((p) => {
//               const inCat = isInCategory(p.id);
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
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
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => addToCategory(p.id)}
//                     disabled={!currentCatId || inCat || b}
//                   >
//                     {inCat ? "อยู่แล้ว" : b ? "กำลังเพิ่ม..." : "เพิ่ม"}
//                   </Button>
//                 </div>
//               );
//             })}

//             {searchTotal > 0 && (
//               <div className="sticky bottom-0 bg-card/80 backdrop-blur mt-2 pt-2 border-t flex items-center justify-between">
//                 <div className="text-xs text-muted-foreground">
//                   หน้า {searchPage} / {searchTotalPages} • ทั้งหมด {searchTotal} รายการ
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
//                     onClick={() => runSearch(Math.min(searchTotalPages, searchPage + 1))}
//                     disabled={searchPage >= searchTotalPages || searching}
//                   >
//                     ถัดไป
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {error && <div className="text-sm text-destructive">{error}</div>}
//         {info && <div className="text-sm text-primary">{info}</div>}
//       </Card>

//       {/* RIGHT */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="mb-4">
//           <div className="text-sm text-muted-foreground">หมวดที่เลือก</div>
//           <div className="text-lg font-semibold">{currentCat?.name ?? "—"}</div>
//         </div>

//         <div className="space-y-2">
//           {catLoading && <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>}

//           {!catLoading &&
//             catItems.map((p, idx) => {
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {p.image_url ? (
//                         <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">{p.name}</div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2 flex-shrink-0">
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveUp(idx)}
//                       disabled={idx === 0 || b}
//                     >
//                       ขึ้น
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       size="sm"
//                       onClick={() => moveDown(idx)}
//                       disabled={idx === catItems.length - 1 || b}
//                     >
//                       ลง
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeFromCategory(p.id)}
//                       disabled={b}
//                     >
//                       {b ? "กำลังนำออก..." : "นำออก"}
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}

//           {!catLoading && catItems.length === 0 && (
//             <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//               ยังไม่มีสินค้าในหมวดนี้
//             </div>
//           )}
//         </div>

//         {catTotal > 0 && (
//           <div className="mt-3 flex items-center justify-between">
//             <div className="text-xs text-muted-foreground">
//               หน้า {catPage} / {catTotalPages} • ทั้งหมด {catTotal} รายการ
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.max(1, catPage - 1))}
//                 disabled={catPage <= 1 || catLoading}
//               >
//                 ก่อนหน้า
//               </Button>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.min(catTotalPages, catPage + 1))}
//                 disabled={catPage >= catTotalPages || catLoading}
//               >
//                 ถัดไป
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }


// v.1.1.2 ================================================

// // src/components/admin/category-products-editor.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Image from "next/image";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";

// type CategoryLite = {
//   id: number | string;
//   name: string;
//   slug?: string;
//   visible?: boolean;
//   order?: number;
//   image_url?: string;
// };

// type ProductLite = {
//   id: number | string;
//   name: string;
//   sku?: string;
//   brand?: string;
//   image_url?: string;
// };

// interface CategoryProductsEditorProps {
//   /** ตั้งค่าเริ่มต้นเป็นหมวดนี้ (ถ้าไม่ส่งมาจะเลือกตัวแรกให้อัตโนมัติ) */
//   initialCategoryId?: string | number;
//   /** จำนวนต่อหน้า (ฝั่งขวา: รายการสินค้าในหมวด) */
//   pageSizeInCategory?: number;
//   /** จำนวนต่อหน้า (ฝั่งซ้าย: ผลลัพธ์ค้นหา) */
//   pageSizeSearch?: number;
//   /** แสดงหัวข้อด้านบนของคอมโพเนนต์ (optional) */
//   heading?: string;
// }

// export default function CategoryProductsEditor({
//   initialCategoryId,
//   pageSizeInCategory = 24,
//   pageSizeSearch = 10,
//   heading,
// }: CategoryProductsEditorProps) {
//   /* ============ category list ============ */
//   const [cats, setCats] = useState<CategoryLite[]>([]);
//   const [currentCatId, setCurrentCatId] = useState<string | number | null>(
//     initialCategoryId ?? null
//   );
//   const [loadingCats, setLoadingCats] = useState(false);

//   const currentCat = useMemo(
//     () => cats.find((c) => String(c.id) === String(currentCatId)) || null,
//     [cats, currentCatId]
//   );

//   /* ============ left: search products ============ */
//   const [q, setQ] = useState("");
//   const [results, setResults] = useState<ProductLite[]>([]);
//   const [searching, setSearching] = useState(false);
//   const [searchPage, setSearchPage] = useState(1);
//   const [searchTotal, setSearchTotal] = useState(0);
//   const searchTotalPages = Math.max(1, Math.ceil(searchTotal / pageSizeSearch));

//   /* ============ right: products in category ============ */
//   const [catItems, setCatItems] = useState<ProductLite[]>([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catPage, setCatPage] = useState(1);
//   const [catTotal, setCatTotal] = useState(0);
//   const catTotalPages = Math.max(1, Math.ceil(catTotal / pageSizeInCategory));

//   /* ============ misc ============ */
//   const [busy, setBusy] = useState<Record<string, boolean>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const showInfo = (msg: string) => {
//     setInfo(msg);
//     setTimeout(() => setInfo(null), 1800);
//   };

//   /* ============ load categories ============ */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingCats(true);
//         const res = await fetch("/api/mock/categories", { cache: "no-store" });
//         if (!res.ok) throw new Error("โหลดหมวดหมู่ล้มเหลว");
//         const data = await res.json();
//         const list: CategoryLite[] = (data?.items ?? [])
//           .filter((c: any) => c.visible !== false)
//           .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
//         if (!alive) return;
//         setCats(list);
//         if (!initialCategoryId && list.length && !currentCatId) {
//           setCurrentCatId(list[0].id);
//         }
//       } catch (e: any) {
//         setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
//       } finally {
//         setLoadingCats(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ============ load products in current category ============ */
//   const loadCatItems = async (page = 1) => {
//     if (!currentCatId) return;
//     try {
//       setCatLoading(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeInCategory),
//         category_id: String(currentCatId),
//         sort: "order",
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("โหลดสินค้าในหมวดล้มเหลว");
//       const data = await res.json();
//       const list: ProductLite[] = (data?.items ?? []).map((p: any) => ({
//         id: p.id,
//         name: p.name,
//         sku: p.sku,
//         brand: p.brand,
//         image_url: p.image_url,
//       }));
//       setCatItems(list);
//       setCatPage(Number(data?.page ?? page));
//       setCatTotal(Number(data?.total ?? 0));
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการโหลดสินค้าในหมวด");
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!currentCatId) return;
//     loadCatItems(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentCatId]);

//   /* ============ search ops ============ */
//   const runSearch = async (page = 1) => {
//     try {
//       setSearching(true);
//       const params = new URLSearchParams({
//         page: String(page),
//         pageSize: String(pageSizeSearch),
//         q: q.trim(),
//       });
//       const res = await fetch(`/api/mock/products?${params.toString()}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error("ค้นหาล้มเหลว");
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
//       setError(e?.message ?? "เกิดข้อผิดพลาดในการค้นหา");
//     } finally {
//       setSearching(false);
//     }
//   };
//   const onSearchSubmit = () => runSearch(1);

//   /* ============ mutations ============ */
//   const markBusy = (id: string | number, v: boolean) =>
//     setBusy((m) => ({ ...m, [String(id)]: v }));

//   const addToCategory = async (pid: string | number) => {
//     if (!currentCatId) return;
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: currentCatId }),
//       });
//       if (!res.ok) throw new Error("เพิ่มสินค้าเข้าหมวดไม่สำเร็จ");
//       await loadCatItems(catPage);
//       showInfo("เพิ่มสินค้าเข้าหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะเพิ่มสินค้า");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   const removeFromCategory = async (pid: string | number) => {
//     markBusy(pid, true);
//     setError(null);
//     try {
//       const res = await fetch(`/api/mock/products/${encodeURIComponent(String(pid))}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ category_id: "" }), // ล้างค่า
//       });
//       if (!res.ok) throw new Error("นำสินค้าออกจากหมวดไม่สำเร็จ");
//       const nextCount = catItems.length - 1;
//       const nextPage = nextCount <= 0 && catPage > 1 ? Math.max(1, catPage - 1) : catPage;
//       await loadCatItems(nextPage);
//       showInfo("นำสินค้าออกจากหมวดแล้ว");
//     } catch (e: any) {
//       setError(e?.message ?? "เกิดข้อผิดพลาดขณะนำสินค้าออก");
//     } finally {
//       markBusy(pid, false);
//     }
//   };

//   const isInCategory = (pid: string | number) =>
//     catItems.some((p) => String(p.id) === String(pid));

//   /* ============ render ============ */
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* LEFT */}
//       <Card className="p-4 space-y-4">
//         {heading && <h2 className="text-lg font-semibold">{heading}</h2>}

//         <div>
//           <div className="text-sm font-medium">เลือกหมวดหมู่</div>
//           <div className="text-xs text-muted-foreground">เลือกหมวดที่จะเพิ่ม/ลบสินค้า</div>
//         </div>

//         <Select
//           value={currentCatId != null ? String(currentCatId) : undefined}
//           onValueChange={(v) => setCurrentCatId(v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder={loadingCats ? "Loading..." : "เลือกหมวดหมู่"} />
//           </SelectTrigger>
//           <SelectContent>
//             {cats.map((c) => (
//               <SelectItem key={String(c.id)} value={String(c.id)}>
//                 {c.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <div className="pt-2 border-t">
//           <div className="font-medium mb-2 mt-2">เพิ่มสินค้าเข้าหมวด</div>
//           <div className="flex gap-2">
//             <Input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="พิมพ์ชื่อ/รหัสสินค้า แล้วกดค้นหา"
//               onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
//             />
//             <Button onClick={onSearchSubmit} disabled={searching}>
//               {searching ? "ค้นหา..." : "ค้นหา"}
//             </Button>
//           </div>

//           {/* search results with its own scroll; footer pagination sticks */}
//           <div className="mt-3 max-h-[calc(100vh-380px)] overflow-auto space-y-2">
//             {results.map((p) => {
//               const inCat = isInCategory(p.id);
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
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
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => addToCategory(p.id)}
//                     disabled={!currentCatId || inCat || b}
//                   >
//                     {inCat ? "อยู่แล้ว" : b ? "กำลังเพิ่ม..." : "เพิ่ม"}
//                   </Button>
//                 </div>
//               );
//             })}

//             {searchTotal > 0 && (
//               <div className="sticky bottom-0 bg-card/80 backdrop-blur mt-2 pt-2 border-t flex items-center justify-between">
//                 <div className="text-xs text-muted-foreground">
//                   หน้า {searchPage} / {searchTotalPages} • ทั้งหมด {searchTotal} รายการ
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
//                     onClick={() => runSearch(Math.min(searchTotalPages, searchPage + 1))}
//                     disabled={searchPage >= searchTotalPages || searching}
//                   >
//                     ถัดไป
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {error && <div className="text-sm text-destructive">{error}</div>}
//         {info && <div className="text-sm text-primary">{info}</div>}
//       </Card>

//       {/* RIGHT */}
//       <Card className="p-4 lg:col-span-2">
//         <div className="mb-4">
//           <div className="text-sm text-muted-foreground">หมวดที่เลือก</div>
//           <div className="text-lg font-semibold">{currentCat?.name ?? "—"}</div>
//         </div>

//         <div className="space-y-2">
//           {catLoading && <div className="text-sm text-muted-foreground">กำลังโหลดสินค้า…</div>}

//           {!catLoading &&
//             catItems.map((p) => {
//               const b = !!busy[String(p.id)];
//               return (
//                 <div key={String(p.id)} className="flex items-center justify-between rounded-md border p-2">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
//                       {p.image_url ? (
//                         <Image src={p.image_url} alt={p.name} fill className="object-cover" />
//                       ) : (
//                         <div className="w-full h-full" />
//                       )}
//                     </div>
//                     <div className="truncate">
//                       <div className="text-sm font-medium truncate">{p.name}</div>
//                       <div className="text-xs text-muted-foreground truncate">
//                         ID: {String(p.id)}{p.brand ? ` • ${p.brand}` : ""}{p.sku ? ` • ${p.sku}` : ""}
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     onClick={() => removeFromCategory(p.id)}
//                     disabled={b}
//                   >
//                     {b ? "กำลังนำออก..." : "นำออก"}
//                   </Button>
//                 </div>
//               );
//             })}

//           {!catLoading && catItems.length === 0 && (
//             <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
//               ยังไม่มีสินค้าในหมวดนี้
//             </div>
//           )}
//         </div>

//         {catTotal > 0 && (
//           <div className="mt-3 flex items-center justify-between">
//             <div className="text-xs text-muted-foreground">
//               หน้า {catPage} / {catTotalPages} • ทั้งหมด {catTotal} รายการ
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.max(1, catPage - 1))}
//                 disabled={catPage <= 1 || catLoading}
//               >
//                 ก่อนหน้า
//               </Button>
//               <Button
//                 size="sm"
//                 variant="secondary"
//                 onClick={() => loadCatItems(Math.min(catTotalPages, catPage + 1))}
//                 disabled={catPage >= catTotalPages || catLoading}
//               >
//                 ถัดไป
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }
