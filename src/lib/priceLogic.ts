// src/lib/priceLogic.tsฃ

import { UIProduct } from "@/services/product.service";
import { DiscountFrameRule } from "@/services/rule.service";

/**
 * Interface สำหรับผลลัพธ์การคำนวณราคาและ Frame ที่ใช้งาน
 */
export interface ProductPriceResult extends UIProduct {
    // ราคาหลังส่วนลด (คำนวณจาก product_price - ส่วนลด)
    final_price: number; 
    
    // Rule ที่ถูกเลือกใช้ในการแสดงผล Frame/Badge (ถ้ามี)
    active_frame_rule: DiscountFrameRule | null;
}

/**
 * คำนวณราคาขายสุดท้ายและกำหนด Frame Rule ที่เหมาะสมให้กับสินค้าแต่ละชิ้น
 *
 * @param product ข้อมูลสินค้า UIProduct ที่ดึงมาจาก DB
 * @param frameRules รายการ DiscountFrameRule ที่ใช้งานอยู่ทั้งหมด
 * @returns ProductPriceResult ที่มี final_price และ active_frame_rule
 */
export function calculatePriceAndFrame(
    product: UIProduct,
    frameRules: DiscountFrameRule[]
): ProductPriceResult {
    
    // ----------------------------------------------------
    // A. Logic คำนวณส่วนลด (Discount Logic)
    // ----------------------------------------------------
    
    // 💡 เนื่องจากเรายังไม่มีตาราง/Service สำหรับ 'Discount Logic' จริงๆ
    // เราจะใช้ค่า 'discount_percent' ที่ถูก Hardcode เป็น null ใน product.service.ts ชั่วคราว
    // และสมมติค่าส่วนลดที่นี่ (ถ้าสินค้ามี ID เป็นเลขคี่ ให้ลด 10%, คู่ ลด 25%)
    
    let effectiveDiscountPercent: number | null = null;
    let finalPrice = product.product_price ?? 0;
    
    // 🚧 Mock Discount Logic:
    if (product.product_id % 2 !== 0) {
        // ID เป็นเลขคี่ -> ลด 10%
        effectiveDiscountPercent = 10;
    } else {
        // ID เป็นเลขคู่ -> ลด 25%
        effectiveDiscountPercent = 25;
    }
    
    // คำนวณราคาสุดท้าย
    if (effectiveDiscountPercent !== null && product.product_price !== null) {
        const discountAmount = product.product_price * (effectiveDiscountPercent / 100);
        finalPrice = product.product_price - discountAmount;
    }

    // ----------------------------------------------------
    // B. Logic กำหนด Frame/Badge (Frame Logic)
    // ----------------------------------------------------
    
    let activeFrameRule: DiscountFrameRule | null = null;
    
    // 1. กรองเฉพาะ Frame Rules ที่มี min_percent (ส่วนลดที่ได้จากการคำนวณ) อยู่ในช่วงนั้น
    const matchingRules = frameRules
        // 🚩 กฎ: min_percent ต้องน้อยกว่าหรือเท่ากับส่วนลดที่ได้
        .filter(rule => effectiveDiscountPercent !== null && effectiveDiscountPercent >= rule.min_percent)
        // 🚩 กฎ: ถ้ามี max_percent ต้องมากกว่าส่วนลดที่ได้
        .filter(rule => rule.max_percent === null || effectiveDiscountPercent !== null && effectiveDiscountPercent <= rule.max_percent)
        // 2. เรียงตามลำดับความสำคัญ (display_order) เพื่อเลือก Rule ที่มีลำดับสูงสุด
        .sort((a, b) => a.display_order - b.display_order);

    // 3. เลือก Rule แรกที่ตรงตามเงื่อนไข (มีความสำคัญสูงสุด)
    if (matchingRules.length > 0) {
        activeFrameRule = matchingRules[0];
    }
    
    // ----------------------------------------------------
    // C. ส่งผลลัพธ์กลับ
    // ----------------------------------------------------

    return {
        ...product, // ข้อมูลเดิมทั้งหมด
        discount_percent: effectiveDiscountPercent, // อัปเดตส่วนลดที่คำนวณได้
        final_price: Math.max(0, parseFloat(finalPrice.toFixed(2))), // ปัดเศษทศนิยม 2 ตำแหน่ง
        active_frame_rule: activeFrameRule, // Frame/Badge Rule ที่จะถูกใช้
    };
}