// v.1.1.8 ===============================================
// src/app/profile/components/PersonProfileForm.tsx

"use client";

import * as React from "react";
import { useToast } from "@/components/ui/use-toast";
import type {
  PersonProfile,
  PostalCodeRaw,
} from "@/types/profile";

import PersonContactSection from "./PersonContactSection";
import PersonShipAddressSection from "./PersonShipAddressSection";
import PersonTaxAddressSection from "./PersonTaxAddressSection";

type Props = {
  person: PersonProfile;
  setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
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

export default function PersonProfileForm({ person, setPerson }: Props) {
  const { toast, confirm } = useToast();

  // ===== state id สำหรับ ship =====
  const [shipProvinceId, setShipProvinceId] = React.useState<number | null>(
    null
  );
  const [shipDistrictId, setShipDistrictId] = React.useState<number | null>(
    null
  );
  const [shipSubDistrictId, setShipSubDistrictId] =
    React.useState<number | null>(null);

  // ===== state id สำหรับ tax =====
  const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
  const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
  const [taxSubDistrictId, setTaxSubDistrictId] =
    React.useState<number | null>(null);

  const isShipEmpty = isAddressEmpty({
    addr: person.personShipAddr,
    province: person.personShipProvince,
    district: person.personShipCountry,
    subDistrict: person.personShipDistric,
    postCode: person.personShipPostCode,
  });

  const isTaxEmpty = isAddressEmpty({
    addr: person.personTaxAddr,
    province: person.personTaxProvince,
    district: person.personTaxCountry,
    subDistrict: person.personTaxDistric,
    postCode: person.personTaxPostcode,
  });

  /* ===== auto-fill postcode ===== */
  const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
    if (scope === "ship") {
      setPerson((p) => ({
        ...p,
        personShipPostCode: String(raw.code),
        personShipProvince: p.personShipProvince || raw.provinceName,
        personShipCountry: p.personShipCountry || raw.districtName,
        personShipDistric: p.personShipDistric || raw.subDistrictName,
      }));
    } else {
      setPerson((p) => ({
        ...p,
        personTaxPostcode: String(raw.code),
        personTaxProvince: p.personTaxProvince || raw.provinceName,
        personTaxCountry: p.personTaxCountry || raw.districtName,
        personTaxDistric: p.personTaxDistric || raw.subDistrictName,
      }));
    }
  };

  /* ===== copy ship -> tax (มี confirm ถ้าทับข้อมูลเดิม) ===== */
  const copyShipToTax = async () => {
    if (isShipEmpty) {
      toast({
        variant: "destructive",
        title: "ไม่สามารถคัดลอกที่อยู่ได้",
        description: "กรุณากรอกที่อยู่สำหรับจัดส่งสินค้าก่อน",
      });
      return;
    }

    const taxHadData = !isTaxEmpty;

    if (taxHadData) {
      const ok = await confirm({
        title: "ยืนยันคัดลอกที่อยู่",
        description:
          "ข้อมูลที่อยู่ออกใบกำกับภาษีเดิมจะถูกแทนที่ทั้งหมดด้วยที่อยู่สำหรับจัดส่งสินค้า\nคุณต้องการดำเนินการต่อหรือไม่?",
        confirmText: "คัดลอกที่อยู่",
        cancelText: "ยกเลิก",
        variant: "destructive",
      });

      if (!ok) return;
    }

    setPerson((p) => ({
      ...p,
      personTaxAddr: p.personShipAddr || "",
      personTaxProvince: p.personShipProvince || "",
      personTaxCountry: p.personShipCountry || "",
      personTaxDistric: p.personShipDistric || "",
      personTaxPostcode: p.personShipPostCode || "",
    }));

    // sync id ให้ tax section
    setTaxProvinceId(shipProvinceId);
    setTaxDistrictId(shipDistrictId);
    setTaxSubDistrictId(shipSubDistrictId);

    toast({
      title: "คัดลอกที่อยู่เรียบร้อย",
      description:
        "ระบบได้นำที่อยู่จัดส่งสินค้าไปใช้เป็นที่อยู่ออกใบกำกับภาษีให้แล้ว",
    });
  };

  return (
    <div className="space-y-8">
      <PersonContactSection person={person} setPerson={setPerson} />

      <PersonShipAddressSection
        person={person}
        setPerson={setPerson}
        provinceId={shipProvinceId}
        districtId={shipDistrictId}
        subDistrictId={shipSubDistrictId}
        setProvinceId={setShipProvinceId}
        setDistrictId={setShipDistrictId}
        setSubDistrictId={setShipSubDistrictId}
        fillFromPostal={fillFromPostal}
      />

      <PersonTaxAddressSection
        person={person}
        setPerson={setPerson}
        provinceId={taxProvinceId}
        districtId={taxDistrictId}
        subDistrictId={taxSubDistrictId}
        setProvinceId={setTaxProvinceId}
        setDistrictId={setTaxDistrictId}
        setSubDistrictId={setTaxSubDistrictId}
        fillFromPostal={fillFromPostal}
        isShipEmpty={isShipEmpty}
        onCopyShipToTax={copyShipToTax}
      />
    </div>
  );
}

