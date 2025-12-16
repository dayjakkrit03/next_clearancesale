// v.1.1.2 =================================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Package } from "lucide-react";

/** ให้หน้า success ใช้โครงเดียวกับหน้า /payment/qr, /payment/card */
interface PaymentItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  image: string;
  originalPrice?: number;
  discount?: string;
}

interface PaymentData {
  amount: number;
  orderId: string;
  items: PaymentItem[];
  subtotal?: number;
  shippingFee?: number;
  shippingDiscount?: number;
  voucherDiscount?: number;
  appliedVouchers?: Array<{
    code: string;
    discount: number;
  }>;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  // helper format date
  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    try {
      // 1) ดึงจาก sessionStorage (ข้อมูลเดียวกับที่หน้า qr/card ใช้)
      const storedData = sessionStorage.getItem("paymentData");

      if (!storedData) {
        // ถ้าไม่มี data เลย → เป็นการเข้า url ตรง
        // ตอนนี้ให้ redirect กลับหน้าแรกไปก่อน (ชั่วคราว)
        router.replace("/");
        return;
      }

      const data: PaymentData = JSON.parse(storedData);

      // 2) เผื่ออนาคตอยากให้ bank redirect มา พร้อม orderId/amount ใน query
      //    ตอนนี้ถ้ามี query ก็เอามาทับได้ เช่น /payment/success?orderId=XXX
      const orderIdFromQuery = searchParams.get("orderId");
      const amountFromQuery = searchParams.get("amount");

      const merged: PaymentData = {
        ...data,
        orderId: orderIdFromQuery || data.orderId,
        amount: amountFromQuery ? Number(amountFromQuery) : data.amount,
      };

      setPaymentData(merged);
    } catch (e) {
      console.error("Failed to load payment data:", e);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router, searchParams]);

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              ขอบคุณสำหรับการสั่งซื้อ!
            </h1>
            <div className="text-3xl font-bold text-primary mb-4">
              ฿{paymentData.amount.toLocaleString()}
            </div>
            <p className="text-gray-600 mb-2">หมายเลขคำสั่งซื้อของคุณคือ</p>
            <p className="text-lg font-semibold text-gray-800">
              {paymentData.orderId}
            </p>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-gray-600 mb-2">ชำระเงินเรียบร้อยแล้ว</p>
              <div className="text-2xl font-bold text-primary">
                ฿{paymentData.amount.toLocaleString()}
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-4">วันที่จัดส่งของคุณ</h3>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">สินค้าทั้งหมด</p>
                  <p className="text-sm text-gray-600">
                    {paymentData.items.length} รายการ
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-20 md:pl-4">
                <p className="text-sm text-gray-600">คาดว่าจะส่งภายใน</p>
                <p className="font-semibold">
                  {formatDate(2)} - {formatDate(5)}
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                สำหรับรายละเอียดเพิ่มเติม ติดตามสถานะการจัดส่งได้ที่
              </p>
              <Button
                variant="outline"
                className="text-primary hover:text-primary/80"
              >
                ดูคำสั่งซื้อ
              </Button>
            </div>
          </div>

          {/* Email Confirmation (mock text ไว้ก่อน) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-blue-700">
                เราได้ส่งอีเมลยืนยันไปยัง customer@example.com พร้อมรายละเอียดคำสั่งซื้อแล้ว
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">สรุปคำสั่งซื้อ</h3>

            <div className="space-y-4">
              {paymentData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      จำนวน: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">รวมทั้งสิ้น</span>
                <span className="font-bold text-xl text-primary">
                  ฿{paymentData.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => router.push("/")}>
              ช็อปต่อ
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => router.push("/cart")}
            >
              ดูตะกร้าสินค้า
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// v.1.1.2 =================================================================

// "use client";

// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { CheckCircle, Mail, Package } from "lucide-react";

// // Mock data for demonstration purposes, making the page standalone.
// const mockPaymentData = {
//   amount: 7986.00,
//   orderId: "ORDER-MOCK-12345",
//   items: [
//     {
//       id: "1",
//       name: "Switch 24 Port Gigabit",
//       quantity: 1,
//       price: 2899,
//       image: "/assets/switch-24port.jpg",
//     },
//     {
//       id: "2",
//       name: "สายแลน Cat6 UTP Cable 305m",
//       quantity: 2,
//       price: 1599,
//       image: "/assets/lan-cable-cat6.jpg",
//     },
//     {
//       id: "3",
//       name: "WiFi Router AC1200",
//       quantity: 1,
//       price: 1899,
//       image: "/assets/wifi-router-ac1200.jpg",
//     },
//   ],
// };

// export default function PaymentSuccessPage() {
//   const router = useRouter();
//   const paymentData = mockPaymentData;

//   const formatDate = (daysFromNow: number) => {
//     const date = new Date();
//     date.setDate(date.getDate() + daysFromNow);
//     return date.toLocaleDateString('th-TH', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="py-8">
//         <div className="max-w-2xl mx-auto px-4">
//           {/* Success Header */}
//           <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
//             <div className="flex justify-center mb-4">
//               <CheckCircle className="h-16 w-16 text-green-500" />
//             </div>
//             <h1 className="text-2xl font-bold text-green-600 mb-2">
//               ขอบคุณสำหรับการสั่งซื้อ!
//             </h1>
//             <div className="text-3xl font-bold text-primary mb-4">
//               ฿{paymentData.amount.toLocaleString()}
//             </div>
//             <p className="text-gray-600 mb-2">หมายเลขคำสั่งซื้อของคุณคือ</p>
//             <p className="text-lg font-semibold text-gray-800">
//               {paymentData.orderId}
//             </p>
//           </div>

