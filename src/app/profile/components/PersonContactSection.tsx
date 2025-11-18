// src/app/profile/components/PersonContactSection.tsx

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PersonProfile } from "@/types/profile";

type Props = {
  person: PersonProfile;
  setPerson: React.Dispatch<React.SetStateAction<PersonProfile>>;
};

export default function PersonContactSection({ person, setPerson }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="font-semibold text-base sm:text-lg">
        ข้อมูลติดต่อ (บุคคลธรรมดา)
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>ชื่อลูกค้า</Label>
          <Input
            value={person.personCompanyName ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personCompanyName: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
        <div>
          <Label>หมายเลขบัตรประชาชน</Label>
          <Input
            value={person.personIdCard ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personIdCard: e.target.value,
              }))
            }
            maxLength={20}
          />
        </div>
        <div>
          <Label>เบอร์ติดต่อ</Label>
          <Input
            value={person.personTel ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personTel: e.target.value.replace(/[^\d]/g, ""),
              }))
            }
            maxLength={30}
          />
        </div>
        <div>
          <Label>อีเมล</Label>
          <Input
            type="email"
            value={person.personMail ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personMail: e.target.value,
              }))
            }
            maxLength={80}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>รายละเอียดการติดต่อ / ข้อมูลการจัดส่งสินค้าเพิ่มเติม</Label>
          <Input
            value={person.personContactMore ?? ""}
            onChange={(e) =>
              setPerson((p) => ({
                ...p,
                personContactMore: e.target.value,
              }))
            }
            maxLength={50}
          />
        </div>
      </div>
    </section>
  );
}
