// src/app/product/[id]/component/ServiceFeatures.tsx

"use client";

import { Truck, Shield, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ServiceFeatures() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-sm">ส่งฟรี</p>
              <p className="text-xs text-muted-foreground">
                สั่งซื้อขั้นต่ำ 5,000฿
              </p>
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
  );
}