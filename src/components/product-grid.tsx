// src/components/product-grid.tsx

import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Fiber Optic Cable Single Mode 305m",
    price: 2150,
    originalPrice: 2750,
    discount: 22,
    rating: 4.8,
    reviews: 156,
    image: "/assets/fiber-optic-cable.jpg",
    isLiked: true,
    isFreeShipping: true,
  },
  {
    id: 2,
    name: "24-Port Gigabit Network Switch",
    price: 3890,
    originalPrice: 4500,
    discount: 14,
    rating: 4.6,
    reviews: 234,
    image: "/assets/network-switch-professional.jpg",
    isFreeShipping: true,
  },
  {
    id: 3,
    name: "RG-6 Coaxial Cable 305m",
    price: 1450,
    originalPrice: 1850,
    discount: 22,
    rating: 4.5,
    reviews: 189,
    image: "/assets/coaxial-cable-reel.jpg",
    isLiked: false,
  },
  {
    id: 4,
    name: "Solar Cable 4mm² PV Wire 100m",
    price: 2800,
    originalPrice: 3200,
    discount: 13,
    rating: 4.7,
    reviews: 145,
    image: "/assets/solar-cable-red.jpg",
    isFreeShipping: true,
  },
  {
    id: 5,
    name: "Telephone Cable 4-Pair Indoor 305m",
    price: 980,
    originalPrice: 1250,
    discount: 22,
    rating: 4.4,
    reviews: 98,
    image: "/assets/telephone-cable.jpg",
  },
  {
    id: 6,
    name: "19\" Server Rack Cabinet 42U",
    price: 15800,
    originalPrice: 18500,
    discount: 15,
    rating: 4.9,
    reviews: 87,
    image: "/assets/server-rack-19inch.jpg",
    isFreeShipping: true,
  },
  {
    id: 7,
    name: "US-9035 CAT 5E UTP Cable Indoor 305m",
    price: 6094,
    originalPrice: 6800,
    discount: 10,
    rating: 4.7,
    reviews: 178,
    image: "/assets/lan-cat5e-box.jpg",
    isLiked: true,
  },
  {
    id: 8,
    name: "UT-0216 Fiber Media Converter RJ45",
    price: 2247,
    originalPrice: 2800,
    discount: 20,
    rating: 4.6,
    reviews: 124,
    image: "/assets/fiber-media-converter.jpg",
    isFreeShipping: true,
  },
];

interface ProductGridProps {
  onAddToCart?: () => void;
}

export const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">สินค้าแนะนำ</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};