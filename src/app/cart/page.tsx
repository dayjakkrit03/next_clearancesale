"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";


// Mock cart data
const cartItems = [
  {
    id: 1,
    name: "Switch 24 Port Gigabit",
    price: 2899,
    quantity: 1,
    image: "/assets/switch-24port.jpg",
    store: "TechMall Official Store"
  },
  {
    id: 2,
    name: "สายแลน Cat6 UTP Cable 305m",
    price: 1599,
    originalPrice: 1799,
    quantity: 2,
    image: "/assets/lan-cable-cat6.jpg",
    store: "NetworkPro Store",
    discount: "Save ฿200"
  },
  {
    id: 3,
    name: "WiFi Router AC1200",
    price: 1899,
    quantity: 1,
    image: "/assets/wifi-router-ac1200.jpg",
    store: "ConnectTech Store"
  }
];

export default function CartPage() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [items, setItems] = useState(cartItems);
  const [selectedItems, setSelectedItems] = useState<number[]>(cartItems.map(item => item.id));

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    const allSelected = selectedItems.length === items.length && items.length > 0;
    setSelectedItems(allSelected ? [] : items.map(item => item.id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 2000 ? 0 : 99; // Free shipping over ฿2000
  const total = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">ตะกร้าสินค้า</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Checkbox
                checked={selectedItems.length === items.length && items.length > 0}
                onCheckedChange={toggleAllItems}
              />
              <span className="font-medium">เลือกทั้งหมด ({items.length} รายการ)</span>
              <Button variant="ghost" size="sm" className="ml-auto text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items List */}
            {items.map((item) => (
              <div key={item.id} className="p-4 bg-card rounded-lg border">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                  
                  <div className="flex-1">
                    {/* Store Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-muted-foreground">{item.store}</span>
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.name}</h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-primary">
                            ฿{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ฿{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              {item.discount}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Delete Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => updateQuantity(item.id, 0)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-bold mb-4">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>ยอดรวม ({selectedItems.length} รายการ)</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>ค่าจัดส่ง</span>
                  <span className={shippingFee === 0 ? "text-green-600" : ""}>
                    {shippingFee === 0 ? "ฟรี" : `฿${shippingFee}`}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>รวม</span>
                  <span className="text-primary">฿{total.toLocaleString()}</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  รวม VAT แล้ว
                </p>
              </div>
              
              <Link href="/checkout">
                <Button 
                  className="w-full mt-4" 
                  size="lg"
                  disabled={selectedItems.length === 0}
                >
                  ดำเนินการชำระเงิน ({selectedItems.length})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}