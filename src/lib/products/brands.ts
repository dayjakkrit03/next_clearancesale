// map ชื่อแบรนด์ -> path โลโก้ ใน public/brand_logo/*
export function brandLogoPath(brand?: string): string | null {
  const b = (brand ?? "").trim().toLowerCase();
  if (!b) return null;

  const map: Record<string, string> = {
    commscope: "/brand_logo/commscope_logo.png",
    link: "/brand_logo/link_logo.png",
    germanyrack: "/brand_logo/germanyrack_logo.png",
    // เพิ่มได้เรื่อยๆ
  };

  return map[b] ?? null;
}
