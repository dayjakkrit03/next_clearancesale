// v.1.1.3 ===================================================================
// src/app/register/page.tsx

import { Metadata } from "next";
import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | Interlink Shop",
};

export default function RegisterPage() {
  return (
    <div className=" min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
          สมัครสมาชิกใหม่
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
          สมัครสมาชิก Interlink Shop เพื่อสะสมประวัติการสั่งซื้อและใช้งานฟีเจอร์พิเศษ
        </p>

        {/* ฟอร์มสมัครสมาชิก + ยืนยันรหัส */}
        <RegisterForm />

        {/* 🔹 ปุ่ม Social Register อยู่ตรงนี้เหมือนเดิม */}
        {/* <div className="mt-6">
          <AuthSocialButtons mode="register" />
        </div> */}

        {/* Terms */}
        <p className="mt-6 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
          การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
          <a href="/terms" className="text-primary hover:underline">
            เงื่อนไขการใช้งาน
          </a>{" "}
          และ{" "}
          <a href="/privacy" className="text-primary hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>{" "}
          ของ Interlink Shop
        </p>

        <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <a href="/login" className="text-primary hover:underline">
            เข้าสู่ระบบที่นี่
          </a>
        </p>
      </div>
    </div>
  );
}

// v.1.1.3 ===================================================================

// v.1.1.2 ===================================================================
// // src/app/register/page.tsx

// import { Metadata } from "next";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";

// export const metadata: Metadata = {
//   title: "สมัครสมาชิก | Interlink Shop",
// };

// export default function RegisterPage() {
//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           สมัครสมาชิกใหม่
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           สมัครสมาชิก Interlink Shop เพื่อสะสมประวัติการสั่งซื้อและใช้งานฟีเจอร์พิเศษ
//         </p>

//         <form className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">ชื่อ-นามสกุล</Label>
//             <Input id="name" placeholder="ชื่อ-นามสกุล" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input id="email" type="email" placeholder="you@example.com" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input id="password" type="password" placeholder="อย่างน้อย 8 ตัวอักษร" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
//             <Input id="confirm" type="password" placeholder="กรอกรหัสผ่านอีกครั้ง" />
//           </div>

//           <Button type="submit" className="w-full">
//             สมัครสมาชิก
//           </Button>
//         </form>

//         {/* 🔹 ปุ่ม Social Register อยู่ตรงนี้ */}
//         <div className="mt-6">
//           <AuthSocialButtons mode="register" />
//         </div>

//         {/* Terms */}
//         <p className="mt-6 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//         การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
//         <Link href="/terms" className="text-primary hover:underline">
//             เงื่อนไขการใช้งาน
//         </Link>{" "}
//         และ{" "}
//         <Link href="/privacy" className="text-primary hover:underline">
//             นโยบายความเป็นส่วนตัว
//         </Link>{" "}
//         ของ Interlink Shop
//         </p>

//         <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//           มีบัญชีอยู่แล้ว?{" "}
//           <Link href="/login" className="text-primary hover:underline">
//             เข้าสู่ระบบที่นี่
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ===================================================================

// // src/app/register/page.tsx

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";

// export default function RegisterPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get("redirect") || "/";

//   const [fullName, setFullName] = useState("");
//   const [company, setCompany] = useState("");
//   const [phone, setPhone] = useState("");

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordConfirm, setPasswordConfirm] = useState("");

//   const [acceptTerms, setAcceptTerms] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password !== passwordConfirm) {
//       alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
//       return;
//     }
//     if (!acceptTerms) {
//       alert("กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก");
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("Register with:", {
//         fullName,
//         company,
//         phone,
//         email,
//         password,
//       });

//       // TODO: เรียก API สมัครสมาชิกจริงในอนาคต
//       // สมมติสมัครเสร็จ → ไปหน้า login พร้อม prefill email หรือ redirect กลับ
//       router.push(`/login?redirect=${encodeURIComponent(redirectTo)}&email=${encodeURIComponent(email)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-lg">
//         <Card className="border border-primary/10 shadow-lg">
//           <CardHeader className="space-y-2 text-center">
//             <CardTitle className="text-2xl font-bold text-primary">
//               สมัครสมาชิกใหม่
//             </CardTitle>
//             <CardDescription className="text-sm text-muted-foreground">
//               ลงทะเบียนเพื่อสั่งซื้อสินค้า ดูประวัติการสั่งซื้อ และรับสิทธิพิเศษจาก Interlink Shop
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* กลุ่มข้อมูลติดต่อ */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
//                   <Input
//                     id="fullName"
//                     placeholder="ชื่อจริง - นามสกุล"
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label htmlFor="company">บริษัท (ถ้ามี)</Label>
//                   <Input
//                     id="company"
//                     placeholder="ชื่อบริษัท / หน่วยงาน"
//                     value={company}
//                     onChange={(e) => setCompany(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="081-234-5678"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label htmlFor="email">อีเมล</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="example@interlink.co.th"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     autoComplete="email"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <Label htmlFor="password">รหัสผ่าน</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder="อย่างน้อย 8 ตัวอักษร"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     autoComplete="new-password"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label htmlFor="passwordConfirm">ยืนยันรหัสผ่าน</Label>
//                   <Input
//                     id="passwordConfirm"
//                     type="password"
//                     placeholder="พิมพ์รหัสผ่านอีกครั้ง"
//                     value={passwordConfirm}
//                     onChange={(e) => setPasswordConfirm(e.target.value)}
//                     required
//                     autoComplete="new-password"
//                   />
//                 </div>
//               </div>

//               {/* Terms */}
//               <div className="flex items-start gap-2 text-xs sm:text-sm">
//                 <input
//                   id="acceptTerms"
//                   type="checkbox"
//                   className="mt-1 h-4 w-4 rounded border-muted-foreground/40"
//                   checked={acceptTerms}
//                   onChange={(e) => setAcceptTerms(e.target.checked)}
//                 />
//                 <label
//                   htmlFor="acceptTerms"
//                   className="text-muted-foreground cursor-pointer"
//                 >
//                   ข้าพเจ้าได้อ่านและยอมรับ{" "}
//                   <span className="text-primary underline">
//                     เงื่อนไขการใช้งาน
//                   </span>{" "}
//                   และ{" "}
//                   <span className="text-primary underline">
//                     นโยบายความเป็นส่วนตัว
//                   </span>
//                 </label>
//               </div>

//               {/* Submit */}
//               <Button
//                 type="submit"
//                 className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
//                 disabled={loading}
//               >
//                 {loading && (
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                 )}
//                 สมัครสมาชิก
//               </Button>
//             </form>
//           </CardContent>

//           <CardFooter className="flex flex-col gap-2 text-center text-xs sm:text-sm">
//             <div className="text-muted-foreground">
//               มีบัญชีอยู่แล้ว ?
//               <Link
//                 href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
//                 className="ml-1 text-primary hover:underline font-medium"
//               >
//                 เข้าสู่ระบบ
//               </Link>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </main>
//   );
// }
