// src/app/profile/components/PersonTaxAddressSection.tsx

"use client";

import * as React from "react";
import clsx from "clsx";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationSelect from "./LocationSelect";
import type {
  PersonProfile,
  PostalCodeRaw,
  LocationOption,
  ProvinceItem,
  DistrictItem,
  SubDistrictItem,
} from "@/types/profile";

type Props = {
  person: PersonProfile;
  setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
  provinceId: number | null;
  districtId: number | null;
  subDistrictId: number | null;
  setProvinceId: (v: number | null) => void;
  setDistrictId: (v: number | null) => void;
  setSubDistrictId: (v: number | null) => void;
  fillFromPostal: (raw: PostalCodeRaw, scope: "ship" | "tax") => void;
  isShipEmpty: boolean;
  onCopyShipToTax: () => void;
};

export default function PersonTaxAddressSection({
  person,
  setPerson,
  provinceId,
  districtId,
  subDistrictId,
  setProvinceId,
  setDistrictId,
  setSubDistrictId,
  fillFromPostal,
  isShipEmpty,
  onCopyShipToTax,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="font-semibold text-base sm:text-lg">
          ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
        </h2>
        <button
          type="button"
          disabled={isShipEmpty}
          className={clsx(
            "inline-flex w-full sm:w-auto justify-center items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-all",
            "active:scale-[0.97] active:shadow-none",
            !isShipEmpty &&
              "bg-primary text-white border-primary shadow-sm hover:-translate-y-0.5 hover:shadow-md",
            isShipEmpty &&
              "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
          )}
          onClick={onCopyShipToTax}
        >
          <Copy className="h-3 w-3" />
          <span>ใช้ที่อยู่เดียวกับที่อยู่จัดส่งสินค้า</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
          <Input
            value={person.personTaxAddr ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personTaxAddr: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* จังหวัด */}
          <LocationSelect
            label="จังหวัด"
            endpoint="provinces"
            value={person.personTaxProvince ?? ""}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personTaxProvince: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
              const id = opt.raw?.id ?? null;
              setProvinceId(id);
              setDistrictId(null);
              setSubDistrictId(null);
              setPerson((p) => ({
                ...p,
                personTaxProvince: opt.label,
                personTaxCountry: "",
                personTaxDistric: "",
                personTaxPostcode: "",
              }));
            }}
          />
          {/* เขต/อำเภอ */}
          <LocationSelect
            label="เขต/อำเภอ"
            endpoint="districts"
            value={person.personTaxCountry ?? ""}
            provinceId={provinceId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personTaxCountry: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<DistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setDistrictId(id);
              setSubDistrictId(null);
              setPerson((p) => ({
                ...p,
                personTaxCountry: opt.label,
                personTaxDistric: "",
                personTaxPostcode: "",
              }));
            }}
          />
          {/* แขวง/ตำบล */}
          <LocationSelect
            label="แขวง/ตำบล"
            endpoint="sub-districts"
            value={person.personTaxDistric ?? ""}
            districtId={districtId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personTaxDistric: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setSubDistrictId(id);
              setPerson((p) => ({
                ...p,
                personTaxDistric: opt.label,
                personTaxPostcode: "",
              }));
            }}
          />
          {/* รหัสไปรษณีย์ */}
          <LocationSelect
            label="รหัสไปรษณีย์"
            endpoint="postal-codes"
            value={person.personTaxPostcode ?? ""}
            provinceId={provinceId ?? undefined}
            districtId={districtId ?? undefined}
            subDistrictId={subDistrictId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personTaxPostcode: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
              if (opt.raw) fillFromPostal(opt.raw, "tax");
            }}
          />
        </div>
      </div>
    </section>
  );
}
