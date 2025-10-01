// src/mocks/db.ts

// in-memory "DB" (dev only)
import { z } from "zod";

export const CategorySchema = z.object({
  id: z.union([z.string(), z.number()]),
  slug: z.string(),
  name: z.string(),
  image_url: z.string().optional(),
  visible: z.boolean().optional().default(true),
  order: z.number().int().nonnegative().default(0),
});

export type MockCategory = z.infer<typeof CategorySchema>;

type DB = {
  categories: MockCategory[];
  nextId: number;
};

// เก็บไว้ใน global ให้อยู่รอดข้าม request ตอน dev
const g = globalThis as unknown as { __mockDb?: DB };
if (!g.__mockDb) {
  g.__mockDb = {
    categories: [
      { id: 1, slug: "lan-utp", name: "LAN (UTP) System", image_url: "/assets/category-lan-utp.jpg", visible: true, order: 0 },
      { id: 2, slug: "fiber-optic", name: "FIBER OPTIC System", image_url: "/assets/category-fiber-optic.jpg", visible: true, order: 1  },
      { id: 3, slug: "telephone", name: "Telephone CABLE", image_url: "/assets/category-telephone.jpg", visible: true, order: 2  },
      { id: 4, slug: "fttr-fttx", name: "FTTR/FTTx OVAL / FLAT CABLE", image_url: "/assets/category-fttr-fttx.jpg", visible: true, order: 3  },
      { id: 5, slug: "data-center", name: "DATA CENTER System", image_url: "/assets/category-data-center.jpg", visible: true, order: 4  },
      { id: 6, slug: "coaxial", name: "COAXIAL (RG) System", image_url: "/assets/category-coaxial.jpg", visible: true, order: 5  },
      { id: 7, slug: "solar", name: "SOLAR CABLE", image_url: "/assets/category-solar.jpg", visible: true, order: 6  },
      { id: 8, slug: "security-control", name: "SECURITY AND CONTROL System", image_url: "/assets/category-security-control.jpg", visible: true, order: 7  },
      { id: 9, slug: "networking", name: "NETWORKING System", image_url: "/assets/category-networking.jpg", visible: true, order: 8  },
      { id: 10, slug: "germany-rack", name: "GERMANY RACK", image_url: "/assets/category-germany-rack.jpg", visible: true, order: 9  },
      { id: 11, slug: "cctv-cabinet", name: "CCTV OUTDOOR CABINET", image_url: "/assets/category-cctv-cabinet.jpg", visible: true, order: 10  },
      { id: 12, slug: "link-rack", name: "LINK RACK", image_url: "/assets/category-link-rack.jpg", visible: true, order: 11  },
    ],
    nextId: 4,
  };
}

export const db = g.__mockDb!;

// helper
export function sortByOrder() {
  db.categories.sort((a, b) => a.order - b.order || String(a.id).localeCompare(String(b.id)));
}
