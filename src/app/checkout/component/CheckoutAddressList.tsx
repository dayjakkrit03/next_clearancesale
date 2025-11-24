// src/app/checkout/component/CheckoutAddressList.tsx

"use client";

import type {
  CheckoutAddress,
  CheckoutAddressTag,
} from "../checkout.types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Check, Home, Building } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type NewAddressFormState = {
  type: CheckoutAddressTag;
  name: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  zipcode: string;
};

type Props = {
  addresses: CheckoutAddress[];
  selectedAddress: CheckoutAddress;
  newAddress: NewAddressFormState;
  setNewAddress: Dispatch<SetStateAction<NewAddressFormState>>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: Dispatch<SetStateAction<boolean>>;
  onSelectAddress: (address: CheckoutAddress) => void;
  onSetDefault: (id: number) => void;
  onEditAddress: (address: CheckoutAddress) => void;
  onSaveEditedAddress: () => void;
};

export default function CheckoutAddressList({
  addresses,
  selectedAddress,
  newAddress,
  setNewAddress,
  isEditDialogOpen,
  setIsEditDialogOpen,
  onSelectAddress,
  onSetDefault,
  onEditAddress,
  onSaveEditedAddress,
}: Props) {
  return (
    <>
      {/* Address list */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
              selectedAddress.id === address.id
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                <span
                  className={`text-xs px-3 py-1 rounded-full text-white font-medium ${
                    address.type === "HOME"
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                >
                  {address.type}
                </span>
                <span className="font-semibold text-gray-900 truncate">
                  {address.name}
                </span>
                <span className="text-gray-600 text-sm">
                  {address.phone}
                </span>
                {address.isDefault && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    ค่าเริ่มต้น
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(address);
                  }}
                  className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600"
                  title="แก้ไขที่อยู่"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(address.id);
                  }}
                  className={`h-9 w-9 p-0 ${
                    address.isDefault
                      ? "text-green-600 hover:bg-green-100"
                      : "text-gray-400 hover:bg-gray-100 hover:text-green-600"
                  }`}
                  title={
                    address.isDefault
                      ? "ที่อยู่เริ่มต้น"
                      : "ตั้งเป็นค่าเริ่มต้น"
                  }
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="text-sm text-gray-600 leading-relaxed cursor-pointer hover:text-gray-800 transition-colors"
              onClick={() => onSelectAddress(address)}
            >
              <p className="break-words">{address.address}</p>
            </div>

            <div className="mt-4 sm:hidden">
              <Button
                variant={
                  selectedAddress.id === address.id ? "default" : "outline"
                }
                size="sm"
                className="w-full"
                onClick={() => onSelectAddress(address)}
              >
                {selectedAddress.id === address.id
                  ? "เลือกแล้ว"
                  : "เลือกที่อยู่นี้"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขที่อยู่จัดส่ง</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">ชื่อ-นามสกุล</Label>
                <Input
                  id="edit-name"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">หมายเลขโทรศัพท์</Label>
                <Input
                  id="edit-phone"
                  placeholder="กรุณากรอกหมายเลขโทรศัพท์"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-address">ที่อยู่</Label>
              <Textarea
                id="edit-address"
                placeholder="บ้านเลขที่ ชั้น ชื่ออาคาร ชื่อถนน"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    address: e.target.value,
                  })
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-province">จังหวัด</Label>
                <Input
                  id="edit-province"
                  placeholder="กรุณาเลือกจังหวัด"
                  value={newAddress.province}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      province: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-district">เขต/อำเภอ</Label>
                <Input
                  id="edit-district"
                  placeholder="กรุณาเลือกเขต/อำเภอ"
                  value={newAddress.district}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      district: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-subdistrict">แขวง/ตำบล</Label>
                <Input
                  id="edit-subdistrict"
                  placeholder="กรุณาเลือกแขวง/ตำบล"
                  value={newAddress.subdistrict}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      subdistrict: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-zipcode">รหัสไปรษณีย์</Label>
                <Input
                  id="edit-zipcode"
                  placeholder="00000"
                  value={newAddress.zipcode}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      zipcode: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>เลือกป้ายกำกับสำหรับการจัดส่งที่มีประสิทธิภาพ</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={
                    newAddress.type === "HOME" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setNewAddress({ ...newAddress, type: "HOME" })
                  }
                >
                  <Home className="h-4 w-4 mr-1" />
                  บ้าน
                </Button>
                <Button
                  variant={
                    newAddress.type === "OFFICE" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setNewAddress({ ...newAddress, type: "OFFICE" })
                  }
                >
                  <Building className="h-4 w-4 mr-1" />
                  ออฟฟิศ
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="bg-teal-500 hover:bg-teal-600"
                onClick={onSaveEditedAddress}
                disabled={
                  !newAddress.name ||
                  !newAddress.phone ||
                  !newAddress.address
                }
              >
                บันทึก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
