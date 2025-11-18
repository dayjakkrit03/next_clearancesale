// src/app/profile/components/EntityTaxAddressSection.tsx

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationSelect from "./LocationSelect";
import type {
  EntityProfile,
  PostalCodeRaw,
  LocationOption,
  ProvinceItem,
  DistrictItem,
  SubDistrictItem,
} from "@/types/profile";

type Props = {
  entity: EntityProfile;
  setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
  provinceId: number | null;
  districtId: number | null;
  subDistrictId: number | null;
  setProvinceId: (v: number | null) => void;
  setDistrictId: (v: number | null) => void;
  setSubDistrictId: (v: number | null) => void;
  fillFromPostal: (raw: PostalCodeRaw, scope: "ship" | "tax") => void;
};

export default function EntityTaxAddressSection({
  entity,
  setEntity,
  provinceId,
  districtId,
  subDistrictId,
  setProvinceId,
  setDistrictId,
  setSubDistrictId,
  fillFromPostal,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-base sm:text-lg">
        ข้อมูลสำหรับออกใบกำกับภาษี
      </h2>
      <div className="space-y-4">
        <div>
          <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
          <Input
            value={entity.entityTaxId ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityTaxId: e.target.value,
              }))
            }
            maxLength={20}
          />
        </div>
        <div>
          <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
          <Input
            value={entity.entityTaxAddr ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityTaxAddr: e.target.value,
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
            value={entity.entityTaxProvince ?? ""}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityTaxProvince: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
              const id = opt.raw?.id ?? null;
              setProvinceId(id);
              setDistrictId(null);
              setSubDistrictId(null);
              setEntity((p) => ({
                ...p,
                entityTaxProvince: opt.label,
                entityTaxCountry: "",
                entityTaxDistric: "",
                entityTaxPostcode: "",
              }));
            }}
          />
          {/* เขต/อำเภอ */}
          <LocationSelect
            label="เขต/อำเภอ"
            endpoint="districts"
            value={entity.entityTaxCountry ?? ""}
            provinceId={provinceId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityTaxCountry: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<DistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setDistrictId(id);
              setSubDistrictId(null);
              setEntity((p) => ({
                ...p,
                entityTaxCountry: opt.label,
                entityTaxDistric: "",
                entityTaxPostcode: "",
              }));
            }}
          />
          {/* แขวง/ตำบล */}
          <LocationSelect
            label="แขวง/ตำบล"
            endpoint="sub-districts"
            value={entity.entityTaxDistric ?? ""}
            districtId={districtId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityTaxDistric: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setSubDistrictId(id);
              setEntity((p) => ({
                ...p,
                entityTaxDistric: opt.label,
                entityTaxPostcode: "",
              }));
            }}
          />
          {/* รหัสไปรษณีย์ */}
          <LocationSelect
            label="รหัสไปรษณีย์"
            endpoint="postal-codes"
            value={entity.entityTaxPostcode ?? ""}
            provinceId={provinceId ?? undefined}
            districtId={districtId ?? undefined}
            subDistrictId={subDistrictId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityTaxPostcode: val,
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
