// File: src/components/product-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  id: string | number;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  isLiked?: boolean;
  isFreeShipping?: boolean;
  showRating?: boolean;
  isInterlinkMall?: boolean;
  isClearanceSale?: boolean;
  showDiscount?: boolean;
  onAddToCart?: () => void;
  viewMode?: "grid" | "list";
}

export const ProductCard = ({
  id,
  slug,
  name,
  price,
  originalPrice,
  discount,
  rating = 0,
  reviews = 0,
  image,
  isLiked: initialIsLiked = false,
  isFreeShipping = false,
  showRating = true,
  isInterlinkMall = false,
  isClearanceSale = false,
  showDiscount = true, // Default to true to show discount
  onAddToCart,
  viewMode = "grid",
}: ProductCardProps) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleProductClick = () => {
    if (slug) {
      router.push(`/product/${slug}`);
    } else {
      router.push(`/product/${id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('฿', '฿');
  };

  // 🟦 List View
  if (viewMode === "list") {
    return (
      <Card
        className="hover:shadow-card-hover transition-all duration-300 overflow-hidden group cursor-pointer hover:-translate-y-1 flex gap-4 p-4 w-full"
        onClick={handleProductClick}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 overflow-hidden bg-muted/30 rounded-lg flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 80px, 128px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {(discount && showDiscount) && (
            <Badge className="absolute top-1 left-1 bg-sale text-sale-foreground px-1 py-0.5 text-xs font-bold shadow-glow animate-bounce-gentle">
              -{discount}%
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "absolute top-1 right-1 p-1 h-auto rounded-full backdrop-blur-md transition-all duration-300",
              isLiked
                ? "text-sale bg-white/20 hover:bg-white/30 scale-110"
                : "text-white/80 bg-black/20 hover:bg-white/20 hover:text-sale"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={cn("h-3 w-3 transition-transform", isLiked && "fill-current scale-110")} />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 h-full">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {isInterlinkMall && <Badge variant="secondary">InterlinkMall</Badge>}
                {isClearanceSale && <Badge variant="destructive">Clearance Sale</Badge>}
                {isFreeShipping && <Badge className="bg-success hover:bg-success/80">ส่งฟรี</Badge>}
              </div>
              {showRating && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 sm:ml-4">
              <div className="text-right">
                <div className={cn("text-lg font-bold", originalPrice ? "text-destructive" : "text-primary")}>
                  {formatCurrency(price)}
                </div>
                {originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatCurrency(originalPrice)}
                  </div>
                )}
              </div>
              <Button
                className="group-hover:shadow-glow transition-all duration-300 whitespace-nowrap"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.();
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-1 group-hover:animate-bounce-gentle" />
                ใส่ตะกร้า
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 🟦 Grid View
  return (
    <Card
      className="overflow-hidden transition-all duration-300 group cursor-pointer hover:-translate-y-1 h-full flex flex-col"
      onClick={handleProductClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 16vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {(discount && showDiscount) && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold shadow-soft rounded-md">
            -{discount}%
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full backdrop-blur-md transition-all duration-300",
            isLiked
              ? "text-destructive bg-white/30 hover:bg-white/40"
              : "text-white/90 bg-black/30 hover:bg-white/30 hover:text-destructive"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={cn("h-4 w-4 transition-transform", isLiked && "fill-current")} />
        </Button>
        {isFreeShipping && (
          <div className="absolute bottom-2 right-2 bg-success/90 text-success-foreground text-xs px-2 py-1 rounded-md shadow-soft font-medium backdrop-blur-sm">
            ส่งฟรี
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            className="bg-gradient-primary text-primary-foreground opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            ดูรายละเอียด
          </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
          {name}
        </h3>
        <div className="mt-auto">
          {showRating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-3 w-3", i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <div className={cn("text-lg font-bold", originalPrice ? "text-destructive" : "text-primary")}>
              {formatCurrency(price)}
            </div>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalPrice)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-3 sm:p-4 pt-0">
        <Button
          className="w-full group-hover:shadow-glow transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce-gentle" />
          ใส่ตะกร้า
        </Button>
      </div>
    </Card>
  );
};