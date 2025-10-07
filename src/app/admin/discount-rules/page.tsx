
// src/app/admin/discount-rules/page.tsx
import AdminDiscountRulesGrid from "@/app/admin/components/AdminDiscountRulesGrid";
import { getAll as getAllRules, getMeta as getRulesMeta } from "@/app/api/mock/discount-rules/_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDiscountRulesPage() {
  const items = getAllRules();
  const meta = getRulesMeta();
  return (
    <main className="p-6">
      <div className="mb-2 text-2xl font-semibold">Discount Rules</div>
      <p className="text-muted-foreground mb-6">กำหนดสีกรอบ/ความหนาตามเปอร์เซ็นต์ส่วนลด (mock, in-memory)</p>
      <AdminDiscountRulesGrid initial={items} initialMeta={meta} />
    </main>
  );
}