// v.1.1.8 ===============================================

// v.1.1.7 ===============================================
// // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import clsx from "clsx";
// import { Copy } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/components/ui/use-toast";
// import LocationSelect from "./LocationSelect";
// import type {
//   PersonProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
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

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   const { toast, confirm } = useToast();

//   // ===== state id =====
//   const [shipProvinceId, setShipProvinceId] = React.useState<number | null>(
//     null
//   );
//   const [shipDistrictId, setShipDistrictId] = React.useState<number | null>(
//     null
//   );
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   const isShipEmpty = isAddressEmpty({
//     addr: person.personShipAddr,
//     province: person.personShipProvince,
//     district: person.personShipCountry,
//     subDistrict: person.personShipDistric,
//     postCode: person.personShipPostCode,
//   });

//   const isTaxEmpty = isAddressEmpty({
//     addr: person.personTaxAddr,
//     province: person.personTaxProvince,
//     district: person.personTaxCountry,
//     subDistrict: person.personTaxDistric,
//     postCode: person.personTaxPostcode,
//   });

//   /* ===== auto-fill postcode ===== */
//   const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
//     if (scope === "ship") {
//       setPerson((p) => ({
//         ...p,
//         personShipPostCode: String(raw.code),
//         personShipProvince: p.personShipProvince || raw.provinceName,
//         personShipCountry: p.personShipCountry || raw.districtName,
//         personShipDistric: p.personShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setPerson((p) => ({
//         ...p,
//         personTaxPostcode: String(raw.code),
//         personTaxProvince: p.personTaxProvince || raw.provinceName,
//         personTaxCountry: p.personTaxCountry || raw.districtName,
//         personTaxDistric: p.personTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   /* ===== copy ship -> tax (มี confirm ถ้าทับข้อมูลเดิม) ===== */
//   const copyShipToTax = async () => {
//     if (isShipEmpty) {
//       toast({
//         variant: "destructive",
//         title: "ไม่สามารถคัดลอกที่อยู่ได้",
//         description: "กรุณากรอกที่อยู่สำหรับจัดส่งสินค้าก่อน",
//       });
//       return;
//     }

//     const taxHadData = !isTaxEmpty;

//     if (taxHadData) {
//       const ok = await confirm({
//         title: "ยืนยันคัดลอกที่อยู่",
//         description:
//           "ข้อมูลที่อยู่ออกใบกำกับภาษีเดิมจะถูกแทนที่ทั้งหมดด้วยที่อยู่สำหรับจัดส่งสินค้า\nคุณต้องการดำเนินการต่อหรือไม่?",
//         confirmText: "คัดลอกที่อยู่",
//         cancelText: "ยกเลิก",
//         variant: "destructive",
//       });

//       if (!ok) return;
//     }

//     setPerson((p) => ({
//       ...p,
//       personTaxAddr: p.personShipAddr || "",
//       personTaxProvince: p.personShipProvince || "",
//       personTaxCountry: p.personShipCountry || "",
//       personTaxDistric: p.personShipDistric || "",
//       personTaxPostcode: p.personShipPostCode || "",
//     }));

//     setTaxProvinceId(shipProvinceId);
//     setTaxDistrictId(shipDistrictId);
//     setTaxSubDistrictId(shipSubDistrictId);

//     toast({
//       title: "คัดลอกที่อยู่เรียบร้อย",
//       description:
//         "ระบบได้นำที่อยู่จัดส่งสินค้าไปใช้เป็นที่อยู่ออกใบกำกับภาษีให้แล้ว",
//     });
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: opt.label,
//                   personShipCountry: "",
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: opt.label,
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: opt.label,
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่ออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//           <h2 className="font-semibold text-base sm:text-lg">
//             ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//           </h2>
//           <button
//             type="button"
//             disabled={isShipEmpty}
//             className={clsx(
//               "inline-flex w-full sm:w-auto justify-center items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-all",
//               "active:scale-[0.97] active:shadow-none",
//               !isShipEmpty &&
//                 "bg-primary text-white border-primary shadow-sm hover:-translate-y-0.5 hover:shadow-md",
//               isShipEmpty &&
//                 "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
//             )}
//             onClick={copyShipToTax}
//           >
//             <Copy className="h-3 w-3" />
//             <span>ใช้ที่อยู่เดียวกับที่อยู่จัดส่งสินค้า</span>
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: opt.label,
//                   personTaxCountry: "",
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: opt.label,
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: opt.label,
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.7 ===============================================

// v.1.1.6 ===============================================
// // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import clsx from "clsx";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type {
//   PersonProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   // ===== state สำหรับเก็บ id (ใช้ filter API เท่านั้น ไม่ส่งเข้า DB) =====
//   const [shipProvinceId, setShipProvinceId] = React.useState<number | null>(
//     null
//   );
//   const [shipDistrictId, setShipDistrictId] = React.useState<number | null>(
//     null
//   );
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   /* ===== helper: auto-fill จากรหัสไปรษณีย์ (เฉพาะ field ที่ยังว่าง) ===== */
//   const fillFromPostal = (raw: PostalCodeRaw, scope: "ship" | "tax") => {
//     if (scope === "ship") {
//       setPerson((p) => ({
//         ...p,
//         personShipPostCode: String(raw.code),
//         personShipProvince: p.personShipProvince || raw.provinceName,
//         personShipCountry: p.personShipCountry || raw.districtName, // Laravel ใช้ Country = อำเภอ
//         personShipDistric: p.personShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setPerson((p) => ({
//         ...p,
//         personTaxPostcode: String(raw.code),
//         personTaxProvince: p.personTaxProvince || raw.provinceName,
//         personTaxCountry: p.personTaxCountry || raw.districtName,
//         personTaxDistric: p.personTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   /* ===== helper: คัดลอกจากที่อยู่จัดส่ง → ที่อยู่ออกใบกำกับภาษี ===== */
//   const isAddressEmpty = (addr: {
//         addr?: string;
//         province?: string;
//         district?: string;
//         subDistrict?: string;
//         postCode?: string;
//     }) => {
//         return !addr.addr && !addr.province && !addr.district && !addr.subDistrict && !addr.postCode;
//   };

//   const isShipEmpty = isAddressEmpty({
//     addr: person.personShipAddr,
//     province: person.personShipProvince,
//     district: person.personShipCountry,
//     subDistrict: person.personShipDistric,
//     postCode: person.personShipPostCode,
//   });

// const copyShipToTax = () => {
//   const taxEmpty = isAddressEmpty({
//     addr: person.personTaxAddr,
//     province: person.personTaxProvince,
//     district: person.personTaxCountry,
//     subDistrict: person.personTaxDistric,
//     postCode: person.personTaxPostcode,
//   });

//   // ถ้าปลายทางมีข้อมูล → ต้องขอ confirm
//   if (!taxEmpty) {
//     const ok = window.confirm(
//       "ข้อมูลที่อยู่ออกใบกำกับภาษีเดิมจะถูกแทนที่ทั้งหมด\nคุณต้องการคัดลอกจากที่อยู่จัดส่งหรือไม่?"
//     );
//     if (!ok) return;
//   }

//   // คัดลอก
//   setPerson((p) => ({
//     ...p,
//     personTaxAddr: p.personShipAddr || "",
//     personTaxProvince: p.personShipProvince || "",
//     personTaxCountry: p.personShipCountry || "",
//     personTaxDistric: p.personShipDistric || "",
//     personTaxPostcode: p.personShipPostCode || "",
//   }));

//   setTaxProvinceId(shipProvinceId);
//   setTaxDistrictId(shipDistrictId);
//   setTaxSubDistrictId(shipSubDistrictId);
// };


//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
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
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: opt.label,
//                   personShipCountry: "",
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: opt.label,
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: opt.label,
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <div className="flex items-center justify-between gap-2">
//           <h2 className="font-semibold text-base sm:text-lg">
//             ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//           </h2>
//           <button
//             type="button"
//             disabled={isShipEmpty}
//             className={clsx(
//                 "text-xs sm:text-sm underline underline-offset-2",
//                 isShipEmpty ? "text-gray-300 cursor-not-allowed" : "text-primary"
//             )}
//             onClick={copyShipToTax}
//             >
//             ใช้ที่อยู่เดียวกับที่อยู่จัดส่งสินค้า
//            </button>

//         </div>

//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
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
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<ProvinceItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: opt.label,
//                   personTaxCountry: "",
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<DistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: opt.label,
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<SubDistrictItem>) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: opt.label,
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.6 ===============================================

// v.1.1.5 ===============================================
// // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type {
//   PersonProfile,
//   PostalCodeRaw,
//   LocationOption,
//   ProvinceItem,
//   DistrictItem,
//   SubDistrictItem,
// } from "@/types/profile";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   // ===== state สำหรับเก็บ id (ใช้ filter API เท่านั้น ไม่ส่งเข้า DB) =====
//   const [shipProvinceId, setShipProvinceId] = React.useState<number | null>(
//     null
//   );
//   const [shipDistrictId, setShipDistrictId] = React.useState<number | null>(
//     null
//   );
//   const [shipSubDistrictId, setShipSubDistrictId] =
//     React.useState<number | null>(null);

//   const [taxProvinceId, setTaxProvinceId] = React.useState<number | null>(null);
//   const [taxDistrictId, setTaxDistrictId] = React.useState<number | null>(null);
//   const [taxSubDistrictId, setTaxSubDistrictId] =
//     React.useState<number | null>(null);

//   /* ===== helper: auto-fill จากรหัสไปรษณีย์ (เฉพาะ field ที่ยังว่าง) ===== */
//   const fillFromPostal = (
//     raw: PostalCodeRaw,
//     scope: "ship" | "tax"
//   ) => {
//     if (scope === "ship") {
//       setPerson((p) => ({
//         ...p,
//         personShipPostCode: String(raw.code),
//         personShipProvince: p.personShipProvince || raw.provinceName,
//         personShipCountry: p.personShipCountry || raw.districtName, // Laravel ใช้ Country = อำเภอ
//         personShipDistric: p.personShipDistric || raw.subDistrictName,
//       }));
//     } else {
//       setPerson((p) => ({
//         ...p,
//         personTaxPostcode: String(raw.code),
//         personTaxProvince: p.personTaxProvince || raw.provinceName,
//         personTaxCountry: p.personTaxCountry || raw.districtName,
//         personTaxDistric: p.personTaxDistric || raw.subDistrictName,
//       }));
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
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
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<ProvinceItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipProvinceId(id);
//                 setShipDistrictId(null);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: opt.label,
//                   personShipCountry: "",
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<DistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipDistrictId(id);
//                 setShipSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: opt.label,
//                   personShipDistric: "",
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               districtId={shipDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<SubDistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setShipSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: opt.label,
//                   personShipPostCode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               provinceId={shipProvinceId ?? undefined}
//               districtId={shipDistrictId ?? undefined}
//               subDistrictId={shipSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipPostCode: val,
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

//       {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
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
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<ProvinceItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxProvinceId(id);
//                 setTaxDistrictId(null);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: opt.label,
//                   personTaxCountry: "",
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* เขต/อำเภอ */}
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<DistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxDistrictId(id);
//                 setTaxSubDistrictId(null);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: opt.label,
//                   personTaxDistric: "",
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* แขวง/ตำบล */}
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               districtId={taxDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: val,
//                 }))
//               }
//               onOptionSelected={(
//                 opt: LocationOption<SubDistrictItem>
//               ) => {
//                 const id = opt.raw?.id ?? null;
//                 setTaxSubDistrictId(id);
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: opt.label,
//                   personTaxPostcode: "",
//                 }));
//               }}
//             />
//             {/* รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               provinceId={taxProvinceId ?? undefined}
//               districtId={taxDistrictId ?? undefined}
//               subDistrictId={taxSubDistrictId ?? undefined}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxPostcode: val,
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
//     </div>
//   );
// }

// v.1.1.5 ===============================================

// v.1.1.4 ===============================================
// // // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type {
//   PersonProfile,
//   PostalCodeRaw,
//   LocationOption,
// } from "@/types/profile";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   /* ===== helper: auto-fill จากรหัสไปรษณีย์ ===== */
//   const fillFromPostal = (
//     raw: PostalCodeRaw,
//     scope: "ship" | "tax"
//   ) => {
//     if (scope === "ship") {
//       setPerson((p) => ({
//         ...p,
//         personShipPostCode: String(raw.code),
//         personShipProvince: raw.provinceName,
//         personShipCountry: raw.districtName,   // Laravel ใช้ Country = อำเภอ
//         personShipDistric: raw.subDistrictName,
//       }));
//     } else {
//       setPerson((p) => ({
//         ...p,
//         personTaxPostcode: String(raw.code),
//         personTaxProvince: raw.provinceName,
//         personTaxCountry: raw.districtName,
//         personTaxDistric: raw.subDistrictName,
//       }));
//     }
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* ✅ เปลี่ยนลำดับเป็น จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipPostCode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "ship");
//               }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             {/* ✅ ลำดับเดียวกัน จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ */}
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxPostcode: val,
//                 }))
//               }
//               onOptionSelected={(opt: LocationOption<PostalCodeRaw>) => {
//                 if (opt.raw) fillFromPostal(opt.raw, "tax");
//               }}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.4 ===============================================

