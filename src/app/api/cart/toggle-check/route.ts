// v.1.1.2 =============================================
// src/app/api/cart/toggle-check/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prismaShop, setShopSessionTZ } from "@/lib/db";
import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";

type ToggleItemPayload = {
  id: number;
  checked: boolean;
};

type ToggleRequestBody = {
  items: ToggleItemPayload[];
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

    let customerId: number | null = null;
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) customerId = Number(decoded.sub);
    }

    if (!customerId) {
      return NextResponse.json({ status: "login" }, { status: 200 });
    }

    const body = (await req.json()) as ToggleRequestBody | null;
    const items = body?.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: "ok", updated: 0 },
        { status: 200 },
      );
    }

    await setShopSessionTZ();

    const customerIdBig = BigInt(customerId);

    // ใช้ transaction เพื่อความปลอดภัย
    await prismaShop.$transaction(
      items.map((item) =>
        prismaShop.carts.updateMany({
          where: {
            id__customers: customerIdBig,
            id: BigInt(item.id),
            cart_status: 0,
            event_sale: CURRENT_EVENT_SALE as any,
          },
          data: {
            check_product: item.checked,
            updated_at: new Date(),
          },
        }),
      ),
    );

    return NextResponse.json(
      {
        status: "ok",
        updated: items.length,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[api/cart/toggle-check] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 },
    );
  }
}

// v.1.1.2 =============================================

// // src/app/api/cart/toggle-check/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
// import { prismaShop, setShopSessionTZ } from "@/lib/db";
// import { CURRENT_EVENT_SALE } from "@/services/cart/cart.helpers";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const { Ctrue, Cfalse } = body ?? {};

//     // ================================
//     //   ตรวจสอบ token และ customerId
//     // ================================
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
//     let customerId: number | null = null;

//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) {
//         customerId = Number(decoded.sub);
//       }
//     }

//     if (!customerId) {
//       return NextResponse.json({ status: "login" });
//     }

//     await setShopSessionTZ();

//     // -------------------------------
//     // CHECK ALL
//     // -------------------------------
//     if (Array.isArray(Ctrue) && Cfalse == null) {
//       await prismaShop.carts.updateMany({
//         where: {
//           id__customers: BigInt(customerId),
//           cart_status: 0,
//           event_sale: CURRENT_EVENT_SALE,
//         },
//         data: { check_product: true, updated_at: new Date() },
//       });

//       return NextResponse.json({ status: "checked-all" });
//     }

//     // -------------------------------
//     // UNCHECK ALL
//     // -------------------------------
//     if (Array.isArray(Cfalse) && Ctrue == null) {
//       await prismaShop.carts.updateMany({
//         where: {
//           id__customers: BigInt(customerId),
//           cart_status: 0,
//           event_sale: CURRENT_EVENT_SALE,
//         },
//         data: { check_product: false, updated_at: new Date() },
//       });

//       return NextResponse.json({ status: "unchecked-all" });
//     }

//     // -------------------------------
//     // PARTIAL CHECK / UNCHECK
//     // -------------------------------
//     if (Array.isArray(Ctrue) || Array.isArray(Cfalse)) {
//       if (Array.isArray(Ctrue) && Ctrue.length > 0) {
//         await prismaShop.carts.updateMany({
//           where: {
//             id__customers: BigInt(customerId),
//             id: { in: Ctrue.map((id: number) => BigInt(id)) },
//           },
//           data: { check_product: true, updated_at: new Date() },
//         });
//       }

//       if (Array.isArray(Cfalse) && Cfalse.length > 0) {
//         await prismaShop.carts.updateMany({
//           where: {
//             id__customers: BigInt(customerId),
//             id: { in: Cfalse.map((id: number) => BigInt(id)) },
//           },
//           data: { check_product: false, updated_at: new Date() },
//         });
//       }

//       return NextResponse.json({ status: "partial-updated" });
//     }

//     return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
//   } catch (err: any) {
//     console.error("[api/cart/toggle-check] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }
