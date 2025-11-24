// src/app/checkout/component/CheckoutAddressSheet.tsx

"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Plus, Home, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  CheckoutAddress,
  CheckoutAddressTag,
} from "../checkout.types";
import CheckoutAddressList from "./CheckoutAddressList";

// ฟอร์มสำหรับเพิ่ม/แก้ไขที่อยู่
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
  setAddresses: Dispatch<SetStateAction<CheckoutAddress[]>>;
  setSelectedAddress: Dispatch<SetStateAction<CheckoutAddress>>;
  onClose: () => void;
};

export default function CheckoutAddressSheet({
  addresses,
  selectedAddress,
  setAddresses,
  setSelectedAddress,
  onClose,
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<CheckoutAddress | null>(null);

  const [newAddress, setNewAddress] = useState<NewAddressFormState>({
    type: "HOME",
    name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    subdistrict: "",
    zipcode: "",
  });

  const resetNewAddress = () =>
    setNewAddress({
      type: "HOME",
      name: "",
      phone: "",
      address: "",
      province: "",
      district: "",
      subdistrict: "",
      zipcode: "",
    });

  const handleSelectAddress = (address: CheckoutAddress) => {
    setSelectedAddress(address);
    onClose();
  };

  const handleSetDefault = (addressId: number) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );

    const newDefault = addresses.find((a) => a.id === addressId);
    if (newDefault) {
      setSelectedAddress(newDefault);
    }
  };

  const handleAddAddress = () => {
    const newAddr: CheckoutAddress = {
      id: addresses.length + 1,
      type: newAddress.type,
      name: newAddress.name,
      phone: newAddress.phone,
      address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
      isDefault: false,
    };

    setAddresses((prev) => [...prev, newAddr]);
    resetNewAddress();
    setIsAddDialogOpen(false);
  };

  const handleEditAddress = (address: CheckoutAddress) => {
    setEditingAddress(address);
    setNewAddress({
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address.split(",")[0],
      province: "กรุงเทพมหานคร",
      district: "Wang Thonglang",
      subdistrict: "Saphan Song",
      zipcode: "10310",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedAddress = () => {
    if (!editingAddress) return;

    const updated: CheckoutAddress = {
      ...editingAddress,
      type: newAddress.type,
      name: newAddress.name,
      phone: newAddress.phone,
      address: `${newAddress.address}, ${newAddress.subdistrict}, ${newAddress.zipcode}, ${newAddress.district}, ${newAddress.province}`,
    };

    setAddresses((prev) =>
      prev.map((addr) => (addr.id === editingAddress.id ? updated : addr))
    );

    if (selectedAddress.id === editingAddress.id) {
      setSelectedAddress(updated);
    }

    resetNewAddress();
    setEditingAddress(null);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>ที่อยู่จัดส่ง</SheetTitle>
      </SheetHeader>

      <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
        {/* Add address dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Plus className="h-4 w-4" />
              เพิ่มที่อยู่ใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>เพิ่มที่อยู่จัดส่งใหม่</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
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
                  <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
                  <Input
                    id="phone"
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
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
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
                  <Label htmlFor="province">จังหวัด</Label>
                  <Input
                    id="province"
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
                  <Label htmlFor="district">เขต/อำเภอ</Label>
                  <Input
                    id="district"
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
                  <Label htmlFor="subdistrict">แขวง/ตำบล</Label>
                  <Input
                    id="subdistrict"
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
                  <Label htmlFor="zipcode">รหัสไปรษณีย์</Label>
                  <Input
                    id="zipcode"
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
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={handleAddAddress}
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

        {/* Address list + edit dialog แยกไป component ย่อย */}
        <CheckoutAddressList
          addresses={addresses}
          selectedAddress={selectedAddress}
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          onSelectAddress={handleSelectAddress}
          onSetDefault={handleSetDefault}
          onEditAddress={handleEditAddress}
          onSaveEditedAddress={handleSaveEditedAddress}
        />
      </div>
    </>
  );
}
