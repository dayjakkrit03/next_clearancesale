// v.1.1.4 ===============================================
// src/app/profile/ProfileClient.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import {
  type PersonProfile,
  type EntityProfile,
  type ProfileResponse,
  type Mode,
} from "@/types/profile";

import PersonProfileForm from "./components/PersonProfileForm";
import EntityProfileForm from "./components/EntityProfileForm";

type Props = {
  initialPerson: PersonProfile | null;
  initialEntity: EntityProfile | null;
};

/** helper เช็คว่า object ว่าง (ไม่มีข้อมูลจริง ๆ) */
const isEmptyProfile = (obj: Record<string, unknown> | null | undefined) => {
  if (!obj) return true;
  const values = Object.values(obj);
  if (values.length === 0) return true;

  return values.every((v) => {
    if (v === null || v === undefined) return true;
    const s = String(v).trim();
    return s === "";
  });
};

/** helper trim string */
const norm = (v: unknown) => String(v ?? "").trim();

/** helper เช็ค block ที่อยู่ (addr + province + district + subDistrict + postCode) */
const isAddressBlockEmpty = (addr: {
  addr?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postCode?: string;
}) => {
  const values = [
    norm(addr.addr),
    norm(addr.province),
    norm(addr.district),
    norm(addr.subDistrict),
    norm(addr.postCode),
  ];
  return values.every((v) => v === "");
};

const isAddressBlockPartial = (addr: {
  addr?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  postCode?: string;
}) => {
  const values = [
    norm(addr.addr),
    norm(addr.province),
    norm(addr.district),
    norm(addr.subDistrict),
    norm(addr.postCode),
  ];
  const filled = values.filter((v) => v !== "").length;
  return filled > 0 && filled < values.length;
};

/** ตรวจสอบเลขบัตรประชาชน / เลขผู้เสียภาษีไทย (13 หลัก, checksum เดียวกัน) */
const isValidThai13DigitId = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 13) return false;

  let sum = 0;
  // น้ำหนักจาก 13 ลงมา 2 (ตำแหน่ง 1–12)
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits.charAt(i), 10);
    if (Number.isNaN(d)) return false;
    sum += d * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  const last = parseInt(digits.charAt(12), 10);
  return check === last;
};

