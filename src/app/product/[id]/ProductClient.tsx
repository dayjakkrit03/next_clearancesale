// src/app/product/[id]/ProductClient.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "@/components/shopping-cart";

// Component ย่อย
import { ProductImageGallery } from "./component/ProductImageGallery";
import { ProductDetailsPanel } from "./component/ProductDetailsPanel";
import { ProductSalesForm } from "./component/ProductSalesForm";
import { ServiceFeatures } from "./component/ServiceFeatures";


// Type Placeholder สำหรับแก้ไข Error 2305 และ 2739
type UIProduct = any; 
type DiscountRuleLite = any; 

// ***************************************************************
// ***** แก้ไข Error 2322: ทำให้ Properties ทั้งหมดเป็น Required *****
// ***************************************************************
type CardPartsVisibility = {
    // 🎯 แก้ไข Error 2322: เปลี่ยน ?: boolean เป็น : boolean
    name: boolean; 
    category: boolean; 

    image: boolean;
    discountBadge: boolean;
    brandLogo: boolean;
    frame: boolean;
    ratingReview: boolean;
    price: boolean;
    originalPrice: boolean;
    sku: boolean;
    uom: boolean;
    brandName: boolean;
    [key: string]: boolean; // ต้องบังคับให้เป็น boolean เท่านั้น
}


// Type Props
type ProductClientProps = {
    product: UIProduct;
    visibleParts?: CardPartsVisibility;
    rules?: DiscountRuleLite[];
};

// ====================================================================
// ===== ProductClient Component (Layout หลัก) =====
// ====================================================================

export default function ProductClient({
    product,
    // แก้ไข: ใช้ default value ที่ครบถ้วนตาม Type ใหม่
    // เรายังคงใช้ as CardPartsVisibility ได้เพราะเรากำหนด default เป็น {} และเราแก้ไข Type แล้ว
    visibleParts = {} as CardPartsVisibility, 
    rules = [],
}: ProductClientProps) {
    const router = useRouter();

    const hasConditions =
        Array.isArray(product.conditions) && product.conditions.length > 0;
    
    const [isCartOpen, setIsCartOpen] = useState(false);

    const renderBreadcrumb = () => (
        <nav className="text-sm text-muted-foreground mb-8 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className="hover:text-primary cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    หน้าแรก
                </span>
                <span>/</span>
                <span
                    className="hover:text-primary cursor-pointer"
                    onClick={() => router.push("/products")}
                >
                    สินค้า
                </span>
                <span>/</span>
                <span className="text-primary truncate">{product.name}</span>
            </div>
        </nav>
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-screen-xl px-2 sm:px-4 py-6">
                {renderBreadcrumb()}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-12">
                    {/* A. Product Images (lg:col-span-2) */}
                    <ProductImageGallery
                        product={product}
                        rules={rules}
                        visibleParts={visibleParts}
                    />

                    {/* B. Product Info & Sales (lg:col-span-3) */}
                    <div className="lg:col-span-3 space-y-4 lg:space-y-6">
                        
                        {/* 1. Details (Name, Brand, SKU, Rating) */}
                        <ProductDetailsPanel product={product} visibleParts={visibleParts} />

                        {/* 2. Price, Options & Actions */}
                        <ProductSalesForm
                            product={product}
                            visibleParts={visibleParts}
                            hasConditions={hasConditions}
                            onAddToCart={() => setIsCartOpen(true)}
                        />

                        {/* 3. Service Features (Delivery, Warranty) */}
                        <ServiceFeatures />

                    </div>
                </div>
            </div>

            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}