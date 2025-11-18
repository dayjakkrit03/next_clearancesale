// src/app/profile/components/EntityContactSection.tsx

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EntityProfile } from "@/types/profile";

type Props = {
  entity: EntityProfile;
  setEntity: React.Dispatch<React.SetStateAction<EntityProfile>>;
};

export default function EntityContactSection({ entity, setEntity }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-base sm:text-lg">
        ข้อมูลติดต่อ (นิติบุคคล)
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>ชื่อลูกค้า (บริษัท/ห้าง/ร้าน)</Label>
          <Input
            value={entity.entityCompanyName ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityCompanyName: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
        <div>
          <Label>ผู้รับ / ผู้สั่งสินค้า</Label>
          <Input
            value={entity.entityCustomerName ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityCustomerName: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
        <div>
          <Label>เบอร์ติดต่อ</Label>
          <Input
            value={entity.entityTel ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityTel: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            maxLength={30}
          />
        </div>
        <div>
          <Label>อีเมล</Label>
          <Input
            type="email"
            value={entity.entityMail ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityMail: e.target.value,
              }))
            }
            maxLength={80}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม</Label>
          <Input
            value={entity.entityContactMore ?? ""}
            onChange={(e) =>
              setEntity((p) => ({
                ...p,
                entityContactMore: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
      </div>
    </section>
  );
}