export default function ProfileClient({ initialPerson, initialEntity }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = React.useState<Mode>(
    !initialPerson && initialEntity ? "entity" : "person"
  );

  const [person, setPerson] = React.useState<PersonProfile>(initialPerson ?? {});
  const [entity, setEntity] = React.useState<EntityProfile>(initialEntity ?? {});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ========== validate เฉพาะฝั่งบุคคลธรรมดา ========== */
  const validatePerson = (p: PersonProfile): string[] => {
    const problems: string[] = [];

    const name = norm(p.personCompanyName);
    const telDigits = (p.personTel ?? "").replace(/\D/g, "");
    const email = norm(p.personMail);
    const idCardDigits = (p.personIdCard ?? "").replace(/\D/g, "");

    // 1) required พื้นฐาน
    if (!name) {
      problems.push("กรุณากรอกชื่อลูกค้า (บุคคลธรรมดา)");
    }

    if (!telDigits) {
      problems.push("กรุณากรอกเบอร์ติดต่อ (บุคคลธรรมดา)");
    } else if (telDigits.length < 8 || telDigits.length > 10) {
      problems.push(
        "รูปแบบเบอร์ติดต่อ (บุคคลธรรมดา) ไม่ถูกต้อง (ควรเป็นตัวเลขประมาณ 8–10 หลัก)"
      );
    }

    // 2) email ถ้ามีต้องรูปแบบถูก
    if (email && !emailRegex.test(email)) {
      problems.push("รูปแบบอีเมล (บุคคลธรรมดา) ไม่ถูกต้อง");
    }

    // 3) บัตรประชาชน ถ้ามี ต้อง 13 หลัก + checksum
    if (idCardDigits) {
      if (idCardDigits.length !== 13) {
        problems.push(
          "หมายเลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก (บุคคลธรรมดา)"
        );
      } else if (!isValidThai13DigitId(idCardDigits)) {
        problems.push(
          "หมายเลขบัตรประชาชนไม่ถูกต้อง (บุคคลธรรมดา) กรุณาตรวจสอบอีกครั้ง"
        );
      }
    }

    // 4) ที่อยู่จัดส่ง: ต้องกรอกให้ครบ block
    const shipBlock = {
      addr: p.personShipAddr,
      province: p.personShipProvince,
      district: p.personShipCountry,
      subDistrict: p.personShipDistric,
      postCode: p.personShipPostCode,
    };

    if (isAddressBlockEmpty(shipBlock)) {
      problems.push(
        "กรุณากรอกที่อยู่สำหรับจัดส่งสินค้า (บุคคลธรรมดา) ให้ครบถ้วน (ที่อยู่, จังหวัด, เขต/อำเภอ, แขวง/ตำบล, รหัสไปรษณีย์)"
      );
    } else if (isAddressBlockPartial(shipBlock)) {
      problems.push(
        "กรุณากรอกข้อมูลที่อยู่สำหรับจัดส่งสินค้า (บุคคลธรรมดา) ให้ครบทุกช่อง"
      );
    }

    const shipPostcodeDigits = (p.personShipPostCode ?? "").replace(/\D/g, "");
    if (shipPostcodeDigits && shipPostcodeDigits.length !== 5) {
      problems.push(
        "รหัสไปรษณีย์ (ที่อยู่จัดส่ง - บุคคลธรรมดา) ต้องเป็นตัวเลข 5 หลัก"
      );
    }

    // 5) ที่อยู่ออกใบกำกับภาษี: optional แต่ถ้าเริ่มกรอกต้องครบ block
    const taxBlock = {
      addr: p.personTaxAddr,
      province: p.personTaxProvince,
      district: p.personTaxCountry,
      subDistrict: p.personTaxDistric,
      postCode: p.personTaxPostcode,
    };

    if (isAddressBlockPartial(taxBlock)) {
      problems.push(
        "กรุณากรอกข้อมูลที่อยู่ออกใบกำกับภาษี (บุคคลธรรมดา) ให้ครบทุกช่อง หรือปล่อยว่างทั้งหมด"
      );
    }

    const taxPostcodeDigits = (p.personTaxPostcode ?? "").replace(/\D/g, "");
    if (taxPostcodeDigits && taxPostcodeDigits.length !== 5) {
      problems.push(
        "รหัสไปรษณีย์ (ออกใบกำกับภาษี - บุคคลธรรมดา) ต้องเป็นตัวเลข 5 หลัก"
      );
    }

    return problems;
  };

  /* ========== validate เฉพาะฝั่งนิติบุคคล ========== */
  const validateEntity = (e: EntityProfile): string[] => {
    const problems: string[] = [];

    const companyName = norm(e.entityCompanyName);
    const customerName = norm(e.entityCustomerName);
    const telDigits = (e.entityTel ?? "").replace(/\D/g, "");
    const email = norm(e.entityMail);
    const taxIdDigits = (e.entityTaxId ?? "").replace(/\D/g, "");

    // 1) required พื้นฐาน
    if (!companyName) {
      problems.push("กรุณากรอกชื่อลูกค้า (นิติบุคคล)");
    }
    if (!customerName) {
      problems.push("กรุณากรอกชื่อผู้รับ / ผู้สั่งสินค้า (นิติบุคคล)");
    }

    if (!telDigits) {
      problems.push("กรุณากรอกเบอร์ติดต่อ (นิติบุคคล)");
    } else if (telDigits.length < 8 || telDigits.length > 10) {
      problems.push(
        "รูปแบบเบอร์ติดต่อ (นิติบุคคล) ไม่ถูกต้อง (ควรเป็นตัวเลขประมาณ 8–10 หลัก)"
      );
    }

    // 2) email ถ้ามีต้องรูปแบบถูก
    if (email && !emailRegex.test(email)) {
      problems.push("รูปแบบอีเมล (นิติบุคคล) ไม่ถูกต้อง");
    }

    // 3) เลขผู้เสียภาษี ถ้ามี หรือมีข้อมูลภาษี → บังคับ 13 หลัก + checksum
    const taxBlock = {
      addr: e.entityTaxAddr,
      province: e.entityTaxProvince,
      district: e.entityTaxCountry,
      subDistrict: e.entityTaxDistric,
      postCode: e.entityTaxPostcode,
    };
    const taxBlockHasAny = !isAddressBlockEmpty(taxBlock);

    if (taxIdDigits || taxBlockHasAny) {
      if (!taxIdDigits) {
        problems.push(
          "กรุณากรอกหมายเลขประจำตัวผู้เสียภาษี (นิติบุคคล) ให้ครบถ้วน"
        );
      } else if (taxIdDigits.length !== 13) {
        problems.push(
          "หมายเลขประจำตัวผู้เสียภาษี (นิติบุคคล) ต้องเป็นตัวเลข 13 หลัก"
        );
      } else if (!isValidThai13DigitId(taxIdDigits)) {
        problems.push(
          "หมายเลขประจำตัวผู้เสียภาษี (นิติบุคคล) ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"
        );
      }
    }

    // 4) ที่อยู่จัดส่ง: ต้องกรอกให้ครบ block
    const shipBlock = {
      addr: e.entityShipAddr,
      province: e.entityShipProvince,
      district: e.entityShipCountry,
      subDistrict: e.entityShipDistric,
      postCode: e.entityShipPostCode,
    };

    if (isAddressBlockEmpty(shipBlock)) {
      problems.push(
        "กรุณากรอกที่อยู่สำหรับจัดส่งสินค้า (นิติบุคคล) ให้ครบถ้วน (ที่อยู่, จังหวัด, เขต/อำเภอ, แขวง/ตำบล, รหัสไปรษณีย์)"
      );
    } else if (isAddressBlockPartial(shipBlock)) {
      problems.push(
        "กรุณากรอกข้อมูลที่อยู่สำหรับจัดส่งสินค้า (นิติบุคคล) ให้ครบทุกช่อง"
      );
    }

    const shipPostcodeDigits = (e.entityShipPostCode ?? "").replace(
      /\D/g,
      ""
    );
    if (shipPostcodeDigits && shipPostcodeDigits.length !== 5) {
      problems.push(
        "รหัสไปรษณีย์ (ที่อยู่จัดส่ง - นิติบุคคล) ต้องเป็นตัวเลข 5 หลัก"
      );
    }

    // 5) ที่อยู่ออกใบกำกับภาษี: optional แต่ถ้าเริ่มกรอกต้องครบ block
    if (isAddressBlockPartial(taxBlock)) {
      problems.push(
        "กรุณากรอกข้อมูลที่อยู่ออกใบกำกับภาษี (นิติบุคคล) ให้ครบทุกช่อง หรือปล่อยว่างทั้งหมด"
      );
    }

    const taxPostcodeDigits = (e.entityTaxPostcode ?? "").replace(/\D/g, "");
    if (taxPostcodeDigits && taxPostcodeDigits.length !== 5) {
      problems.push(
        "รหัสไปรษณีย์ (ออกใบกำกับภาษี - นิติบุคคล) ต้องเป็นตัวเลข 5 หลัก"
      );
    }

    return problems;
  };

  const handleSave = async () => {
    // ✅ validate เฉพาะ mode ที่ผู้ใช้กำลังใช้งานอยู่
    const problems =
      mode === "person" ? validatePerson(person) : validateEntity(entity);

    if (problems.length) {
      const description = problems.join("\n");
      setError(description);
      toast({
        variant: "destructive",
        title: "กรุณาตรวจสอบข้อมูล",
        description,
      });
      return;
    }

    // 🔍 ถ้าไม่มีข้อมูลเลย อย่าส่ง object ว่าง ๆ ไปสร้าง row เปล่า
    const payloadPerson = isEmptyProfile(person) ? null : person;
    const payloadEntity = isEmptyProfile(entity) ? null : entity;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person: payloadPerson,
          entity: payloadEntity,
        }),
      });

      const data: ProfileResponse = await res.json();

      if (!res.ok || !data.ok) {
        setError("บันทึกข้อมูลไม่สำเร็จ");
        toast({
          variant: "destructive",
          title: "บันทึกไม่สำเร็จ",
          description: "กรุณาลองใหม่อีกครั้ง หรือแจ้งเจ้าหน้าที่",
        });
        return;
      }

      toast({
        title: "บันทึกสำเร็จ",
        description: "ระบบได้อัปเดตข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว",
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ในขณะนี้",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
          ข้อมูลสำหรับใช้ในการสั่งซื้อ
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
          กรอกข้อมูลติดต่อและที่อยู่ให้ครบถ้วน เพื่อความสะดวกในการออกเอกสารและจัดส่งสินค้า
        </p>

        {/* Toggle บุคคลธรรมดา / นิติบุคคล */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            type="button"
            className={clsx(
              "px-4 py-2 rounded-full text-sm border",
              mode === "person"
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-700 border-slate-200"
            )}
            onClick={() => setMode("person")}
          >
            บุคคลธรรมดา
          </button>
          <button
            type="button"
            className={clsx(
              "px-4 py-2 rounded-full text-sm border",
              mode === "entity"
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-700 border-slate-200"
            )}
            onClick={() => setMode("entity")}
          >
            นิติบุคคล
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 whitespace-pre-line">
            {error}
          </div>
        )}

        {mode === "person" && (
          <PersonProfileForm person={person} setPerson={setPerson} />
        )}

        {mode === "entity" && (
          <EntityProfileForm entity={entity} setEntity={setEntity} />
        )}

        {/* ปุ่มบันทึก */}
        <div className="mt-8">
          <Button
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.4 ===============================================

// v.1.1.3 ===============================================
// // src/app/profile/ProfileClient.tsx
// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import clsx from "clsx";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// import {
//   type PersonProfile,
//   type EntityProfile,
//   type ProfileResponse,
//   type Mode,
// } from "@/types/profile"; // ⬅ เปลี่ยนมาใช้ type กลาง

// import PersonProfileForm from "./components/PersonProfileForm";
// import EntityProfileForm from "./components/EntityProfileForm";

// type Props = {
//   initialPerson: PersonProfile | null;
//   initialEntity: EntityProfile | null;
// };

// /** helper เช็คว่า object ว่าง (ไม่มีข้อมูลจริง ๆ) */
// const isEmptyProfile = (obj: Record<string, unknown> | null | undefined) => {
//   if (!obj) return true;
//   const values = Object.values(obj);
//   if (values.length === 0) return true;

//   return values.every((v) => {
//     if (v === null || v === undefined) return true;
//     const s = String(v).trim();
//     return s === "";
//   });
// };

// export default function ProfileClient({ initialPerson, initialEntity }: Props) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [mode, setMode] = React.useState<Mode>(
//     !initialPerson && initialEntity ? "entity" : "person"
//   );

//   const [person, setPerson] = React.useState<PersonProfile>(initialPerson ?? {});
//   const [entity, setEntity] = React.useState<EntityProfile>(initialEntity ?? {});
//   const [saving, setSaving] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const validate = (): string[] => {
//     const problems: string[] = [];
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (person.personMail && !emailRegex.test(person.personMail)) {
//       problems.push("รูปแบบอีเมล (บุคคลธรรมดา) ไม่ถูกต้อง");
//     }
//     if (entity.entityMail && !emailRegex.test(entity.entityMail)) {
//       problems.push("รูปแบบอีเมล (นิติบุคคล) ไม่ถูกต้อง");
//     }
//     if (person.personTel && person.personTel.replace(/\D/g, "").length < 6) {
//       problems.push("เบอร์ติดต่อ (บุคคลธรรมดา) สั้นเกินไป");
//     }
//     if (entity.entityTel && entity.entityTel.replace(/\D/g, "").length < 6) {
//       problems.push("เบอร์ติดต่อ (นิติบุคคล) สั้นเกินไป");
//     }

//     return problems;
//   };

//   const handleSave = async () => {
//     const problems = validate();
//     if (problems.length) {
//       const description = problems.join("\n");
//       setError(description);
//       toast({
//         variant: "destructive",
//         title: "กรุณาตรวจสอบข้อมูล",
//         description,
//       });
//       return;
//     }

//     // 🔍 ถ้าไม่มีข้อมูลเลย อย่าส่ง object ว่าง ๆ ไปสร้าง row เปล่า
//     const payloadPerson = isEmptyProfile(person) ? null : person;
//     const payloadEntity = isEmptyProfile(entity) ? null : entity;

//     try {
//       setSaving(true);
//       setError(null);

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           person: payloadPerson,
//           entity: payloadEntity,
//         }),
//       });

//       const data: ProfileResponse = await res.json();

//       if (!res.ok || !data.ok) {
//         setError("บันทึกข้อมูลไม่สำเร็จ");
//         toast({
//           variant: "destructive",
//           title: "บันทึกไม่สำเร็จ",
//           description: "กรุณาลองใหม่อีกครั้ง หรือแจ้งเจ้าหน้าที่",
//         });
//         return;
//       }

//       toast({
//         title: "บันทึกสำเร็จ",
//         description: "ระบบได้อัปเดตข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว",
//       });

//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
//       toast({
//         variant: "destructive",
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถบันทึกข้อมูลได้ในขณะนี้",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-4 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           ข้อมูลสำหรับใช้ในการสั่งซื้อ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรอกข้อมูลติดต่อและที่อยู่ให้ครบถ้วน เพื่อความสะดวกในการออกเอกสารและจัดส่งสินค้า
//         </p>

//         {/* Toggle บุคคลธรรมดา / นิติบุคคล */}
//         <div className="flex justify-center mb-6 gap-4">
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "person"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("person")}
//           >
//             บุคคลธรรมดา
//           </button>
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "entity"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("entity")}
//           >
//             นิติบุคคล
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 text-sm text-red-600 whitespace-pre-line">
//             {error}
//           </div>
//         )}

