// v.1.1.3 ================================================
// src/lib/db.ts
import { PrismaClient as ShopClient } from "@prisma/generated/shop";
import { PrismaClient as InterlinkClient } from "@prisma/generated/interlink";

/**
 * เก็บ instance ไว้บน global เฉพาะตอน dev เพื่อกัน hot-reload สร้างซ้ำ
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaShop: ShopClient | undefined;
  // eslint-disable-next-line no-var
  var prismaInterlink: InterlinkClient | undefined;
}

/**
 * Prisma clients (typed)
 */
export const prismaShop: ShopClient =
  globalThis.prismaShop ??
  new ShopClient({
    datasources: { db: { url: process.env.DATABASE_URL_SHOP! } },
  });

export const prismaInterlink: InterlinkClient =
  globalThis.prismaInterlink ??
  new InterlinkClient({
    datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaShop = prismaShop;
  globalThis.prismaInterlink = prismaInterlink;
}

/* ================= Timezone Helpers =================
   ใช้ session time_zone ของ MySQL ให้เป็น +07:00
   เรียก "ก่อนยิง query" ในแต่ละคำขอ/แต่ละฟังก์ชันของ _store.ts
   เช่น: await setInterlinkSessionTZ();
*/

async function setSessionTZ(
  client: { $executeRawUnsafe: (q: string) => Promise<unknown> },
  tz: string = "+07:00"
) {
  try {
    // หมายเหตุ: ใช้ $executeRawUnsafe เพราะเป็นคำสั่ง session-level ไม่รับพารามิเตอร์
    await client.$executeRawUnsafe(`SET time_zone = '${tz}'`);
  } catch (e) {
    // ไม่ throw เพื่อไม่ให้ request ล่มจากการตั้ง TZ (จะ log ไว้แทน)
    console.error("Failed to set MySQL session time_zone", e);
  }
}

/** เรียกก่อนคุย DB interlink */
export async function setInterlinkSessionTZ(tz: string = "+07:00") {
  await setSessionTZ(prismaInterlink, tz);
}

/** เรียกก่อนคุย DB shop (ถ้ามีใช้งานฝั่งนี้) */
export async function setShopSessionTZ(tz: string = "+07:00") {
  await setSessionTZ(prismaShop, tz);
}

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/lib/db.ts
// import { PrismaClient as ShopClient } from '@prisma/generated/shop';
// import { PrismaClient as InterlinkClient } from '@prisma/generated/interlink';

// declare global {
//   // เก็บไว้ใน global เฉพาะตอน dev เพื่อกัน hot-reload สร้าง client ซ้ำ
//   // (สังเกตว่ากำหนด type ชัดเจน ไม่ใช่ PrismaClient ทั่วไป)
//   // eslint-disable-next-line no-var
//   var prismaShop: ShopClient | undefined;
//   // eslint-disable-next-line no-var
//   var prismaInterlink: InterlinkClient | undefined;
// }

// // สร้าง instance พร้อมกำหนด type ที่แน่นอน
// export const prismaShop: ShopClient =
//   globalThis.prismaShop ??
//   new ShopClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } } });

// export const prismaInterlink: InterlinkClient =
//   globalThis.prismaInterlink ??
//   new InterlinkClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } } });

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prismaShop = prismaShop;
//   globalThis.prismaInterlink = prismaInterlink;
// }

// v.1.1.2 ================================================

// // src/lib/db.ts
// import { PrismaClient as ShopClient } from "@prisma/generated/shop";
// import { PrismaClient as InterlinkClient } from "@prisma/generated/interlink";

// const g = global as any;

// export const prismaShop: ShopClient =
//   g.prismaShop ?? new ShopClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } }, log: ['warn', 'error'] });

// export const prismaInterlink: InterlinkClient =
//   g.prismaInterlink ?? new InterlinkClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } }, log: ['warn', 'error'] });

// if (process.env.NODE_ENV !== "production") {
//   g.prismaShop = prismaShop;
//   g.prismaInterlink = prismaInterlink;
// }
