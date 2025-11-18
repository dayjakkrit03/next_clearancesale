// src/app/profile/components/PersonShipAddressSection.tsx

"use client";

import * as React from "react";
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
};

export default function PersonShipAddressSection({
  person,
  setPerson,
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
        ที่อยู่สำหรับจัดส่งสินค้า
      </h2>
      <div className="space-y-4">
        <div>
          <Label>ที่อยู่</Label>
          <Input
            value={person.personShipAddr ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personShipAddr: e.target.value,
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
            value={person.personShipProvince ?? ""}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personShipProvince: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
              const id = opt.raw?.id ?? null;
              setProvinceId(id);
              setDistrictId(null);
              setSubDistrictId(null);
              setPerson((p) => ({
                ...p,
                personShipProvince: opt.label,
                personShipCountry: "",
                personShipDistric: "",
                personShipPostCode: "",
              }));
            }}
          />
          {/* เขต/อำเภอ */}
          <LocationSelect
            label="เขต/อำเภอ"
            endpoint="districts"
            value={person.personShipCountry ?? ""}
            provinceId={provinceId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personShipCountry: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<DistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setDistrictId(id);
              setSubDistrictId(null);
              setPerson((p) => ({
                ...p,
                personShipCountry: opt.label,
                personShipDistric: "",
                personShipPostCode: "",
              }));
            }}
          />
          {/* แขวง/ตำบล */}
          <LocationSelect
            label="แขวง/ตำบล"
            endpoint="sub-districts"
            value={person.personShipDistric ?? ""}
            districtId={districtId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personShipDistric: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setSubDistrictId(id);
              setPerson((p) => ({
                ...p,
                personShipDistric: opt.label,
                personShipPostCode: "",
              }));
            }}
          />
          {/* รหัสไปรษณีย์ */}
          <LocationSelect
            label="รหัสไปรษณีย์"
            endpoint="postal-codes"
            value={person.personShipPostCode ?? ""}
            provinceId={provinceId ?? undefined}
            districtId={districtId ?? undefined}
            subDistrictId={subDistrictId ?? undefined}
            onChange={(val) =>
              setPerson((p) => ({
                ...p,
                personShipPostCode: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
              if (opt.raw) fillFromPostal(opt.raw, "ship");
            }}
          />
        </div>
      </div>
    </section>
  );
}
