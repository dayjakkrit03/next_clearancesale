// src/app/admin/components/products/price.ts

// price helpers

export function calcOriginalPrice(price: number, discountPercent?: number) {
  if (!discountPercent || discountPercent <= 0 || discountPercent >= 100) return undefined;
  const original = Math.round(price / (1 - discountPercent / 100));
  return original > price ? original : undefined;
}

export function frameBorderClass(p?: number) {
  if (!p || p < 10) return "border-transparent";
  if (p >= 90) return "border-red-500";
  if (p >= 80) return "border-yellow-500";
  if (p >= 70) return "border-amber-500";
  if (p >= 60) return "border-sky-500";
  return "border-slate-300";
}
