// src/app/admin/components/products/brand.ts

// brand helpers

export function brandLogoPath(brand?: string): string | null {
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
