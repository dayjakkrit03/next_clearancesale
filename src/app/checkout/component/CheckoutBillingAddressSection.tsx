// v.1.1.2 ===================================================================
// // src/app/checkout/component/CheckoutBillingAddressSection.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { FileText } from "lucide-react";

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
//   /** ที่อยู่ออกใบกำกับภาษีจาก service layer */
//   billingAddress: CheckoutAddress | null;
//   /** เผื่ออนาคต ถ้าจะให้ copy จากที่อยู่จัดส่ง */
//   shippingAddress?: CheckoutAddress | null;
//   profileInfo?: CheckoutProfileInfo;

//   onChangeBillingAddress?: (addr: CheckoutAddress | null) => void;
//   onChangeProfileInfo?: (info: CheckoutProfileInfo | undefined) => void;
// };

// export default function CheckoutBillingAddressSection({
//   billingAddress,
//   shippingAddress, // ตอนนี้ยังไม่ใช้ แต่เผื่อ copy ตามที่อยู่จัดส่ง
//   profileInfo,
//   onChangeBillingAddress,
//   onChangeProfileInfo,
// }: Props) {
//   // ===== list address สำหรับเลือกใน sheet =====
//   const [addresses, setAddresses] = useState<CheckoutAddress[]>(() =>
//     billingAddress ? [billingAddress] : [],
//   );

//   // ทำให้ selectedAddress ไม่เป็น null (ให้ตรง type ของ CheckoutAddressSheet)
//   const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress>(() => {
//     if (billingAddress) return billingAddress;

//     // fallback dummy (กรณียังไม่มีที่อยู่ออกใบกำกับภาษี)
//     return {
//       id: 0,
//       type: "HOME",
//       name: "",
//       phone: "",
//       address: "",
//       isDefault: false,
//     };
//   });

//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   // sync เมื่อ billingAddress จาก server เปลี่ยน
//   useEffect(() => {
//     if (billingAddress) {
//       setAddresses([billingAddress]);
//       setSelectedAddress(billingAddress);
//     } else {
//       setAddresses([]);
//       setSelectedAddress({
//         id: 0,
//         type: "HOME",
//         name: "",
//         phone: "",
//         address: "",
//         isDefault: false,
//       });
//     }
//   }, [billingAddress]);

//   // แจ้ง parent ทุกครั้งที่ selectedAddress เปลี่ยน
//   useEffect(() => {
//     if (!onChangeBillingAddress) return;

//     if (selectedAddress.id === 0 && !selectedAddress.name) {
//       onChangeBillingAddress(null);
//     } else {
//       onChangeBillingAddress(selectedAddress);
//     }
//   }, [selectedAddress, onChangeBillingAddress]);

//   const hasRealAddress =
//     addresses.length > 0 && addresses[0].id !== 0;

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <FileText className="h-5 w-5" />
//           ที่อยู่ออกใบกำกับภาษี
//           <span className="text-sm text-muted-foreground">
//             (ถ้ามี)
//           </span>

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
//               {hasRealAddress && (
//                 <CheckoutAddressSheet
//                   addresses={addresses}
//                   selectedAddress={selectedAddress}
//                   setAddresses={setAddresses}
//                   setSelectedAddress={setSelectedAddress}
//                   onClose={() => setIsSheetOpen(false)}
//                 />
//               )}
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         {hasRealAddress ? (
//           <CheckoutAddressSummary selectedAddress={selectedAddress} />
//         ) : (
//           <p className="text-sm text-muted-foreground">
//             ยังไม่ได้ตั้งค่าที่อยู่ออกใบกำกับภาษี
//             โปรดเพิ่มข้อมูลในหน้าโปรไฟล์ของคุณ
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


// v.1.1.2 ===================================================================

// // src/app/checkout/component/CheckoutBillingAddressSection.tsx

// "use client";

// import { useState } from "react";
// import { FileText } from "lucide-react";

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

// import type { CheckoutAddress } from "@/types/checkout";
// import CheckoutAddressSheet from "./CheckoutAddressSheet";
// import CheckoutAddressSummary from "./CheckoutAddressSummary";

// /**
//  * Mock ข้อมูลที่อยู่ออกใบกำกับภาษี
//  * - สมมติว่ามีทั้งบุคคลธรรมดา + นิติบุคคลเหมือนกับบล็อกจัดส่ง
//  * - default เลือก "นิติบุคคล" เพราะใช้บ่อยสำหรับใบกำกับภาษี
//  */
// const initialBillingAddresses: CheckoutAddress[] = [
//   {
//     id: 101,
//     type: "HOME",
//     name: "สิรดา ถวิก",
//     phone: "086-352-7663",
//     address:
//       "บ้านเลขที่ 50/37 ซอย 8 แขวงสะพานสอง เขตวังทองหลาง กรุงเทพมหานคร 10310",
//     isDefault: false,
//     profileMode: "person",
//     purpose: "billing",
//   },
//   {
//     id: 102,
//     type: "OFFICE",
//     name: "บจก. อินเตอร์ลิ้งค์ คอมมิวนิเคชั่น",
//     phone: "02-123-4567",
//     address:
//       "สำนักงานใหญ่ 65 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10110",
//     isDefault: true,
//     profileMode: "entity",
//     purpose: "billing",
//   },
// ];

// export default function CheckoutBillingAddressSection() {
//   const [addresses, setAddresses] =
//     useState<CheckoutAddress[]>(initialBillingAddresses);

//   // ที่อยู่ออกใบกำกับภาษีที่ใช้สำหรับ order นี้
//   const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress>(
//     initialBillingAddresses[1] // default = นิติบุคคล
//   );

//   const [isSheetOpen, setIsSheetOpen] = useState(false);

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <FileText className="h-5 w-5" />
//           ที่อยู่ออกใบกำกับภาษี <span className="text-sm text-muted-foreground">(ถ้ามี)</span>
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
//                 addresses={addresses}
//                 selectedAddress={selectedAddress}
//                 setAddresses={setAddresses}
//                 setSelectedAddress={setSelectedAddress}
//                 onClose={() => setIsSheetOpen(false)}
//                 // เดี๋ยวเราจะไปปรับ CheckoutAddressSheet ให้รองรับ title/custom text
//               />
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         <CheckoutAddressSummary selectedAddress={selectedAddress} />
//       </CardContent>
//     </Card>
//   );
// }
