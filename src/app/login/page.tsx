// v.1.1.5 =====================================================================
// src/app/login/page.tsx
import { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | Interlink Shop",
};

export default function LoginPage() {
  // ให้หน้า layout จัด container เองเหมือนเดิม
  return <LoginForm />;
}

// v.1.1.5 =====================================================================

// v.1.1.4 =====================================================================
// // src/app/login/page.tsx
// import { Metadata } from "next";
// import LoginForm from "./LoginForm";

// export const metadata: Metadata = {
//   title: "เข้าสู่ระบบ | Interlink Shop",
// };

// export default function LoginPage() {
//   // ถ้าอยากรองรับ ?redirect=/xxx เพิ่ม props ทีหลังได้
//   return <LoginForm />;
// }


// v.1.1.4 =====================================================================

// v.1.1.3 =====================================================================
// // src/app/login/page.tsx

// import { Metadata } from "next";
// import LoginForm from "./LoginForm";

// export const metadata: Metadata = {
//   title: "เข้าสู่ระบบ | Interlink Shop",
// };

// export default function LoginPage() {
//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <LoginForm />
//       </div>
//     </div>
//   );
// }

// v.1.1.3 =====================================================================

// v.1.1.2 ===================================================================
// // src/app/login/page.tsx

// import { Metadata } from "next";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { AuthSocialButtons } from "@/app/(auth)/components/AuthSocialButtons";

// export const metadata: Metadata = {
//   title: "เข้าสู่ระบบ | Interlink Shop",
// };

// export default function LoginPage() {
//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         <form className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input id="email" type="email" placeholder="you@example.com" />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input id="password" type="password" placeholder="••••••••" />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input id="remember" type="checkbox" className="h-3 w-3" />
//               <label htmlFor="remember" className="text-muted-foreground">
//                 จดจำการเข้าสู่ระบบ
//               </label>
//             </div>
//             <Link
//               href="/forgot-password"
//               className="text-primary hover:underline"
//             >
//               ลืมรหัสผ่าน?
//             </Link>
//           </div>

//           <Button type="submit" className="w-full">
//             เข้าสู่ระบบ
//           </Button>
//         </form>

//         {/* 🔹 ปุ่ม Social Login */}
//         <div className="mt-6">
//           <AuthSocialButtons mode="login" />
//         </div>

//         {/* ลิงก์สมัครสมาชิก */}
//         <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//           ยังไม่มีบัญชี?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             สมัครสมาชิกใหม่
//           </Link>
//         </p>

//         {/* Terms & Privacy */}
//         <p className="mt-4 text-center text-[11px] text-muted-foreground/80">
//             การเข้าสู่ระบบหมายความว่าคุณยอมรับ{" "}
//             <Link href="/terms" className="underline cursor-pointer">
//                 เงื่อนไขการใช้งาน
//             </Link>{" "}
//             และ{" "}
//             <Link href="/privacy" className="underline cursor-pointer">
//                 นโยบายความเป็นส่วนตัว
//             </Link>{" "}
//         </p>
//       </div>
//     </div>
//   );
// }


// v.1.1.2 ===================================================================

// // src/app/login/page.tsx

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

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const redirectTo = searchParams.get("redirect") || "/";

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     // TODO: เรียก API login จริงในอนาคต
//     // รอให้ลอง UX เฉย ๆ ตอนนี้ทำเป็น mock
//     try {
//       console.log("Login with:", { email, password, remember });

//       // สมมติ login สำเร็จ → redirect
//       router.push(redirectTo);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md">
//         <Card className="border border-primary/10 shadow-lg">
//           <CardHeader className="space-y-2 text-center">
//             <CardTitle className="text-2xl font-bold text-primary">
//               เข้าสู่ระบบ
//             </CardTitle>
//             <CardDescription className="text-sm text-muted-foreground">
//               กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้า และติดตามสถานะคำสั่งซื้อของคุณ
//             </CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Email */}
//               <div className="space-y-1">
//                 <Label htmlFor="email">อีเมล</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="example@interlink.co.th"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   autoComplete="email"
//                 />
//               </div>

//               {/* Password */}
//               <div className="space-y-1">
//                 <Label htmlFor="password">รหัสผ่าน</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   autoComplete="current-password"
//                 />
//               </div>

//               {/* Remember + Forgot password */}
//               <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
//                 <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 rounded border-muted-foreground/40"
//                     checked={remember}
//                     onChange={(e) => setRemember(e.target.checked)}
//                   />
//                   <span className="text-muted-foreground">จดจำฉันไว้ในระบบ</span>
//                 </label>

//                 <button
//                   type="button"
//                   className="text-primary hover:underline"
//                   onClick={() => {
//                     // TODO: ไปหน้า /forgot-password ในอนาคต
//                     alert("ฟีเจอร์กู้รหัสผ่านจะพร้อมใช้งานในภายหลัง");
//                   }}
//                 >
//                   ลืมรหัสผ่าน?
//                 </button>
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
//                 เข้าสู่ระบบ
//               </Button>
//             </form>
//           </CardContent>

//           <CardFooter className="flex flex-col gap-2 text-center text-xs sm:text-sm">
//             <div className="text-muted-foreground">
//               ยังไม่มีบัญชี ?
//               <Link
//                 href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
//                 className="ml-1 text-primary hover:underline font-medium"
//               >
//                 สมัครสมาชิกใหม่
//               </Link>
//             </div>
//             <p className="text-[11px] text-muted-foreground/80">
//               การเข้าสู่ระบบหมายความว่าคุณยอมรับ{" "}
//               <span className="underline cursor-pointer">
//                 เงื่อนไขการใช้งาน
//               </span>{" "}
//               และ{" "}
//               <span className="underline cursor-pointer">
//                 นโยบายความเป็นส่วนตัว
//               </span>
//             </p>
//           </CardFooter>
//         </Card>
//       </div>
//     </main>
//   );
// }
