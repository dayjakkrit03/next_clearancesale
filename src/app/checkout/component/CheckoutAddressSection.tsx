// v.1.1.4 =========================================================
// src/app/checkout/component/CheckoutAddressSection.tsx

"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

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

import type {
  CheckoutAddress,
  CheckoutProfileInfo,
  CheckoutProfileAddressBook,
  CheckoutProfileMode,
} from "@/types/checkout";

import CheckoutAddressSheet from "./CheckoutAddressSheet";
import CheckoutAddressSummary from "./CheckoutAddressSummary";

type Props = {
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  profileInfo?: CheckoutProfileInfo;

  /** สมุด 2 การ์ดโปรไฟล์ (person + entity) ที่ service ส่งมาให้ */
  addressProfiles?: CheckoutProfileAddressBook;

  onChangeShippingAddress: (addr: CheckoutAddress | null) => void;
  onChangeBillingAddress: (addr: CheckoutAddress | null) => void;
  onChangeProfileInfo: (info: CheckoutProfileInfo | undefined) => void;
};

export default function CheckoutAddressSection({
  shippingAddress,
  billingAddress,
  profileInfo,
  addressProfiles,
  onChangeShippingAddress,
  onChangeBillingAddress,
  onChangeProfileInfo,
}: Props) {
  /* ======================================================
   * STATE: sheet เปิด/ปิด
   * ====================================================== */

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /* ======================================================
   * HANDLER: เมื่อเลือกการ์ดจาก sheet
   * mode: "person" | "entity"
   * ====================================================== */
  const handleSelectProfileFromSheet = (
    mode: Exclude<CheckoutProfileMode, null>,
  ) => {
    if (!addressProfiles) {
      setIsSheetOpen(false);
      return;
    }

    const group =
      mode === "person"
        ? addressProfiles.person
        : addressProfiles.entity;

    if (!group) {
      setIsSheetOpen(false);
      return;
    }

    // 1) อัปเดตที่อยู่จัดส่ง / ใบกำกับภาษี ตามการ์ดที่เลือก
    onChangeShippingAddress(group.shipping ?? null);
    onChangeBillingAddress(group.billing ?? null);

    // 2) อัปเดต profileInfo.mode ให้ badge ด้านบนเปลี่ยนตาม
    onChangeProfileInfo({
      ...(profileInfo ?? { mode: null }),
      mode,
    });

    // 3) ปิด sheet
    setIsSheetOpen(false);
  };

  /* ===== ป้ายโปรไฟล์ด้านบนสุด ===== */

  const modeLabel =
    profileInfo?.mode === "person"
      ? "บุคคลธรรมดา"
      : profileInfo?.mode === "entity"
      ? "นิติบุคคล"
      : "โปรไฟล์";

  const badgeClass =
    profileInfo?.mode === "person"
      ? "bg-orange-500"
      : profileInfo?.mode === "entity"
      ? "bg-emerald-600"
      : "bg-gray-400";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          {/* ป้ายบุคคลธรรมดา / นิติบุคคล ด้านบนสุด */}
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeClass}`}
          >
            {modeLabel}
          </span>

          <div className="flex items-center gap-2 text-base text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>ที่อยู่สำหรับจัดส่ง / ออกใบกำกับภาษี</span>
          </div>

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
                // ✅ ส่งสมุด 2 การ์ดเข้า sheet
                addressProfiles={addressProfiles}
                selectedMode={profileInfo?.mode ?? null}
                onSelectProfile={handleSelectProfileFromSheet}
                onClose={() => setIsSheetOpen(false)}
                title="เลือกโปรไฟล์สำหรับที่อยู่"
              />
            </SheetContent>
          </Sheet>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ที่อยู่จัดส่ง */}
        <div>
          <p className="font-medium">ที่อยู่จัดส่ง</p>

          {shippingAddress ? (
            <CheckoutAddressSummary selectedAddress={shippingAddress} />
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีที่อยู่จัดส่ง โปรดเพิ่มข้อมูลในโปรไฟล์
            </p>
          )}
        </div>

        {/* ที่อยู่ออกใบกำกับภาษี */}
        <div>
          <p className="font-medium">ที่อยู่ออกใบกำกับภาษี</p>

          {billingAddress ? (
            <CheckoutAddressSummary selectedAddress={billingAddress} />
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีที่อยู่ออกใบกำกับภาษี
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// v.1.1.4 =========================================================

// v.1.1.3 =========================================================
// // src/app/checkout/component/CheckoutAddressSection.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { MapPin } from "lucide-react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";

// import type {
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// import CheckoutAddressSheet from "./CheckoutAddressSheet";
// import CheckoutAddressSummary from "./CheckoutAddressSummary";

// type Props = {
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;

//   onChangeShippingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeBillingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeProfileInfo: (info: CheckoutProfileInfo | undefined) => void;
// };

// export default function CheckoutAddressSection({
//   shippingAddress,
//   billingAddress,
//   profileInfo,
//   onChangeShippingAddress,
//   onChangeBillingAddress,
// }: Props) {
//   const dummyAddr: CheckoutAddress = {
//     id: 0,
//     type: "HOME",
//     name: "",
//     phone: "",
//     address: "",
//     isDefault: false,
//   };

//   /* ======================================================
//    * STATE ภายในสำหรับ Sheet
//    * ====================================================== */

//   const [allAddresses, setAllAddresses] = useState<CheckoutAddress[]>([]);
//   const [selectedAddress, setSelectedAddress] =
//     useState<CheckoutAddress>(dummyAddr);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   useEffect(() => {
//     const list: CheckoutAddress[] = [];

//     if (shippingAddress) list.push(shippingAddress);
//     if (billingAddress) list.push(billingAddress);

//     if (list.length === 0) {
//       setAllAddresses([dummyAddr]);
//       setSelectedAddress((prev) => (prev.id === 0 ? prev : dummyAddr));
//       return;
//     }

//     setAllAddresses(list);

//     setSelectedAddress((prev) => {
//       const found = list.find((a) => a.id === prev.id);
//       return found ?? list[0];
//     });
//   }, [shippingAddress, billingAddress]);

//   const handleSelectFromSheet = (addr: CheckoutAddress) => {
//     setSelectedAddress(addr);

//     if (addr.id === 0) {
//       onChangeShippingAddress(null);
//       onChangeBillingAddress(null);
//       return;
//     }

//     if (addr.purpose === "shipping") {
//       onChangeShippingAddress(addr);
//     } else if (addr.purpose === "billing") {
//       onChangeBillingAddress(addr);
//     } else {
//       onChangeShippingAddress(addr);
//     }
//   };

//   const setSelectedAddressForSheet = (
//     updater: CheckoutAddress | ((prev: CheckoutAddress) => CheckoutAddress),
//   ) => {
//     const next =
//       typeof updater === "function"
//         ? (updater as (prev: CheckoutAddress) => CheckoutAddress)(
//             selectedAddress,
//           )
//         : updater;

//     handleSelectFromSheet(next);
//   };

//   /* ===== ป้ายโปรไฟล์ด้านบนสุด ===== */

//   const modeLabel =
//     profileInfo?.mode === "person"
//       ? "บุคคลธรรมดา"
//       : profileInfo?.mode === "entity"
//       ? "นิติบุคคล"
//       : "โปรไฟล์";

//   const badgeClass =
//     profileInfo?.mode === "person"
//       ? "bg-orange-500"
//       : profileInfo?.mode === "entity"
//       ? "bg-emerald-600"
//       : "bg-gray-400";

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-3 text-lg">
//           {/* ป้ายบุคคลธรรมดา / นิติบุคคล ด้านบนสุด */}
//           <span
//             className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeClass}`}
//           >
//             {modeLabel}
//           </span>

