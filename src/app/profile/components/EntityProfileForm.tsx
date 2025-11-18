// v.1.1.8 ==============================================
// src/app/profile/components/EntityProfileForm.tsx

"use client";

import * as React from "react";
import { useToast } from "@/components/ui/use-toast";
import type {
  EntityProfile,
  PostalCodeRaw,
} from "@/types/profile";

import EntityContactSection from "./EntityContactSection";
import EntityTaxAddressSection from "./EntityTaxAddressSection";
import EntityShipAddressSection from "./EntityShipAddressSection";

type Props = {
  entity: EntityProfile;
  setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
};

const isAddressEmpty = (addr: {
  addr?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postCode?: string;
}) => {
  return (
    !addr.addr &&
    !addr.province &&
    !addr.district &&
    !addr.subDistrict &&
    !addr.postCode
  );
};

export default function EntityProfileForm({ entity, setEntity }: Props) {
  const { toast, confirm } = useToast();

  // state id สำหรับ tax
  const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
  const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
  const [taxSubDistrictId, setTaxSubDistrictId] =
    React.useState<number | null>(null);

  // state id สำหรับ ship
  const [shipProvinceId, setShipProvinceId] =
    React.useState<number | null>(null);
  const [shipDistrictId, setShipDistrictId] =
    React.useState<number | null>(null);
  const [shipSubDistrictId, setShipSubDistrictId] =
    React.useState<number | null>(null);

  const isTaxEmpty = isAddressEmpty({
    addr: entity.entityTaxAddr,
    province: entity.entityTaxProvince,
    district: entity.entityTaxCountry,
    subDistrict: entity.entityTaxDistric,
    postCode: entity.entityTaxPostcode,
  });

  const isShipEmpty = isAddressEmpty({
    addr: entity.entityShipAddr,
    province: entity.entityShipProvince,
    district: entity.entityShipCountry,
    subDistrict: entity.entityShipDistric,
    postCode: entity.entityShipPostCode,
  });

  const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
    if (scope === "ship") {
      setEntity((p) => ({
        ...p,
        entityShipPostCode: String(raw.code),
        entityShipProvince: p.entityShipProvince || raw.provinceName,
        entityShipCountry: p.entityShipCountry || raw.districtName,
        entityShipDistric: p.entityShipDistric || raw.subDistrictName,
      }));
    } else {
      setEntity((p) => ({
        ...p,
        entityTaxPostcode: String(raw.code),
        entityTaxProvince: p.entityTaxProvince || raw.provinceName,
        entityTaxCountry: p.entityTaxCountry || raw.districtName,
        entityTaxDistric: p.entityTaxDistric || raw.subDistrictName,
      }));
    }
  };

  /* ===== helper: คัดลอกจากที่อยู่ออกใบกำกับภาษี → ที่อยู่จัดส่ง ===== */
  const copyTaxToShip = async () => {
    if (isTaxEmpty) {
      toast({
        variant: "destructive",
        title: "ไม่สามารถคัดลอกที่อยู่ได้",
        description: "กรุณากรอกข้อมูลสำหรับออกใบกำกับภาษีก่อน",
      });
      return;
    }

    const shipHadData = !isShipEmpty;

    if (shipHadData) {
      const ok = await confirm({
        title: "ยืนยันคัดลอกที่อยู่",
        description:
          "ข้อมูลที่อยู่สำหรับจัดส่งสินค้าเดิมจะถูกแทนที่ทั้งหมดด้วยข้อมูลสำหรับออกใบกำกับภาษี\nคุณต้องการดำเนินการต่อหรือไม่?",
        confirmText: "คัดลอกที่อยู่",
        cancelText: "ยกเลิก",
        variant: "destructive",
      });

      if (!ok) return;
    }

    setEntity((p) => ({
      ...p,
      entityShipAddr: p.entityTaxAddr || "",
      entityShipProvince: p.entityTaxProvince || "",
      entityShipCountry: p.entityTaxCountry || "",
      entityShipDistric: p.entityTaxDistric || "",
      entityShipPostCode: p.entityTaxPostcode || "",
    }));

    setShipProvinceId(taxProvinceId);
    setShipDistrictId(taxDistrictId);
    setShipSubDistrictId(taxSubDistrictId);

    toast({
      title: "คัดลอกที่อยู่เรียบร้อย",
      description:
        "ระบบได้นำข้อมูลสำหรับออกใบกำกับภาษีไปใช้เป็นที่อยู่สำหรับจัดส่งสินค้าให้แล้ว",
    });
  };

  return (
    <div className="space-y-8">
      <EntityContactSection entity={entity} setEntity={setEntity} />

      <EntityTaxAddressSection
        entity={entity}
        setEntity={setEntity}
        provinceId={taxProvinceId}
        districtId={taxDistrictId}
        subDistrictId={taxSubDistrictId}
        setProvinceId={setTaxProvinceId}
        setDistrictId={setTaxDistrictId}
        setSubDistrictId={setTaxSubDistrictId}
        fillFromPostal={fillFromPostal}
      />

      <EntityShipAddressSection
        entity={entity}
        setEntity={setEntity}
        provinceId={shipProvinceId}
        districtId={shipDistrictId}
        subDistrictId={shipSubDistrictId}
        setProvinceId={setShipProvinceId}
        setDistrictId={setShipDistrictId}
        setSubDistrictId={setShipSubDistrictId}
        fillFromPostal={fillFromPostal}
        isTaxEmpty={isTaxEmpty}
        onCopyTaxToShip={copyTaxToShip}
      />
    </div>
  );
}

