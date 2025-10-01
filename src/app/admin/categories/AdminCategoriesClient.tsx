// src/app/admin/categories/AdminCategoriesClient.tsx

'use client';

import dynamic from 'next/dynamic';
import type { UICategory } from '../components/AdminCategoryGrid';

// โหลด Grid แบบ client-only เพื่อเลี่ยง hydration mismatch จาก dnd-kit
const AdminCategoryGrid = dynamic(
  () => import('../components/AdminCategoryGrid'),
  { ssr: false }
);

export default function AdminCategoriesClient({ items }: { items: UICategory[] }) {
  return <AdminCategoryGrid initial={items} />;
}
