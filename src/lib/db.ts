// v.1.1.2 ================================================
// src/lib/db.ts
import { PrismaClient as ShopClient } from '@prisma/generated/shop';
import { PrismaClient as InterlinkClient } from '@prisma/generated/interlink';

declare global {
  // เก็บไว้ใน global เฉพาะตอน dev เพื่อกัน hot-reload สร้าง client ซ้ำ
  // (สังเกตว่ากำหนด type ชัดเจน ไม่ใช่ PrismaClient ทั่วไป)
  // eslint-disable-next-line no-var
  var prismaShop: ShopClient | undefined;
  // eslint-disable-next-line no-var
  var prismaInterlink: InterlinkClient | undefined;
}

// สร้าง instance พร้อมกำหนด type ที่แน่นอน
export const prismaShop: ShopClient =
  globalThis.prismaShop ??
  new ShopClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } } });

export const prismaInterlink: InterlinkClient =
  globalThis.prismaInterlink ??
  new InterlinkClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } } });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaShop = prismaShop;
  globalThis.prismaInterlink = prismaInterlink;
}

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
