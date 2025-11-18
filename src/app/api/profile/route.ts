// v.1.1.3 ===============================================
// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { ProfileService } from "@/services/profile.service";
import type { ProfilePayload } from "@/types/profile";

/** ดึง customerId จาก JWT */
function getCustomerId(req: NextRequest): bigint | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload?.sub) return null;
  try {
    return BigInt(payload.sub);
  } catch {
    return null;
  }
}

/** แปลง BigInt ใน person/entity ให้เป็น string ก่อนส่งออก */
function toJsonSafeProfile(profile: any) {
  const { person, entity } = profile;

  const safePerson = person
    ? {
        ...person,
        id: person.id?.toString(),
        id__customer: person.id__customer?.toString(),
      }
    : null;

  const safeEntity = entity
    ? {
        ...entity,
        id: entity.id?.toString(),
        id__customer: entity.id__customer?.toString(),
      }
    : null;

  return { person: safePerson, entity: safeEntity };
}

export async function GET(req: NextRequest) {
  const id = getCustomerId(req);
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });

  const profile = await ProfileService.getProfile(id);
  const safe = toJsonSafeProfile(profile);

  return NextResponse.json({ ok: true, ...safe });
}

export async function POST(req: NextRequest) {
  const id = getCustomerId(req);
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });

  let body: ProfilePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 }
    );
  }

  await ProfileService.saveProfile(id, body);
  return NextResponse.json({ ok: true });
}

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/app/api/profile/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { ProfileService } from "@/services/profile.service";

// /** ดึง customerId จาก JWT */
// function getCustomerId(req: NextRequest): bigint | null {
//   const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
//   if (!token) return null;

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) return null;
//   try {
//     return BigInt(payload.sub);
//   } catch {
//     return null;
//   }
// }

// /** แปลง BigInt ใน person/entity ให้เป็น string ก่อนส่งออก */
// function toJsonSafeProfile(profile: any) {
//   const { person, entity } = profile;

//   const safePerson = person
//     ? {
//         ...person,
//         id: person.id?.toString(),
//         id__customer: person.id__customer?.toString(),
//       }
//     : null;

//   const safeEntity = entity
//     ? {
//         ...entity,
//         id: entity.id?.toString(),
//         id__customer: entity.id__customer?.toString(),
//       }
//     : null;

//   return { person: safePerson, entity: safeEntity };
// }

// export async function GET(req: NextRequest) {
//   const id = getCustomerId(req);
//   if (!id) return NextResponse.json({ ok: false }, { status: 401 });

//   const profile = await ProfileService.getProfile(id);

//   // ⬇️ ใช้ helper แทนคืนค่า person/entity ตรง ๆ
//   const safe = toJsonSafeProfile(profile);
//   return NextResponse.json({ ok: true, ...safe });
// }

// export async function POST(req: NextRequest) {
//   const id = getCustomerId(req);
//   if (!id) return NextResponse.json({ ok: false }, { status: 401 });

//   let body;
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json(
//       { ok: false, error: "INVALID_JSON" },
//       { status: 400 }
//     );
//   }

//   await ProfileService.saveProfile(id, body);
//   return NextResponse.json({ ok: true });
// }



// v.1.1.2 ===============================================

// // src/app/api/profile/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prismaShop } from "@/lib/db";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

// /** --------- Types used by API ---------- */
// type PersonProfileInput = {
//   personCompanyName?: string | null;
//   personIdCard?: string | null;
//   personTel?: string | null;
//   personMail?: string | null;
//   personContactMore?: string | null;

//   personShipAddr?: string | null;
//   personShipDistric?: string | null;
//   personShipProvince?: string | null;
//   personShipCountry?: string | null;
//   personShipPostCode?: string | null;

//   personTaxAddr?: string | null;
//   personTaxDistric?: string | null;
//   personTaxProvince?: string | null;
//   personTaxCountry?: string | null;
//   personTaxPostcode?: string | null;
// };

// type EntityProfileInput = {
//   entityCompanyName?: string | null;
//   entityCustomerName?: string | null;
//   entityTel?: string | null;
//   entityMail?: string | null;
//   entityContactMore?: string | null;

//   entityTaxId?: string | null;
//   entityTaxAddr?: string | null;
//   entityTaxDistric?: string | null;
//   entityTaxProvince?: string | null;
//   entityTaxCountry?: string | null;
//   entityTaxPostcode?: string | null;

//   entityShipAddr?: string | null;
//   entityShipDistric?: string | null;
//   entityShipProvince?: string | null;
//   entityShipCountry?: string | null;
//   entityShipPostCode?: string | null;
// };

// type ProfileResponse = {
//   ok: boolean;
//   person?: PersonProfileInput | null;
//   entity?: EntityProfileInput | null;
// };

// /** อ่าน user จาก JWT cookie */
// function getAuthCustomerId(req: NextRequest): bigint | null {
//   const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
//   if (!token) return null;

//   const payload = verifyAuthToken(token);
//   if (!payload?.sub) return null;

//   try {
//     return BigInt(payload.sub);
//   } catch {
//     return null;
//   }
// }

// /** แปลง record จาก Prisma เป็น object ที่ JSON ได้ */
// function mapPersonRecord(
//   p: any | null
// ): PersonProfileInput | null {
//   if (!p) return null;
//   return {
//     personCompanyName: p.personCompanyName,
//     personIdCard: p.personIdCard,
//     personTel: p.personTel,
//     personMail: p.personMail,
//     personContactMore: p.personContactMore,
//     personShipAddr: p.personShipAddr,
//     personShipDistric: p.personShipDistric,
//     personShipProvince: p.personShipProvince,
//     personShipCountry: p.personShipCountry,
//     personShipPostCode: p.personShipPostCode,
//     personTaxAddr: p.personTaxAddr,
//     personTaxDistric: p.personTaxDistric,
//     personTaxProvince: p.personTaxProvince,
//     personTaxCountry: p.personTaxCountry,
//     personTaxPostcode: p.personTaxPostcode,
//   };
// }

// function mapEntityRecord(
//   e: any | null
// ): EntityProfileInput | null {
//   if (!e) return null;
//   return {
//     entityCompanyName: e.entityCompanyName,
//     entityCustomerName: e.entityCustomerName,
//     entityTel: e.entityTel,
//     entityMail: e.entityMail,
//     entityContactMore: e.entityContactMore,
//     entityTaxId: e.entityTaxId,
//     entityTaxAddr: e.entityTaxAddr,
//     entityTaxDistric: e.entityTaxDistric,
//     entityTaxProvince: e.entityTaxProvince,
//     entityTaxCountry: e.entityTaxCountry,
//     entityTaxPostcode: e.entityTaxPostcode,
//     entityShipAddr: e.entityShipAddr,
//     entityShipDistric: e.entityShipDistric,
//     entityShipProvince: e.entityShipProvince,
//     entityShipCountry: e.entityShipCountry,
//     entityShipPostCode: e.entityShipPostCode,
//   };
// }

// /** ------------ GET /api/profile ------------- */
// export async function GET(req: NextRequest) {
//   const customerId = getAuthCustomerId(req);
//   if (!customerId) {
//     return NextResponse.json<ProfileResponse>(
//       { ok: false },
//       { status: 401 }
//     );
//   }

//   try {
//     const [person, entity] = await Promise.all([
//       prismaShop.customer_profile_people.findFirst({
//         where: { id__customer: customerId },
//       }),
//       prismaShop.customer_profile_entities.findFirst({
//         where: { id__customer: customerId },
//       }),
//     ]);

//     return NextResponse.json<ProfileResponse>({
//       ok: true,
//       person: mapPersonRecord(person),
//       entity: mapEntityRecord(entity),
//     });
//   } catch (err) {
//     console.error("[profile] GET error", err);
//     return NextResponse.json<ProfileResponse>(
//       { ok: false },
//       { status: 500 }
//     );
//   }
// }

// /** ------------ POST /api/profile ------------- */
// export async function POST(req: NextRequest) {
//   const customerId = getAuthCustomerId(req);
//   if (!customerId) {
//     return NextResponse.json(
//       { ok: false, error: "UNAUTHENTICATED" },
//       { status: 401 }
//     );
//   }

//   let body: { person?: PersonProfileInput; entity?: EntityProfileInput };
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json(
//       { ok: false, error: "INVALID_JSON" },
//       { status: 400 }
//     );
//   }

//   const { person, entity } = body;

//   try {
//     // --------- บุคคลธรรมดา ------------
//     if (person) {
//       const existingPerson =
//         await prismaShop.customer_profile_people.findFirst({
//           where: { id__customer: customerId },
//         });

//       if (existingPerson) {
//         await prismaShop.customer_profile_people.update({
//           where: { id: existingPerson.id },
//           data: {
//             personCompanyName: person.personCompanyName ?? null,
//             personIdCard: person.personIdCard ?? null,
//             personTel: person.personTel ?? null,
//             personMail: person.personMail ?? null,
//             personContactMore: person.personContactMore ?? null,
//             personShipAddr: person.personShipAddr ?? null,
//             personShipDistric: person.personShipDistric ?? null,
//             personShipProvince: person.personShipProvince ?? null,
//             personShipCountry: person.personShipCountry ?? null,
//             personShipPostCode: person.personShipPostCode ?? null,
//             personTaxAddr: person.personTaxAddr ?? null,
//             personTaxDistric: person.personTaxDistric ?? null,
//             personTaxProvince: person.personTaxProvince ?? null,
//             personTaxCountry: person.personTaxCountry ?? null,
//             personTaxPostcode: person.personTaxPostcode ?? null,
//           },
//         });
//       } else {
//         await prismaShop.customer_profile_people.create({
//           data: {
//             id__customer: customerId,
//             personCompanyName: person.personCompanyName ?? null,
//             personIdCard: person.personIdCard ?? null,
//             personTel: person.personTel ?? null,
//             personMail: person.personMail ?? null,
//             personContactMore: person.personContactMore ?? null,
//             personShipAddr: person.personShipAddr ?? null,
//             personShipDistric: person.personShipDistric ?? null,
//             personShipProvince: person.personShipProvince ?? null,
//             personShipCountry: person.personShipCountry ?? null,
//             personShipPostCode: person.personShipPostCode ?? null,
//             personTaxAddr: person.personTaxAddr ?? null,
//             personTaxDistric: person.personTaxDistric ?? null,
//             personTaxProvince: person.personTaxProvince ?? null,
//             personTaxCountry: person.personTaxCountry ?? null,
//             personTaxPostcode: person.personTaxPostcode ?? null,
//           },
//         });
//       }
//     }

//     // --------- นิติบุคคล ------------
//     if (entity) {
//       const existingEntity =
//         await prismaShop.customer_profile_entities.findFirst({
//           where: { id__customer: customerId },
//         });

//       if (existingEntity) {
//         await prismaShop.customer_profile_entities.update({
//           where: { id: existingEntity.id },
//           data: {
//             entityCompanyName: entity.entityCompanyName ?? null,
//             entityCustomerName: entity.entityCustomerName ?? null,
//             entityTel: entity.entityTel ?? null,
//             entityMail: entity.entityMail ?? null,
//             entityContactMore: entity.entityContactMore ?? null,
//             entityTaxId: entity.entityTaxId ?? null,
//             entityTaxAddr: entity.entityTaxAddr ?? null,
//             entityTaxDistric: entity.entityTaxDistric ?? null,
//             entityTaxProvince: entity.entityTaxProvince ?? null,
//             entityTaxCountry: entity.entityTaxCountry ?? null,
//             entityTaxPostcode: entity.entityTaxPostcode ?? null,
//             entityShipAddr: entity.entityShipAddr ?? null,
//             entityShipDistric: entity.entityShipDistric ?? null,
//             entityShipProvince: entity.entityShipProvince ?? null,
//             entityShipCountry: entity.entityShipCountry ?? null,
//             entityShipPostCode: entity.entityShipPostCode ?? null,
//           },
//         });
//       } else {
//         await prismaShop.customer_profile_entities.create({
//           data: {
//             id__customer: customerId,
//             entityCompanyName: entity.entityCompanyName ?? null,
//             entityCustomerName: entity.entityCustomerName ?? null,
//             entityTel: entity.entityTel ?? null,
//             entityMail: entity.entityMail ?? null,
//             entityContactMore: entity.entityContactMore ?? null,
//             entityTaxId: entity.entityTaxId ?? null,
//             entityTaxAddr: entity.entityTaxAddr ?? null,
//             entityTaxDistric: entity.entityTaxDistric ?? null,
//             entityTaxProvince: entity.entityTaxProvince ?? null,
//             entityTaxCountry: entity.entityTaxCountry ?? null,
//             entityTaxPostcode: entity.entityTaxPostcode ?? null,
//             entityShipAddr: entity.entityShipAddr ?? null,
//             entityShipDistric: entity.entityShipDistric ?? null,
//             entityShipProvince: entity.entityShipProvince ?? null,
//             entityShipCountry: entity.entityShipCountry ?? null,
//             entityShipPostCode: entity.entityShipPostCode ?? null,
//           },
//         });
//       }
//     }

//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     console.error("[profile] POST error", err);
//     return NextResponse.json(
//       { ok: false, error: "SERVER_ERROR" },
//       { status: 500 }
//     );
//   }
// }
