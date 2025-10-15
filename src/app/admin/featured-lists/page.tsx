// v.1.1.2 ================================================
// src/app/admin/featured-lists/page.tsx
import { Suspense } from "react";
import FeaturedListEditor from "@/components/admin/featured-list-editor";

export const revalidate = 0;            // ระหว่าง dev: ไม่ cache
export const dynamic = "force-dynamic"; // ให้เรนเดอร์สดเสมอ

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 bg-muted rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-40 bg-muted/60 rounded-lg animate-pulse" />
        <div className="lg:col-span-2 h-80 bg-muted/60 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export default function AdminFeaturedListsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Featured Lists</h1>
        <p className="text-muted-foreground">
          จัดชุด “สินค้าแนะนำ” สำหรับหน้าแรกหรือแคมเปญต่าง ๆ
        </p>
      </div>

      {/* เผื่อโหลดข้อมูล/คอมโพเนนต์ช้าหน่อย ให้มีโครงวางก่อน */}
      <Suspense fallback={<EditorSkeleton />}>
        <FeaturedListEditor />
      </Suspense>
    </div>
  );
}

// v.1.1.2 ================================================

// // src/app/admin/featured-lists/page.tsx
// import FeaturedListEditor from "@/components/admin/featured-list-editor";

// export const revalidate = 0;

// export default function AdminFeaturedListsPage() {
//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Featured Lists</h1>
//         <p className="text-muted-foreground">
//           จัดชุด “สินค้าแนะนำ” สำหรับหน้าแรกหรือแคมเปญต่าง ๆ
//         </p>
//       </div>
//       <FeaturedListEditor />
//     </div>
//   );
// }
