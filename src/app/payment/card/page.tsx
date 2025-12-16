

// v.1.1.2 =================================================================
// src/app/payment/card/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
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

export default function PaymentCardPage() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("paymentData");
    if (!storedData) {
      router.replace("/checkout");
      return;
    }

    const data: PaymentData = JSON.parse(storedData);
    setPaymentData(data);
  }, [router]);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>กำลังโหลดรายละเอียดการชำระเงิน...</div>
      </div>
    );
  }

  async function handlePayNow() {
    setIsPaying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/payment/card", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error ?? "เริ่มการชำระเงินไม่สำเร็จ");
      }

      // ถ้า FastAPI ส่ง status = success ก็ถือว่าเรียบร้อย
      if (data.bankStatus && data.bankStatus !== "success") {
        console.warn("[payment.card] bankStatus =", data.bankStatus);
      }

      // ไปหน้า success (จะพา ref_inv ไปด้วยก็ได้)
      const refInvParam = encodeURIComponent(data.refInv ?? "");
      router.push(`/payment/success?ref_inv=${refInvParam}`);
    } catch (err: any) {
      console.error("[payment.card] handlePayNow error =", err);
      setErrorMsg(err.message ?? "ไม่สามารถชำระเงินได้");
    } finally {
      setIsPaying(false);
    }
  }

  const subtotal =
    paymentData.subtotal ??
    paymentData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  const shippingFee = paymentData.shippingFee ?? 0;
  const voucherDiscount =
    paymentData.voucherDiscount ??
    paymentData.appliedVouchers?.reduce(
      (sum, v) => sum + v.discount,
      0,
    ) ??
    0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าชำระเงิน
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  ชำระเงินด้วยบัตรเครดิต/เดบิต
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 space-y-4">
                  <div className="text-lg font-medium">
                    ยอดที่ต้องชำระ: ฿{paymentData.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    หมายเลขคำสั่งซื้อ: {paymentData.orderId || "-"}
                  </div>

                  {/* ปุ่ม PAY → เปิด popup ยืนยันแบบ Laravel */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4 font-semibold">
                        PAY
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pay Now</DialogTitle>
                        <DialogDescription>
                          ท่านจะได้รับสินค้าภายใน 1 วันทำการ
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>การชำระเงินทั้งหมด</span>
                          <span className="font-semibold">
                            ฿{paymentData.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-red-500 text-right">
                          (รวมภาษีมูลค่าเพิ่มแล้ว)
                        </p>

                        {errorMsg && (
                          <p className="text-sm text-red-500 mt-2">
                            {errorMsg}
                          </p>
                        )}
                      </div>

                      <DialogFooter className="mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          disabled={isPaying}
                        >
                          ปิด
                        </Button>
                        <Button onClick={handlePayNow} disabled={isPaying}>
                          {isPaying ? "กำลังดำเนินการ..." : "จ่ายด้วยบัตร"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-6 text-sm text-muted-foreground">
                    รองรับบัตร Visa, MasterCard, JCB
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm space-y-2">
                  <div className="font-medium">ความปลอดภัยในการชำระเงิน</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• การเชื่อมต่อปลอดภัยด้วย SSL</li>
                    <li>• ข้อมูลบัตรได้รับการเข้ารหัส</li>
                    <li>• ผ่านมาตรฐาน PCI DSS</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentData.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        จำนวน: {item.quantity}
                      </div>
                      {item.originalPrice && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            ฿{item.originalPrice.toLocaleString()}
                          </span>
                          {item.discount && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              {item.discount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between text-sm">
                  <span>ราคาสินค้า</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>

                {shippingFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>ค่าจัดส่ง</span>
                    <span>฿{shippingFee.toLocaleString()}</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>ส่วนลดจากโค้ด</span>
                    <span>-฿{voucherDiscount.toLocaleString()}</span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between font-medium text-lg">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>฿{paymentData.amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm space-y-2">
                  <div className="font-medium">หมายเหตุ</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• กรุณาตรวจสอบข้อมูลก่อนชำระเงิน</li>
                    <li>• ระบบจะส่งใบเสร็จทางอีเมล</li>
                    <li>• หากมีปัญหาโปรดติดต่อฝ่ายลูกค้าสัมพันธ์</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// v.1.1.2 =================================================================

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft, CreditCard } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// interface PaymentData {
//   amount: number;
//   orderId: string;
//   items: any[];
//   subtotal?: number;
//   shippingFee?: number;
//   shippingDiscount?: number;
//   voucherDiscount?: number;
//   appliedVouchers?: Array<{
//     code: string;
//     discount: number;
//   }>;
// }

// export default function PaymentCardPage() {
//   const router = useRouter();
//   const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

//   useEffect(() => {
//     const storedData = sessionStorage.getItem('paymentData');
//     if (!storedData) {
//       router.replace('/checkout');
//       return;
//     }
    
//     const data: PaymentData = JSON.parse(storedData);
//     setPaymentData(data);

//     // Create script for K-Payment Gateway (Card Payment)
//     const script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = 'https://kpaymentgateway.kasikornbank.com/ui/v2/kpayment.min.js';
//     script.setAttribute('data-apikey', 'pkey_test_placeholder_key1234567'); // Placeholder API Key
//     script.setAttribute('data-amount', data.amount.toFixed(2));
//     script.setAttribute('data-payment-methods', 'card');
//     script.setAttribute('data-order-id', data.orderId);
    
//     document.body.appendChild(script);

//     return () => {
//       // Cleanup script when component unmounts
//       const existingScript = document.querySelector(`script[src="${script.src}"]`);
//       if (existingScript) {
//         document.body.removeChild(existingScript);
//       }
//     };
//   }, [router]);

//   if (!paymentData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div>กำลังโหลดรายละเอียดการชำระเงิน...</div>
//       </div>
//     );
//   }

//   const handleSimulateSuccess = () => {
//     // In a real scenario, K-Payment Gateway would handle the redirect.
//     // This is for simulation purposes.
//     router.push('/payment/success');
//   };

//   return (
//     <div className="min-h-screen bg-background">
      
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         <div className="mb-6">
//           <Button 
//             variant="ghost" 
//             onClick={() => router.back()}
//             className="mb-4"
//           >
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             กลับไปหน้าชำระเงิน
//           </Button>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Payment Section */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CreditCard className="h-5 w-5" />
//                   ชำระเงินด้วยบัตรเครดิต/เดบิต
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-center p-8">
//                   <div className="text-lg font-medium mb-4">
//                     ยอดที่ต้องชำระ: ฿{paymentData.amount.toLocaleString()}
//                   </div>
//                   <div className="text-sm text-muted-foreground mb-6">
//                     หมายเลขคำสั่งซื้อ: {paymentData.orderId}
//                   </div>
                  
//                   {/* K-Payment Gateway will render a "Pay Now" button here */}
//                   <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
//                     <div className="text-gray-500 text-sm">
//                       ปุ่มชำระเงินจะแสดงที่นี่
//                       <br />
//                       <button 
//                         onClick={handleSimulateSuccess}
//                         className="text-blue-600 hover:text-blue-800 underline cursor-pointer mt-2"
//                       >
//                         (จำลองการชำระเงินสำเร็จ)
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div className="mt-6 text-sm text-muted-foreground">
//                     รองรับบัตร Visa, MasterCard, JCB
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Security Info */}
//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-sm space-y-2">
//                   <div className="font-medium">ความปลอดภัยในการชำระเงิน</div>
//                   <ul className="text-muted-foreground space-y-1">
//                     <li>• การเชื่อมต่อปลอดภัยด้วย SSL</li>
//                     <li>• ข้อมูลบัตรได้รับการเข้ารหัส</li>
//                     <li>• ผ่านมาตรฐาน PCI DSS</li>
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Order Summary */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {paymentData.items.map((item, index) => (
//                   <div key={index} className="flex gap-3">
//                     <img 
//                       src={item.image} 
//                       alt={item.name}
//                       className="w-16 h-16 object-cover rounded-lg"
//                     />
//                     <div className="flex-1">
//                       <div className="font-medium">{item.name}</div>
//                       <div className="text-sm text-muted-foreground">
//                         จำนวน: {item.quantity}
//                       </div>
//                       {item.originalPrice && (
//                         <div className="flex items-center gap-2 mt-1">
//                           <span className="text-sm text-muted-foreground line-through">
//                             ฿{item.originalPrice.toLocaleString()}
//                           </span>
//                           {item.discount && (
//                             <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
//                               {item.discount}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                     <div className="font-medium">
//                       ฿{(item.price * item.quantity).toLocaleString()}
//                     </div>
//                   </div>
//                 ))}
                
//                 <Separator className="my-4" />
                
//                 <div className="flex justify-between text-sm">
//                   <span>ราคาสินค้า</span>
//                   <span>฿{(paymentData.subtotal || paymentData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toLocaleString()}</span>
//                 </div>
                
//                 {(paymentData.shippingFee || 0) > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span>ค่าจัดส่ง</span>
//                     <span>฿{paymentData.shippingFee!.toLocaleString()}</span>
//                   </div>
//                 )}
                
//                 {/* {(paymentData.shippingDiscount || 0) > 0 && (
//                   <div className="flex justify-between text-sm text-green-600">
//                     <span>ส่วนลดค่าจัดส่ง</span>
//                     <span>-฿{paymentData.shippingDiscount!.toLocaleString()}</span>
//                   </div>
//                 )} */}
                
//                 {paymentData.appliedVouchers && paymentData.appliedVouchers.map((voucher, index) => (
//                   <div key={index} className="flex justify-between text-sm text-green-600">
//                     <span>ส่วนลดจากโค้ด ({voucher.code})</span>
//                     <span>-฿{voucher.discount.toLocaleString()}</span>
//                   </div>
//                 ))}
                
//                 {(!paymentData.appliedVouchers || paymentData.appliedVouchers.length === 0) && (paymentData.voucherDiscount || 0) > 0 && (
//                   <div className="flex justify-between text-sm text-green-600">
//                     <span>ส่วนลดจากโค้ด</span>
//                     <span>-฿{paymentData.voucherDiscount!.toLocaleString()}</span>
//                   </div>
//                 )}
                
//                 <Separator className="my-4" />
                
//                 <div className="flex justify-between font-medium text-lg">
//                   <span>ยอดรวมทั้งหมด</span>
//                   <span>฿{paymentData.amount.toLocaleString()}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="pt-6">
//                 <div className="text-sm space-y-2">
//                   <div className="font-medium">หมายเหตุ</div>
//                   <ul className="text-muted-foreground space-y-1">
//                     <li>• กรุณาตรวจสอบข้อมูลก่อนชำระเงิน</li>
//                     <li>• ระบบจะส่งใบเสร็จทางอีเมล</li>
//                     <li>• หากมีปัญหาโปรดติดต่อฝ่ายลูกค้าสัมพันธ์</li>
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }