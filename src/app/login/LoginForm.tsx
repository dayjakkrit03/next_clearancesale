// v.1.1.7 =================================================
// src/app/login/LoginForm.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast"; // ⭐ ใช้ toast

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast(); // ⭐ ดึง toast ออกมาใช้

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSummary = useCartStore((s) => s.setSummary);
  const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

  // เวลาเข้า /login ให้เลื่อนสกรอล์ขึ้นบนสุด ไม่ตามตำแหน่งเก่า
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  // ⭐ โหลดค่าที่เคย “จดจำการเข้าสู่ระบบ” ไว้
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedRemember =
      window.localStorage.getItem("remember_login") === "1";
    const storedEmail = window.localStorage.getItem("remember_email") ?? "";

    if (storedRemember && storedEmail) {
      setRemember(true);
      setEmail(storedEmail);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
          // ⭐ ส่งค่า remember ไปให้ backend ด้วย
          remember,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const message =
          data?.message ||
          "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
        setError(message);

        // ⭐ แจ้งเตือน error
        toast({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: message,
          variant: "destructive",
        });

        setLoading(false);
        return;
      }

      // ⭐ จัดการ localStorage ตาม checkbox
      if (typeof window !== "undefined") {
        if (remember) {
          window.localStorage.setItem("remember_login", "1");
          window.localStorage.setItem("remember_email", email);
        } else {
          window.localStorage.removeItem("remember_login");
          window.localStorage.removeItem("remember_email");
        }
      }

      // โหลด cart summary หลัง login
      try {
        const sumRes = await fetch("/api/cart/summary", {
          cache: "no-store",
        });
        if (sumRes.ok) {
          const sumJson = await sumRes.json().catch(() => null);
          if (sumJson?.summary) {
            setSummary(sumJson.summary);
          }
        }
      } catch (e) {
        console.error("[Login] failed to load cart summary after login", e);
      }

      // ⭐ แจ้งเตือน success
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ระบบกำลังพาคุณไปยังหน้าที่ต้องการ",
      });

      await router.push(finalRedirect || "/");
      router.refresh();
    } catch (err) {
      console.error(err);
      const message = "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง";
      setError(message);

      // ⭐ แจ้งเตือนกรณี network / error อื่น ๆ
      toast({
        title: "เกิดข้อผิดพลาด",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
          เข้าสู่ระบบ
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
          กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
        </p>

        {error && (
          <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-3 w-3"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-muted-foreground">
                จดจำการเข้าสู่ระบบ
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-primary hover:underline">
            สมัครสมาชิกใหม่
          </Link>
        </p>

        <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
          การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
          <Link
            href="/policy/term-of-use"
            className="text-primary hover:underline"
          >
            ข้อกำหนดและเงื่อนไขการใช้บริการ
          </Link>{" "}
          และ{" "}
          <Link
            href="/policy/privacy-policy"
            className="text-primary hover:underline"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </p>
      </div>
    </div>
  );
}

// v.1.1.7 =================================================

// v.1.1.6 =================================================
// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// // import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";
// import { useCartStore } from "@/store/cart-store";

// type LoginFormProps = {
//   redirectTo?: string;
// };

// export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const setSummary = useCartStore((s) => s.setSummary);
//   const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

//   // เวลาเข้า /login ให้เลื่อนสกรอล์ขึ้นบนสุด ไม่ตามตำแหน่งเก่า
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.scrollTo(0, 0);
//     }
//   }, []);

//   // ⭐ โหลดค่าที่เคย “จดจำการเข้าสู่ระบบ” ไว้
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const storedRemember = window.localStorage.getItem("remember_login") === "1";
//     const storedEmail = window.localStorage.getItem("remember_email") ?? "";

//     if (storedRemember && storedEmail) {
//       setRemember(true);
//       setEmail(storedEmail);
//     }
//   }, []);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password,
//           // ⭐ ส่งค่า remember ไปให้ backend ด้วย
//           remember,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.ok) {
//         setError(
//           data?.message ||
//             "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
//         );
//         setLoading(false);
//         return;
//       }

//       // ⭐ จัดการ localStorage ตาม checkbox
//       if (typeof window !== "undefined") {
//         if (remember) {
//           window.localStorage.setItem("remember_login", "1");
//           window.localStorage.setItem("remember_email", email);
//         } else {
//           window.localStorage.removeItem("remember_login");
//           window.localStorage.removeItem("remember_email");
//         }
//       }

//       // โหลด cart summary หลัง login
//       try {
//         const sumRes = await fetch("/api/cart/summary", {
//           cache: "no-store",
//         });
//         if (sumRes.ok) {
//           const sumJson = await sumRes.json().catch(() => null);
//           if (sumJson?.summary) {
//             setSummary(sumJson.summary);
//           }
//         }
//       } catch (e) {
//         console.error("[Login] failed to load cart summary after login", e);
//       }

//       await router.push(finalRedirect || "/");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         {error && (
//           <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </div>
//         )}

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input
//                 id="remember"
//                 type="checkbox"
//                 className="h-3 w-3"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
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

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//           </Button>
//         </form>

//         <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//           ยังไม่มีบัญชี?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             สมัครสมาชิกใหม่
//           </Link>
//         </p>

//         <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//           การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//           <Link
//             href="/policy/term-of-use"
//             className="text-primary hover:underline"
//           >
//             ข้อกำหนดและเงื่อนไขการใช้บริการ
//           </Link>{" "}
//           และ{" "}
//           <Link
//             href="/policy/privacy-policy"
//             className="text-primary hover:underline"
//           >
//             นโยบายความเป็นส่วนตัว
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.6 =================================================

// v.1.1.5 =================================================
// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// // import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";
// import { useCartStore } from "@/store/cart-store";

// type LoginFormProps = {
//   redirectTo?: string;
// };

// export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const setSummary = useCartStore((s) => s.setSummary);
//   const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

//   // 👇 เพิ่ม: เวลาเข้า /login ให้เลื่อนสกรอล์ขึ้นบนสุด ไม่ตามตำแหน่งเก่า
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.scrollTo(0, 0);
//     }
//   }, []);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.ok) {
//         setError(
//           data?.message ||
//             "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
//         );
//         setLoading(false);
//         return;
//       }

//       try {
//         const sumRes = await fetch("/api/cart/summary", {
//           cache: "no-store",
//         });
//         if (sumRes.ok) {
//           const sumJson = await sumRes.json().catch(() => null);
//           if (sumJson?.summary) {
//             setSummary(sumJson.summary);
//           }
//         }
//       } catch (e) {
//         console.error("[Login] failed to load cart summary after login", e);
//       }

//       await router.push(finalRedirect || "/");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className=" bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         {error && (
//           <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </div>
//         )}

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input
//                 id="remember"
//                 type="checkbox"
//                 className="h-3 w-3"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
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

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//           </Button>
//         </form>

//         <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//           ยังไม่มีบัญชี?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             สมัครสมาชิกใหม่
//           </Link>
//         </p>

//         <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//           การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//           <Link
//             href="/policy/term-of-use"
//             className="text-primary hover:underline"
//           >
//             ข้อกำหนดและเงื่อนไขการใช้บริการ
//           </Link>{" "}
//           และ{" "}
//           <Link
//             href="/policy/privacy-policy"
//             className="text-primary hover:underline"
//           >
//             นโยบายความเป็นส่วนตัว
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.5 =================================================

// v.1.1.4 =================================================
// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";

// // 🛒 เพิ่ม: ใช้ Zustand cart store
// import { useCartStore } from "@/store/cart-store";

// type LoginFormProps = {
//   redirectTo?: string;
// };

// export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // 🛒 hook สำหรับอัปเดต summary หลัง login
//   const setSummary = useCartStore((s) => s.setSummary);

//   // ถ้ามี ?redirect=/xxx ใช้ค่านั้น
//   const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.ok) {
//         setError(
//           data?.message ||
//             "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
//         );
//         setLoading(false);
//         return;
//       }

//       // 🔹 หลัง login สำเร็จ → โหลด summary แล้วอัปเดต Zustand
//       try {
//         const sumRes = await fetch("/api/cart/summary", {
//           cache: "no-store",
//         });
//         if (sumRes.ok) {
//           const sumJson = await sumRes.json().catch(() => null);
//           if (sumJson?.summary) {
//             setSummary(sumJson.summary);
//           }
//         }
//       } catch (e) {
//         console.error("[Login] failed to load cart summary after login", e);
//       }

//       // สำเร็จ → redirect กลับไปหน้าที่มาหรือหน้าแรก
//       await router.push(finalRedirect || "/");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
//     } finally {
//       // เผื่อกรณี navigation ช้า / มี error → ปุ่มจะไม่ค้าง
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         {error && (
//           <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </div>
//         )}

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input
//                 id="remember"
//                 type="checkbox"
//                 className="h-3 w-3"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
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

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//           </Button>
//         </form>

//         {/* ปุ่ม Social Login (ตอนนี้เป็น UI เฉย ๆ ก่อน) */}
//         {/* <div className="mt-6">
//           <AuthSocialButtons mode="login" />
//         </div> */}

//         {/* ลิงก์สมัครสมาชิก */}
//         <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//           ยังไม่มีบัญชี?{" "}
//           <Link href="/register" className="text-primary hover:underline">
//             สมัครสมาชิกใหม่
//           </Link>
//         </p>

//         {/* Terms & Privacy */}
//         <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//           การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//           <Link
//             href="/policy/term-of-use"
//             className="text-primary hover:underline"
//           >
//             ข้อกำหนดและเงื่อนไขการใช้บริการ
//           </Link>{" "}
//           และ{" "}
//           <Link
//             href="/policy/privacy-policy"
//             className="text-primary hover:underline"
//           >
//             นโยบายความเป็นส่วนตัว
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.4 =================================================

// v.1.1.3 ================================================
// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";

// type LoginFormProps = {
//   redirectTo?: string;
// };

// export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ถ้ามี ?redirect=/xxx ใช้ค่านั้น
//   const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.ok) {
//         setError(
//           data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
//         );
//         setLoading(false);
//         return;
//       }

//       // สำเร็จ → redirect กลับไปหน้าที่มาหรือหน้าแรก
//       await router.push(finalRedirect || "/");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
//     } finally {
//       // เผื่อกรณี navigation ช้า / มี error → ปุ่มจะไม่ค้าง
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         {error && (
//           <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </div>
//         )}

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input
//                 id="remember"
//                 type="checkbox"
//                 className="h-3 w-3"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
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

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//           </Button>
//         </form>

//         {/* ปุ่ม Social Login (ตอนนี้เป็น UI เฉย ๆ ก่อน) */}
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
//         <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//           การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//           <Link
//             href="/policy/term-of-use"
//             className="text-primary hover:underline"
//           >
//             ข้อกำหนดและเงื่อนไขการใช้บริการ
//           </Link>{" "}
//           และ{" "}
//           <Link
//             href="/policy/privacy-policy"
//             className="text-primary hover:underline"
//           >
//             นโยบายความเป็นส่วนตัว
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";

// type LoginFormProps = {
//   redirectTo?: string;
// };

// export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ถ้ามี ?redirect=/xxx ใช้ค่านั้น
//   const finalRedirect = searchParams.get("redirect") ?? redirectTo ?? "/";

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: email,
//           password,
//         }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data.ok) {
//         setError(
//           data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
//         );
//         setLoading(false);
//         return;
//       }

//       // สำเร็จ → redirect
//       router.push(finalRedirect || "/");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8">
//         <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//           เข้าสู่ระบบ
//         </h1>
//         <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//           กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//         </p>

//         {error && (
//           <div className="mb-4 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
//             {error}
//           </div>
//         )}

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="space-y-2">
//             <Label htmlFor="email">อีเมล</Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">รหัสผ่าน</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center gap-2">
//               <input
//                 id="remember"
//                 type="checkbox"
//                 className="h-3 w-3"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
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

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//           </Button>
//         </form>

//         {/* ปุ่ม Social Login (ยังเป็น UI อย่างเดียว) */}
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
//         <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
//           การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//           <Link
//             href="/policy/term-of-use"
//             className="text-primary hover:underline"
//           >
//             ข้อกำหนดและเงื่อนไขการใช้บริการ
//           </Link>{" "}
//           และ{" "}
//           <Link
//             href="/policy/privacy-policy"
//             className="text-primary hover:underline"
//           >
//             นโยบายความเป็นส่วนตัว
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// v.1.1.2 ================================================

// // src/app/login/LoginForm.tsx
// "use client";

// import { FormEvent, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import AuthSocialButtons from "@/app/(auth)/components/AuthSocialButtons";

// export default function LoginForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirect = searchParams.get("redirect") || "/";

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setErrorMsg(null);

//     if (!identifier || !password) {
//       setErrorMsg("กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ identifier, password }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok || !data?.ok) {
//         setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
//         setLoading(false);
//         return;
//       }

//       // login สำเร็จ → redirect กลับหน้าที่ต้องการ หรือหน้าแรก
//       router.push(redirect);
//     } catch (err) {
//       console.error(err);
//       setErrorMsg("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
//         เข้าสู่ระบบ
//       </h1>
//       <p className="text-xs sm:text-sm text-muted-foreground text-center mb-6">
//         กรุณาเข้าสู่ระบบเพื่อสั่งซื้อสินค้าและตรวจสอบสถานะคำสั่งซื้อของคุณ
//       </p>

//       {errorMsg && (
//         <div className="mb-4 text-xs sm:text-sm text-red-600 text-center">
//           {errorMsg}
//         </div>
//       )}

//       <form className="space-y-4" onSubmit={handleSubmit}>
//         <div className="space-y-2">
//           <Label htmlFor="email">อีเมล หรือชื่อผู้ใช้</Label>
//           <Input
//             id="email"
//             type="text"
//             placeholder="you@example.com"
//             value={identifier}
//             onChange={(e) => setIdentifier(e.target.value)}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="password">รหัสผ่าน</Label>
//           <Input
//             id="password"
//             type="password"
//             placeholder="••••••••"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>

//         <div className="flex items-center justify-between text-xs sm:text-sm">
//           <div className="flex items-center gap-2">
//             <input id="remember" type="checkbox" className="h-3 w-3" />
//             <label htmlFor="remember" className="text-muted-foreground">
//               จดจำการเข้าสู่ระบบ
//             </label>
//           </div>
//           <Link
//             href="/forgot-password"
//             className="text-primary hover:underline"
//           >
//             ลืมรหัสผ่าน?
//           </Link>
//         </div>

//         <Button type="submit" className="w-full" disabled={loading}>
//           {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
//         </Button>
//       </form>

//       {/* 🔹 ปุ่ม Social Login (ยังไม่ทำงาน แสดง UI ไว้ก่อน) */}
//       <div className="mt-6">
//         <AuthSocialButtons mode="login" />
//       </div>

//       {/* Terms + Register link เหมือนเดิม */}
//       <p className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
//         ยังไม่มีบัญชี?{" "}
//         <Link href="/register" className="text-primary hover:underline">
//           สมัครสมาชิกใหม่
//         </Link>
//       </p>

//       <p className="mt-2 text-center text-[10px] sm:text-xs text-muted-foreground leading-snug">
//         การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
//         <Link
//           href="/policy/terms"
//           className="underline underline-offset-2 hover:text-primary"
//         >
//           ข้อกำหนดในการใช้บริการ
//         </Link>{" "}
//         และ{" "}
//         <Link
//           href="/policy/privacy"
//           className="underline underline-offset-2 hover:text-primary"
//         >
//           นโยบายความเป็นส่วนตัว
//         </Link>{" "}
//         ของ Interlink Shop
//       </p>
//     </>
//   );
// }