// v.1.1.3 ===============================================
// // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";

// import type { PersonProfile, PostalCodeItem, LocationOption } from "@/types/profile";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   /** -------------------------------
//    *  Auto-fill เมื่อ user เลือก "รหัสไปรษณีย์"
//    * ------------------------------- */
//   const handlePostalSelected = (opt: LocationOption<PostalCodeItem>) => {
//     if (!opt?.raw) return;

//     const raw = opt.raw;

//     setPerson((prev) => ({
//       ...prev,
//       personShipPostCode: String(raw.code),
//       personShipProvince: raw.provinceName,
//       personShipCountry: raw.districtName,
//       personShipDistric: raw.subDistrictName,
//     }));
//   };

//   const handleTaxPostalSelected = (opt: LocationOption<PostalCodeItem>) => {
//     if (!opt?.raw) return;

//     const raw = opt.raw;

//     setPerson((prev) => ({
//       ...prev,
//       personTaxPostcode: String(raw.code),
//       personTaxProvince: raw.provinceName,
//       personTaxCountry: raw.districtName,
//       personTaxDistric: raw.subDistrictName,
//     }));
//   };

//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>

//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personShipDistric: val }))
//               }
//             />

//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personShipCountry: val }))
//               }
//             />

//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personShipProvince: val }))
//               }
//             />

