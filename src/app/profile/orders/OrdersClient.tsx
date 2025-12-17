// v.1.1.4 version แก้ไข ui ============================================================
// // // src/app/profile/orders/OrdersClient.tsx
// "use client";

// import Image from "next/image";
// import { useState, useMemo } from "react";
// import {
//   CheckCircle2,
//   Package,
//   Calendar,
//   Hash,
//   Phone,
// } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardHeader,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// /* ===================== TYPES ===================== */

// export type OrderSalesLine = {
//   sku: string;
//   quantity: number;
//   unit: string;
//   price: number;
//   amount: number;
//   imageUrl?: string | null;
// };

// export type OrderItem = {
//   id: number | string;
//   inv: string | null;
//   ref_inv?: string | null;
//   reserve: boolean;
//   updated_at: string; // ← มาจาก DB ตรง ๆ
//   lead_time?: string | null;
//   salesLines: OrderSalesLine[];
// };

// type Props = {
//   orders: OrderItem[];
//   reserves?: OrderItem[];
// };

// /* ===================== HELPERS ===================== */

// function calcTotal(lines: OrderSalesLine[]) {
//   return lines.reduce((sum, l) => sum + (l.amount || 0), 0);
// }

// /* ===================== COMPONENT ===================== */

// export default function OrdersClient({
//   orders,
//   reserves = [],
// }: Props) {
//   const [mode, setMode] = useState<"order" | "reserve">("order");

//   const list = mode === "order" ? orders : reserves;

//   if (!list || list.length === 0) {
//     return (
//       <div className="py-24 text-center text-muted-foreground">
//         ไม่มีประวัติข้อมูล
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* selector */}
//       <div className="max-w-xs">
//         <select
//           className="w-full rounded-md border px-3 py-2 text-sm"
//           value={mode}
//           onChange={(e) => setMode(e.target.value as any)}
//         >
//           <option value="order">ประวัติการสั่งซื้อ</option>
//           <option value="reserve">ประวัติการสั่งจอง</option>
//         </select>
//       </div>

//       {/* list */}
//       <div className="space-y-6">
//         {list.map((order) => {
//           const total = calcTotal(order.salesLines);

//           return (
//             <Card key={order.id} className="shadow-sm">
//               <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
//                   <Calendar className="h-4 w-4" />
//                   <span>{order.updated_at}</span>
//                 </div>

//                 <Badge className="flex items-center gap-1 bg-green-600">
//                   <CheckCircle2 className="h-4 w-4" />
//                   {order.reserve ? "จองสำเร็จ" : "ชำระเงินสำเร็จ"}
//                 </Badge>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 {/* items */}
//                 <div className="space-y-4">
//                   {order.salesLines.map((line, idx) => (
//                     <div
//                       key={idx}
//                       className="flex items-center gap-4"
//                     >
//                       <div className="relative h-14 w-14 shrink-0 rounded-md border bg-white">
//                         <Image
//                           src={line.imageUrl || "/placeholder.png"}
//                           alt={line.sku}
//                           fill
//                           className="object-contain p-2"
//                         />
//                       </div>

//                       <div className="flex-1">
//                         <div className="font-medium">
//                           {line.sku}
//                         </div>
//                         <div className="text-sm text-muted-foreground">
//                           {line.quantity} {line.unit} ×{" "}
//                           {line.price.toFixed(2)} ฿
//                         </div>
//                       </div>

//                       <div className="font-semibold">
//                         {line.amount.toFixed(2)} ฿
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <Separator />

//                 {/* footer */}
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div className="space-y-1 text-sm">
//                     {order.inv && (
//                       <div className="flex items-center gap-2">
//                         <Hash className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-muted-foreground">
//                           เลขที่เอกสาร:
//                         </span>
//                         <Badge variant="secondary">
//                           {order.inv}
//                         </Badge>
//                       </div>
//                     )}

//                     {order.lead_time && (
//                       <div className="flex items-center gap-2">
//                         <Package className="h-4 w-4 text-muted-foreground" />
//                         <span>{order.lead_time}</span>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-2">
//                       <Phone className="h-4 w-4 text-muted-foreground" />
//                       <a
//                         href="tel:026661111"
//                         className="hover:underline"
//                       >
//                         02 666 1111 ต่อ 1423
//                       </a>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <div className="text-sm text-muted-foreground">
//                       ยอดทั้งหมด
//                     </div>
//                     <div className="text-2xl font-bold text-primary">
//                       {total.toFixed(2)} ฿
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


// v.1.1.4 version แก้ไข ui ============================================================

// v.1.1.3 version แปลงเป้นเวลาไทย ======================================================
// src/app/profile/orders/OrdersClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import OrderLinesTable from "./components/OrderLinesTable";

/* ===================== TYPES ===================== */

type SalesLine = {
  item_NoField: string;
  quantityField: number;
  unit_of_Measure_CodeField: string;
  unit_PriceField: number;
  amountField: number;
  imageUrl?: string | null;
};

type InvRow = {
  id: bigint;
  inv?: string | null;
  ref_inv?: string | null;
  reserve: boolean;
  updated_at?: Date | null;
  lead_time?: string | null;
  salesLines: SalesLine[];
};

type Props = {
  orders: InvRow[];
  reserves: InvRow[];
};

/* ===================== HELPERS ===================== */

