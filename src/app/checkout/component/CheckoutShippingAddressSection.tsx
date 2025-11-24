// v.1.1.3 ===============================================================
// src/app/checkout/component/CheckoutShippingAddressSection.tsx

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

import type { CheckoutAddress } from "../checkout.types";
import CheckoutAddressSheet from "./CheckoutAddressSheet";
import CheckoutAddressSummary from "./CheckoutAddressSummary";

const initialAddresses: CheckoutAddress[] = [
  {
    id: 1,
    type: "HOME",
    name: "สิรดา ธำรำ",
    phone: "0863527663",
    address:
      "สบปิดิ์ ร้ำปี ร่ำวชำกระก๊วยิดส เคลส์ 50/37 ซอย 8 ซิ์ง อ.สิ่ง ลิ. สะหมำเชม/ Saphan Song, 10310, วำงห่องส่ำม/ Wang Thonglang, กรุงเทพมหำนคร/ Bangkok",
    isDefault: true,
  },
];

export default function CheckoutShippingAddressSection() {
  const [addresses, setAddresses] =
    useState<CheckoutAddress[]>(initialAddresses);
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress>(
    initialAddresses[0]
  );

  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          ที่อยู่จัดส่ง
          <Sheet
            open={isAddressSheetOpen}
            onOpenChange={setIsAddressSheetOpen}
          >
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
                onClose={() => setIsAddressSheetOpen(false)}
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

// v.1.1.3 ===============================================================

// v.1.1.2 ===============================================================
// // src/app/checkout/component/CheckoutShippingAddressSection.tsx

// "use client";

// import { useState } from "react";
// import { MapPin, Plus, Home, Building, Edit, Check } from "lucide-react";
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
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// // ⬇️ ใช้ type กลางจาก checkout.types.ts
// import type {
//   CheckoutAddress,
//   CheckoutAddressTag,
// } from "../checkout.types";

// const initialAddresses: CheckoutAddress[] = [
//   {
//     id: 1,
//     type: "HOME",
//     name: "สิรดา ธำรำ",
//     phone: "0863527663",
//     address:
//       "สบปิดิ์ ร้ำปี ร่ำวชำกระก๊วยิดส เคลส์ 50/37 ซอย 8 ซิ์ง อ.สิ่ง ลิ. สะหมำเชม/ Saphan Song, 10310, วำงห่องส่ำม/ Wang Thonglang, กรุงเทพมหำนคร/ Bangkok",
//     isDefault: true,
//   },
// ];

// // ฟอร์มสำหรับเพิ่ม/แก้ไขที่อยู่ (ไม่จำเป็นต้องมี id / isDefault)
// type NewAddressFormState = {
//   type: CheckoutAddressTag;
//   name: string;
//   phone: string;
//   address: string;
//   province: string;
//   district: string;
//   subdistrict: string;
//   zipcode: string;
// };

// export default function CheckoutShippingAddressSection() {
//   const [addresses, setAddresses] =
//     useState<CheckoutAddress[]>(initialAddresses);
//   const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress>(
//     initialAddresses[0]
//   );

//   const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<CheckoutAddress | null>(
//     null
//   );

//   const [newAddress, setNewAddress] = useState<NewAddressFormState>({
//     type: "HOME",
//     name: "",
//     phone: "",
//     address: "",
//     province: "",
//     district: "",
//     subdistrict: "",
//     zipcode: "",
//   });

//   const resetNewAddress = () =>
//     setNewAddress({
//       type: "HOME",
//       name: "",
//       phone: "",
//       address: "",
//       province: "",
//       district: "",
//       subdistrict: "",
//       zipcode: "",
//     });

//   const handleSelectAddress = (address: CheckoutAddress) => {
//     setSelectedAddress(address);
//     setIsAddressSheetOpen(false);
//   };

//   const handleSetDefault = (addressId: number) => {
//     setAddresses((prev) =>
//       prev.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === addressId,
//       }))
//     );
//     const newDefault = addresses.find((a) => a.id === addressId);
//     if (newDefault) setSelectedAddress(newDefault);
//   };

//   const handleAddAddress = () => {
//     const newAddr: CheckoutAddress = {
//       id: addresses.length + 1,
//       type: newAddress.type,
//       name: newAddress.name,
//       phone: newAddress.phone,
//       address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
//       isDefault: false,
//     };

//     setAddresses((prev) => [...prev, newAddr]);
//     resetNewAddress();
//     setIsAddDialogOpen(false);
//   };

//   const handleEditAddress = (address: CheckoutAddress) => {
//     setEditingAddress(address);
//     setNewAddress({
//       type: address.type,
//       name: address.name,
//       phone: address.phone,
//       address: address.address.split(",")[0],
//       province: "กรุงเทพมหานคร",
//       district: "Wang Thonglang",
//       subdistrict: "Saphan Song",
//       zipcode: "10310",
//     });
//     setIsEditDialogOpen(true);
//   };

//   const handleSaveEditedAddress = () => {
//     if (!editingAddress) return;

//     const updated: CheckoutAddress = {
//       ...editingAddress,
//       type: newAddress.type,
//       name: newAddress.name,
//       phone: newAddress.phone,
//       address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
//     };

//     setAddresses((prev) =>
//       prev.map((addr) => (addr.id === editingAddress.id ? updated : addr))
//     );

//     if (selectedAddress.id === editingAddress.id) {
//       setSelectedAddress(updated);
//     }

//     resetNewAddress();
//     setEditingAddress(null);
//     setIsEditDialogOpen(false);
//   };

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <MapPin className="h-5 w-5" />
//           ที่อยู่จัดส่ง
//           <Sheet
//             open={isAddressSheetOpen}
//             onOpenChange={setIsAddressSheetOpen}
//           >
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
//               <SheetHeader>
//                 <SheetTitle>ที่อยู่จัดส่ง</SheetTitle>
//               </SheetHeader>

//               <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
//                 {/* Add address dialog */}
//                 <Dialog
//                   open={isAddDialogOpen}
//                   onOpenChange={setIsAddDialogOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="w-full justify-start gap-2"
//                     >
//                       <Plus className="h-4 w-4" />
//                       เพิ่มที่อยู่ใหม่
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                       <DialogTitle>เพิ่มที่อยู่จัดส่งใหม่</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="name">ชื่อ-นามสกุล</Label>
//                           <Input
//                             id="name"
//                             placeholder="กรุณากรอกชื่อ-นามสกุล"
//                             value={newAddress.name}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 name: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
//                           <Input
//                             id="phone"
//                             placeholder="กรุณากรอกหมายเลขโทรศัพท์"
//                             value={newAddress.phone}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 phone: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="address">ที่อยู่</Label>
//                         <Textarea
//                           id="address"
//                           placeholder="บ้านเลขที่ ชั้น ชื่ออาคาร ชื่อถนน"
//                           value={newAddress.address}
//                           onChange={(e) =>
//                             setNewAddress({
//                               ...newAddress,
//                               address: e.target.value,
//                             })
//                           }
//                           className="min-h-[80px]"
//                         />
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="province">จังหวัด</Label>
//                           <Input
//                             id="province"
//                             placeholder="กรุณาเลือกจังหวัด"
//                             value={newAddress.province}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 province: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="district">เขต/อำเภอ</Label>
//                           <Input
//                             id="district"
//                             placeholder="กรุณาเลือกเขต/อำเภอ"
//                             value={newAddress.district}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 district: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="subdistrict">แขวง/ตำบล</Label>
//                           <Input
//                             id="subdistrict"
//                             placeholder="กรุณาเลือกแขวง/ตำบล"
//                             value={newAddress.subdistrict}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 subdistrict: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="zipcode">รหัสไปรษณีย์</Label>
//                           <Input
//                             id="zipcode"
//                             placeholder="00000"
//                             value={newAddress.zipcode}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 zipcode: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>
//                           เลือกป้ายกำกับสำหรับการจัดส่งที่มีประสิทธิภาพ
//                         </Label>
//                         <div className="flex gap-2 mt-2">
//                           <Button
//                             variant={
//                               newAddress.type === "HOME" ? "default" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "HOME" })
//                             }
//                           >
//                             <Home className="h-4 w-4 mr-1" />
//                             บ้าน
//                           </Button>
//                           <Button
//                             variant={
//                               newAddress.type === "OFFICE"
//                                 ? "default"
//                                 : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "OFFICE" })
//                             }
//                           >
//                             <Building className="h-4 w-4 mr-1" />
//                             ออฟฟิศ
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="flex justify-end gap-2 pt-4">
//                         <Button
//                           variant="outline"
//                           onClick={() => setIsAddDialogOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="bg-teal-500 hover:bg-teal-600"
//                           onClick={handleAddAddress}
//                           disabled={
//                             !newAddress.name ||
//                             !newAddress.phone ||
//                             !newAddress.address
//                           }
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 {/* Address list */}
//                 <div className="space-y-4">
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
//                         selectedAddress.id === address.id
//                           ? "border-teal-500 bg-teal-50 shadow-sm"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                     >
//                       <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
//                         <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
//                           <span
//                             className={`text-xs px-3 py-1 rounded-full text-white font-medium ${
//                               address.type === "HOME"
//                                 ? "bg-orange-500"
//                                 : "bg-blue-500"
//                             }`}
//                           >
//                             {address.type}
//                           </span>
//                           <span className="font-semibold text-gray-900 truncate">
//                             {address.name}
//                           </span>
//                           <span className="text-gray-600 text-sm">
//                             {address.phone}
//                           </span>
//                           {address.isDefault && (
//                             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
//                               ค่าเริ่มต้น
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1 flex-shrink-0">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEditAddress(address);
//                             }}
//                             className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600"
//                             title="แก้ไขที่อยู่"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleSetDefault(address.id);
//                             }}
//                             className={`h-9 w-9 p-0 ${
//                               address.isDefault
//                                 ? "text-green-600 hover:bg-green-100"
//                                 : "text-gray-400 hover:bg-gray-100 hover:text-green-600"
//                             }`}
//                             title={
//                               address.isDefault
//                                 ? "ที่อยู่เริ่มต้น"
//                                 : "ตั้งเป็นค่าเริ่มต้น"
//                             }
//                           >
//                             <Check className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>

//                       <div
//                         className="text-sm text-gray-600 leading-relaxed cursor-pointer hover:text-gray-800 transition-colors"
//                         onClick={() => handleSelectAddress(address)}
//                       >
//                         <p className="break-words">{address.address}</p>
//                       </div>

//                       <div className="mt-4 sm:hidden">
//                         <Button
//                           variant={
//                             selectedAddress.id === address.id
//                               ? "default"
//                               : "outline"
//                           }
//                           size="sm"
//                           className="w-full"
//                           onClick={() => handleSelectAddress(address)}
//                         >
//                           {selectedAddress.id === address.id
//                             ? "เลือกแล้ว"
//                             : "เลือกที่อยู่นี้"}
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Edit dialog */}
//                 <Dialog
//                   open={isEditDialogOpen}
//                   onOpenChange={setIsEditDialogOpen}
//                 >
//                   <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                       <DialogTitle>แก้ไขที่อยู่จัดส่ง</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
//                           <Input
//                             id="edit-name"
//                             placeholder="กรุณากรอกชื่อ-นามสกุล"
//                             value={newAddress.name}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 name: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-phone">หมายเลขโทรศัพท์</Label>
//                           <Input
//                             id="edit-phone"
//                             placeholder="กรุณากรอกหมายเลขโทรศัพท์"
//                             value={newAddress.phone}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 phone: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="edit-address">ที่อยู่</Label>
//                         <Textarea
//                           id="edit-address"
//                           placeholder="บ้านเลขที่ ชั้น ชื่ออาคาร ชื่อถนน"
//                           value={newAddress.address}
//                           onChange={(e) =>
//                             setNewAddress({
//                               ...newAddress,
//                               address: e.target.value,
//                             })
//                           }
//                           className="min-h-[80px]"
//                         />
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-province">จังหวัด</Label>
//                           <Input
//                             id="edit-province"
//                             placeholder="กรุณาเลือกจังหวัด"
//                             value={newAddress.province}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 province: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-district">เขต/อำเภอ</Label>
//                           <Input
//                             id="edit-district"
//                             placeholder="กรุณาเลือกเขต/อำเภอ"
//                             value={newAddress.district}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 district: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-subdistrict">แขวง/ตำบล</Label>
//                           <Input
//                             id="edit-subdistrict"
//                             placeholder="กรุณาเลือกแขวง/ตำบล"
//                             value={newAddress.subdistrict}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 subdistrict: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-zipcode">รหัสไปรษณีย์</Label>
//                           <Input
//                             id="edit-zipcode"
//                             placeholder="00000"
//                             value={newAddress.zipcode}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 zipcode: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>
//                           เลือกป้ายกำกับสำหรับการจัดส่งที่มีประสิทธิภาพ
//                         </Label>
//                         <div className="flex gap-2 mt-2">
//                           <Button
//                             variant={
//                               newAddress.type === "HOME" ? "default" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "HOME" })
//                             }
//                           >
//                             <Home className="h-4 w-4 mr-1" />
//                             บ้าน
//                           </Button>
//                           <Button
//                             variant={
//                               newAddress.type === "OFFICE"
//                                 ? "default"
//                                 : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "OFFICE" })
//                             }
//                           >
//                             <Building className="h-4 w-4 mr-1" />
//                             ออฟฟิศ
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="flex justify-end gap-2 pt-4">
//                         <Button
//                           variant="outline"
//                           onClick={() => setIsEditDialogOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="bg-teal-500 hover:bg-teal-600"
//                           onClick={handleSaveEditedAddress}
//                           disabled={
//                             !newAddress.name ||
//                             !newAddress.phone ||
//                             !newAddress.address
//                           }
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         <div className="bg-orange-50 p-3 rounded border border-orange-200">
//           <div className="flex items-center gap-2 mb-1">
//             <span
//               className={`text-white text-xs px-2 py-1 rounded ${
//                 selectedAddress.type === "HOME"
//                   ? "bg-orange-500"
//                   : "bg-blue-500"
//               }`}
//             >
//               {selectedAddress.type}
//             </span>
//             <span className="font-medium">{selectedAddress.name}</span>
//             <span className="text-muted-foreground">
//               {selectedAddress.phone}
//             </span>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             {selectedAddress.address}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// v.1.1.2 ===============================================================


