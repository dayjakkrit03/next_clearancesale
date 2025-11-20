// src/services/cart/cart.query.ts

import { prismaShop, prismaInterlink } from "@/lib/db";
import { setShopSessionTZ, setInterlinkSessionTZ } from "@/lib/db";

/**
 * หา product_id จาก products_clearance ด้วย SKU
 */
export async function getProductIdBySku(sku: string): Promise<number | null> {
  await setInterlinkSessionTZ();

  const product = await prismaInterlink.products_clearance.findFirst({
    where: { product_sku: sku },
    select: { product_id: true },
  });

  return product?.product_id ?? null;
}

/**
 * หา location code จาก discountpercentage_clearance_tb
 * logic ตาม Laravel:
 * - ดึง create_name ตาม product_id
 * - join เป็น string
 * - ใช้ตัวอักษร 2 ตัวท้ายเป็น location code
 */
export async function getLocationCodeForProductSku(
  sku: string
): Promise<string | null> {
  const productId = await getProductIdBySku(sku);
  if (!productId) return null;

  await setInterlinkSessionTZ();

  const rows = await prismaInterlink.discountpercentage_clearance_tb.findMany({
    where: { product_id: productId },
    select: { create_name: true },
  });

  if (!rows.length) return null;

  const concat = rows.map((r) => r.create_name ?? "").join("");
  const trimmed = concat.trim();
  if (!trimmed) return null;

  return trimmed.slice(-2); // เอา 2 ตัวท้ายเหมือน PHP substr(..., -2)
}

/**
 * รวมจำนวน lock order ทั้งหมดของสินค้า (ทุก customer)
 */
export async function getTotalLockOrder(params: {
  sku: string;
  uom: string;
  location: string;
}): Promise<number> {
  const { sku, uom, location } = params;

  await setShopSessionTZ();

  const rows = await prismaShop.lock_orders.findMany({
    where: {
      status: 1,
      location,
      sku,
      uom,
    },
    select: { quantity: true },
  });

  return rows.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
}

/**
 * รวมจำนวน lock order ของ "ลูกค้าคนนี้" เท่านั้น
 */
export async function getTotalYouLockOrder(params: {
  sku: string;
  uom: string;
  location: string;
  customerId: number;
}): Promise<number> {
  const { sku, uom, location, customerId } = params;

  await setShopSessionTZ();

  const rows = await prismaShop.lock_orders.findMany({
    where: {
      status: 1,
      location,
      sku,
      uom,
      id_customer: BigInt(customerId),
    },
    select: { quantity: true },
  });

  return rows.reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);
}

/**
 * หา record carts เดิมของ customer + product + cart_status + reserve
 * ตาม logic updateOrCreate ของ Laravel
 */
export async function findCartRowForCustomerProduct(params: {
  customerId: number;
  product: string;
  reserve: 0 | 1;
}): Promise<any | null> {
  const { customerId, product, reserve } = params;

  await setShopSessionTZ();

  return prismaShop.carts.findFirst({
    where: {
      id__customers: BigInt(customerId),
      product,
      cart_status: 0,
      reserve,
    },
  });
}
