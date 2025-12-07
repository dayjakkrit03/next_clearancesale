// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// ใช้ globalThis แทน declare global เพื่อลดปัญหา TS ซ้อนกัน
const globalForPrisma = globalThis as unknown as {
  prismaShop?: PrismaClient;
  prismaInterlink?: PrismaClient;
};

// Prisma สำหรับ SHOP
export const prismaShop =
  globalForPrisma.prismaShop ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_SHOP!,
      },
    },
  });

// Prisma สำหรับ INTERLINK
export const prismaInterlink =
  globalForPrisma.prismaInterlink ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_INTERLINK!,
      },
    },
  });

// เวลาอยู่ใน dev ให้ cache ไว้บน global เพื่อไม่สร้าง client ซ้ำ
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaShop = prismaShop;
  globalForPrisma.prismaInterlink = prismaInterlink;
}


// // src/lib/prisma.ts

// import { PrismaClient } from '@prisma/client';

// declare global {
//   var prismaShop: PrismaClient | undefined;
//   var prismaInterlink: PrismaClient | undefined;
// }

// export const prismaShop =
//   global.prismaShop ??
//   new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } } });

// export const prismaInterlink =
//   global.prismaInterlink ??
//   new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } } });

// if (process.env.NODE_ENV !== 'production') {
//   global.prismaShop = prismaShop;
//   global.prismaInterlink = prismaInterlink;
// }