//         {mode === "person" && (
//           <PersonProfileForm person={person} setPerson={setPerson} />
//         )}

//         {mode === "entity" && (
//           <EntityProfileForm entity={entity} setEntity={setEntity} />
//         )}

//         {/* ปุ่มบันทึก */}
//         <div className="mt-8">
//           <Button
//             className="w-full sm:w-auto"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/profile/ProfileClient.tsx
// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import clsx from "clsx";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// import {
//   type PersonProfile,
//   type EntityProfile,
//   type ProfileResponse,
//   type Mode,
// } from "./profile.types";
// import PersonProfileForm from "./components/PersonProfileForm";
// import EntityProfileForm from "./components/EntityProfileForm";

// type Props = {
//   initialPerson: PersonProfile | null;
//   initialEntity: EntityProfile | null;
// };

// export default function ProfileClient({ initialPerson, initialEntity }: Props) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [mode, setMode] = React.useState<Mode>(
//     !initialPerson && initialEntity ? "entity" : "person"
//   );
//   const [person, setPerson] = React.useState<PersonProfile>(initialPerson ?? {});
//   const [entity, setEntity] = React.useState<EntityProfile>(initialEntity ?? {});
//   const [saving, setSaving] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const validate = (): string[] => {
//     const problems: string[] = [];
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (person.personMail && !emailRegex.test(person.personMail)) {
//       problems.push("รูปแบบอีเมล (บุคคลธรรมดา) ไม่ถูกต้อง");
//     }
//     if (entity.entityMail && !emailRegex.test(entity.entityMail)) {
//       problems.push("รูปแบบอีเมล (นิติบุคคล) ไม่ถูกต้อง");
//     }
//     if (person.personTel && person.personTel.replace(/\D/g, "").length < 6) {
//       problems.push("เบอร์ติดต่อ (บุคคลธรรมดา) สั้นเกินไป");
//     }
//     if (entity.entityTel && entity.entityTel.replace(/\D/g, "").length < 6) {
//       problems.push("เบอร์ติดต่อ (นิติบุคคล) สั้นเกินไป");
//     }

//     return problems;
//   };

//   const handleSave = async () => {
//     const problems = validate();
//     if (problems.length) {
//       const description = problems.join("\n");
//       setError(description);
//       toast({
//         variant: "destructive",
//         title: "กรุณาตรวจสอบข้อมูล",
//         description,
//       });
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ person, entity }),
//       });

