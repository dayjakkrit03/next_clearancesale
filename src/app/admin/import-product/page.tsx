// src/app/admin/import-product/page.tsx

import AdminImportProductPanel from '../components/AdminImportProductPanel';
import { Zap } from 'lucide-react';

/**
 * หน้าสำหรับจัดการ Workflow การนำเข้าข้อมูลสินค้า (Product)
 */
export default function AdminImportProductPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-orange-600" />
          Product Import Workflow
        </h1>
        <p className="mt-1 text-gray-600">
          ควบคุมและตรวจสอบการนำเข้าข้อมูลสินค้าทั้งหมดจากไฟล์ Excel และจัดการ Assets รูปภาพที่เกี่ยวข้อง
        </p>
      </header>

      {/* Main Panel */}
      <AdminImportProductPanel />

    </div>
  );
}