// // src/app/checkout/component/CheckoutShippingAddressSection.tsx

// "use client";

// import { useState } from "react";
// import {
//   MapPin,
//   Plus,
//   Home,
//   Building,
//   Edit,
//   Check,
// } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// const initialAddresses = [
//   {
//     id: 1,
//     type: "HOME",
//     name: "สิรดา ธำรำ",
//     phone: "0863527663",
//     address:
//       "สบปิดิ์ ร้ำปี ร่ำวชำกระก๊วยิดส เคลส์ 50/37 ซอย 8 ซิ์ง อ.สิ่ง ลิ. สะหมำเชม/ Saphan Song, 10310, วำงห่องส่ำม/ Wang Thonglang, กรุงเทพมหำนคร/ Bangkok",
//     isDefault: true,
//   },
// ];

// type Address = (typeof initialAddresses)[number];

// export default function CheckoutShippingAddressSection() {
//   const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
//   const [selectedAddress, setSelectedAddress] = useState<Address>(initialAddresses[0]);

//   const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<Address | null>(null);

//   const [newAddress, setNewAddress] = useState({
//     type: "HOME",
//     name: "",
//     phone: "",
//     address: "",
//     province: "",
//     district: "",
//     subdistrict: "",
//     zipcode: "",
//   });

//   const resetNewAddress = () =>
//     setNewAddress({
//       type: "HOME",
//       name: "",
//       phone: "",
//       address: "",
//       province: "",
//       district: "",
//       subdistrict: "",
//       zipcode: "",
//     });

