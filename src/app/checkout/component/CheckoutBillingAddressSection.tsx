// src/app/checkout/component/CheckoutBillingAddressSection.tsx

"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { CheckoutAddress } from "@/types/checkout";
import CheckoutAddressSheet from "./CheckoutAddressSheet";
import CheckoutAddressSummary from "./CheckoutAddressSummary";

/**
 * Mock ข้อมูลที่อยู่ออกใบกำกับภาษี
 * - สมมติว่ามีทั้งบุคคลธรรมดา + นิติบุคคลเหมือนกับบล็อกจัดส่ง
 * - default เลือก "นิติบุคคล" เพราะใช้บ่อยสำหรับใบกำกับภาษี
 */
const initialBillingAddresses: CheckoutAddress[] = [
  {
    id: 101,
    type: "HOME",
    name: "สิรดา ถวิก",
    phone: "086-352-7663",
    address:
      "บ้านเลขที่ 50/37 ซอย 8 แขวงสะพานสอง เขตวังทองหลาง กรุงเทพมหานคร 10310",
    isDefault: false,
    profileMode: "person",
    purpose: "billing",
  },
  {
    id: 102,
    type: "OFFICE",
    name: "บจก. อินเตอร์ลิ้งค์ คอมมิวนิเคชั่น",
    phone: "02-123-4567",
    address:
      "สำนักงานใหญ่ 65 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10110",
    isDefault: true,
    profileMode: "entity",
    purpose: "billing",
  },
];

export default function CheckoutBillingAddressSection() {
  const [addresses, setAddresses] =
    useState<CheckoutAddress[]>(initialBillingAddresses);

  // ที่อยู่ออกใบกำกับภาษีที่ใช้สำหรับ order นี้
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress>(
    initialBillingAddresses[1] // default = นิติบุคคล
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          ที่อยู่ออกใบกำกับภาษี <span className="text-sm text-muted-foreground">(ถ้ามี)</span>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-primary"
              >
                แก้ไข
              </Button>
            </SheetTrigger>

            <SheetContent className="w-[400px] sm:w-[540px] max-w-full overflow-hidden">
              <CheckoutAddressSheet
                addresses={addresses}
                selectedAddress={selectedAddress}
                setAddresses={setAddresses}
                setSelectedAddress={setSelectedAddress}
                onClose={() => setIsSheetOpen(false)}
                // เดี๋ยวเราจะไปปรับ CheckoutAddressSheet ให้รองรับ title/custom text
              />
            </SheetContent>
          </Sheet>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CheckoutAddressSummary selectedAddress={selectedAddress} />
      </CardContent>
    </Card>
  );
}