/** แปลง Date เป็นเวลาไทย (Asia/Bangkok) */
function formatThaiDate(d?: string | Date | null) {
  if (!d) return "-";

  const date = new Date(d);

  // 🔑 ลบ 7 ชั่วโมง
  date.setHours(date.getHours() - 7);

  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ===================== COMPONENT ===================== */

export default function OrdersClient({ orders, reserves }: Props) {
  const [mode, setMode] = useState<"order" | "reserve">("order");
  const { toast } = useToast();

  // ✅ แสดง toast หลัง redirect จาก payment (ครั้งเดียว)
  useEffect(() => {
    const raw = sessionStorage.getItem("post_payment_toast");
    if (!raw) return;

    sessionStorage.removeItem("post_payment_toast");

    try {
      const data = JSON.parse(raw);
      toast({
        title: data.title,
        description: data.description,
        variant: "default",
      });
    } catch {
      // กันพังเงียบ ๆ
    }
  }, [toast]);

  const list = mode === "order" ? orders : reserves;

   
    
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ===== Toggle ===== */}
      <div className="mb-6">
        <select
          className="w-full max-w-xs border border-blue-800 border-b-2 rounded px-3 py-2"
          value={mode}
          onChange={(e) =>
            setMode(e.target.value === "reserve" ? "reserve" : "order")
          }
        >
          <option value="order">ประวัติการสั่งซื้อ</option>
          <option value="reserve">ประวัติการสั่งจอง</option>
        </select>
      </div>

      {/* ===== Empty ===== */}
      {list.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <h1 className="text-2xl">ประวัติข้อมูลการสั่งซื้อ</h1>
        </div>
      ) : (
        <div className="space-y-10">
          {list.map((inv) => {
            const total = inv.salesLines.reduce(
              (sum, l) => sum + Number(l.amountField || 0),
              0,
            );

            return (
              <div
                key={String(inv.id)}
                className="border rounded-lg shadow-sm"
              >
                {/* ===== Header ===== */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="text-sm text-gray-600">
                    {formatThaiDate(inv.updated_at)}
                  </span>

                  {mode === "order" ? (
                    <span className="px-3 py-1 text-sm rounded bg-green-600 text-white">
                      ชำระเงินสำเร็จ
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded bg-purple-700 text-white">
                      จองสินค้าสำเร็จ
                    </span>
                  )}
                </div>

                {/* ===== Body ===== */}
                <div className="p-4">
                  <OrderLinesTable lines={inv.salesLines} />
                </div>

                {/* ===== Footer ===== */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-4 border-t">
                  <div className="text-sm">
                    <div>
                      <span className="font-medium">เลขที่เอกสาร: </span>
                      <span className="inline-block bg-gray-200 rounded px-2 py-0.5">
                        {inv.inv || inv.ref_inv || "-"}
                      </span>
                    </div>

                    {inv.lead_time && (
                      <div className="mt-1">{inv.lead_time}</div>
                    )}

                    <div className="mt-1">
                      ติดต่อ:{" "}
                      <a
                        href="tel:+6626661111"
                        className="text-black underline"
                      >
                        02 666 1111 ต่อ 1423
                      </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">
                      {mode === "order"
                        ? "ยอดคำสั่งซื้อทั้งหมด"
                        : "ยอดคำสั่งจองทั้งหมด"}
                    </div>
                    <div className="text-xl font-semibold text-blue-600">
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ฿
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// v.1.1.3 ======================================================

// v.1.1.2 ======================================================
// // src/app/profile/orders/OrdersClient.tsx
// "use client";

// import { useState } from "react";
// import OrderLinesTable from "./components/OrderLinesTable";

// type SalesLine = {
//   item_NoField: string;
//   quantityField: number;
//   unit_of_Measure_CodeField: string;
//   unit_PriceField: number;
//   amountField: number;
//   imageUrl?: string | null;
// };

// type InvRow = {
//   id: bigint;
//   inv?: string | null;
//   ref_inv?: string | null;
//   reserve: boolean;
//   updated_at?: Date | null;
//   lead_time?: string | null;
//   salesLines: SalesLine[];
// };

// type Props = {
//   orders: InvRow[];
//   reserves: InvRow[];
// };

// export default function OrdersClient({ orders, reserves }: Props) {
//   const [mode, setMode] = useState<"order" | "reserve">("order");

//   const list = mode === "order" ? orders : reserves;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* ===== Toggle ===== */}
//       <div className="mb-6">
//         <select
//           className="w-full max-w-xs border border-blue-800 border-b-2 rounded px-3 py-2"
//           value={mode}
//           onChange={(e) =>
//             setMode(e.target.value === "reserve" ? "reserve" : "order")
//           }
//         >
//           <option value="order">ประวัติการสั่งซื้อ</option>
//           <option value="reserve">ประวัติการสั่งจอง</option>
//         </select>
//       </div>

//       {/* ===== Empty ===== */}
//       {list.length === 0 ? (
//         <div className="text-center text-gray-400 py-20">
//           <h1 className="text-2xl">ประวัติข้อมูลการสั่งซื้อ</h1>
//         </div>
//       ) : (
//         <div className="space-y-10">
//           {list.map((inv) => {
//             const total = inv.salesLines.reduce(
//               (sum, l) => sum + Number(l.amountField || 0),
//               0,
//             );

//             return (
//               <div
//                 key={String(inv.id)}
//                 className="border rounded-lg shadow-sm"
//               >
//                 {/* ===== Header ===== */}
//                 <div className="flex items-center justify-between px-4 py-3 border-b">
//                   <span className="text-sm text-gray-600">
//                     {inv.updated_at
//                       ? new Date(inv.updated_at).toLocaleString("th-TH")
//                       : "-"}
//                   </span>

//                   {mode === "order" ? (
//                     <span className="px-3 py-1 text-sm rounded bg-green-600 text-white">
//                       ชำระเงินสำเร็จ
//                     </span>
//                   ) : (
//                     <span className="px-3 py-1 text-sm rounded bg-purple-700 text-white">
//                       จองสินค้าสำเร็จ
//                     </span>
//                   )}
//                 </div>

//                 {/* ===== Body ===== */}
//                 <div className="p-4">
//                   <OrderLinesTable lines={inv.salesLines} />
//                 </div>

//                 {/* ===== Footer ===== */}
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-4 border-t">
//                   <div className="text-sm">
//                     <div>
//                       <span className="font-medium">
//                         เลขที่เอกสาร:{" "}
//                       </span>
//                       <span className="inline-block bg-gray-200 rounded px-2 py-0.5">
//                         {inv.inv || inv.ref_inv || "-"}
//                       </span>
//                     </div>

//                     {inv.lead_time && (
//                       <div className="mt-1">{inv.lead_time}</div>
//                     )}

//                     <div className="mt-1">
//                       ติดต่อ:{" "}
//                       <a
//                         href="tel:+6626661111"
//                         className="text-black underline"
//                       >
//                         02 666 1111 ต่อ 1423
//                       </a>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <div className="text-sm">
//                       {mode === "order"
//                         ? "ยอดคำสั่งซื้อทั้งหมด"
//                         : "ยอดคำสั่งจองทั้งหมด"}
//                     </div>
//                     <div className="text-xl font-semibold text-blue-600">
//                       {total.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}{" "}
//                       ฿
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// v.1.1.2 ======================================================

// // src/app/profile/orders/OrdersClient.tsx
// "use client";

// import { useState } from "react";

// type InvRow = {
//   id: bigint;
//   inv?: string | null;
//   ref_inv?: string | null;
//   reserve: boolean;
//   updated_at?: Date | null;
//   lead_time?: string | null;
//   data_sales_line?: string | null;
// };

// type Props = {
//   orders: InvRow[];
//   reserves: InvRow[];
// };

// /**
//  * OrdersClient
//  * - toggle ประวัติการสั่งซื้อ / สั่งจอง
//  * - ตอนนี้แสดงโครงก่อน (ยังไม่ map sales line)
//  */
// export default function OrdersClient({ orders, reserves }: Props) {
//   const [mode, setMode] = useState<"order" | "reserve">("order");

//   const list = mode === "order" ? orders : reserves;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* ===== Header / Toggle ===== */}
//       <div className="mb-6">
//         <select
//           className="w-full max-w-xs border border-blue-800 border-b-2 rounded px-3 py-2"
//           value={mode}
//           onChange={(e) =>
//             setMode(e.target.value === "reserve" ? "reserve" : "order")
//           }
//         >
//           <option value="order">ประวัติการสั่งซื้อ</option>
//           <option value="reserve">ประวัติการสั่งจอง</option>
//         </select>
//       </div>

//       {/* ===== List ===== */}
//       {list.length === 0 ? (
//         <div className="text-center text-gray-400 py-20">
//           <h1 className="text-2xl">ประวัติข้อมูลการสั่งซื้อ</h1>
//         </div>
//       ) : (
//         <div className="space-y-8">
//           {list.map((item) => (
//             <div
//               key={String(item.id)}
//               className="border rounded-lg shadow-sm"
//             >
//               {/* Header */}
//               <div className="flex items-center justify-between px-4 py-3 border-b">
//                 <span className="text-sm text-gray-600">
//                   {item.updated_at
//                     ? new Date(item.updated_at).toLocaleString("th-TH")
//                     : "-"}
//                 </span>

//                 {mode === "order" ? (
//                   <span className="px-3 py-1 text-sm rounded bg-green-600 text-white">
//                     ชำระเงินสำเร็จ
//                   </span>
//                 ) : (
//                   <span className="px-3 py-1 text-sm rounded bg-purple-700 text-white">
//                     จองสินค้าสำเร็จ
//                   </span>
//                 )}
//               </div>

//               {/* Body (placeholder ก่อน) */}
//               <div className="p-4 text-sm text-gray-700">
//                 <p>
//                   <strong>เลขที่เอกสาร:</strong>{" "}
//                   {item.inv || item.ref_inv || "-"}
//                 </p>

//                 {item.lead_time && (
//                   <p className="mt-1">{item.lead_time}</p>
//                 )}

//                 <p className="mt-2 text-gray-400">
//                   (รายละเอียดสินค้า จะเพิ่มในขั้นถัดไป)
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