//   const handleSelectAddress = (address: Address) => {
//     setSelectedAddress(address);
//     setIsAddressSheetOpen(false);
//   };

//   const handleSetDefault = (addressId: number) => {
//     setAddresses((prev) =>
//       prev.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === addressId,
//       }))
//     );
//     const newDefault = addresses.find((a) => a.id === addressId);
//     if (newDefault) setSelectedAddress(newDefault);
//   };

//   const handleAddAddress = () => {
//     const newAddr: Address = {
//       id: addresses.length + 1,
//       type: newAddress.type,
//       name: newAddress.name,
//       phone: newAddress.phone,
//       address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
//       isDefault: false,
//     };

//     setAddresses((prev) => [...prev, newAddr]);
//     resetNewAddress();
//     setIsAddDialogOpen(false);
//   };

//   const handleEditAddress = (address: Address) => {
//     setEditingAddress(address);
//     setNewAddress({
//       type: address.type,
//       name: address.name,
//       phone: address.phone,
//       address: address.address.split(",")[0],
//       province: "กรุงเทพมหานคร",
//       district: "Wang Thonglang",
//       subdistrict: "Saphan Song",
//       zipcode: "10310",
//     });
//     setIsEditDialogOpen(true);
//   };

//   const handleSaveEditedAddress = () => {
//     if (!editingAddress) return;

