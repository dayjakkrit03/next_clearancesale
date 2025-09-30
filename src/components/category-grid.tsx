// src/components/category-grid.tsx

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export interface Category {
  id?: number | string;
  name: string;
  slug: string;
  image_url?: string;
  image?: string;
}

const MOCK_CATEGORIES: Category[] = [
  { slug: "lan-utp", image: "/assets/category-lan-utp.jpg", name: "LAN (UTP) System" },
  { slug: "fiber-optic", image: "/assets/category-fiber-optic.jpg", name: "FIBER OPTIC System" },
  { slug: "fttr-fttx", image: "/assets/category-fttr-fttx.jpg", name: "FTTR/FTTx OVAL / FLAT CABLE" },
  { slug: "data-center", image: "/assets/category-data-center.jpg", name: "DATA CENTER System" },
  { slug: "coaxial", image: "/assets/category-coaxial.jpg", name: "COAXIAL (RG) System" },
  { slug: "telephone", image: "/assets/category-telephone.jpg", name: "Telephone CABLE" },
  { slug: "solar", image: "/assets/category-solar.jpg", name: "SOLAR CABLE" },
  { slug: "security-control", image: "/assets/category-security-control.jpg", name: "SECURITY AND CONTROL System" },
  { slug: "networking", image: "/assets/category-networking.jpg", name: "NETWORKING System" },
  { slug: "germany-rack", image: "/assets/category-germany-rack.jpg", name: "GERMANY RACK" },
  { slug: "cctv-cabinet", image: "/assets/category-cctv-cabinet.jpg", name: "CCTV OUTDOOR CABINET" },
  { slug: "link-rack", image: "/assets/category-link-rack.jpg", name: "LINK RACK" },
];

interface CategoryGridProps {
  items?: Category[];
}

export const CategoryGrid = ({ items }: CategoryGridProps) => {
  const router = useRouter();

  const data = items && items.length > 0 ? items : MOCK_CATEGORIES;

  const handleCategoryClick = (category: { slug?: string; name: string }) => {
    router.push(`/products?category=${encodeURIComponent(category.slug ?? category.name)}`);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            หมวดหมู่สินค้า
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            เลือกซื้ออุปกรณ์เครือข่ายคุณภาพสูงจากหมวดหมู่ที่หลากหลาย
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {data.map((category, index) => (
            <div
              key={category.slug ?? index}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center p-6 rounded-xl bg-card hover:bg-gradient-card shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Image
                  src={category.image_url ?? category.image ?? "/placeholder.png"}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-2xl shadow-soft"
                />
              </div>
              <span className="text-sm font-medium text-center group-hover:text-primary transition-colors leading-tight h-10">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};