// src/services/checkout/checkout.repo.ts

import { prismaShop, setShopSessionTZ } from "@/lib/db";
import type {
  CheckoutItem,
  CheckoutAddress,
} from "@/app/checkout/checkout.types";

/**
 * ดึงรายการสินค้าใน cart ของลูกค้าจาก DB
 * TODO: ปรับ field mapping ให้ตรงกับ schema carts/products จริง
 */
export async function fetchCartItems(
  customerId: number | null,
): Promise<CheckoutItem[]> {
  if (!customerId) return [];

  await setShopSessionTZ();

  // 👇 ตัวอย่างโครง query (ปรับตามตารางจริงได้เลย)
  const rows = await prismaShop.carts.findMany({
    where: {
      id__customers: BigInt(customerId),
      cart_status: 0,
    },
    select: {
      id: true,
      // TODO: map field จริง เช่น product_name, price, quantity, image, store_name ฯลฯ
    },
  });

  // ตอนนี้ยัง map แบบ placeholder ไว้ก่อนให้คอมไพล์ผ่าน
  const items: CheckoutItem[] = rows.map((row: any, index: number) => ({
    id: Number(row.id ?? index + 1),
    name: row.product_name ?? "สินค้าในตะกร้า",
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? 1),
    image: row.image_url ?? "/placeholder.png",
    store: row.store_name ?? "Interlink Store",
    originalPrice: row.original_price
      ? Number(row.original_price)
      : undefined,
    discount: row.discount_label ?? undefined,
  }));

  return items;
}

/**
 * ดึงที่อยู่จัดส่ง default ของลูกค้า
 * TODO: ปรับให้ไปดึงจากตาราง profile/address จริง
 */
export async function fetchDefaultShippingAddress(
  customerId: number | null,
): Promise<CheckoutAddress | null> {
  if (!customerId) return null;

  await setShopSessionTZ();

  // TODO: เขียน query จริงจากตาราง profile/person_address ฯลฯ
  // ตัวอย่าง mock ชั่วคราว
  const mock: CheckoutAddress = {
    id: 1,
    type: "HOME",
    name: "ลูกค้า Interlink",
    phone: "0800000000",
    address:
      "123/45 ซอยตัวอย่าง ถนนตัวอย่าง แขวง/ตำบลตัวอย่าง เขต/อำเภอตัวอย่าง กรุงเทพฯ 10110",
    isDefault: true,
  };

  return mock;
}
