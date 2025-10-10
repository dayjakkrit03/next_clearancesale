// v.1.1.2 ====================================================
// src/app/admin/discount-rules/page.tsx
import AdminDiscountRulesGrid from "@/app/admin/components/AdminDiscountRulesGrid";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDiscountRulesPage() {
  // ✅ await headers() ก่อนใช้ .get()
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    `localhost:${process.env.PORT ?? 3000}`;
  const base = `${proto}://${host}`;

  let items: any[] = [];
  let meta: any = undefined;

  try {
    const res = await fetch(`${base}/api/mock/discount-rules`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      items = data?.items ?? [];
      meta  = data?.meta  ?? undefined;
    } else {
      console.error("Fetch discount-rules failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Fetch discount-rules error:", e);
  }

  return (
    <main className="p-6">
      <div className="mb-2 text-2xl font-semibold">Discount Rules</div>
      <p className="text-muted-foreground mb-6">
        กำหนดสีกรอบ/ความหนาตามเปอร์เซ็นต์ส่วนลด (mock, in-memory)
      </p>
      <AdminDiscountRulesGrid initial={items} initialMeta={meta} />
    </main>
  );
}

// v.1.1.2 ====================================================


// // src/app/admin/discount-rules/page.tsx
// import AdminDiscountRulesGrid from "@/app/admin/components/AdminDiscountRulesGrid";
// import { getAll as getAllRules, getMeta as getRulesMeta } from "@/app/api/mock/discount-rules/_store";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export default async function AdminDiscountRulesPage() {
//   const items = getAllRules();
//   const meta = getRulesMeta();
//   return (
//     <main className="p-6">
//       <div className="mb-2 text-2xl font-semibold">Discount Rules</div>
//       <p className="text-muted-foreground mb-6">กำหนดสีกรอบ/ความหนาตามเปอร์เซ็นต์ส่วนลด (mock, in-memory)</p>
//       <AdminDiscountRulesGrid initial={items} initialMeta={meta} />
//     </main>
//   );
// }
