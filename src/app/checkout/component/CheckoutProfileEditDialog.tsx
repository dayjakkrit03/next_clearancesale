// v.1.1.4 ===========================================================
// src/app/checkout/component/CheckoutProfileEditDialog.tsx

"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ✅ ใช้ hook useToast ของโปรเจกต์คุณ
import { useToast } from "@/components/ui/use-toast";

import type {
  PersonProfile,
  EntityProfile,
  ProfilePayload,
} from "@/types/profile";

import PersonProfileForm from "@/app/profile/components/PersonProfileForm";
import EntityProfileForm from "@/app/profile/components/EntityProfileForm";

type Mode = "person" | "entity";

type Props = {
  /** เปิด/ปิด dialog จากภายนอก (เช่น จากปุ่มดินสอใน checkout) */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** แก้ไขโปรไฟล์ประเภทไหน */
  mode: Mode;

  /** ค่าเริ่มต้นของ profile (ดึงจาก service / session ภายนอก) */
  initialPerson?: PersonProfile | null;
  initialEntity?: EntityProfile | null;

  /** callback เวลาเซฟสำเร็จ → ให้ checkout เอาไป map เป็น address ต่อ */
  onSaved?: (payload: {
    person?: PersonProfile | null;
    entity?: EntityProfile | null;
  }) => void;
};

/* ======================================================
 * Helper: ตัด field แปลก ๆ (id, created_at, ฯลฯ) ออกก่อนส่งเข้า API
 * ====================================================== */

function sanitizePersonForSave(src: any): PersonProfile {
  if (!src) return {};
  const {
    personCompanyName,
    personIdCard,
    personTel,
    personMail,
    personContactMore,
    personShipAddr,
    personShipDistric,
    personShipProvince,
    personShipCountry,
    personShipPostCode,
    personTaxAddr,
    personTaxDistric,
    personTaxProvince,
    personTaxCountry,
    personTaxPostcode,
  } = src as PersonProfile & Record<string, any>;

  return {
    personCompanyName,
    personIdCard,
    personTel,
    personMail,
    personContactMore,
    personShipAddr,
    personShipDistric,
    personShipProvince,
    personShipCountry,
    personShipPostCode,
    personTaxAddr,
    personTaxDistric,
    personTaxProvince,
    personTaxCountry,
    personTaxPostcode,
  };
}

function sanitizeEntityForSave(src: any): EntityProfile {
  if (!src) return {};
  const {
    entityCompanyName,
    entityCustomerName,
    entityTel,
    entityMail,
    entityContactMore,
    entityTaxId,
    entityTaxAddr,
    entityTaxDistric,
    entityTaxProvince,
    entityTaxCountry,
    entityTaxPostcode,
    entityShipAddr,
    entityShipDistric,
    entityShipProvince,
    entityShipCountry,
    entityShipPostCode,
  } = src as EntityProfile & Record<string, any>;

  return {
    entityCompanyName,
    entityCustomerName,
    entityTel,
    entityMail,
    entityContactMore,
    entityTaxId,
    entityTaxAddr,
    entityTaxDistric,
    entityTaxProvince,
    entityTaxCountry,
    entityTaxPostcode,
    entityShipAddr,
    entityShipDistric,
    entityShipProvince,
    entityShipCountry,
    entityShipPostCode,
  };
}

