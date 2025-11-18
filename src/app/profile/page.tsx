// v.1.1.3 =================================================
// src/app/profile/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prismaShop } from "@/lib/db";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import ProfileClient from "./ProfileClient";
import type { PersonProfile, EntityProfile } from "./profile.types";

async function getInitialProfile(): Promise<{
  person: PersonProfile | null;
  entity: EntityProfile | null;
}> {
  // ✅ ตรงนี้ต้อง await
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/login?redirect=${encodeURIComponent("/profile")}`);
  }

  const payload = verifyAuthToken(token!);
  if (!payload?.sub) {
    redirect(`/login?redirect=${encodeURIComponent("/profile")}`);
  }

  let customerId: bigint;
  try {
    customerId = BigInt(payload.sub);
  } catch {
    redirect(`/login?redirect=${encodeURIComponent("/profile")}`);
  }

  const [personRow, entityRow] = await Promise.all([
    prismaShop.customer_profile_people.findFirst({
      where: { id__customer: customerId },
    }),
    prismaShop.customer_profile_entities.findFirst({
      where: { id__customer: customerId },
    }),
  ]);

  const person: PersonProfile | null = personRow
    ? ((() => {
        const {
          id,
          id__customer,
          start,
          created_at,
          updated_at,
          ...rest
        } = personRow;
        return rest as PersonProfile;
      })())
    : null;

  const entity: EntityProfile | null = entityRow
    ? ((() => {
        const {
          id,
          id__customer,
          start,
          created_at,
          updated_at,
          ...rest
        } = entityRow;
        return rest as EntityProfile;
      })())
    : null;

  return { person, entity };
}

export default async function ProfilePage() {
  const { person, entity } = await getInitialProfile();

  return <ProfileClient initialPerson={person} initialEntity={entity} />;
}

// v.1.1.3 =================================================

// v.1.1.2 =================================================
// // src/app/profile/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
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

// export default function ProfilePage() {
//   const router = useRouter();

//   const [mode, setMode] = useState<Mode>("person");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [person, setPerson] = useState<PersonProfile>({});
//   const [entity, setEntity] = useState<EntityProfile>({});

//   // โหลดข้อมูลครั้งแรก
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/profile", { cache: "no-store" });

//         if (res.status === 401) {
//           router.push(`/login?redirect=${encodeURIComponent("/profile")}`);
//           return;
//         }

//         const data: ProfileResponse = await res.json();
//         if (data.ok) {
//           if (data.person) setPerson(data.person);
//           if (data.entity) setEntity(data.entity);

//           if (!data.person && data.entity) {
//             setMode("entity");
//           }
//         } else {
//           setError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("เกิดข้อผิดพลาดระหว่างโหลดข้อมูล");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, [router]);

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setError(null);

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ person, entity }),
//       });

//       const data = await res.json();

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

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <p className="text-sm text-muted-foreground">
//           กำลังโหลดข้อมูลโปรไฟล์...
//         </p>
//       </div>
//     );
//   }

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

// v.1.1.2 =================================================

// // src/app/profile/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import clsx from "clsx";

// type PersonProfile = {
//   personCompanyName?: string;
//   personIdCard?: string;
//   personTel?: string;
//   personMail?: string;
//   personContactMore?: string;

//   personShipAddr?: string;
//   personShipDistric?: string;
//   personShipProvince?: string;
//   personShipCountry?: string;
//   personShipPostCode?: string;

//   personTaxAddr?: string;
//   personTaxDistric?: string;
//   personTaxProvince?: string;
//   personTaxCountry?: string;
//   personTaxPostcode?: string;
// };

// type EntityProfile = {
//   entityCompanyName?: string;
//   entityCustomerName?: string;
//   entityTel?: string;
//   entityMail?: string;
//   entityContactMore?: string;

//   entityTaxId?: string;
//   entityTaxAddr?: string;
//   entityTaxDistric?: string;
//   entityTaxProvince?: string;
//   entityTaxCountry?: string;
//   entityTaxPostcode?: string;

//   entityShipAddr?: string;
//   entityShipDistric?: string;
//   entityShipProvince?: string;
//   entityShipCountry?: string;
//   entityShipPostCode?: string;
// };

// type ProfileResponse = {
//   ok: boolean;
//   person?: PersonProfile | null;
//   entity?: EntityProfile | null;
// };

// type Mode = "person" | "entity";

// export default function ProfilePage() {
//   const router = useRouter();

//   const [mode, setMode] = useState<Mode>("person");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [person, setPerson] = useState<PersonProfile>({});
//   const [entity, setEntity] = useState<EntityProfile>({});

//   // โหลดข้อมูลครั้งแรก
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/profile", { cache: "no-store" });

//         if (res.status === 401) {
//           // ยังไม่ล็อกอิน → ส่งไปหน้า login
//           router.push(
//             `/login?redirect=${encodeURIComponent("/profile")}`
//           );
//           return;
//         }

//         const data: ProfileResponse = await res.json();
//         if (data.ok) {
//           if (data.person) setPerson(data.person);
//           if (data.entity) setEntity(data.entity);

//           // ถ้ามีข้อมูลเฉพาะฝั่ง entity → default เปิดแท็บนิติบุคคล
//           if (!data.person && data.entity) {
//             setMode("entity");
//           }
//         } else {
//           setError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("เกิดข้อผิดพลาดระหว่างโหลดข้อมูล");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, [router]);

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setError(null);

//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ person, entity }),
//       });

//       const data = await res.json();

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

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <p className="text-sm text-muted-foreground">
//           กำลังโหลดข้อมูลโปรไฟล์...
//         </p>
//       </div>
//     );
//   }

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
//           <div className="mb-4 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         {/* ฟอร์มบุคคลธรรมดา */}
//         {mode === "person" && (
//           <div className="space-y-8">
//             {/* ข้อมูลติดต่อ */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ข้อมูลติดต่อ (บุคคลธรรมดา)
//               </h2>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>ชื่อลูกค้า</Label>
//                   <Input
//                     value={person.personCompanyName ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personCompanyName: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div>
//                   <Label>หมายเลขบัตรประชาชน</Label>
//                   <Input
//                     value={person.personIdCard ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personIdCard: e.target.value,
//                       }))
//                     }
//                     maxLength={20}
//                   />
//                 </div>
//                 <div>
//                   <Label>เบอร์ติดต่อ</Label>
//                   <Input
//                     value={person.personTel ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personTel: e.target.value.replace(/[^\d]/g, ""),
//                       }))
//                     }
//                     maxLength={30}
//                   />
//                 </div>
//                 <div>
//                   <Label>อีเมล</Label>
//                   <Input
//                     type="email"
//                     value={person.personMail ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personMail: e.target.value,
//                       }))
//                     }
//                     maxLength={80}
//                   />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <Label>
//                     รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//                   </Label>
//                   <Input
//                     value={person.personContactMore ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personContactMore: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* ที่อยู่จัดส่ง */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ที่อยู่สำหรับจัดส่งสินค้า
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <Label>ที่อยู่</Label>
//                   <Input
//                     value={person.personShipAddr ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personShipAddr: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>แขวง/ตำบล</Label>
//                     <Input
//                       value={person.personShipDistric ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personShipDistric: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>เขต/อำเภอ</Label>
//                     <Input
//                       value={person.personShipCountry ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personShipCountry: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>จังหวัด</Label>
//                     <Input
//                       value={person.personShipProvince ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personShipProvince: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>รหัสไปรษณีย์</Label>
//                     <Input
//                       value={person.personShipPostCode ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personShipPostCode: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* ที่อยู่สำหรับออกใบกำกับภาษี */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//                   <Input
//                     value={person.personTaxAddr ?? ""}
//                     onChange={(e) =>
//                       setPerson((p) => ({
//                         ...p,
//                         personTaxAddr: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>แขวง/ตำบล</Label>
//                     <Input
//                       value={person.personTaxDistric ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personTaxDistric: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>เขต/อำเภอ</Label>
//                     <Input
//                       value={person.personTaxCountry ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personTaxCountry: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>จังหวัด</Label>
//                     <Input
//                       value={person.personTaxProvince ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personTaxProvince: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>รหัสไปรษณีย์</Label>
//                     <Input
//                       value={person.personTaxPostcode ?? ""}
//                       onChange={(e) =>
//                         setPerson((p) => ({
//                           ...p,
//                           personTaxPostcode: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>
//         )}

//         {/* ฟอร์มนิติบุคคล */}
//         {mode === "entity" && (
//           <div className="space-y-8">
//             {/* ข้อมูลติดต่อ */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ข้อมูลติดต่อ (นิติบุคคล)
//               </h2>
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
//                   <Input
//                     value={entity.entityCompanyName ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityCompanyName: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div>
//                   <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
//                   <Input
//                     value={entity.entityCustomerName ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityCustomerName: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div>
//                   <Label>เบอร์ติดต่อ</Label>
//                   <Input
//                     value={entity.entityTel ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityTel: e.target.value.replace(/[^\d]/g, ""),
//                       }))
//                     }
//                     maxLength={30}
//                   />
//                 </div>
//                 <div>
//                   <Label>อีเมล</Label>
//                   <Input
//                     type="email"
//                     value={entity.entityMail ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityMail: e.target.value,
//                       }))
//                     }
//                     maxLength={80}
//                   />
//                 </div>
//                 <div className="sm:col-span-2">
//                   <Label>
//                     รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม
//                   </Label>
//                   <Input
//                     value={entity.entityContactMore ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityContactMore: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* ที่อยู่ภาษี */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ข้อมูลสำหรับออกใบกำกับภาษี
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <Label>หมายเลขประจำตัวผู้เสียภาษี</Label>
//                   <Input
//                     value={entity.entityTaxId ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityTaxId: e.target.value,
//                       }))
//                     }
//                     maxLength={20}
//                   />
//                 </div>
//                 <div>
//                   <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
//                   <Input
//                     value={entity.entityTaxAddr ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityTaxAddr: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>แขวง/ตำบล</Label>
//                     <Input
//                       value={entity.entityTaxDistric ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityTaxDistric: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>เขต/อำเภอ</Label>
//                     <Input
//                       value={entity.entityTaxCountry ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityTaxCountry: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>จังหวัด</Label>
//                     <Input
//                       value={entity.entityTaxProvince ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityTaxProvince: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>รหัสไปรษณีย์</Label>
//                     <Input
//                       value={entity.entityTaxPostcode ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityTaxPostcode: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* ที่อยู่จัดส่ง */}
//             <section className="space-y-4">
//               <h2 className="font-semibold text-base sm:text-lg">
//                 ที่อยู่สำหรับจัดส่งสินค้า
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <Label>ที่อยู่</Label>
//                   <Input
//                     value={entity.entityShipAddr ?? ""}
//                     onChange={(e) =>
//                       setEntity((p) => ({
//                         ...p,
//                         entityShipAddr: e.target.value,
//                       }))
//                     }
//                     maxLength={50}
//                   />
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>แขวง/ตำบล</Label>
//                     <Input
//                       value={entity.entityShipDistric ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityShipDistric: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>เขต/อำเภอ</Label>
//                     <Input
//                       value={entity.entityShipCountry ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityShipCountry: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>จังหวัด</Label>
//                     <Input
//                       value={entity.entityShipProvince ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityShipProvince: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                   <div>
//                     <Label>รหัสไปรษณีย์</Label>
//                     <Input
//                       value={entity.entityShipPostCode ?? ""}
//                       onChange={(e) =>
//                         setEntity((p) => ({
//                           ...p,
//                           entityShipPostCode: e.target.value,
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </div>
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