//     const updated: Address = {
//       ...editingAddress,
//       type: newAddress.type,
//       name: newAddress.name,
//       phone: newAddress.phone,
//       address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
//     };

//     setAddresses((prev) =>
//       prev.map((addr) => (addr.id === editingAddress.id ? updated : addr))
//     );

//     if (selectedAddress.id === editingAddress.id) {
//       setSelectedAddress(updated);
//     }

//     resetNewAddress();
//     setEditingAddress(null);
//     setIsEditDialogOpen(false);
//   };

//   return (
//     <Card>
//       <CardHeader className="pb-3">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <MapPin className="h-5 w-5" />
//           ที่อยู่จัดส่ง
//           <Sheet open={isAddressSheetOpen} onOpenChange={setIsAddressSheetOpen}>
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
//               <SheetHeader>
//                 <SheetTitle>ที่อยู่จัดส่ง</SheetTitle>
//               </SheetHeader>

//               <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
//                 {/* Add address dialog */}
//                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="w-full justify-start gap-2"
//                     >
//                       <Plus className="h-4 w-4" />
//                       เพิ่มที่อยู่ใหม่
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                       <DialogTitle>เพิ่มที่อยู่จัดส่งใหม่</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="name">ชื่อ-นามสกุล</Label>
//                           <Input
//                             id="name"
//                             placeholder="กรุณากรอกชื่อ-นามสกุล"
//                             value={newAddress.name}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 name: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
//                           <Input
//                             id="phone"
//                             placeholder="กรุณากรอกหมายเลขโทรศัพท์"
//                             value={newAddress.phone}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 phone: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="address">ที่อยู่</Label>
//                         <Textarea
//                           id="address"
//                           placeholder="บ้านเลขที่ ชั้น ชื่ออาคาร ชื่อถนน"
//                           value={newAddress.address}
//                           onChange={(e) =>
//                             setNewAddress({
//                               ...newAddress,
//                               address: e.target.value,
//                             })
//                           }
//                           className="min-h-[80px]"
//                         />
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="province">จังหวัด</Label>
//                           <Input
//                             id="province"
//                             placeholder="กรุณาเลือกจังหวัด"
//                             value={newAddress.province}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 province: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="district">เขต/อำเภอ</Label>
//                           <Input
//                             id="district"
//                             placeholder="กรุณาเลือกเขต/อำเภอ"
//                             value={newAddress.district}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 district: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="subdistrict">แขวง/ตำบล</Label>
//                           <Input
//                             id="subdistrict"
//                             placeholder="กรุณาเลือกแขวง/ตำบล"
//                             value={newAddress.subdistrict}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 subdistrict: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="zipcode">รหัสไปรษณีย์</Label>
//                           <Input
//                             id="zipcode"
//                             placeholder="00000"
//                             value={newAddress.zipcode}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 zipcode: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>เลือกป้ายกำกับสำหรับการจัดส่งที่มีประสิทธิภาพ</Label>
//                         <div className="flex gap-2 mt-2">
//                           <Button
//                             variant={
//                               newAddress.type === "HOME" ? "default" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "HOME" })
//                             }
//                           >
//                             <Home className="h-4 w-4 mr-1" />
//                             บ้าน
//                           </Button>
//                           <Button
//                             variant={
//                               newAddress.type === "OFFICE"
//                                 ? "default"
//                                 : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "OFFICE" })
//                             }
//                           >
//                             <Building className="h-4 w-4 mr-1" />
//                             ออฟฟิศ
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="flex justify-end gap-2 pt-4">
//                         <Button
//                           variant="outline"
//                           onClick={() => setIsAddDialogOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="bg-teal-500 hover:bg-teal-600"
//                           onClick={handleAddAddress}
//                           disabled={
//                             !newAddress.name ||
//                             !newAddress.phone ||
//                             !newAddress.address
//                           }
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 {/* Address list */}
//                 <div className="space-y-4">
//                   {addresses.map((address) => (
//                     <div
//                       key={address.id}
//                       className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
//                         selectedAddress.id === address.id
//                           ? "border-teal-500 bg-teal-50 shadow-sm"
//                           : "border-gray-200 hover:border-gray-300"
//                       }`}
//                     >
//                       <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
//                         <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
//                           <span
//                             className={`text-xs px-3 py-1 rounded-full text-white font-medium ${
//                               address.type === "HOME"
//                                 ? "bg-orange-500"
//                                 : "bg-blue-500"
//                             }`}
//                           >
//                             {address.type}
//                           </span>
//                           <span className="font-semibold text-gray-900 truncate">
//                             {address.name}
//                           </span>
//                           <span className="text-gray-600 text-sm">
//                             {address.phone}
//                           </span>
//                           {address.isDefault && (
//                             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
//                               ค่าเริ่มต้น
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1 flex-shrink-0">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEditAddress(address);
//                             }}
//                             className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600"
//                             title="แก้ไขที่อยู่"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleSetDefault(address.id);
//                             }}
//                             className={`h-9 w-9 p-0 ${
//                               address.isDefault
//                                 ? "text-green-600 hover:bg-green-100"
//                                 : "text-gray-400 hover:bg-gray-100 hover:text-green-600"
//                             }`}
//                             title={
//                               address.isDefault
//                                 ? "ที่อยู่เริ่มต้น"
//                                 : "ตั้งเป็นค่าเริ่มต้น"
//                             }
//                           >
//                             <Check className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>

