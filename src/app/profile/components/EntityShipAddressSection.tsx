// src/app/profile/components/EntityShipAddressSection.tsx

"use client";

import * as React from "react";
import clsx from "clsx";
import { Copy } from "lucide-react";
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
  isTaxEmpty: boolean;
  onCopyTaxToShip: () => void;
};

export default function EntityShipAddressSection({
  entity,
  setEntity,
  provinceId,
  districtId,
  subDistrictId,
  setProvinceId,
  setDistrictId,
  setSubDistrictId,
  fillFromPostal,
  isTaxEmpty,
  onCopyTaxToShip,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="font-semibold text-base sm:text-lg">
          ที่อยู่สำหรับจัดส่งสินค้า
        </h2>
        <button
          type="button"
          disabled={isTaxEmpty}
          className={clsx(
            "inline-flex w-full sm:w-auto justify-center items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-all",
            "active:scale-[0.97] active:shadow-none",
            !isTaxEmpty &&
              "bg-primary text-white border-primary shadow-sm hover:-translate-y-0.5 hover:shadow-md",
            isTaxEmpty &&
              "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
          )}
          onClick={onCopyTaxToShip}
        >
          <Copy className="h-3 w-3" />
          <span>ใช้ที่อยู่เดียวกับสำหรับออกใบกำกับภาษี</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>ที่อยู่</Label>
          <Input
            value={entity.entityShipAddr ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityShipAddr: e.target.value,
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
            value={entity.entityShipProvince ?? ""}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityShipProvince: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
              const id = opt.raw?.id ?? null;
              setProvinceId(id);
              setDistrictId(null);
              setSubDistrictId(null);
              setEntity((p) => ({
                ...p,
                entityShipProvince: opt.label,
                entityShipCountry: "",
                entityShipDistric: "",
                entityShipPostCode: "",
              }));
            }}
          />
          {/* เขต/อำเภอ */}
          <LocationSelect
            label="เขต/อำเภอ"
            endpoint="districts"
            value={entity.entityShipCountry ?? ""}
            provinceId={provinceId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityShipCountry: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<DistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setDistrictId(id);
              setSubDistrictId(null);
              setEntity((p) => ({
                ...p,
                entityShipCountry: opt.label,
                entityShipDistric: "",
                entityShipPostCode: "",
              }));
            }}
          />
          {/* แขวง/ตำบล */}
          <LocationSelect
            label="แขวง/ตำบล"
            endpoint="sub-districts"
            value={entity.entityShipDistric ?? ""}
            districtId={districtId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityShipDistric: val,
              }))
            }
            onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
              const id = opt.raw?.id ?? null;
              setSubDistrictId(id);
              setEntity((p) => ({
                ...p,
                entityShipDistric: opt.label,
                entityShipPostCode: "",
              }));
            }}
          />
          {/* รหัสไปรษณีย์ */}
          <LocationSelect
            label="รหัสไปรษณีย์"
            endpoint="postal-codes"
            value={entity.entityShipPostCode ?? ""}
            provinceId={provinceId ?? undefined}
            districtId={districtId ?? undefined}
            subDistrictId={subDistrictId ?? undefined}
            onChange={(val) =>
              setEntity((p) => ({
                ...p,
                entityShipPostCode: val,
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