//           <div className="flex items-center gap-2 text-base text-muted-foreground">
//             <MapPin className="h-5 w-5" />
//             <span>ที่อยู่สำหรับจัดส่ง / ออกใบกำกับภาษี</span>
//           </div>

//           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//             <SheetTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="ml-auto text-primary"
//               >
//                 แก้ไข
//               </Button>
//             </SheetTrigger>

//             <SheetContent className="w-[400px] sm:w-[540px] max-w-full overflow-hidden">
//               <CheckoutAddressSheet
//                 addresses={allAddresses}
//                 selectedAddress={selectedAddress}
//                 setAddresses={setAllAddresses}
//                 setSelectedAddress={setSelectedAddressForSheet}
//                 onClose={() => setIsSheetOpen(false)}
//                 title="เลือกที่อยู่จากโปรไฟล์"
//               />
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {/* ที่อยู่จัดส่ง */}
//         <div>
//           <p className="font-medium">ที่อยู่จัดส่ง</p>

//           {shippingAddress ? (
//             <CheckoutAddressSummary selectedAddress={shippingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่จัดส่ง โปรดเพิ่มข้อมูลในโปรไฟล์
//             </p>
//           )}
//         </div>

//         {/* ที่อยู่ออกใบกำกับภาษี */}
//         <div>
//           <p className="font-medium">ที่อยู่ออกใบกำกับภาษี</p>

//           {billingAddress ? (
//             <CheckoutAddressSummary selectedAddress={billingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่ออกใบกำกับภาษี
//             </p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.3 =========================================================

// v.1.1.2 =========================================================
// "use client";

// import { useEffect, useState } from "react";
// import { MapPin } from "lucide-react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";

// import type {
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// import CheckoutAddressSheet from "./CheckoutAddressSheet";
// import CheckoutAddressSummary from "./CheckoutAddressSummary";