//                       <div
//                         className="text-sm text-gray-600 leading-relaxed cursor-pointer hover:text-gray-800 transition-colors"
//                         onClick={() => handleSelectAddress(address)}
//                       >
//                         <p className="break-words">{address.address}</p>
//                       </div>

//                       <div className="mt-4 sm:hidden">
//                         <Button
//                           variant={
//                             selectedAddress.id === address.id
//                               ? "default"
//                               : "outline"
//                           }
//                           size="sm"
//                           className="w-full"
//                           onClick={() => handleSelectAddress(address)}
//                         >
//                           {selectedAddress.id === address.id
//                             ? "เลือกแล้ว"
//                             : "เลือกที่อยู่นี้"}
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Edit dialog */}
//                 <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//                   <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                       <DialogTitle>แก้ไขที่อยู่จัดส่ง</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
//                           <Input
//                             id="edit-name"
//                             placeholder="กรุณากรอกชื่อ-นามสกุล"
//                             value={newAddress.name}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 name: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-phone">หมายเลขโทรศัพท์</Label>
//                           <Input
//                             id="edit-phone"
//                             placeholder="กรุณากรอกหมายเลขโทรศัพท์"
//                             value={newAddress.phone}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 phone: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="edit-address">ที่อยู่</Label>
//                         <Textarea
//                           id="edit-address"
//                           placeholder="บ้านเลขที่ ชั้น ชื่ออาคาร ชื่อถนน"
//                           value={newAddress.address}
//                           onChange={(e) =>
//                             setNewAddress({
//                               ...newAddress,
//                               address: e.target.value,
//                             })
//                           }
//                           className="min-h-[80px]"
//                         />
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-province">จังหวัด</Label>
//                           <Input
//                             id="edit-province"
//                             placeholder="กรุณาเลือกจังหวัด"
//                             value={newAddress.province}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 province: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-district">เขต/อำเภอ</Label>
//                           <Input
//                             id="edit-district"
//                             placeholder="กรุณาเลือกเขต/อำเภอ"
//                             value={newAddress.district}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 district: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="edit-subdistrict">แขวง/ตำบล</Label>
//                           <Input
//                             id="edit-subdistrict"
//                             placeholder="กรุณาเลือกแขวง/ตำบล"
//                             value={newAddress.subdistrict}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 subdistrict: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="edit-zipcode">รหัสไปรษณีย์</Label>
//                           <Input
//                             id="edit-zipcode"
//                             placeholder="00000"
//                             value={newAddress.zipcode}
//                             onChange={(e) =>
//                               setNewAddress({
//                                 ...newAddress,
//                                 zipcode: e.target.value,
//                               })
//                             }
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label>เลือกป้ายกำกับสำหรับการจัดส่งที่มีประสิทธิภาพ</Label>
//                         <div className="flex gap-2 mt-2">
//                           <Button
//                             variant={
//                               newAddress.type === "HOME" ? "default" : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "HOME" })
//                             }
//                           >
//                             <Home className="h-4 w-4 mr-1" />
//                             บ้าน
//                           </Button>
//                           <Button
//                             variant={
//                               newAddress.type === "OFFICE"
//                                 ? "default"
//                                 : "outline"
//                             }
//                             size="sm"
//                             onClick={() =>
//                               setNewAddress({ ...newAddress, type: "OFFICE" })
//                             }
//                           >
//                             <Building className="h-4 w-4 mr-1" />
//                             ออฟฟิศ
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="flex justify-end gap-2 pt-4">
//                         <Button
//                           variant="outline"
//                           onClick={() => setIsEditDialogOpen(false)}
//                         >
//                           ยกเลิก
//                         </Button>
//                         <Button
//                           className="bg-teal-500 hover:bg-teal-600"
//                           onClick={handleSaveEditedAddress}
//                           disabled={
//                             !newAddress.name ||
//                             !newAddress.phone ||
//                             !newAddress.address
//                           }
//                         >
//                           บันทึก
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         <div className="bg-orange-50 p-3 rounded border border-orange-200">
//           <div className="flex items-center gap-2 mb-1">
//             <span
//               className={`text-white text-xs px-2 py-1 rounded ${
//                 selectedAddress.type === "HOME" ? "bg-orange-500" : "bg-blue-500"
//               }`}
//             >
//               {selectedAddress.type}
//             </span>
//             <span className="font-medium">{selectedAddress.name}</span>
//             <span className="text-muted-foreground">
//               {selectedAddress.phone}
//             </span>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             {selectedAddress.address}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
