// src/lib/products/brand.ts
// ให้แผนที่แบรนด์ -> path โลโก้ ปรับตามโปรเจกต์จริงของคุณ
export function brandLogoPath(brand?: string): string | null {
  const b = (brand ?? "").trim().toLowerCase();
  if (!b) return null;

  const map: Record<string, string> = {
    commscope: "/brand_logo/commscope_logo.png",
    link: "/brand_logo/link_logo.png",
    germanyrack: "/brand_logo/germanyrack_logo.png",
    // เพิ่มตามต้องการ...
  };

  return map[b] ?? null;
}
