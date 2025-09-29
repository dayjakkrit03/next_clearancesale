// src/lib/db.ts  (หรือใช้ชื่อ prisma.ts ก็ได้)
import { PrismaClient as ShopClient } from "@prisma/generated/shop";
import { PrismaClient as InterlinkClient } from "@prisma/generated/interlink";

const g = global as any;

export const prismaShop: ShopClient =
  g.prismaShop ?? new ShopClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } } });

export const prismaInterlink: InterlinkClient =
  g.prismaInterlink ?? new InterlinkClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } } });

if (process.env.NODE_ENV !== "production") {
  g.prismaShop = prismaShop;
  g.prismaInterlink = prismaInterlink;
}
