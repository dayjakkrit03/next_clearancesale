// src/app/product/[id]/component/ProductImageGallery.tsx

"use client";

import { useMemo, useState } from "react";
import { ZoomIn, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

// ***************************************************************
// ***** แก้ไข Error 2305: Type Placeholder (นำมาแทนการ Import) *****
// ***************************************************************

type UIProduct = any; // Placeholder
type DiscountRuleLite = {
    minPercent?: number;
    maxPercent?: number;
    frameMode?: 'image' | 'draw';
    frameImageUrl?: string;
    frameInsetPx?: number;
    frameOpacity?: number;
    frameObjectFit?: string;
    borderWidth?: number;
    borderColorHex?: string;
};
type CardPartsVisibility = any; // Placeholder (ถูกกำหนดใน ProductClient.tsx แล้ว)

type FrameInfo = {
    mode: 'image' | 'draw';
    imageUrl?: string;
    inset?: number;
    opacity?: number;
    objectFit?: 'contain' | 'cover' | 'fill';
    borderWidth?: number;
    borderColorHex?: string;
};

// ===== Helpers (ย้ายมาที่นี่) =====
const objectFit = (fit?: string): "contain" | "cover" | "fill" =>
    fit === "cover" ? "cover" : fit === "stretch" ? "fill" : "contain";

const toFrameInfo = (rule: DiscountRuleLite | null): FrameInfo | null => {
    if (!rule) return null;
    if (rule.frameMode === "image" && rule.frameImageUrl) {
        return {
            mode: "image",
            imageUrl: rule.frameImageUrl,
            inset: Math.max(0, Number(rule.frameInsetPx ?? 0)),
            opacity:
                typeof rule.frameOpacity === "number"
                    ? Math.max(0, Math.min(1, rule.frameOpacity))
                    : 1,
            objectFit: objectFit(rule.frameObjectFit),
        };
    }
    return {
        mode: "draw",
        borderWidth: Number(rule.borderWidth) || 2,
        borderColorHex: String(rule.borderColorHex || "#000"),
    };
};

const pickRuleFactory =
    (rules: DiscountRuleLite[]) => (percent?: number): DiscountRuleLite | null => {
        if (percent == null) return null;
        for (const r of rules) {
            const lowerOk = percent >= (r.minPercent ?? 0);
            const upperOk =
                typeof r.maxPercent === "number" ? percent <= r.maxPercent : true;
            if (lowerOk && upperOk) return r;
        }
        return null;
    };

const brandToLogoUrl = (brand?: string) => {
    if (!brand) return undefined;
    const slug = brand.toLowerCase().replace(/\s+/g, "-");
    return `/brand_logo/${slug}_logo.png`;
};

// ==================================

interface ImageGalleryProps {
    product: UIProduct;
    visibleParts: CardPartsVisibility;
    rules: DiscountRuleLite[];
}

export function ProductImageGallery({ product, visibleParts, rules }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showZoom, setShowZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const images = useMemo(() => {
        const imgs = Array.isArray(product.images) ? [...product.images] : [];
        imgs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (imgs.length === 0) {
            const fallback = product.image_url || "/placeholder.png";
            return [{ url: fallback, order: 0, isPrimary: true }];
        }
        return imgs;
    }, [product.images, product.image_url]);
    const currentImageUrl = images[selectedImage]?.url || "/placeholder.png";

    const pickRule = useMemo(() => pickRuleFactory(rules), [rules]);
    const frameInfo: FrameInfo | null = useMemo(
        () => toFrameInfo(pickRule(product?.discountPercent)),
        [pickRule, product?.discountPercent]
    );
    const brandLogoUrl = useMemo(() => brandToLogoUrl(product?.brand), [product?.brand]);

    const showDiscountBadge =
        (visibleParts.discountBadge ?? true) && (product.discountPercent ?? 0) > 0;
    const showBrandLogo = (visibleParts.brandLogo ?? true) && !!brandLogoUrl;
    const showFrame = (visibleParts.frame ?? true) && !!frameInfo;

    // ===== Handlers (ย้ายมาที่นี่) =====
    const handleMouseEnterImage = (e: React.MouseEvent<HTMLImageElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
        setShowZoom(true);
    };
    const handleMouseMoveImage = (e: React.MouseEvent<HTMLImageElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };
    const handleMouseLeaveImage = () => setShowZoom(false);
    // ===================================

    return (
        <div className="lg:col-span-2 space-y-4 relative">
            <div
                className={[
                    "aspect-square rounded-lg overflow-hidden relative bg-muted/30",
                    showFrame && frameInfo?.mode === "draw" ? "border-solid" : "",
                ].join(" ")}
                style={
                    showFrame && frameInfo?.mode === "draw"
                        ? {
                            borderWidth: frameInfo.borderWidth,
                            borderColor: frameInfo.borderColorHex,
                        }
                        : undefined
                }
            >
                {/* Discount Badge */}
                {showDiscountBadge && (
                    <div className="absolute top-3 left-3 z-20">
                        <Badge className="bg-sale text-sale-foreground text-base font-bold px-5 py-2 rounded-lg shadow-lg">
                            -{product.discountPercent}%
                        </Badge>
                    </div>
                )}

                {/* Brand Logo */}
                {showBrandLogo && (
                    <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-2 shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={brandLogoUrl}
                            alt={product.brand || "brand"}
                            className="h-12 w-auto object-contain drop-shadow-md"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display =
                                    "none";
                            }}
                        />
                    </div>
                )}

                {/* Discount Frame (Image Mode) */}
                {showFrame && frameInfo?.mode === "image" && (
                    <div
                        className="pointer-events-none absolute inset-2 z-10 rounded-lg"
                        style={{
                            opacity: frameInfo.opacity ?? 1,
                            padding: frameInfo.inset ?? 0,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={frameInfo.imageUrl}
                            alt="frame"
                            className="w-full h-full object-contain"
                            style={{ objectFit: frameInfo.objectFit }}
                        />
                    </div>
                )}

                {/* Main Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onMouseEnter={handleMouseEnterImage}
                    onMouseMove={handleMouseMoveImage}
                    onMouseLeave={handleMouseLeaveImage}
                />

                {showZoom && (
                    <div className="absolute inset-0 pointer-events-none">
                        <ZoomIn className="absolute top-4 right-4 h-6 w-6 text-white/80" />
                    </div>
                )}
            </div>

            {/* Zoom overlay - desktop only */}
            {showZoom && (
                <div
                    className="hidden lg:block absolute top-0 left-full ml-4 w-96 h-96 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                    style={{
                        backgroundImage: `url(${currentImageUrl})`,
                        backgroundSize: "200%",
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}

            {/* Thumbnails */}
            <div className="w-full">
                <Carousel className="w-full">
                    <CarouselContent className="-ml-2">
                        {images.map((im, index) => (
                            <CarouselItem
                                key={`${im.url}-${index}`}
                                className="pl-2 basis-1/4 sm:basis-1/5"
                            >
                                <button
                                    onMouseEnter={() => setSelectedImage(index)}
                                    onClick={() => setSelectedImage(index)}
                                    className={[
                                        "aspect-square rounded-lg overflow-hidden border-2 transition-colors w-full relative bg-muted/20",
                                        selectedImage === index
                                            ? "border-primary"
                                            : "border-muted hover:border-primary/50",
                                    ].join(" ")}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={im.url}
                                        alt={`thumb ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {im.isPrimary && (
                                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                                            main
                                        </span>
                                    )}
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                </Carousel>
            </div>
        </div>
    );
}