export default function CheckoutProfileEditDialog({
  open,
  onOpenChange,
  mode,
  initialPerson,
  initialEntity,
  onSaved,
}: Props) {
  const [person, setPerson] = useState<PersonProfile>(
    () => initialPerson ?? ({} as PersonProfile),
  );
  const [entity, setEntity] = useState<EntityProfile>(
    () => initialEntity ?? ({} as EntityProfile),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // ✅ ดึง toast / confirm จาก hook
  const { toast } = useToast();

  // รีเซ็ตค่าเมื่อเปิด dialog ใหม่ หรือเปลี่ยน mode / initial*
  useEffect(() => {
    if (!open) return;
    if (mode === "person") {
      setPerson(initialPerson ?? ({} as PersonProfile));
    } else {
      setEntity(initialEntity ?? ({} as EntityProfile));
    }
    setErrorText(null);
  }, [open, mode, initialPerson, initialEntity]);

  const title =
    mode === "person"
      ? "แก้ไขข้อมูลโปรไฟล์ (บุคคลธรรมดา)"
      : "แก้ไขข้อมูลโปรไฟล์ (นิติบุคคล)";

  async function handleSave() {
    try {
      setIsSaving(true);
      setErrorText(null);

      const payload: ProfilePayload = {
        person:
          mode === "person" ? sanitizePersonForSave(person) : undefined,
        entity:
          mode === "entity" ? sanitizeEntityForSave(entity) : undefined,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "บันทึกข้อมูลไม่สำเร็จ");
      }

      // ✅ Toast สำเร็จ
      toast({
        title: "บันทึกสำเร็จ",
        description:
          mode === "person"
            ? "อัปเดตข้อมูลบุคคลธรรมดาเรียบร้อยแล้ว"
            : "อัปเดตข้อมูลนิติบุคคลเรียบร้อยแล้ว",
      });

      // แจ้งให้ parent รู้ว่าบันทึกเสร็จแล้ว
      onSaved?.({
        person: mode === "person" ? (payload.person ?? null) : undefined,
        entity: mode === "entity" ? (payload.entity ?? null) : undefined,
      });

      onOpenChange(false);
    } catch (err: any) {
      console.error("[CheckoutProfileEditDialog] save error =", err);
      const message =
        err?.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล";

      setErrorText(message);

      // ❌ Toast error
      toast({
        title: "เกิดข้อผิดพลาด",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            ข้อมูลที่บันทึกที่นี่จะถูกใช้เป็นข้อมูลอ้างอิงสำหรับการจัดส่ง และการออกใบกำกับภาษี
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {mode === "person" ? (
            <PersonProfileForm person={person} setPerson={setPerson} />
          ) : (
            <EntityProfileForm entity={entity} setEntity={setEntity} />
          )}

          {errorText && (
            <p className="text-sm text-red-600">{errorText}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              บันทึกข้อมูล
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// v.1.1.4 ===========================================================

// v.1.1.3 ===========================================================
// // src/app/checkout/component/CheckoutProfileEditDialog.tsx

// "use client";

// import { useEffect, useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
//   import { Loader2 } from "lucide-react";

// import type {
//   PersonProfile,
//   EntityProfile,
//   ProfilePayload,
// } from "@/types/profile";

// import PersonProfileForm from "@/app/profile/components/PersonProfileForm";
// import EntityProfileForm from "@/app/profile/components/EntityProfileForm";


// type Mode = "person" | "entity";

// type Props = {
//   /** เปิด/ปิด dialog จากภายนอก (เช่น จากปุ่มดินสอใน checkout) */
//   open: boolean;
//   onOpenChange: (open: boolean) => void;

//   /** แก้ไขโปรไฟล์ประเภทไหน */
//   mode: Mode;

//   /** ค่าเริ่มต้นของ profile (ดึงจาก service / session ภายนอก) */
//   initialPerson?: PersonProfile | null;
//   initialEntity?: EntityProfile | null;

//   /** callback เวลาเซฟสำเร็จ → ให้ checkout เอาไป map เป็น address ต่อ */
//   onSaved?: (payload: {
//     person?: PersonProfile | null;
//     entity?: EntityProfile | null;
//   }) => void;
// };

// /* ======================================================
//  * Helper: ตัด field แปลก ๆ (id, created_at, ฯลฯ) ออกก่อนส่งเข้า API
//  * ====================================================== */

// function sanitizePersonForSave(src: any): PersonProfile {
//   if (!src) return {};
//   const {
//     personCompanyName,
//     personIdCard,
//     personTel,
//     personMail,
//     personContactMore,
//     personShipAddr,
//     personShipDistric,
//     personShipProvince,
//     personShipCountry,
//     personShipPostCode,
//     personTaxAddr,
//     personTaxDistric,
//     personTaxProvince,
//     personTaxCountry,
//     personTaxPostcode,
//   } = src as PersonProfile & Record<string, any>;

//   return {
//     personCompanyName,
//     personIdCard,
//     personTel,
//     personMail,
//     personContactMore,
//     personShipAddr,
//     personShipDistric,
//     personShipProvince,
//     personShipCountry,
//     personShipPostCode,
//     personTaxAddr,
//     personTaxDistric,
//     personTaxProvince,
//     personTaxCountry,
//     personTaxPostcode,
//   };
// }

// function sanitizeEntityForSave(src: any): EntityProfile {
//   if (!src) return {};
//   const {
//     entityCompanyName,
//     entityCustomerName,
//     entityTel,
//     entityMail,
//     entityContactMore,
//     entityTaxId,
//     entityTaxAddr,
//     entityTaxDistric,
//     entityTaxProvince,
//     entityTaxCountry,
//     entityTaxPostcode,
//     entityShipAddr,
//     entityShipDistric,
//     entityShipProvince,
//     entityShipCountry,
//     entityShipPostCode,
//   } = src as EntityProfile & Record<string, any>;

//   return {
//     entityCompanyName,
//     entityCustomerName,
//     entityTel,
//     entityMail,
//     entityContactMore,
//     entityTaxId,
//     entityTaxAddr,
//     entityTaxDistric,
//     entityTaxProvince,
//     entityTaxCountry,
//     entityTaxPostcode,
//     entityShipAddr,
//     entityShipDistric,
//     entityShipProvince,
//     entityShipCountry,
//     entityShipPostCode,
//   };
// }

// export default function CheckoutProfileEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initialPerson,
//   initialEntity,
//   onSaved,
// }: Props) {
//   const [person, setPerson] = useState<PersonProfile>(
//     () => (initialPerson ?? ({} as PersonProfile)),
//   );
//   const [entity, setEntity] = useState<EntityProfile>(
//     () => (initialEntity ?? ({} as EntityProfile)),
//   );

//   const [isSaving, setIsSaving] = useState(false);
//   const [errorText, setErrorText] = useState<string | null>(null);

//   // รีเซ็ตค่าเมื่อเปิด dialog ใหม่ หรือเปลี่ยน mode / initial*
//   useEffect(() => {
//     if (!open) return;
//     if (mode === "person") {
//       setPerson(initialPerson ?? ({} as PersonProfile));
//     } else {
//       setEntity(initialEntity ?? ({} as EntityProfile));
//     }
//     setErrorText(null);
//   }, [open, mode, initialPerson, initialEntity]);

//   const title =
//     mode === "person"
//       ? "แก้ไขข้อมูลโปรไฟล์ (บุคคลธรรมดา)"
//       : "แก้ไขข้อมูลโปรไฟล์ (นิติบุคคล)";

//   async function handleSave() {
//     try {
//       setIsSaving(true);
//       setErrorText(null);

//       const payload: ProfilePayload = {
//         person:
//           mode === "person" ? sanitizePersonForSave(person) : undefined,
//         entity:
//           mode === "entity" ? sanitizeEntityForSave(entity) : undefined,
//       };

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(text || "บันทึกข้อมูลไม่สำเร็จ");
//       }

//       // แจ้งให้ parent รู้ว่าบันทึกเสร็จแล้ว
//       onSaved?.({
//         person: mode === "person" ? (payload.person ?? null) : undefined,
//         entity: mode === "entity" ? (payload.entity ?? null) : undefined,
//       });

//       onOpenChange(false);
//     } catch (err: any) {
//       console.error("[CheckoutProfileEditDialog] save error =", err);
//       setErrorText(err?.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <p className="mt-1 text-sm text-muted-foreground">
//             ข้อมูลที่บันทึกที่นี่จะถูกใช้เป็นข้อมูลอ้างอิงสำหรับการจัดส่ง และการออกใบกำกับภาษี
//           </p>
//         </DialogHeader>

//         <div className="mt-4 space-y-4">
//           {mode === "person" ? (
//             <PersonProfileForm person={person} setPerson={setPerson} />
//           ) : (
//             <EntityProfileForm entity={entity} setEntity={setEntity} />
//           )}

//           {errorText && (
//             <p className="text-sm text-red-600">{errorText}</p>
//           )}

//           <div className="mt-2 flex justify-end gap-2">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSaving}
//             >
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSave} disabled={isSaving}>
//               {isSaving && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               บันทึกข้อมูล
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.3 ===========================================================

// v.1.1.2 ===========================================================
// // src/app/checkout/component/CheckoutProfileEditDialog.tsx

// "use client";

// import { useEffect, useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// import type {
//   PersonProfile,
//   EntityProfile,
//   ProfilePayload,
// } from "@/types/profile";

// import PersonProfileForm from "@/app/profile/components/PersonProfileForm";
// import EntityProfileForm from "@/app/profile/components/EntityProfileForm";

// type Mode = "person" | "entity";

// type Props = {
//   /** เปิด/ปิด dialog จากภายนอก (เช่น จากปุ่มดินสอใน checkout) */
//   open: boolean;
//   onOpenChange: (open: boolean) => void;

//   /** แก้ไขโปรไฟล์ประเภทไหน */
//   mode: Mode;

//   /** ค่าเริ่มต้นของ profile (ดึงจาก service / session ภายนอก) */
//   initialPerson?: PersonProfile | null;
//   initialEntity?: EntityProfile | null;

//   /** callback เวลาเซฟสำเร็จ → ให้ checkout เอาไป refresh / map เป็น address ต่อ */
//   onSaved?: () => void;
// };

// export default function CheckoutProfileEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initialPerson,
//   initialEntity,
//   onSaved,
// }: Props) {
//   const [person, setPerson] = useState<PersonProfile>(
//     () => initialPerson ?? ({} as PersonProfile),
//   );
//   const [entity, setEntity] = useState<EntityProfile>(
//     () => initialEntity ?? ({} as EntityProfile),
//   );

//   const [isSaving, setIsSaving] = useState(false);
//   const [errorText, setErrorText] = useState<string | null>(null);

//   // รีเซ็ตค่าเมื่อเปิด dialog ใหม่ หรือเปลี่ยน mode / initial*
//   useEffect(() => {
//     if (!open) return;

//     console.log(
//       "[CheckoutProfileEditDialog] open =", open,
//       "mode =", mode,
//       "initialPerson =", initialPerson,
//       "initialEntity =", initialEntity
//     );

//     if (mode === "person") {
//       setPerson(initialPerson ?? ({} as PersonProfile));
//     } else {
//       setEntity(initialEntity ?? ({} as EntityProfile));
//     }
//     setErrorText(null);
//   }, [open, mode, initialPerson, initialEntity]);

//   const title =
//     mode === "person"
//       ? "แก้ไขข้อมูลโปรไฟล์ (บุคคลธรรมดา)"
//       : "แก้ไขข้อมูลโปรไฟล์ (นิติบุคคล)";

//   async function handleSave() {
//     try {
//       setIsSaving(true);
//       setErrorText(null);

//       const payload: ProfilePayload = {
//         person: mode === "person" ? person : undefined,
//         entity: mode === "entity" ? entity : undefined,
//       };

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(text || "บันทึกข้อมูลไม่สำเร็จ");
//       }

//       // แจ้งให้ parent รู้ว่าบันทึกเสร็จแล้ว
//       onSaved?.();

//       onOpenChange(false);
//     } catch (err: any) {
//       setErrorText(err?.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <p className="mt-1 text-sm text-muted-foreground">
//             ข้อมูลที่บันทึกที่นี่จะถูกใช้เป็นข้อมูลอ้างอิงสำหรับการจัดส่ง และการออกใบกำกับภาษี
//           </p>
//         </DialogHeader>

//         <div className="mt-4 space-y-4">
//           {mode === "person" ? (
//             <PersonProfileForm person={person} setPerson={setPerson} />
//           ) : (
//             <EntityProfileForm entity={entity} setEntity={setEntity} />
//           )}

//           {errorText && (
//             <p className="text-sm text-red-600">{errorText}</p>
//           )}

//           <div className="mt-2 flex justify-end gap-2">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSaving}
//             >
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSave} disabled={isSaving}>
//               {isSaving && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               บันทึกข้อมูล
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// v.1.1.2 ===========================================================

// // src/app/checkout/component/CheckoutProfileEditDialog.tsx

// "use client";

// import { useEffect, useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// import type {
//   PersonProfile,
//   EntityProfile,
//   ProfilePayload,
// } from "@/types/profile";

// import PersonProfileForm from "@/app/profile/components/PersonProfileForm";
// import EntityProfileForm from "@/app/profile/components/EntityProfileForm";

// type Mode = "person" | "entity";

// type Props = {
//   /** เปิด/ปิด dialog จากภายนอก (เช่น จากปุ่มดินสอใน checkout) */
//   open: boolean;
//   onOpenChange: (open: boolean) => void;

//   /** แก้ไขโปรไฟล์ประเภทไหน */
//   mode: Mode;

//   /** ค่าเริ่มต้นของ profile (ดึงจาก service / session ภายนอก) */
//   initialPerson?: PersonProfile | null;
//   initialEntity?: EntityProfile | null;

//   /** callback เวลาเซฟสำเร็จ → ให้ checkout เอาไป map เป็น address ต่อ */
//   onSaved?: (payload: { person?: PersonProfile | null; entity?: EntityProfile | null }) => void;
// };

// export default function CheckoutProfileEditDialog({
//   open,
//   onOpenChange,
//   mode,
//   initialPerson,
//   initialEntity,
//   onSaved,
// }: Props) {
//   const [person, setPerson] = useState<PersonProfile>(() => (initialPerson ?? ({} as PersonProfile)));
//   const [entity, setEntity] = useState<EntityProfile>(() => (initialEntity ?? ({} as EntityProfile)));

//   const [isSaving, setIsSaving] = useState(false);
//   const [errorText, setErrorText] = useState<string | null>(null);

//   // รีเซ็ตค่าเมื่อเปิด dialog ใหม่ หรือเปลี่ยน mode / initial*
//   useEffect(() => {
//     if (!open) return;
//     if (mode === "person") {
//       setPerson(initialPerson ?? ({} as PersonProfile));
//     } else {
//       setEntity(initialEntity ?? ({} as EntityProfile));
//     }
//     setErrorText(null);
//   }, [open, mode, initialPerson, initialEntity]);

//   const title =
//     mode === "person"
//       ? "แก้ไขข้อมูลโปรไฟล์ (บุคคลธรรมดา)"
//       : "แก้ไขข้อมูลโปรไฟล์ (นิติบุคคล)";

//   async function handleSave() {
//     try {
//       setIsSaving(true);
//       setErrorText(null);

//       const payload: ProfilePayload = {
//         person: mode === "person" ? person : undefined,
//         entity: mode === "entity" ? entity : undefined,
//       };

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(text || "บันทึกข้อมูลไม่สำเร็จ");
//       }

//       // แจ้งให้ parent รู้ว่าบันทึกเสร็จแล้ว
//       onSaved?.({
//         person: mode === "person" ? person : undefined,
//         entity: mode === "entity" ? entity : undefined,
//       });

//       onOpenChange(false);
//     } catch (err: any) {
//       setErrorText(err?.message || "เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <p className="mt-1 text-sm text-muted-foreground">
//             ข้อมูลที่บันทึกที่นี่จะถูกใช้เป็นข้อมูลอ้างอิงสำหรับการจัดส่ง และการออกใบกำกับภาษี
//           </p>
//         </DialogHeader>

//         <div className="mt-4 space-y-4">
//           {mode === "person" ? (
//             <PersonProfileForm person={person} setPerson={setPerson} />
//           ) : (
//             <EntityProfileForm entity={entity} setEntity={setEntity} />
//           )}

//           {errorText && (
//             <p className="text-sm text-red-600">{errorText}</p>
//           )}

//           <div className="mt-2 flex justify-end gap-2">
//             <Button
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//               disabled={isSaving}
//             >
//               ยกเลิก
//             </Button>
//             <Button onClick={handleSave} disabled={isSaving}>
//               {isSaving && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               บันทึกข้อมูล
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