// type Props = {
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;

//   onChangeShippingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeBillingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeProfileInfo: (info: CheckoutProfileInfo | undefined) => void;
// };

// export default function CheckoutAddressSection({
//   shippingAddress,
//   billingAddress,
//   profileInfo,
//   onChangeShippingAddress,
//   onChangeBillingAddress,
// }: Props) {
//   const dummyAddr: CheckoutAddress = {
//     id: 0,
//     type: "HOME",
//     name: "",
//     phone: "",
//     address: "",
//     isDefault: false,
//   };

//   /* ======================================================
//    * STATE ภายในสำหรับ Sheet
//    * ====================================================== */

//   const [allAddresses, setAllAddresses] = useState<CheckoutAddress[]>([]);
//   const [selectedAddress, setSelectedAddress] =
//     useState<CheckoutAddress>(dummyAddr);
//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   // sync จาก props → state ภายใน (แต่ทำให้ไม่วนลูป)
//   useEffect(() => {
//     const list: CheckoutAddress[] = [];

//     if (shippingAddress) list.push(shippingAddress);
//     if (billingAddress) list.push(billingAddress);

//     if (list.length === 0) {
//       setAllAddresses([dummyAddr]);
//       setSelectedAddress((prev) => (prev.id === 0 ? prev : dummyAddr));
//       return;
//     }

//     setAllAddresses(list);

//     // ถ้า selected เดิมยังอยู่ใน list ให้ใช้ตัวเดิม
//     // ถ้าไม่อยู่แล้ว ให้ใช้ตัวแรกของ list
//     setSelectedAddress((prev) => {
//       const found = list.find((a) => a.id === prev.id);
//       return found ?? list[0];
//     });
//   }, [shippingAddress, billingAddress]);

//   /* ======================================================
//    * เลือก address จาก Sheet → อัปเดต parent โดยตรง
//    * (ไม่ใช้ useEffect อีกต่อไป เพื่อกัน infinite loop)
//    * ====================================================== */

//   const handleSelectFromSheet = (addr: CheckoutAddress) => {
//     setSelectedAddress(addr);

//     if (addr.id === 0) {
//       onChangeShippingAddress(null);
//       onChangeBillingAddress(null);
//       return;
//     }

//     if (addr.purpose === "shipping") {
//       onChangeShippingAddress(addr);
//     } else if (addr.purpose === "billing") {
//       onChangeBillingAddress(addr);
//     } else {
//       // ถ้าไม่ได้ระบุ purpose ชัดเจน ก็ให้ถือว่าเป็นที่อยู่จัดส่งเป็นหลัก
//       onChangeShippingAddress(addr);
//     }
//   };

//   // แปลงให้เป็น signature แบบ Dispatch<SetStateAction<CheckoutAddress>>
//   // เพื่อให้ใช้กับ CheckoutAddressSheet ได้
//   const setSelectedAddressForSheet = (
//     updater: CheckoutAddress | ((prev: CheckoutAddress) => CheckoutAddress),
//   ) => {
//     const next =
//       typeof updater === "function"
//         ? (updater as (prev: CheckoutAddress) => CheckoutAddress)(
//             selectedAddress,
//           )
//         : updater;

//     handleSelectFromSheet(next);
//   };

//   /* ======================================================
//    * label โหมดโปรไฟล์ด้านบน
//    * ====================================================== */

//   const modeLabel =
//     profileInfo?.mode === "person"
//       ? "บุคคลธรรมดา"
//       : profileInfo?.mode === "entity"
//       ? "นิติบุคคล"
//       : "โปรไฟล์";

//   /* ======================================================
//    * RENDER
//    * ====================================================== */

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <MapPin className="h-5 w-5" />
//           {modeLabel}

//           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//             <SheetTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="ml-auto text-primary"
//               >
//                 แก้ไข
//               </Button>
//             </SheetTrigger>

//             <SheetContent className="w-[400px] sm:w-[540px] max-w-full overflow-hidden">
//               <CheckoutAddressSheet
//                 addresses={allAddresses}
//                 selectedAddress={selectedAddress}
//                 setAddresses={setAllAddresses}
//                 setSelectedAddress={setSelectedAddressForSheet}
//                 onClose={() => setIsSheetOpen(false)}
//                 title="เลือกที่อยู่จากโปรไฟล์"
//               />
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         {/* ====== ที่อยู่จัดส่ง ====== */}
//         <div>
//           <p className="font-medium">ที่อยู่จัดส่ง</p>

//           {shippingAddress ? (
//             <CheckoutAddressSummary selectedAddress={shippingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่จัดส่ง โปรดเพิ่มข้อมูลในโปรไฟล์
//             </p>
//           )}
//         </div>

//         {/* ====== ที่อยู่ออกใบกำกับภาษี ====== */}
//         <div>
//           <p className="font-medium">ที่อยู่ออกใบกำกับภาษี</p>

