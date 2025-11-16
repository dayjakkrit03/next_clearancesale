// src/components/header/category-menu.tsx

"use client";

import { useEffect, useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MenuCategory = {
  id?: number | string;
  name: string;
  slug: string;
  image_url?: string;
  visible?: boolean;
  order?: number;
};

type HeaderCategoryMenuProps = {
  onCategorySelected?: (categoryName: string) => void;
};

export function HeaderCategoryMenu({
  onCategorySelected,
}: HeaderCategoryMenuProps) {
  const [menuCats, setMenuCats] = useState<MenuCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      try {
        setCatsLoading(true);
        setCatsError(null);

        const r = await fetch("/api/mock/categories", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json().catch(() => ({}));
        const items = Array.isArray(data?.items)
          ? (data.items as MenuCategory[])
          : [];

        const normalized = items
          .filter((c) => c && c.name && c.visible !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setMenuCats(normalized);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setCatsError(e?.message || "โหลดหมวดหมู่ไม่สำเร็จ");
        setMenuCats([]);
      } finally {
        setCatsLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, []);

  const handleCategoryClick = (name: string) => {
    onCategorySelected?.(name);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 shrink-0"
        >
          <Menu className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline font-semibold text-base">
            หมวดหมู่สินค้า
          </span>
          <span className="sm:hidden text-xs">หมวดหมู่</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-white shadow-lg border border-primary/10 z-50">
        {/* Loading */}
        {catsLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`s-${i}`}
              className="px-2 py-2 text-sm text-muted-foreground"
            >
              กำลังโหลด…
            </div>
          ))}

        {/* Error */}
        {!catsLoading && catsError && (
          <div className="px-3 py-2 text-sm text-destructive">
            โหลดหมวดหมู่ไม่สำเร็จ
          </div>
        )}

        {/* Normal */}
        {!catsLoading && !catsError && menuCats.length > 0 && (
          <>
            {menuCats.map((c) => (
              <DropdownMenuItem
                key={String(c.id ?? c.slug)}
                className="text-primary hover:bg-primary/10 cursor-pointer"
                onClick={() => handleCategoryClick(c.name)}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Empty */}
        {!catsLoading && !catsError && menuCats.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            ไม่มีหมวดหมู่ให้แสดง
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
