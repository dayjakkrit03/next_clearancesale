"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Heart, Share2, ShoppingCart as ShoppingCartIcon, Plus, Minus, Shield, Truck, RotateCcw, ZoomIn, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShoppingCart } from "@/components/shopping-cart";
import { MessageChat } from "@/components/message-chat";

// Mock product data (in a real app, this would be fetched from an API using the id)
const mockProduct = {
  id: 1,
  name: "CAT 6 UTP (250 MHz) w/Cross Filler, 24 AWG, CM , UL Blue 305 M./Reelex",
  price: 2390,
  originalPrice: 2990,
  discount: 20,
  rating: 4.5,
  reviews: 128,
  stock: 15,
  brand: "Link",
  model: "US-9106A",
  images: [
    "/assets/lan-cable-1.jpg",
    "/assets/lan-cable-2.jpg",
    "/assets/lan-cable-3.jpg",
    "/assets/lan-cable-4.jpg",
    "/assets/lan-cable-5.jpg"
  ],
  description: "Kingston FURY Beast DDR4 delivers the reliable high-performance needed to power desktops with the latest AMD and Intel CPUs. The aggressive look with bold heat spreaders will level up the look of your rig.",
  specifications: {
    "Memory Type": "DDR4",
    "Capacity": "16GB (2x8GB)",
    "Speed": "3200MHz",
    "CAS Latency": "CL16",
    "Voltage": "1.35V",
    "Form Factor": "DIMM",
    "Pin Configuration": "288-pin"
  },
  features: [
    "Intel XMP Ready",
    "Plug N Play functionality",
    "Aggressive styling with bold heat spreaders", 
    "Available in multiple speeds"
  ]
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState("Silver");
  const [selectedStorage, setSelectedStorage] = useState("512GB");

  const product = mockProduct; // In a real app, you would fetch product data using the id

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

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

  const handleMouseLeaveImage = () => {
    setShowZoom(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Header onCartClick={() => setIsCartOpen(true)} /> */}
      
      <div className="container mx-auto px-4 py-8 max-w-full overflow-hidden">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-8 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span 
              className="hover:text-primary cursor-pointer" 
              onClick={() => router.push('/')}
            >
              หน้าแรก
            </span>
            <span>/</span>
            <span 
              className="hover:text-primary cursor-pointer"
              onClick={() => router.push('/products')}
            >
              สินค้า
            </span>
            <span>/</span>
            <span className="text-primary truncate">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="lg:col-span-2 space-y-4 relative">
            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden relative">
              <img
                src={product.images[selectedImage]}
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
            
            {/* Zoom overlay - Only show on desktop */}
            {showZoom && (
              <div 
                className="hidden lg:block absolute top-0 left-full ml-4 w-96 h-96 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                style={{
                  backgroundImage: `url(${product.images[selectedImage]})`,
                  backgroundSize: '200%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}

            {/* Thumbnail Carousel */}
            <div className="w-full">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {product.images.map((image, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/4 sm:basis-1/5">
                      <button
                        onMouseEnter={() => setSelectedImage(index)}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors w-full ${
                          selectedImage === index 
                            ? 'border-primary' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 break-words">{product.name}</h1>
              <p className="text-muted-foreground text-sm md:text-base break-words">Brand: {product.brand} | Model (SKU): {product.model} | หน่วยสินค้า: BX.</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-warning fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-medium">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-muted-foreground">{product.reviews} รีวิว</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-sale">
                  ฿{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-lg md:text-xl text-muted-foreground line-through">
                    ฿{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discount && (
                  <Badge className="bg-sale text-sale-foreground text-sm px-3 py-1">
                    ประหยัด {product.discount}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">รวม VAT แล้ว</p>
            </div>

            {/* Promotions */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-medium text-sm md:text-base">Promotions:</span>
                <Badge className="bg-primary text-primary-foreground">B2</Badge>
                <Badge variant="outline" className="text-primary border-primary text-xs md:text-sm">
                  Buy 2, get 3% off. Buy 4, get 5% off.
                </Badge>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="space-y-3">
              <h3 className="text-muted-foreground font-medium text-sm md:text-base">Delivery Options:</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm flex-1 break-words">กรุงเทพมหานคร/ Bangkok, วังทองหลาง/ Wang Thonglang, 10310</span>
                  <Button variant="link" className="text-primary text-sm p-0 h-auto whitespace-nowrap">CHANGE</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Guaranteed by 8 Aug</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">Standard, with shipping fee ฿29.00</p>
              </div>
            </div>

            {/* Return & Warranty */}
            <div className="flex flex-wrap items-start gap-2">
              <span className="text-muted-foreground font-medium text-sm md:text-base">Return & Warranty:</span>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm break-words">Change of Mind • 7 Days Free Return • Warranty not available</span>
              </div>
            </div>

            {/* Color Family */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
              <span className="text-muted-foreground font-medium text-sm md:text-base">Color Family:</span>
              <div className="flex flex-wrap items-center gap-3">
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Black" id="black" />
                    <Label htmlFor="black" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-6 h-6 bg-black rounded border"></div>
                      Black
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Silver" id="silver" />
                    <Label htmlFor="silver" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-6 h-6 bg-gray-300 rounded border"></div>
                      Silver
                    </Label>
                  </div>
                </RadioGroup>
                <span className="text-sm text-muted-foreground">({selectedColor})</span>
              </div>
            </div>

            {/* Storage Capacity */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
              <span className="text-muted-foreground font-medium text-sm md:text-base">Storage Capacity:</span>
              <div className="flex flex-wrap items-center gap-3">
                <RadioGroup value={selectedStorage} onValueChange={setSelectedStorage} className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="512GB" id="512gb" />
                    <Label htmlFor="512gb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                      512GB
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1TB" id="1tb" />
                    <Label htmlFor="1tb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                      1TB
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2TB" id="2tb" />
                    <Label htmlFor="2tb" className="cursor-pointer border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                      2TB
                    </Label>
                  </div>
                </RadioGroup>
                <span className="text-sm text-muted-foreground">({selectedStorage})</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-success font-medium">มีสินค้าในสต็อก ({product.stock} ชิ้น)</span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-muted-foreground">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push('/checkout')}
                >
                  Buy Now
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsCartOpen(true)}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`${isLiked ? "text-sale border-sale" : ""} p-3`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="lg" className="p-3">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Service Features */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-sm">ส่งฟรี</p>
                      <p className="text-xs text-muted-foreground">สั่งซื้อขั้นต่ำ 1,000฿</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">รับประกัน</p>
                      <p className="text-xs text-muted-foreground">3 ปี</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-medium text-sm">เปลี่ยน/คืนสินค้า</p>
                      <p className="text-xs text-muted-foreground">ภายใน 7 วัน</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 text-sm">
            <TabsTrigger value="description" className="text-xs sm:text-sm">รายละเอียด</TabsTrigger>
            <TabsTrigger value="specifications" className="text-xs sm:text-sm">สเปค</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm">รีวิว ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">รายละเอียดสินค้า</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {product.description}
                </p>
                <h4 className="font-semibold mb-3">คุณสมบัติเด่น:</h4>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">สเปคสินค้า</h3>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-muted/30">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">รีวิวลูกค้า</h3>
                <div className="text-center py-12 text-muted-foreground">
                  <p>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                  <p className="text-sm mt-2">เป็นคนแรกที่ให้รีวิวสินค้านี้</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* <Footer /> */}
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <MessageChat />
    </div>
  );
}