// v.1.1.8 ==============================================


// v.1.1.7 ==============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import clsx from "clsx";
// import { Copy } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import { useToast } from "@/components/ui/use-toast";
// import type {
//   EntityProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// const isAddressEmpty = (addr: {
//   addr?: string;
//   province?: string;
//   district?: string;
//   subDistrict?: string;
//   postCode?: string;
// }) => {
//   return (
//     !addr.addr &&
//     !addr.province &&
//     !addr.district &&
//     !addr.subDistrict &&
//     !addr.postCode
//   );
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   const { toast, confirm } = useToast();

//   // state id สำหรับ tax + ship
//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   const [shipProvinceId, setShipProvinceId] =
//     React.useState<number | null>(null);
//   const [shipDistrictId, setShipDistrictId] =
//     React.useState<number | null>(null);
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const isTaxEmpty = isAddressEmpty({
//     addr: entity.entityTaxAddr,
//     province: entity.entityTaxProvince,
//     district: entity.entityTaxCountry,
//     subDistrict: entity.entityTaxDistric,
//     postCode: entity.entityTaxPostcode,
//   });

//   const isShipEmpty = isAddressEmpty({
//     addr: entity.entityShipAddr,
//     province: entity.entityShipProvince,
//     district: entity.entityShipCountry,
//     subDistrict: entity.entityShipDistric,
//     postCode: entity.entityShipPostCode,
//   });

//   const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
//     if (scope === "ship") {
//       setEntity((p) => ({
//         ...p,
//         entityShipPostCode: String(raw.code),
//         entityShipProvince: p.entityShipProvince || raw.provinceName,
//         entityShipCountry: p.entityShipCountry || raw.districtName,
//         entityShipDistric: p.entityShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setEntity((p) => ({
//         ...p,
//         entityTaxPostcode: String(raw.code),
//         entityTaxProvince: p.entityTaxProvince || raw.provinceName,
//         entityTaxCountry: p.entityTaxCountry || raw.districtName,
//         entityTaxDistric: p.entityTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   /* ===== helper: คัดลอกจากที่อยู่ออกใบกำกับภาษี → ที่อยู่จัดส่ง ===== */
//   const copyTaxToShip = async () => {
//     if (isTaxEmpty) {
//       toast({
//         variant: "destructive",
//         title: "ไม่สามารถคัดลอกที่อยู่ได้",
//         description: "กรุณากรอกข้อมูลสำหรับออกใบกำกับภาษีก่อน",
//       });
//       return;
//     }

//     const shipHadData = !isShipEmpty;

//     if (shipHadData) {
//       const ok = await confirm({
//         title: "ยืนยันคัดลอกที่อยู่",
//         description:
//           "ข้อมูลที่อยู่สำหรับจัดส่งสินค้าเดิมจะถูกแทนที่ทั้งหมดด้วยข้อมูลสำหรับออกใบกำกับภาษี\nคุณต้องการดำเนินการต่อหรือไม่?",
//         confirmText: "คัดลอกที่อยู่",
//         cancelText: "ยกเลิก",
//         variant: "destructive",
//       });

//       if (!ok) return;
//     }

//     setEntity((p) => ({
//       ...p,
//       entityShipAddr: p.entityTaxAddr || "",
//       entityShipProvince: p.entityTaxProvince || "",
//       entityShipCountry: p.entityTaxCountry || "",
//       entityShipDistric: p.entityTaxDistric || "",
//       entityShipPostCode: p.entityTaxPostcode || "",
//     }));

//     setShipProvinceId(taxProvinceId);
//     setShipDistrictId(taxDistrictId);
//     setShipSubDistrictId(taxSubDistrictId);

//     toast({
//       title: "คัดลอกที่อยู่เรียบร้อย",
//       description:
//         "ระบบได้นำข้อมูลสำหรับออกใบกำกับภาษีไปใช้เป็นที่อยู่สำหรับจัดส่งสินค้าให้แล้ว",
//     });
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: opt.label,
//                   entityTaxCountry: "",
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: opt.label,
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: opt.label,
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <h2 className="font-semibold text-base sm:text-lg">
//             ที่อยู่สำหรับจัดส่งสินค้า
//           </h2>
//           <button
//             type="button"
//             disabled={isTaxEmpty}
//             className={clsx(
//               "inline-flex w-full sm:w-auto justify-center items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-all",
//               "active:scale-[0.97] active:shadow-none",
//               !isTaxEmpty &&
//                 "bg-primary text-white border-primary shadow-sm hover:-translate-y-0.5 hover:shadow-md",
//               isTaxEmpty &&
//                 "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
//             )}
//             onClick={copyTaxToShip}
//           >
//             <Copy className="h-3 w-3" />
//             <span>ใช้ที่อยู่เดียวกับสำหรับออกใบกำกับภาษี</span>
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: opt.label,
//                   entityShipCountry: "",
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: opt.label,
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: opt.label,
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.7 ==============================================

// v.1.1.6 ==============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import clsx from "clsx";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type {
//   EntityProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   // state id สำหรับ tax + ship
//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   const [shipProvinceId, setShipProvinceId] =
//     React.useState<number | null>(null);
//   const [shipDistrictId, setShipDistrictId] =
//     React.useState<number | null>(null);
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
//     if (scope === "ship") {
//       setEntity((p) => ({
//         ...p,
//         entityShipPostCode: String(raw.code),
//         entityShipProvince: p.entityShipProvince || raw.provinceName,
//         entityShipCountry: p.entityShipCountry || raw.districtName,
//         entityShipDistric: p.entityShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setEntity((p) => ({
//         ...p,
//         entityTaxPostcode: String(raw.code),
//         entityTaxProvince: p.entityTaxProvince || raw.provinceName,
//         entityTaxCountry: p.entityTaxCountry || raw.districtName,
//         entityTaxDistric: p.entityTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   /* ===== helper: คัดลอกจากที่อยู่ออกใบกำกับภาษี → ที่อยู่จัดส่ง ===== */

//   const isAddressEmpty = (addr: {
//         addr?: string;
//         province?: string;
//         district?: string;
//         subDistrict?: string;
//         postCode?: string;
//     }) => {
//         return !addr.addr && !addr.province && !addr.district && !addr.subDistrict && !addr.postCode;
//   };

//   const isTaxEmpty = isAddressEmpty({
//     addr: entity.entityTaxAddr,
//     province: entity.entityTaxProvince,
//     district: entity.entityTaxCountry,
//     subDistrict: entity.entityTaxDistric,
//     postCode: entity.entityTaxPostcode,
//   });

//   const copyTaxToShip = () => {
//     const shipEmpty = isAddressEmpty({
//         addr: entity.entityShipAddr,
//         province: entity.entityShipProvince,
//         district: entity.entityShipCountry,
//         subDistrict: entity.entityShipDistric,
//         postCode: entity.entityShipPostCode,
//     });

//     // ถ้าปลายทางมีข้อมูล → confirm
//     if (!shipEmpty) {
//         const ok = window.confirm(
//         "ข้อมูลที่อยู่จัดส่งเดิมจะถูกแทนที่ทั้งหมด\nคุณต้องการคัดลอกจากข้อมูลภาษีหรือไม่?"
//         );
//         if (!ok) return;
//     }

//     setEntity((p) => ({
//         ...p,
//         entityShipAddr: p.entityTaxAddr || "",
//         entityShipProvince: p.entityTaxProvince || "",
//         entityShipCountry: p.entityTaxCountry || "",
//         entityShipDistric: p.entityTaxDistric || "",
//         entityShipPostCode: p.entityTaxPostcode || "",
//     }));

//     setShipProvinceId(taxProvinceId);
//     setShipDistrictId(taxDistrictId);
//     setShipSubDistrictId(taxSubDistrictId);
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: opt.label,
//                   entityTaxCountry: "",
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: opt.label,
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: opt.label,
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <h2 className="font-semibold text-base sm:text-lg">
//             ที่อยู่สำหรับจัดส่งสินค้า
//           </h2>
//           <button
//             type="button"
//             disabled={isTaxEmpty}
//             className={clsx(
//                 "text-xs sm:text-sm underline underline-offset-2",
//                 isTaxEmpty ? "text-gray-300 cursor-not-allowed" : "text-primary"
//             )}
//             onClick={copyTaxToShip}
//             >
//             ใช้ที่อยู่เดียวกับสำหรับออกใบกำกับภาษี
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: opt.label,
//                   entityShipCountry: "",
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: opt.label,
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: opt.label,
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.6 ==============================================

// v.1.1.5 ==============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type {
//   EntityProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   // state id สำหรับ tax + ship
//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   const [shipProvinceId, setShipProvinceId] =
//     React.useState<number | null>(null);
//   const [shipDistrictId, setShipDistrictId] =
//     React.useState<number | null>(null);
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const fillFromPostal = (
//     raw: PostalCodeRaw,
//     scope: "ship" | "tax"
//   ) => {
//     if (scope === "ship") {
//       setEntity((p) => ({
//         ...p,
//         entityShipPostCode: String(raw.code),
//         entityShipProvince: p.entityShipProvince || raw.provinceName,
//         entityShipCountry: p.entityShipCountry || raw.districtName,
//         entityShipDistric: p.entityShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setEntity((p) => ({
//         ...p,
//         entityTaxPostcode: String(raw.code),
//         entityTaxProvince: p.entityTaxProvince || raw.provinceName,
//         entityTaxCountry: p.entityTaxCountry || raw.districtName,
//         entityTaxDistric: p.entityTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<ProvinceItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: opt.label,
//                   entityTaxCountry: "",
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<DistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: opt.label,
//                   entityTaxDistric: "",
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<SubDistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: opt.label,
//                   entityTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<PostalCodeRaw>
//               ) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ที่อยู่สำหรับจัดส่งสินค้า
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* จังหวัด */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<ProvinceItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: opt.label,
//                   entityShipCountry: "",
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<DistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: opt.label,
//                   entityShipDistric: "",
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<SubDistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: opt.label,
//                   entityShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<PostalCodeRaw>
//               ) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.5 ==============================================

// v.1.1.4 ==============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect  from './LocationSelect' // นี่คือ named import
// import type {
//   EntityProfile,
//   PostalCodeRaw,
//   LocationOption,
// } from "@/types/profile";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   const fillFromPostal = (
//     raw: PostalCodeRaw,
//     scope: "ship" | "tax"
//   ) => {
//     if (scope === "ship") {
//       setEntity((p) => ({
//         ...p,
//         entityShipPostCode: String(raw.code),
//         entityShipProvince: raw.provinceName,
//         entityShipCountry: raw.districtName,
//         entityShipDistric: raw.subDistrictName,
//       }));
//     } else {
//       setEntity((p) => ({
//         ...p,
//         entityTaxPostcode: String(raw.code),
//         entityTaxProvince: raw.provinceName,
//         entityTaxCountry: raw.districtName,
//         entityTaxDistric: raw.subDistrictName,
//       }));
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* ✅ ลำดับ จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ที่อยู่สำหรับจัดส่งสินค้า
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* ✅ ลำดับ จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.4 ==============================================

// v.1.1.3 ===============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type { EntityProfile, PostalCodeRaw, LocationOption } from "@/types/profile";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   /* helper สำหรับเวลาเลือก postal code → auto-fill field อื่น ๆ */
//   const applyPostalCodeToTax = (opt: LocationOption<PostalCodeRaw>) => {
//     const raw = opt.raw;
//     if (!raw) return;

//     setEntity((prev) => ({
//       ...prev,
//       // รหัสไปรษณีย์เก็บเป็นตัวเลขล้วนจาก code
//       entityTaxPostcode: raw.code?.toString() ?? prev.entityTaxPostcode,
//       // auto-fill ชื่อที่เหลือ ถ้ามีข้อมูล
//       entityTaxDistric: raw.subDistrictName ?? prev.entityTaxDistric,
//       entityTaxCountry: raw.districtName ?? prev.entityTaxCountry,
//       entityTaxProvince: raw.provinceName ?? prev.entityTaxProvince,
//     }));
//   };

//   const applyPostalCodeToShip = (opt: LocationOption<PostalCodeRaw>) => {
//     const raw = opt.raw;
//     if (!raw) return;

//     setEntity((prev) => ({
//       ...prev,
//       entityShipPostCode: raw.code?.toString() ?? prev.entityShipPostCode,
//       entityShipDistric: raw.subDistrictName ?? prev.entityShipDistric,
//       entityShipCountry: raw.districtName ?? prev.entityShipCountry,
//       entityShipProvince: raw.provinceName ?? prev.entityShipProvince,
//     }));
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม</Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   // ถ้าพิมพ์เองให้เก็บตามที่พิมพ์
//                   entityTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt) => applyPostalCodeToTax(opt as LocationOption<PostalCodeRaw>)}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ที่อยู่สำหรับจัดส่งสินค้า
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt) => applyPostalCodeToShip(opt as LocationOption<PostalCodeRaw>)}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/profile/components/EntityProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type { EntityProfile } from "../profile.types";

// type Props = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({ entity, setEntity }: Props) {
//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ข้อมูลภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityTaxDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityTaxCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityTaxProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxPostcode: val,
//                 }))
//               }
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ที่อยู่สำหรับจัดส่งสินค้า
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={entity.entityShipDistric ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={entity.entityShipCountry ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={entity.entityShipProvince ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={entity.entityShipPostCode ?? ""}
//               onChange={(val) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipPostCode: val,
//                 }))
//               }
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.2 ===============================================

// // src/app/profile/components/EntityProfileForm.tsx

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import type { EntityProfile } from "../profile.types";

// type EntityProfileFormProps = {
//   entity: EntityProfile;
//   setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
// };

// export default function EntityProfileForm({
//   entity,
//   setEntity,
// }: EntityProfileFormProps) {
//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (นิติบุคคล)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//             <Input
//               value={entity.entityCompanyName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//             <Input
//               value={entity.entityCustomerName ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityCustomerName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={entity.entityTel ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={entity.entityMail ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>
//               รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//             </Label>
//             <Input
//               value={entity.entityContactMore ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่ภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//             <Input
//               value={entity.entityTaxId ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxId: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={entity.entityTaxAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <Label>แขวง/ตำบล</Label>
//               <Input
//                 value={entity.entityTaxDistric ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityTaxDistric: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>เขต/อำเภอ</Label>
//               <Input
//                 value={entity.entityTaxCountry ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityTaxCountry: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>จังหวัด</Label>
//               <Input
//                 value={entity.entityTaxProvince ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityTaxProvince: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>รหัสไปรษณีย์</Label>
//               <Input
//                 value={entity.entityTaxPostcode ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityTaxPostcode: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่จัดส่ง */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ที่อยู่สำหรับจัดส่งสินค้า
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่</Label>
//             <Input
//               value={entity.entityShipAddr ?? ""}
//               onChange={(e) =>
//                 setEntity((p) => ({
//                   ...p,
//                   entityShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <Label>แขวง/ตำบล</Label>
//               <Input
//                 value={entity.entityShipDistric ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityShipDistric: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>เขต/อำเภอ</Label>
//               <Input
//                 value={entity.entityShipCountry ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityShipCountry: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>จังหวัด</Label>
//               <Input
//                 value={entity.entityShipProvince ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityShipProvince: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>รหัสไปรษณีย์</Label>
//               <Input
//                 value={entity.entityShipPostCode ?? ""}
//                 onChange={(e) =>
//                   setEntity((p) => ({
//                     ...p,
//                     entityShipPostCode: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
