// v.1.1.2 =============================================
// src/app/api/cart/add/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { addToCartService, getCartSummary } from "@/services/cart/cart.service";
import type { AddToCartRequest } from "@/types/cart";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AddToCartRequest;

    const { product, quantity, uom, price } = body;

    if (!product || !quantity || !uom || price == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ============================
     *   ตรวจสอบ JWT Token
     * ============================ */
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

    let customerId: number | null = null;
    if (token) {
      const decoded = verifyAuthToken(token);
      if (decoded?.sub) {
        customerId = Number(decoded.sub);
      }
    }

    /* ============================
     *   เรียก service add cart
     * ============================ */
    const result = await addToCartService({
      customerId,
      payload: { product, quantity, uom, price },
    });

    /* ============================
     *   ส่งผลลัพธ์กลับไป frontend แบบใหม่
     *   (รวม summary กลับไปด้วย)
     * ============================ */

    switch (result.status) {
      case "success": {
        const summary = await getCartSummary(customerId);
        return NextResponse.json(
          {
            status: "success",
            summary,
          },
          { status: 201 }
        );
      }

      case "login":
        return NextResponse.json(
          { status: "login" },
          { status: 200 }
        );

      case "less-left":
        return NextResponse.json(
          {
            status: "less-left",
            itemAvail: result.itemAvail,
          },
          { status: 200 }
        );

      case "sold-out":
      default:
        return NextResponse.json(
          { status: "sold-out" },
          { status: 200 }
        );
    }
  } catch (err: any) {
    console.error("[api/cart/add] ERROR", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message },
      { status: 500 }
    );
  }
}

// v.1.1.2 =============================================

// // src/app/api/cart/add/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";
// import { addToCartService } from "@/services/cart/cart.service";
// import type { AddToCartRequest } from "@/types/cart";

// export async function POST(req: NextRequest) {
//   try {
//     const body = (await req.json()) as AddToCartRequest;

//     const { product, quantity, uom, price } = body;

//     if (!product || !quantity || !uom || price == null) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     /* ============================
//      *   ตรวจสอบ JWT Token
//      * ============================ */
//     const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || null;

//     let customerId: number | null = null;
//     if (token) {
//       const decoded = verifyAuthToken(token);
//       if (decoded?.sub) {
//         customerId = Number(decoded.sub);
//       }
//     }

//     /* ============================
//      *   เรียก service add cart
//      * ============================ */
//     const result = await addToCartService({
//       customerId,
//       payload: {
//         product,
//         quantity,
//         uom,
//         price,
//       },
//     });

//     /* ============================
//      *   ส่งผลลัพธ์กลับไป frontend
//      * ============================ */

//     switch (result.status) {
//       case "success":
//         return NextResponse.json({ status: "success" }, { status: 201 });

//       case "login":
//         return NextResponse.json({ status: "login" }, { status: 200 });

//       case "less-left":
//         return NextResponse.json(
//           {
//             status: "less-left",
//             itemAvail: result.itemAvail,
//           },
//           { status: 200 }
//         );

//       case "sold-out":
//       default:
//         return NextResponse.json(
//           { status: "sold-out" },
//           { status: 200 }
//         );
//     }
//   } catch (err: any) {
//     console.error("[api/cart/add] ERROR", err);
//     return NextResponse.json(
//       { error: "Internal Server Error", message: err?.message },
//       { status: 500 }
//     );
//   }
// }
