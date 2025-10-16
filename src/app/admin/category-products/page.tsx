// v.1.1.2 ================================================
// src/app/admin/category-products/page.tsx
import CategoryProductsEditor from "@/components/admin/category-products-editor";

export const revalidate = 0; // ไม่ cache ระหว่างพัฒนา

export default function AdminCategoryProductsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Category Products</h1>
        <p className="text-muted-foreground">
          จัดการ “สินค้าในหมวดหมู่” — ค้นหาสินค้าทั่วไปทางซ้าย แล้วเพิ่ม/ลบเข้า-ออกหมวดที่เลือก
        </p>
      </div>

      {/* ตัวแก้ไขหลัก (ซ้าย: เลือกหมวด+ค้นหา/เพิ่ม, ขวา: สินค้าในหมวด + นำออก) */}
      <CategoryProductsEditor heading="จัดการสินค้าในหมวดหมู่" />
      {/* ถ้าต้องการกำหนดค่าเริ่มต้นบางอย่าง (เช่น หมวดเริ่มต้น หรือจำนวนต่อหน้า) ก็ส่งพร็อพเพิ่มได้ เช่น: */}
      {/* <CategoryProductsEditor initialCategoryId={1} pageSizeInCategory={24} pageSizeSearch={10} /> */}
    </div>
  );
}

// v.1.1.2 ================================================

// // src/app/admin/category-products/page.tsx
// import AdminCategoryProductsClient from "@/app/admin/category-products/AdminCategoryProductsClient";

// export const revalidate = 0; // ไม่ cache ระหว่างพัฒนา

// export default function AdminCategoryProductsPage() {
//   return (
//     <div className="p-6 space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold">Category Products</h1>
//         <p className="text-muted-foreground">
//           จัดการ “สินค้าในหมวดหมู่” — ค้นหาสินค้าทั่วไปทางซ้าย แล้วเพิ่ม/ลบเข้า-ออกหมวดที่เลือก
//         </p>
//       </div>

//       {/* หน้าคลไคลเอนต์หลัก (จะสร้างไฟล์นี้ถัดไป) */}
//       <AdminCategoryProductsClient />
//     </div>
//   );
// }
