// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

declare global {
  var prismaShop: PrismaClient | undefined;
  var prismaInterlink: PrismaClient | undefined;
}

export const prismaShop =
  global.prismaShop ??
  new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_SHOP! } } });

export const prismaInterlink =
  global.prismaInterlink ??
  new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_INTERLINK! } } });

if (process.env.NODE_ENV !== 'production') {
  global.prismaShop = prismaShop;
  global.prismaInterlink = prismaInterlink;
}