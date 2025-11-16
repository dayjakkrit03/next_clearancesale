// v.1.1.6 ===================================================================
// src/components/header/user-menu.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel, // ใช้เพื่อโชว์ email บนสุดของเมนู
} from "@/components/ui/dropdown-menu";

type MeResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null; // ไม่ใช้แล้ว แต่ปล่อยไว้เผื่ออนาคต
  };
};

export function HeaderUserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data: MeResponse = await res.json().catch(() => ({ ok: false }));

        if (!cancelled) {
          if (data.ok) {
            setUser(data.user ?? null);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isLoggedIn = !!user;

  const go = (path: string) => router.push(path);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 flex items-center px-2 sm:px-3"
        >
          <User className="h-4 w-4 lg:h-5 lg:w-5" />

          {/* ชื่อจริงถูกตัดออก → โชว์เฉพาะ email บนจอใหญ่ */}
          {isLoggedIn && (
            <span className="ml-2 hidden lg:block text-xs max-w-[160px] truncate">
              {user?.email}
            </span>
          )}

          <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 bg-white text-foreground shadow-lg border border-primary/10"
      >
        {isLoggedIn ? (
          <>
            {/* 🔥 แสดงเฉพาะอีเมลด้านบนเมนู */}
            <DropdownMenuLabel className="text-xs leading-tight">
              <div className="font-semibold truncate">
                {user?.email}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => go("/profile")}>
              โปรไฟล์
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => go("/orders")}>
              ประวัติการสั่งซื้อ
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              ออกจากระบบ
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/login?redirect=${encodeURIComponent(
                    window.location.pathname + window.location.search
                  )}`
                )
              }
            >
              เข้าสู่ระบบ
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => go("/register")}>
              สมัครสมาชิกใหม่
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


// v.1.1.6 ===================================================================

// v.1.1.5 ===================================================================
// // src/components/header/user-menu.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { User, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// type MeResponse = {
//   ok: boolean;
//   user?: {
//     id: string;
//     email: string;
//     name?: string | null;
//   };
// };

// export function HeaderUserMenu() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [user, setUser] = useState<MeResponse["user"] | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMe() {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/auth/me", {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: MeResponse = await res.json().catch(() => ({ ok: false }));

//         if (!cancelled) {
//           if (data.ok) {
//             setUser(data.user ?? null);
//           } else {
//             setUser(null);
//           }
//         }
//       } catch {
//         if (!cancelled) {
//           setUser(null);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadMe();
//     return () => {
//       cancelled = true;
//     };
//   }, [pathname]);

//   const isLoggedIn = !!user;

//   const go = (path: string) => router.push(path);

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" });
//     } catch {
//       /* ignore */
//     }
//     setUser(null);
//     router.push("/");
//     router.refresh();
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-white hover:bg-white/20 hidden sm:flex"
//         >
//           <User className="h-4 w-4 lg:h-5 lg:w-5" />
//           {isLoggedIn && (
//             <span className="ml-2 hidden lg:block text-xs max-w-[160px] truncate">
//               {user?.name || user?.email}
//             </span>
//           )}
//           <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         align="end"
//         className="w-48 bg-white text-foreground shadow-lg border border-primary/10"
//       >
//         {isLoggedIn ? (
//           <>
//             {/* เมนูสำหรับคนที่ล็อกอินแล้วเท่านั้น */}
//             <DropdownMenuItem onClick={() => go("/profile")}>
//               โปรไฟล์
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => go("/orders")}>
//               ประวัติการสั่งซื้อ
//             </DropdownMenuItem>

//             <DropdownMenuSeparator />

//             <DropdownMenuItem
//               onClick={handleLogout}
//               className="text-red-600 focus:text-red-600"
//             >
//               ออกจากระบบ
//             </DropdownMenuItem>
//           </>
//         ) : (
//           <>
//             {/* ยังไม่ล็อกอิน → โชว์เฉพาะ login / register */}
//             {/* <DropdownMenuItem onClick={() => go("/login")}> */}
//             <DropdownMenuItem
//                 onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
//             >
//               เข้าสู่ระบบ
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => go("/register")}>
//               สมัครสมาชิกใหม่
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// v.1.1.5 ===================================================================

// v.1.1.4 ===================================================================
// // src/components/header/user-menu.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { User, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// type MeResponse = {
//   ok: boolean;
//   user?: {
//     id: string;
//     email: string;
//     name?: string | null;
//   };
// };

// export function HeaderUserMenu() {
//   const router = useRouter();
//   const pathname = usePathname(); // 👈 เอา path ปัจจุบันมาใช้
//   const [user, setUser] = useState<MeResponse["user"] | null>(null);
//   const [loading, setLoading] = useState(true);

//   // โหลดสถานะ login ทุกครั้งที่ path เปลี่ยน
//   useEffect(() => {
//     let cancelled = false;

//     async function loadMe() {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/auth/me", {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: MeResponse = await res.json().catch(() => ({ ok: false }));

//         if (!cancelled) {
//           if (data.ok) {
//             setUser(data.user ?? null);
//           } else {
//             setUser(null);
//           }
//         }
//       } catch {
//         if (!cancelled) {
//           setUser(null);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadMe();
//     return () => {
//       cancelled = true;
//     };
//   }, [pathname]); // 👈 path เปลี่ยน → เช็ค /me อีกรอบ

//   const isLoggedIn = !!user;

//   const go = (path: string) => {
//     router.push(path);
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" });
//     } catch {
//       // เงียบไว้ก็ได้
//     }
//     setUser(null);
//     router.push("/");
//     router.refresh();
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-white hover:bg-white/20 hidden sm:flex"
//         >
//           <User className="h-4 w-4 lg:h-5 lg:w-5" />

//           {/* แสดงชื่อ / email เมื่อ login แล้ว */}
//           {isLoggedIn && (
//             <span className="ml-2 hidden lg:block text-xs max-w-[140px] truncate">
//               {user?.name || user?.email}
//             </span>
//           )}

//           <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         align="end"
//         className="w-48 bg-white text-foreground shadow-lg border border-primary/10"
//       >
//         <DropdownMenuItem onClick={() => go("/profile")}>
//           โปรไฟล์
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => go("/orders")}>
//           ประวัติการสั่งซื้อ
//         </DropdownMenuItem>

//         <DropdownMenuSeparator />

//         {isLoggedIn ? (
//           <DropdownMenuItem
//             onClick={handleLogout}
//             className="text-red-600 focus:text-red-600"
//           >
//             ออกจากระบบ
//           </DropdownMenuItem>
//         ) : (
//           <>
//             <DropdownMenuItem onClick={() => go("/login")}>
//               เข้าสู่ระบบ
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => go("/register")}>
//               สมัครสมาชิกใหม่
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// v.1.1.4 ===================================================================

// v.1.1.3 ===================================================================
// // src/components/header/user-menu.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { User, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// type MeResponse = {
//   ok: boolean;
//   user?: {
//     id: string;
//     email: string;
//     name?: string | null;
//   };
// };

// export function HeaderUserMenu() {
//   const router = useRouter();
//   const [user, setUser] = useState<MeResponse["user"] | null>(null);
//   const [loading, setLoading] = useState(true);

//   // โหลดสถานะ Login จาก API
//   useEffect(() => {
//     let cancelled = false;

//     async function loadMe() {
//       try {
//         const res = await fetch("/api/auth/me", {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data: MeResponse = await res.json().catch(() => ({ ok: false }));

//         if (!cancelled) {
//           if (data.ok) {
//             setUser(data.user ?? null);
//           } else {
//             setUser(null);
//           }
//         }
//       } catch {
//         if (!cancelled) setUser(null);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadMe();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const isLoggedIn = !!user;

//   // ===== Handlers =====
//   const go = (path: string) => {
//     router.push(path);
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" });
//     } catch {}
//     setUser(null);
//     router.push("/");
//     router.refresh();
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-white hover:bg-white/20 hidden sm:flex"
//         >
//           <User className="h-4 w-4 lg:h-5 lg:w-5" />

//           {/* แสดงชื่อเมื่อ Login */}
//           {isLoggedIn && (
//             <span className="ml-2 hidden lg:block text-xs max-w-[140px] truncate">
//               {user?.name || user?.email}
//             </span>
//           )}

//           <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         align="end"
//         className="w-48 bg-white text-foreground shadow-lg border border-primary/10"
//       >
//         {/* เมนูเหมือนเดิม */}
//         <DropdownMenuItem onClick={() => go("/profile")}>
//           โปรไฟล์
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => go("/orders")}>
//           ประวัติการสั่งซื้อ
//         </DropdownMenuItem>

//         <DropdownMenuSeparator />

//         {/* ถ้า Login แล้ว → แสดงปุ่มออกจากระบบ */}
//         {isLoggedIn ? (
//           <DropdownMenuItem
//             onClick={handleLogout}
//             className="text-red-600 focus:text-red-600"
//           >
//             ออกจากระบบ
//           </DropdownMenuItem>
//         ) : (
//           <>
//             <DropdownMenuItem onClick={() => go("/login")}>
//               เข้าสู่ระบบ
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => go("/register")}>
//               สมัครสมาชิกใหม่
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// v.1.1.3 ===================================================================

// v.1.1.2 ===================================================================
// // src/components/header/user-menu.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import { User, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

// export function HeaderUserMenu() {
//   const router = useRouter();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-white hover:bg-white/20 hidden sm:flex"
//         >
//           <User className="h-4 w-4 lg:h-5 lg:w-5" />
//           <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="end"
//         className="w-48 bg-white text-foreground shadow-lg border border-primary/10"
//       >
//         <DropdownMenuItem onClick={() => router.push("/profile")}>
//           โปรไฟล์
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => router.push("/orders")}>
//           ประวัติการสั่งซื้อ
//         </DropdownMenuItem>

//         <DropdownMenuSeparator />

//         <DropdownMenuItem onClick={() => router.push("/login")}>
//           เข้าสู่ระบบ
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => router.push("/register")}>
//           สมัครสมาชิกใหม่
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// v.1.1.2 ===================================================================

// // src/components/header/user-menu.tsx

// "use client";

// import { useRouter } from "next/navigation";
// import { User, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export function HeaderUserMenu() {
//   const router = useRouter();

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="text-white hover:bg-white/20 hidden sm:flex"
//         >
//           <User className="h-4 w-4 lg:h-5 lg:w-5" />
//           <ChevronDown className="h-3 w-3 ml-1 hidden lg:block" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="end"
//         className="w-44 bg-white text-foreground shadow-lg border border-primary/10"
//       >
//         <DropdownMenuItem onClick={() => router.push("/profile")}>
//           โปรไฟล์
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => router.push("/orders")}>
//           ประวัติการสั่งซื้อ
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => router.push("/login")}>
//           เข้าสู่ระบบ
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