//           {billingAddress ? (
//             <CheckoutAddressSummary selectedAddress={billingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่ออกใบกำกับภาษี
//             </p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.2 =========================================================

// // src/app/checkout/component/CheckoutAddressSection.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { MapPin } from "lucide-react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
// } from "@/components/ui/sheet";

// import type {
//   CheckoutAddress,
//   CheckoutProfileInfo,
// } from "@/types/checkout";

// import CheckoutAddressSheet from "./CheckoutAddressSheet";
// import CheckoutAddressSummary from "./CheckoutAddressSummary";

// type Props = {
//   shippingAddress: CheckoutAddress | null;
//   billingAddress: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;

//   onChangeShippingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeBillingAddress: (addr: CheckoutAddress | null) => void;
//   onChangeProfileInfo: (info: CheckoutProfileInfo | undefined) => void;
// };

// export default function CheckoutAddressSection({
//   shippingAddress,
//   billingAddress,
//   profileInfo,
//   onChangeShippingAddress,
//   onChangeBillingAddress,
//   onChangeProfileInfo,
// }: Props) {
//   const dummyAddr: CheckoutAddress = {
//     id: 0,
//     type: "HOME",
//     name: "",
//     phone: "",
//     address: "",
//     isDefault: false,
//   };

//   /* ======================================================
//    * STATE สำหรับ Sheet Address รวม
//    * ====================================================== */

//   // ภาพรวม address ทั้งสองโหมด สำหรับแสดงใน sheet
//   const [allAddresses, setAllAddresses] = useState<CheckoutAddress[]>([]);

//   // address ที่กำลังเลือกใน sheet
//   const [selectedAddress, setSelectedAddress] =
//     useState<CheckoutAddress>(dummyAddr);

//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   /* ======================================================
//    * SYNC จาก props → state ภายใน
//    * ====================================================== */

//   useEffect(() => {
//     const list: CheckoutAddress[] = [];

//     if (shippingAddress) list.push(shippingAddress);
//     if (billingAddress) list.push(billingAddress);

//     // กรณีไม่มีเลย ก็ใส่ dummy ไว้ให้ sheet render
//     if (list.length === 0) list.push(dummyAddr);

//     setAllAddresses(list);

//     // เลือก address แรกเป็นค่าเริ่มต้น
//     setSelectedAddress(list[0]);
//   }, [shippingAddress, billingAddress]);

//   /* ======================================================
//    * เมื่อเลือก address ใหม่ใน sheet → อัปเดตทั้ง shipping / billing
//    * ====================================================== */

//   useEffect(() => {
//     if (!selectedAddress || selectedAddress.id === 0) {
//       onChangeShippingAddress(null);
//       onChangeBillingAddress(null);
//       return;
//     }

//     // แยกตาม purpose ของ address (มาจาก type เรา)
//     if (selectedAddress.purpose === "shipping") {
//       onChangeShippingAddress(selectedAddress);
//     }

//     if (selectedAddress.purpose === "billing") {
//       onChangeBillingAddress(selectedAddress);
//     }

//   }, [selectedAddress]);

//   /* ======================================================
//    * UI
//    * ====================================================== */

//   const modeLabel =
//     profileInfo?.mode === "person"
//       ? "บุคคลธรรมดา"
//       : profileInfo?.mode === "entity"
//         ? "นิติบุคคล"
//         : "ไม่ทราบประเภท";

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <MapPin className="h-5 w-5" />
//           {modeLabel}

//           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//             <SheetTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="ml-auto text-primary"
//               >
//                 แก้ไข
//               </Button>
//             </SheetTrigger>

//             <SheetContent className="w-[400px] sm:w-[540px] max-w-full overflow-hidden">
//               <CheckoutAddressSheet
//                 addresses={allAddresses}
//                 selectedAddress={selectedAddress}
//                 setAddresses={setAllAddresses}
//                 setSelectedAddress={setSelectedAddress}
//                 onClose={() => setIsSheetOpen(false)}
//               />
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-4">

//         {/* ====== ที่อยู่จัดส่ง ====== */}
//         <div>
//           <p className="font-medium">ที่อยู่จัดส่ง</p>

//           {shippingAddress ? (
//             <CheckoutAddressSummary selectedAddress={shippingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่จัดส่ง โปรดเพิ่มข้อมูลในโปรไฟล์
//             </p>
//           )}
//         </div>

//         {/* ====== ที่อยู่ออกใบกำกับภาษี ====== */}
//         <div>
//           <p className="font-medium">ที่อยู่ออกใบกำกับภาษี</p>

//           {billingAddress ? (
//             <CheckoutAddressSummary selectedAddress={billingAddress} />
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               ยังไม่มีที่อยู่ออกใบกำกับภาษี
//             </p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
