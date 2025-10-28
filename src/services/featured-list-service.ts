// src/services/featured-list-service.ts

// 💡 เปลี่ยนจาก "@prisma/generated/interlink" เป็น "@/lib/db" และใช้ { featured_lists, featured_list_items } จาก Type
import { prismaInterlink, setInterlinkSessionTZ } from "@/lib/db";
import type { featured_lists, featured_list_items } from "@prisma/generated/interlink";

// ====================== Types ======================
export type FeaturedListItem = {
  productId: string | number;
  order: number; // display_order ใน DB
};

export type FeaturedList = {
  key: string;
  title: string;
  subtitle?: string | null;
  items: FeaturedListItem[];
  limit?: number | null;
};

// 💡 แก้ไข: ใช้ชื่อ Relation ที่ถูกต้องตาม Prisma (featured_list_items)
type ListWithItems = featured_lists & {
  featured_list_items: featured_list_items[];
};

/**
 * แปลงข้อมูลจาก DB Type เป็น FeaturedList (Public Type)
 * @param dbList ข้อมูลลิสต์จาก Prisma พร้อม items ที่แนบมา
 * @returns FeaturedList
 */
const toFeaturedList = (dbList: ListWithItems): FeaturedList => ({
  key: dbList.list_key,
  title: dbList.title,
  subtitle: dbList.subtitle,
  limit: dbList.limit_size,
  // 💡 แก้ไข: ใช้ชื่อ property ที่ถูกต้องในการ Map (featured_list_items)
  items: dbList.featured_list_items
    .map((item: featured_list_items) => ({
      productId: String(item.product_id),
      order: item.display_order,
    }))
    .sort((a: FeaturedListItem, b: FeaturedListItem) => (a.order ?? 0) - (b.order ?? 0)),
});

/**
 * แปลงข้อมูลจาก DB Type ที่ไม่มี items เป็น FeaturedList (Lite Public Type)
 * @param dbList ข้อมูลลิสต์จาก Prisma ที่ไม่มี items
 * @returns FeaturedList (ไม่มี items)
 */
const toFeaturedListLite = (dbList: featured_lists): FeaturedList => ({
  key: dbList.list_key,
  title: dbList.title,
  subtitle: dbList.subtitle,
  limit: dbList.limit_size,
  items: [],
});

// ====================== Public Functions ======================

/**
 * โหลดรายการ Featured List ทั้งหมด (แบบ Lite)
 * @returns Promise<FeaturedList[]>
 */
export async function loadFeaturedLists(): Promise<FeaturedList[]> {
  await setInterlinkSessionTZ();

  const dbLists = await prismaInterlink.featured_lists.findMany({
    orderBy: { list_key: "asc" },
  });

  return dbLists.map(toFeaturedListLite);
}

/**
 * โหลดรายละเอียด Featured List ตาม key
 * @param key list_key
 * @returns Promise<FeaturedList | null>
 */
export async function loadFeaturedListByKey(
  key: string,
  includeItems: boolean = false
): Promise<FeaturedList | null> {
  if (!key) return null;

  await setInterlinkSessionTZ();

  // 💡 แก้ไข: ใช้ชื่อ Relation ที่ถูกต้อง (featured_list_items)
  const dbList = await prismaInterlink.featured_lists.findUnique({
    where: { list_key: key },
    include: includeItems ? { featured_list_items: true } : undefined, // 💡 แก้ไขจุดที่ 1
  });

  if (!dbList) return null;

  if (includeItems) {
    // ตรวจสอบการมีอยู่ของ featured_list_items ก่อนส่งเข้า toFeaturedList
    if ((dbList as ListWithItems).featured_list_items) {
      return toFeaturedList(dbList as ListWithItems);
    }
    // ถ้ามี includeItems แต่ข้อมูลไม่มี items อาจจะ Map ไม่สำเร็จ ให้ return Lite ไปก่อน
    return toFeaturedListLite(dbList as featured_lists);
  }
  return toFeaturedListLite(dbList as featured_lists);
}

/**
 * สร้าง Featured List ใหม่
 * @param list ข้อมูลลิสต์ใหม่ (ต้องมี key, title)
 * @returns Promise<FeaturedList>
 */
export async function createFeaturedList(
  list: Omit<FeaturedList, "items">
): Promise<FeaturedList> {
  await setInterlinkSessionTZ();

  // 💡 แก้ไข: ใช้ชื่อ Relation ที่ถูกต้อง (featured_list_items)
  const newList = await prismaInterlink.featured_lists.create({
    data: {
      list_key: list.key,
      title: list.title,
      subtitle: list.subtitle ?? "",
      limit_size: list.limit,
      created_at: new Date(),
    },
    include: { featured_list_items: true }, // 💡 แก้ไขจุดที่ 2
  });

  return toFeaturedList(newList as ListWithItems);
}

/**
 * บันทึกการเปลี่ยนแปลงของ Featured List (header + items)
 * @param key list_key
 * @param list ข้อมูลที่ต้องการอัปเดต
 * @returns Promise<FeaturedList | null>
 */
export async function saveFeaturedList(
  key: string,
  list: Partial<Omit<FeaturedList, "key">>
): Promise<FeaturedList | null> {
  await setInterlinkSessionTZ();

  const dbList = await prismaInterlink.featured_lists.findUnique({
    where: { list_key: key },
    select: { id: true },
  });

  if (!dbList) {
    throw new Error(`List with key "${key}" not found.`);
  }

  const listId = dbList.id;

  // 1. อัปเดต Header
  await prismaInterlink.featured_lists.update({
    where: { list_key: key },
    data: {
      title: list.title,
      subtitle: list.subtitle,
      limit_size: list.limit,
      updated_at: new Date(),
    },
  });

  // 2. จัดการ Items (Delete all & Recreate)
  if (list.items) {
    await prismaInterlink.featured_list_items.deleteMany({
      where: { list_id: listId },
    });

    if (list.items.length > 0) {
      const newItems = list.items.map((item) => ({
        list_id: listId,
        product_id: Number(item.productId),
        display_order: item.order,
      }));

      await prismaInterlink.featured_list_items.createMany({
        data: newItems,
      });
    }
  }

  // 3. โหลดข้อมูลที่อัปเดตกลับมา
  // 💡 แก้ไข: ใช้ชื่อ Relation ที่ถูกต้อง (featured_list_items)
  const updatedList = await prismaInterlink.featured_lists.findUnique({
    where: { list_key: key },
    include: { featured_list_items: true }, // 💡 แก้ไขจุดที่ 3
  });

  if (!updatedList) return null;

  return toFeaturedList(updatedList as ListWithItems);
}

/**
 * ลบ Featured List
 * @param key list_key
 * @returns Promise<void>
 */
export async function deleteFeaturedList(key: string): Promise<void> {
  await setInterlinkSessionTZ();

  const dbList = await prismaInterlink.featured_lists.findUnique({
    where: { list_key: key },
    select: { id: true },
  });

  if (!dbList) return;

  const listId = dbList.id;

  await prismaInterlink.featured_list_items.deleteMany({
    where: { list_id: listId },
  });

  await prismaInterlink.featured_lists.delete({
    where: { list_key: key },
  });
}