//           {/* Delivery Information */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <div className="text-center mb-4">
//               <p className="text-gray-600 mb-2">
//                 ชำระเงินเรียบร้อยแล้ว
//               </p>
//               <div className="text-2xl font-bold text-primary">
//                 ฿{paymentData.amount.toLocaleString()}
//               </div>
//             </div>

//             <h3 className="font-semibold text-lg mb-4">วันที่จัดส่งของคุณ</h3>
            
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-4">
//                 <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Package className="h-8 w-8 text-primary" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium">สินค้าทั้งหมด</p>
//                   <p className="text-sm text-gray-600">{paymentData.items.length} รายการ</p>
//                 </div>
//               </div>
//               <div className="text-right flex-shrink-0 pl-20 md:pl-4">
//                 <p className="text-sm text-gray-600">คาดว่าจะส่งภายใน</p>
//                 <p className="font-semibold">{formatDate(2)} - {formatDate(5)}</p>
//               </div>
//             </div>

//             <div className="mt-4 text-center">
//               <p className="text-sm text-gray-600 mb-2">
//                 สำหรับรายละเอียดเพิ่มเติม ติดตามสถานะการจัดส่งได้ที่ 
//               </p>
//               <Button variant="outline" className="text-primary hover:text-primary/80">
//                 ดูคำสั่งซื้อ
//               </Button>
//             </div>
//           </div>

//           {/* Email Confirmation */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center space-x-3">
//               <Mail className="h-5 w-5 text-blue-500" />
//               <p className="text-sm text-blue-700">
//                 เราได้ส่งอีเมลยืนยันไปยัง customer@example.com พร้อมรายละเอียดคำสั่งซื้อแล้ว
//               </p>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h3 className="font-semibold text-lg mb-4">สรุปคำสั่งซื้อ</h3>
            
//             <div className="space-y-4">
//               {paymentData.items.map((item, index) => (
//                 <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
//                   <img 
//                     src={item.image} 
//                     alt={item.name}
//                     className="w-16 h-16 object-cover rounded-lg"
//                   />
//                   <div className="flex-1">
//                     <p className="font-medium">{item.name}</p>
//                     <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-semibold">฿{(item.price * item.quantity).toLocaleString()}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="border-t mt-4 pt-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-semibold text-lg">รวมทั้งสิ้น</span>
//                 <span className="font-bold text-xl text-primary">
//                   ฿{paymentData.amount.toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="space-y-3">
//             <Button 
//               className="w-full"
//               size="lg"
//               onClick={() => router.push("/")}
//             >
//               ช็อปต่อ
//             </Button>
            
//             <Button 
//               variant="outline" 
//               className="w-full"
//               size="lg"
//               onClick={() => router.push("/cart")}
//             >
//               ดูตะกร้าสินค้า
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }