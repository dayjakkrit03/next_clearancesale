// v.1.1.2 ===============================================
// src/services/profile.service.ts

import { prismaShop } from "@/lib/db";
import type {
  PersonProfile,
  EntityProfile,
  ProfilePayload,
} from "@/types/profile";

export class ProfileService {
  /** อ่านข้อมูลทั้งหมดของผู้ใช้ (คืนค่าเป็น raw Prisma result) */
  static async getProfile(customerId: bigint) {
    const [person, entity] = await Promise.all([
      prismaShop.customer_profile_people.findFirst({
        where: { id__customer: customerId },
      }),
      prismaShop.customer_profile_entities.findFirst({
        where: { id__customer: customerId },
      }),
    ]);

    return { person, entity };
  }

  /** บันทึกข้อมูลบุคคลธรรมดา */
  static async upsertPerson(customerId: bigint, data: PersonProfile) {
    const existing = await prismaShop.customer_profile_people.findFirst({
      where: { id__customer: customerId },
    });

    if (existing) {
      return prismaShop.customer_profile_people.update({
        where: { id: existing.id },
        data,
      });
    }

    return prismaShop.customer_profile_people.create({
      data: {
        id__customer: customerId,
        ...data,
      },
    });
  }

  /** บันทึกข้อมูลนิติบุคคล */
  static async upsertEntity(customerId: bigint, data: EntityProfile) {
    const existing = await prismaShop.customer_profile_entities.findFirst({
      where: { id__customer: customerId },
    });

    if (existing) {
      return prismaShop.customer_profile_entities.update({
        where: { id: existing.id },
        data,
      });
    }

    return prismaShop.customer_profile_entities.create({
      data: {
        id__customer: customerId,
        ...data,
      },
    });
  }

  /** รวมการบันทึกทั้ง person + entity */
  static async saveProfile(customerId: bigint, body: ProfilePayload) {
    const { person, entity } = body;

    if (person) {
      await this.upsertPerson(customerId, person);
    }

    if (entity) {
      await this.upsertEntity(customerId, entity);
    }

    return true;
  }
}

// v.1.1.2 ===============================================

// // src/services/profile.service.ts

// import { prismaShop } from "@/lib/db";

// export class ProfileService {
//   /** อ่านข้อมูลทั้งหมดของผู้ใช้ */
//   static async getProfile(customerId: bigint) {
//     const [person, entity] = await Promise.all([
//       prismaShop.customer_profile_people.findFirst({
//         where: { id__customer: customerId },
//       }),
//       prismaShop.customer_profile_entities.findFirst({
//         where: { id__customer: customerId },
//       }),
//     ]);

//     return { person, entity };
//   }

//   /** บันทึกข้อมูลบุคคลธรรมดา */
//   static async upsertPerson(customerId: bigint, data: any) {
//     const existing = await prismaShop.customer_profile_people.findFirst({
//       where: { id__customer: customerId },
//     });

//     if (existing) {
//       return prismaShop.customer_profile_people.update({
//         where: { id: existing.id },
//         data,
//       });
//     }

//     return prismaShop.customer_profile_people.create({
//       data: {
//         id__customer: customerId,
//         ...data,
//       },
//     });
//   }

//   /** บันทึกข้อมูลนิติบุคคล */
//   static async upsertEntity(customerId: bigint, data: any) {
//     const existing = await prismaShop.customer_profile_entities.findFirst({
//       where: { id__customer: customerId },
//     });

//     if (existing) {
//       return prismaShop.customer_profile_entities.update({
//         where: { id: existing.id },
//         data,
//       });
//     }

//     return prismaShop.customer_profile_entities.create({
//       data: {
//         id__customer: customerId,
//         ...data,
//       },
//     });
//   }

//   /** รวมการบันทึกทั้ง person + entity */
//   static async saveProfile(customerId: bigint, body: any) {
//     const { person, entity } = body;

//     if (person) {
//       await this.upsertPerson(customerId, person);
//     }

//     if (entity) {
//       await this.upsertEntity(customerId, entity);
//     }

//     return true;
//   }
// }

