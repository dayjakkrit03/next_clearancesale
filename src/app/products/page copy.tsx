// src/app/products/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart } from "@/components/shopping-cart";
// import { MessageChat } from "@/components/message-chat";
import { ProductFilters } from "@/components/product-filters";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("best-match");
  const [currentPage, setCurrentPage] = useState(1);
  
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const cartItemCount = 4;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Mock data for demonstration
  const totalItems = 2552;
  const itemsPerPage = 24;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const mockProducts = [
    {
      id: 1,
      name: "US-9015LSZH CAT 5E UTP Cable LSZH 305m",
      price: 4837.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-lszh.jpg",
      rating: 4.8,
      reviews: 156,
      discount: null,
      isInterlinkMall: true,
      badge: "InterlinkMall"
    },
    {
      id: 2,
      name: "US-9025LSZH CAT 5E STRAND Cable 305m",
      price: 6046.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-strand.jpg",
      rating: 4.6,
      reviews: 89,
      discount: null,
      isFreeShipping: true,
      badge: "InterlinkMall"
    },
    {
      id: 3,
      name: "US-9055E CAT 5E UTP Cable Outdoor 305m",
      price: 37771.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-reel.jpg",
      rating: 4.9,
      reviews: 234,
      discount: null,
      badge: "สินค้าแนะนำ"
    },
    {
      id: 4,
      name: "US-9035 CAT 5E UTP Cable Indoor 305m",
      price: 6094.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-box.jpg",
      rating: 4.7,
      reviews: 178,
      discount: null,
      badge: "สินค้าแนะนำ"
    },
    {
      id: 5,
      name: "US-9045 CAT 5E UTP Cable Plenum 305m",
      price: 5896.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-plenum.jpg",
      rating: 4.5,
      reviews: 123,
      discount: null,
      badge: null
    },
    {
      id: 6,
      name: "US-9015M CAT 5E UTP Cable Premium 305m",
      price: 6420.00,
      originalPrice: null,
      image: "/assets/lan-cat5e-premium.jpg",
      rating: 4.6,
      reviews: 145,
      discount: null,
      isClearanceSale: false,
      badge: "InterlinkMall"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-2 sm:px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4">
          <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/')}>หน้าแรก</span>
          {category && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">{category}</span>
            </>
          )}
          {search && (
            <>
              <span className="mx-2">/</span>
              <span className="text-primary font-medium">ค้นหา: "{search}"</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {category || search || "Network Components"}
              </h1>
              <p className="text-muted-foreground">
                {totalItems.toLocaleString()} items found {category && `for "${category}"`}
                {search && `for "${search}"`}
              </p>
            </div>

            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Sort By:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-match">Best Match</SelectItem>
                    <SelectItem value="price-low">Price Low to High</SelectItem>
                    <SelectItem value="price-high">Price High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">View:</span>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid mb-8 ${
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
                : "grid-cols-1 gap-4"
            }`}>
              {mockProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  // originalPrice={product.originalPrice}
                  // discount={product.discount as number | undefined}
                  rating={product.rating}
                  reviews={product.reviews}
                  image={product.image}
                  isFreeShipping={product.isFreeShipping}
                  isInterlinkMall={product.isInterlinkMall}
                  isClearanceSale={product.isClearanceSale}
                  viewMode={viewMode}
                  onAddToCart={() => setIsCartOpen(true)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <div className="flex gap-1 sm:gap-2">
                {(isMobile ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <span className="text-xs sm:text-sm text-muted-foreground mx-1 sm:mx-2">...</span>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
              >
                {totalPages}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}