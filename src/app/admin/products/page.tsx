// src/app/admin/products/page.tsx  -- Server Component
import AdminProductGrid from "@/app/admin/components/AdminProductGrid";
import { getAll as getAllProducts, getMeta as getProductsMeta } from "@/app/api/mock/products/_store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const items = getAllProducts({ includeHidden: true });
  const meta = getProductsMeta();
  return (
    <main className="p-6">
      <div className="mb-2 text-2xl font-semibold">Products Management</div>
      <p className="text-muted-foreground mb-6">หน้านี้เชื่อมกับ /api/mock/products</p>
      <AdminProductGrid initial={items} initialMeta={meta} />
    </main>
  );
}