//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personShipPostCode: val }))
//               }
//               onOptionSelected={handlePostalSelected} // ⭐ Auto-fill
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//         </h2>

//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>

//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personTaxDistric: val }))
//               }
//             />

//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personTaxCountry: val }))
//               }
//             />

//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personTaxProvince: val }))
//               }
//             />

//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({ ...p, personTaxPostcode: val }))
//               }
//               onOptionSelected={handleTaxPostalSelected} // ⭐ Auto-fill ภาษี
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/profile/components/PersonProfileForm.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import LocationSelect from "./LocationSelect";
// import type { PersonProfile } from "../profile.types";

// type Props = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({ person, setPerson }: Props) {
//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
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
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personShipDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personShipCountry ?? ""} // Laravel ใช้ Country = อำเภอ
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personShipProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personShipPostCode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipPostCode: val,
//                 }))
//               }
//             />
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <LocationSelect
//               label="แขวง/ตำบล"
//               endpoint="sub-districts"
//               value={person.personTaxDistric ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxDistric: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="เขต/อำเภอ"
//               endpoint="districts"
//               value={person.personTaxCountry ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxCountry: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="จังหวัด"
//               endpoint="provinces"
//               value={person.personTaxProvince ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxProvince: val,
//                 }))
//               }
//             />
//             <LocationSelect
//               label="รหัสไปรษณีย์"
//               endpoint="postal-codes"
//               value={person.personTaxPostcode ?? ""}
//               onChange={(val) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxPostcode: val,
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

// // src/app/profile/components/PersonProfileForm.tsx

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import type { PersonProfile } from "../profile.types";

// type PersonProfileFormProps = {
//   person: PersonProfile;
//   setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
// };

// export default function PersonProfileForm({
//   person,
//   setPerson,
// }: PersonProfileFormProps) {
//   return (
//     <div className="space-y-8">
//       {/* ข้อมูลติดต่อ */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลติดต่อ (บุคคลธรรมดา)
//         </h2>
//         <div className="grid sm:grid-cols-2 gap-4">
//           <div>
//             <Label>ชื่อลูกค้า</Label>
//             <Input
//               value={person.personCompanyName ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personCompanyName: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div>
//             <Label>หมายเลขบัตรประชาชน</Label>
//             <Input
//               value={person.personIdCard ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personIdCard: e.target.value,
//                 }))
//               }
//               maxLength={20}
//             />
//           </div>
//           <div>
//             <Label>เบอร์ติดต่อ</Label>
//             <Input
//               value={person.personTel ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTel: e.target.value.replace(/[^\d]/g, ""),
//                 }))
//               }
//               maxLength={30}
//             />
//           </div>
//           <div>
//             <Label>อีเมล</Label>
//             <Input
//               type="email"
//               value={person.personMail ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personMail: e.target.value,
//                 }))
//               }
//               maxLength={80}
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <Label>รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม</Label>
//             <Input
//               value={person.personContactMore ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personContactMore: e.target.value,
//                 }))
//               }
//               maxLength={50}
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
//               value={person.personShipAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personShipAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <Label>แขวง/ตำบล</Label>
//               <Input
//                 value={person.personShipDistric ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personShipDistric: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>เขต/อำเภอ</Label>
//               <Input
//                 value={person.personShipCountry ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personShipCountry: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>จังหวัด</Label>
//               <Input
//                 value={person.personShipProvince ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personShipProvince: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>รหัสไปรษณีย์</Label>
//               <Input
//                 value={person.personShipPostCode ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personShipPostCode: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ที่อยู่ภาษี */}
//       <section className="space-y-4">
//         <h2 className="font-semibold text-base sm:text-lg">
//           ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//         </h2>
//         <div className="space-y-4">
//           <div>
//             <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//             <Input
//               value={person.personTaxAddr ?? ""}
//               onChange={(e) =>
//                 setPerson((p) => ({
//                   ...p,
//                   personTaxAddr: e.target.value,
//                 }))
//               }
//               maxLength={50}
//             />
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <Label>แขวง/ตำบล</Label>
//               <Input
//                 value={person.personTaxDistric ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personTaxDistric: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>เขต/อำเภอ</Label>
//               <Input
//                 value={person.personTaxCountry ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personTaxCountry: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>จังหวัด</Label>
//               <Input
//                 value={person.personTaxProvince ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personTaxProvince: e.target.value,
//                   }))
//                 }
//               />
//             </div>
//             <div>
//               <Label>รหัสไปรษณีย์</Label>
//               <Input
//                 value={person.personTaxPostcode ?? ""}
//                 onChange={(e) =>
//                   setPerson((p) => ({
//                     ...p,
//                     personTaxPostcode: e.target.value,
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
