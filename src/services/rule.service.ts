// // src/services/rule.service.ts

import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import { Prisma } from "@prisma/client"; // นำเข้า Prisma สำหรับ Types (หากจำเป็น)

// 🚩 สร้าง Interface ใหม่สำหรับ Discount Frame Rule โดยใช้ Schema ที่คุณให้มา
// เพื่อให้สอดคล้องกับข้อมูลที่ดึงมาจากตาราง discount_rules
export interface DiscountFrameRule {
    id: number;
    min_percent: number; // Int ใน DB ถูกแปลงเป็น number ใน TS
    max_percent: number | null;
    border_width: number;
    border_color_hex: string;
    badge_bg_hex: string | null;
    badge_text_hex: string | null;
    display_order: number;
    enabled: boolean;
    frame_mode: string; // ใช้ string ชั่วคราวแทน enum
    frame_image_url: string | null;
    frame_inset_px: number;
    // 🚩 แปลง Decimal(3, 2) เป็น number
    frame_opacity: number; 
    frame_object_fit: string; // ใช้ string ชั่วคราวแทน enum
}

// ⚠️ Note: ProductRule interface เดิมที่อยู่ในไฟล์นี้ดูเหมือนเป็นคนละตาราง/Logic 
// (Rule Logic vs Frame/Badge Styling) ผมจะทิ้งไว้เผื่อคุณใช้ในส่วนอื่น แต่จะใช้ DiscountFrameRule ในฟังก์ชันนี้

/**
 * ดึงรายการ Discount Frame Rules ที่ใช้งานอยู่จากตาราง discount_rules
 * (ใช้สำหรับกำหนดกรอบและ Badge ส่วนลด)
 * @returns {Promise<DiscountFrameRule[]>} รายการ Rules ที่เรียงตาม display_order
 */
export async function getActiveFrameRules(): Promise<DiscountFrameRule[]> {
    try {
        // 🎯 การแก้ไขที่ชัดเจน: ใช้ชื่อ Property ที่ TypeScript แนะนำ: 'discount_rules'
        const rawRules = await prismaInterlink.discount_rules.findMany({ 
            where: {
                enabled: true, 
            },
            orderBy: {
                display_order: 'asc', 
            },
            select: {
                id: true,
                min_percent: true,
                max_percent: true,
                border_width: true,
                border_color_hex: true,
                badge_bg_hex: true,
                badge_text_hex: true,
                display_order: true,
                enabled: true,
                frame_mode: true,
                frame_image_url: true,
                frame_inset_px: true,
                frame_opacity: true, // Decimal
                frame_object_fit: true,
            }
        });
        
        // 🚩 Map ข้อมูลเพื่อแปลง Decimal (frame_opacity) ให้เป็น number
        const items: DiscountFrameRule[] = rawRules.map((rawRule: any) => ({
            ...rawRule,
            // แปลง Decimal Object เป็น number
            frame_opacity: rawRule.frame_opacity ? Number(rawRule.frame_opacity) : 1.0,
            // Cast frame_mode/frame_object_fit เป็น string (ไม่ต้องทำอะไรเพราะดึงมาเป็น string แล้ว)
        }));


        return items; 

    } catch (error) {
        console.error("Error fetching active frame rules:", error);
        return []; // คืนค่าเป็น Array ว่างหากเกิด Error
    }
}