// v.1.1.2 ===============================================================
// src/app/(auth)/components/AuthSocialButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Mail, Facebook } from "lucide-react";

type AuthSocialButtonsProps = {
  mode: "login" | "register";
};

export default function AuthSocialButtons({ mode }: AuthSocialButtonsProps) {
  const label =
    mode === "login"
      ? "หรือเข้าสู่ระบบด้วย"
      : "หรือสมัครสมาชิกด้วยบัญชีอื่น";

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3">
        {label}
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Google (placeholder icon = Mail) */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 bg-white"
        >
          <Mail className="h-4 w-4" />
          <span className="text-xs sm:text-sm">เข้าสู่ระบบด้วย Google</span>
        </Button>

        {/* Facebook */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white"
        >
          <Facebook className="h-4 w-4" />
          <span className="text-xs sm:text-sm">เข้าสู่ระบบด้วย Facebook</span>
        </Button>
      </div>
    </div>
  );
}

// v.1.1.2 ===============================================================

// // src/app/(auth)/components/AuthSocialButtons.tsx

// "use client";

// import { Button } from "@/components/ui/button";

// type AuthSocialButtonsProps = {
//   mode: "login" | "register"; // เพื่อปรับข้อความนิดหน่อย
// };

// export function AuthSocialButtons({ mode }: AuthSocialButtonsProps) {
//   const title =
//     mode === "login"
//       ? "หรือเข้าสู่ระบบด้วย"
//       : "หรือสมัครสมาชิกด้วยบัญชีเหล่านี้";

//   return (
//     <div className="space-y-3">
//       {/* เส้นคั่น + ข้อความ */}
//       <div className="flex items-center gap-3">
//         <div className="flex-1 h-px bg-border" />
//         <span className="text-[11px] sm:text-xs text-muted-foreground">
//           {title}
//         </span>
//         <div className="flex-1 h-px bg-border" />
//       </div>

//       {/* ปุ่ม Google / Facebook */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         {/* Google */}
//         <Button
//           type="button"
//           variant="outline"
//           className="w-full bg-white border-slate-200 hover:bg-slate-50 text-foreground justify-center gap-2 text-xs sm:text-sm"
//           onClick={() => {
//             // TODO: ไว้ Phase 2 ค่อยผูก OAuth จริง
//             console.log("Click Google sign-in");
//           }}
//         >
//           <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
//             <span className="text-sm font-bold text-[#4285F4]">G</span>
//           </span>
//           <span>เข้าสู่ระบบด้วย Google</span>
//         </Button>

//         {/* Facebook */}
//         <Button
//           type="button"
//           variant="outline"
//           className="w-full bg-[#1877F2] text-white border-transparent hover:bg-[#166fe0] justify-center gap-2 text-xs sm:text-sm"
//           onClick={() => {
//             // TODO: ไว้ Phase 2 ค่อยผูก OAuth จริง
//             console.log("Click Facebook sign-in");
//           }}
//         >
//           <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
//             <span className="text-sm font-bold leading-none">f</span>
//           </span>
//           <span>เข้าสู่ระบบด้วย Facebook</span>
//         </Button>
//       </div>
//     </div>
//   );
// }
