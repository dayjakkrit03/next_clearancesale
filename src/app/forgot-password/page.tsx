// v.1.1.2 ================================================
// /src/app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";                 // ← เพิ่ม
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      setSent(true);
    } catch (error) {
      console.error("ส่งลิงก์รีเซ็ตรหัสผ่านล้มเหลว:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl font-bold text-center mb-4">
          ลืมรหัสผ่าน
        </h1>

        {!sent ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>อีเมล</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  <span>กำลังส่งลิงก์...</span>
                </span>
              ) : (
                "ส่งลิงก์ตั้งรหัสผ่านใหม่"
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-green-600">
              ถ้ามีอีเมลนี้ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว
            </p>

            {/* ปุ่มกลับหน้าแรก */}
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                กลับไปหน้าแรก
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


// v.1.1.2 ================================================

// // /src/app/forgot-password/page.tsx

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);

//   async function handleSubmit(e: any) {
//     e.preventDefault();

//     const res = await fetch("/api/auth/forgot", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//       headers: { "Content-Type": "application/json" },
//     });

//     setSent(true);
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl font-bold text-center mb-4">
//           ลืมรหัสผ่าน
//         </h1>

//         {!sent ? (
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div>
//               <Label>อีเมล</Label>
//               <Input
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <Button type="submit" className="w-full">
//               ส่งลิงก์ตั้งรหัสผ่านใหม่
//             </Button>
//           </form>
//         ) : (
//           <p className="text-center text-green-600">
//             ถ้ามีอีเมลนี้ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