//       const data: ProfileResponse = await res.json();

//       if (!res.ok || !data.ok) {
//         setError("บันทึกข้อมูลไม่สำเร็จ");
//         toast({
//           variant: "destructive",
//           title: "บันทึกไม่สำเร็จ",
//           description: "กรุณาลองใหม่อีกครั้ง หรือแจ้งเจ้าหน้าที่",
//         });
//         return;
//       }

//       toast({
//         title: "บันทึกสำเร็จ",
//         description: "ระบบได้อัปเดตข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว",
//       });

//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
//       toast({
//         variant: "destructive",
//         title: "เกิดข้อผิดพลาด",
//         description: "ไม่สามารถบันทึกข้อมูลได้ในขณะนี้",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-4 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           ข้อมูลสำหรับใช้ในการสั่งซื้อ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรอกข้อมูลติดต่อและที่อยู่ให้ครบถ้วน เพื่อความสะดวกในการออกเอกสารและจัดส่งสินค้า
//         </p>

//         {/* Toggle บุคคลธรรมดา / นิติบุคคล */}
//         <div className="flex justify-center mb-6 gap-4">
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "person"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("person")}
//           >
//             บุคคลธรรมดา
//           </button>
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "entity"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("entity")}
//           >
//             นิติบุคคล
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 text-sm text-red-600 whitespace-pre-line">
//             {error}
//           </div>
//         )}

//         {mode === "person" && (
//           <PersonProfileForm person={person} setPerson={setPerson} />
//         )}

//         {mode === "entity" && (
//           <EntityProfileForm entity={entity} setEntity={setEntity} />
//         )}

//         {/* ปุ่มบันทึก */}
//         <div className="mt-8">
//           <Button
//             className="w-full sm:w-auto"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ===============================================

// // src/app/profile/ProfileClient.tsx

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import clsx from "clsx";

// import {
//   type PersonProfile,
//   type EntityProfile,
//   type ProfileResponse,
//   type Mode,
// } from "./profile.types";
// import PersonProfileForm from "./components/PersonProfileForm";
// import EntityProfileForm from "./components/EntityProfileForm";

// type ProfileClientProps = {
//   initialPerson: PersonProfile | null;
//   initialEntity: EntityProfile | null;
// };

// export default function ProfileClient({
//   initialPerson,
//   initialEntity,
// }: ProfileClientProps) {
//   const [mode, setMode] = useState<Mode>(
//     !initialPerson && initialEntity ? "entity" : "person"
//   );

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [person, setPerson] = useState<PersonProfile>(initialPerson ?? {});
//   const [entity, setEntity] = useState<EntityProfile>(initialEntity ?? {});

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setError(null);

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ person, entity }),
//       });

