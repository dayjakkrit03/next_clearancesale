// src/app/admin/import-category/page.tsx

"use client";

// 💡 แก้ไข Path การ Import จาก "../components/" เป็น "../components/"
import AdminImportCategoryPanel from "../components/AdminImportCategoryPanel"; 

/**
 * หน้าสำหรับเรียกใช้ API Workflow การนำเข้า Category
 * Path: /admin/import-category
 */
export default function AdminImportCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Category Import Workflow</h1>
      <p className="text-gray-500">
        ควบคุมขั้นตอนการนำเข้าข้อมูลหมวดหมู่สินค้าจากไฟล์ Excel และจัดการ Assets รูปภาพทีละขั้นตอน
      </p>
      
      {/* แสดง Panel ที่มีปุ่ม API Call 5 ขั้นตอน */}
      <AdminImportCategoryPanel />

    </div>
  );
}