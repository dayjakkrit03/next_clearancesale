// v.1.1.3 ================================================
// /src/app/reset-password/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"; // ⭐ ใช้ toast

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast(); // ⭐ ดึง toast

  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ ถ้า token หรือ email ไม่มี → แจ้งเตือนทันที
  useEffect(() => {
    if (!token || !email) {
      toast({
        title: "ลิงก์ไม่ถูกต้อง",
        description: "ไม่พบข้อมูลสำหรับตั้งรหัสผ่านใหม่",
        variant: "destructive",
      });
    }
  }, [token, email, toast]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    if (!password || password.length < 8) {
      const msg = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
      setError(msg);
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    if (!token || !email) {
      const msg = "ลิงก์หมดอายุหรือไม่ถูกต้อง";
      setError(msg);
      toast({
        title: "ไม่สามารถตั้งรหัสผ่านได้",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        body: JSON.stringify({ email, token, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.ok) {
        const msg = data.message || "เกิดข้อผิดพลาด";
        setError(msg);

        toast({
          title: "ตั้งรหัสผ่านไม่สำเร็จ",
          description: msg,
          variant: "destructive",
        });

        return;
      }

      // ⭐ สำเร็จ
      setDone(true);

      toast({
        title: "ตั้งรหัสผ่านใหม่สำเร็จ",
        description: "กำลังพาคุณไปหน้าเข้าสู่ระบบ",
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error(err);

      const msg = "เกิดข้อผิดพลาด ไม่สามารถบันทึกได้";
      setError(msg);

      toast({
        title: "เกิดข้อผิดพลาด",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl font-bold text-center mb-4">
          ตั้งรหัสผ่านใหม่
        </h1>

        {done ? (
          <div className="space-y-6 text-center">
            <p className="text-green-600">
              ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้า Login…
            </p>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                ไปหน้า Login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-center">{error}</p>}

            <div>
              <Label>รหัสผ่านใหม่</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  <span>กำลังบันทึก…</span>
                </span>
              ) : (
                "ยืนยัน"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // /src/app/reset-password/page.tsx

// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function ResetPasswordPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   const token = params.get("token") || "";
//   const email = params.get("email") || "";

//   const [password, setPassword] = useState("");
//   const [done, setDone] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     if (loading) return;
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/auth/reset", {
//         method: "POST",
//         body: JSON.stringify({ email, token, password }),
//         headers: { "Content-Type": "application/json" },
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         setError(data.message || "เกิดข้อผิดพลาด");
//         return;
//       }

//       setDone(true);
//       setTimeout(() => router.push("/login"), 1500);
//     } catch (err) {
//       console.error(err);
//       setError("เกิดข้อผิดพลาด ไม่สามารถบันทึกได้");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl font-bold text-center mb-4">
//           ตั้งรหัสผ่านใหม่
//         </h1>

//         {done ? (
//           <div className="space-y-6 text-center">
//             <p className="text-green-600">
//               ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้า Login…
//             </p>

//             {/* ปุ่มกลับไปหน้า Login เผื่อ user ไม่อยากรอ */}
//             <Link href="/login">
//               <Button variant="outline" className="w-full">
//                 ไปหน้า Login
//               </Button>
//             </Link>
//           </div>
//         ) : (
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             {error && <p className="text-red-600 text-center">{error}</p>}

//             <div>
//               <Label>รหัสผ่านใหม่</Label>
//               <Input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
//                   <span>กำลังบันทึก…</span>
//                 </span>
//               ) : (
//                 "ยืนยัน"
//               )}
//             </Button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // /src/app/reset-password/page.tsx

// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function ResetPasswordPage() {
//   const params = useSearchParams();
//   const router = useRouter();

//   const token = params.get("token") || "";
//   const email = params.get("email") || "";

//   const [password, setPassword] = useState("");
//   const [done, setDone] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSubmit(e: any) {
//     e.preventDefault();

//     const res = await fetch("/api/auth/reset", {
//       method: "POST",
//       body: JSON.stringify({ email, token, password }),
//       headers: { "Content-Type": "application/json" },
//     });

//     const data = await res.json();

//     if (!data.ok) {
//       setError(data.message || "เกิดข้อผิดพลาด");
//       return;
//     }

//     setDone(true);
//     setTimeout(() => router.push("/login"), 1500);
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl font-bold text-center mb-4">
//           ตั้งรหัสผ่านใหม่
//         </h1>

//         {done ? (
//           <p className="text-center text-green-600">ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้า Login…</p>
//         ) : (
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             {error && <p className="text-red-600 text-center">{error}</p>}

//             <div>
//               <Label>รหัสผ่านใหม่</Label>
//               <Input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <Button className="w-full">ยืนยัน</Button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }
