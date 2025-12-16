// src/services/checkout/checkout.crud.ts

import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";

/**
 * โครงสร้าง data_checkout ที่จะเก็บในตาราง inv.data_checkout
 * ตอนนี้ใช้ any ไปก่อน ให้ยืดหยุ่น (คือ payload ที่ส่งไป FastAPI / KBank mock)
 */
export type CheckoutDataPayload = any;

/* ======================================================
 * 1) ดึง + อัปเดตเลข ref_inv จากตาราง counts
 *    เทียบกับ Laravel เดิม:
 *    - Count::where('section','ref_inv')->pluck('count')->first() + 1
 *    - Count::where('section','ref_inv')->increment('count',1);
 * ====================================================== */

export async function getNextRefInv(): Promise<{
  refInv: string;
  nextCount: number;
}> {
  await setShopSessionTZ();

  const row = await prismaShop.counts.findFirst({
    where: { section: "ref_inv" },
  });

  if (!row) {
    throw new Error("[checkout.crud] counts(section=ref_inv) not found");
  }

  const currentCountRaw: any = row.count ?? 0;
  const currentCount = Number(currentCountRaw) || 0;
  const nextCount = currentCount + 1;

  // update กลับไปที่ counts โดยอิง primary key = id
  await prismaShop.counts.update({
    where: { id: row.id },
    data: { count: nextCount },
  });

  // สร้างรหัส SOE-yy-00001 ตาม pattern Laravel
  const now = new Date();
  const year2 = now.getFullYear().toString().slice(-2);
  const running = String(nextCount).padStart(5, "0");
  const refInv = `SOE-${year2}-${running}`;

  return { refInv, nextCount };
}

/* ======================================================
 * 2) เพิ่ม record ใน ref_to_invs
 *    เทียบกับ Laravel:
 *    RefToInv::create(['ref_inv' => $ref_inv, 'chrg_id' => '' ]);
 * ====================================================== */

export async function createRefToInv(refInv: string) {
  await setShopSessionTZ();

  await prismaShop.ref_to_invs.create({
    data: {
      ref_inv: refInv,
      inv: null,
      chrg_id: "", // ต้องใส่ค่า เพราะ field นี้ not null
    },
  });
}

/* ======================================================
 * 3) เพิ่ม record ใน inv
 *    เทียบกับ Laravel:
 *    Inv::create([
 *      'inv' => null,
 *      'chrg_id' => '',
 *      'data_checkout' => json_encode($datasend),
 *      'data_sales_header' => '',
 *      'data_sales_line' => '',
 *      'id__customers' => $id_record_customers,
 *      'ref_inv' => $ref_inv,
 *      'lead_time' => ''
 *    ]);
 * ====================================================== */

export type CreateInvParams = {
  customerId: number | bigint;
  refInv: string;
  dataCheckout: CheckoutDataPayload;
};

export async function createInvRecord(
  params: CreateInvParams
): Promise<{ id: number }> {
  await setShopSessionTZ();

  const cid =
    typeof params.customerId === "bigint"
      ? params.customerId
      : BigInt(params.customerId);

  const created = await prismaShop.inv.create({
    data: {
      inv: null,
      chrg_id: "", // ยังไม่รู้ charge id ตอนนี้
      data_checkout: JSON.stringify(params.dataCheckout),
      data_sales_header: "",
      data_sales_line: "",
      inv_status: false,
      reserve: false,
      id__customers: cid,
      event_sale: CURRENT_EVENT_SALE as any,
      ref_inv: params.refInv,
      complete: false,
      lead_time: "",
    },
  });

  const newId = Number(created.id) || 0;
  return { id: newId };
}

/* ======================================================
 * 4) Helper รวม: เตรียม ref_inv + ref_to_invs + inv
 *    ไว้ให้ service เรียกทีเดียวตอนจะยิงไป FastAPI
 * ====================================================== */

export type PreparePaymentRecordsParams = {
  customerId: number | bigint;
  dataCheckout: CheckoutDataPayload;
};

export type PreparePaymentRecordsResult = {
  refInv: string;
  invId: number;
  count: number;
};

export async function preparePaymentRecords(
  params: PreparePaymentRecordsParams
): Promise<PreparePaymentRecordsResult> {
  // 1) gen ref_inv + update counts
  const { refInv, nextCount } = await getNextRefInv();

  // 2) create ref_to_invs
  await createRefToInv(refInv);

  // 3) create inv
  const { id: invId } = await createInvRecord({
    customerId: params.customerId,
    refInv,
    dataCheckout: params.dataCheckout,
  });

  return {
    refInv,
    invId,
    count: nextCount,
  };
}