//       const data: ProfileResponse = await res.json();

//       if (!res.ok || !data.ok) {
//         setError("บันทึกข้อมูลไม่สำเร็จ");
//         return;
//       }

//       alert("บันทึกข้อมูลเรียบร้อยแล้ว");
//     } catch (err) {
//       console.error(err);
//       setError("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
//       <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-4 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           ข้อมูลสำหรับใช้ในการสั่งซื้อ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรอกข้อมูลติดต่อและที่อยู่ให้ครบถ้วน เพื่อความสะดวกในการออกเอกสารและจัดส่งสินค้า
//         </p>

//         {/* Toggle บุคคลธรรมดา / นิติบุคคล */}
//         <div className="flex justify-center mb-6 gap-4">
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "person"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("person")}
//           >
//             บุคคลธรรมดา
//           </button>
//           <button
//             type="button"
//             className={clsx(
//               "px-4 py-2 rounded-full text-sm border",
//               mode === "entity"
//                 ? "bg-primary text-white border-primary"
//                 : "bg-white text-slate-700 border-slate-200"
//             )}
//             onClick={() => setMode("entity")}
//           >
//             นิติบุคคล
//           </button>
//         </div>

//         {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

//         {mode === "person" && (
//           <PersonProfileForm person={person} setPerson={setPerson} />
//         )}

//         {mode === "entity" && (
//           <EntityProfileForm entity={entity} setEntity={setEntity} />
//         )}

//         {/* ปุ่มบันทึก */}
//         <div className="mt-8">
//           <Button
//             className="w-full sm:w-auto"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
