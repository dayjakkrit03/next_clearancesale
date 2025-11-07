// src/types/product.type.ts

// 💡 Type สำหรับ Product Data ที่ถูกอ่านจาก Excel
// ชื่อ Field จะอ้างอิงตามชื่อคอลัมน์ในตาราง products_clearance
export type ProductExcelItem = {
  // Key หลักในการ Upsert และอ้างอิงรูปภาพ
  product_sku: string; 
  product_name: string;
  product_brand: string;
  product_description: string;
  product_price: number;
  product_uom: string;
  
  // Fields ที่อาจต้องมีการ Mapping หรือมีค่า Default
  category_id: number; 
  sub_id: number;
  part_id: number;
  product_picture: string; // ชื่อไฟล์รูปภาพหลัก หรือ SKU
  product_file: string | null;
  product_filename: string | null;
  product_new: 0 | 1;
  product_best: 0 | 1;
  product_status: 0 | 1;
  users_action: string | null;
  visible: 0 | 1;
  display_order: number;
  
  // Custom Fields (ตามโครงสร้างตาราง products_clearance)
  '9': number;
  '13': number;
  clearanceSales: number;
  clearanceQuantity: number;
  clearancePrice: number | null;
  expo_status: number;
  expo_price: number | null;
  cat5e: number;
  cat6: number;
  tool_tester: number;
  image_url: string | null;
  discount_label: string | null;
  rating_score: number | null;
  rating_count: number | null;
};


// 💡 Type สำหรับ Batch Record ที่ถูกบันทึกในตาราง import_product_batches
export type ProductBatchRecord = {
  id: number;
  source_filename: string;
  total_records: number;
  product_data: ProductExcelItem[]; // ข้อมูลที่แปลงเป็น JSON Array
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FOLDERS_CREATING' | 'IMAGES_COPYING' | 'ERROR';
  created_at: string;
  processed_at: string | null;
  error_details: string | null;
};