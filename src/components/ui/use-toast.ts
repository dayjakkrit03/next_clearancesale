// v.1.1.3 ===============================================
// src/components/ui/use-toast.ts

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number; // ms, default 3500
};

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

const TOAST_ROOT_ID = "app-toast-root";
const DIALOG_ROOT_ID = "app-dialog-root";

/* ---------- Toast (มุมล่าง) ---------- */

function createToastRoot() {
  if (typeof window === "undefined") return null;

  let root = document.getElementById(TOAST_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = TOAST_ROOT_ID;
    // root.className =
    //   "fixed z-[9999] inset-x-0 bottom-0 flex flex-col items-center sm:items-end gap-2 px-4 pb-4 pointer-events-none";
      root.className =
        "fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none";
    document.body.appendChild(root);
  }
  return root;
}

function showToast(options: ToastOptions) {
  const { title, description, variant = "default", duration = 3500 } = options;

  if (typeof window === "undefined") {
    console.log("Toast (server):", options);
    return;
  }

  const root = createToastRoot();
  if (!root) return;

  const el = document.createElement("div");

  // const baseClasses =
  //   "pointer-events-auto w-full sm:max-w-sm rounded-xl border shadow-lg bg-white text-slate-900 p-4 flex gap-3 items-start translate-y-2 opacity-0 transition-all duration-200";
  const baseClasses =
    "pointer-events-auto w-[90%] sm:w-auto max-w-sm rounded-2xl border shadow-xl bg-white text-slate-900 p-5 flex gap-3 items-start scale-95 opacity-0 transition-all duration-200";
  const variantClasses =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";

  el.className = `${baseClasses} ${variantClasses}`;

  el.innerHTML = `
    <div class="mt-0.5">
      ${
        variant === "destructive"
          ? '<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-semibold">!</span>'
          : '<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✓</span>'
      }
    </div>
    <div class="flex-1 space-y-1">
      ${
        title
          ? `<p class="text-sm font-semibold leading-snug">${title}</p>`
          : ""
      }
      ${
        description
          ? `<p class="text-xs text-slate-600 whitespace-pre-line">${description}</p>`
          : ""
      }
    </div>
    <button
      type="button"
      class="ml-2 mt-0.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      aria-label="ปิด"
    >
      ✕
    </button>
  `;

  root.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.remove("scale-95", "opacity-0");
    el.classList.add("scale-100", "opacity-100");
  });

  const closeBtn = el.querySelector("button");
  const remove = () => {
    el.classList.remove("scale-100", "opacity-100");
    el.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      if (el.parentNode === root) {
        root.removeChild(el);
      }
    }, 200);
  };
  closeBtn?.addEventListener("click", remove);

  const timeout = window.setTimeout(remove, duration);

  el.addEventListener("mouseenter", () => window.clearTimeout(timeout));
  el.addEventListener("mouseleave", () => {
    window.setTimeout(remove, 1500);
  });
}

/* ---------- Confirm Popup กลางจอ ---------- */

function createDialogRoot() {
  if (typeof window === "undefined") return null;

  let root = document.getElementById(DIALOG_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = DIALOG_ROOT_ID;
    root.className = "z-[10000]";
    document.body.appendChild(root);
  }
  return root;
}

function showConfirm(options: ConfirmOptions): Promise<boolean> {
  if (typeof window === "undefined") {
    console.log("Confirm (server):", options);
    return Promise.resolve(false);
  }

  const {
    title = "ยืนยันการทำรายการ",
    description,
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    variant = "destructive",
  } = options;

  const root = createDialogRoot();
  if (!root) return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 flex items-center justify-center bg-black/40 px-4 opacity-0 transition-opacity duration-200 pointer-events-auto";

    const cardVariant =
      variant === "destructive"
        ? "border-red-200 bg-white"
        : "border-slate-200 bg-white";

    overlay.innerHTML = `
      <div class="w-full max-w-sm rounded-2xl border ${cardVariant} shadow-xl p-5 space-y-3 translate-y-2 transition-all duration-200 bg-white">
        <p class="text-base font-semibold text-slate-900">${title}</p>
        ${
          description
            ? `<p class="text-sm text-slate-600 whitespace-pre-line">${description}</p>`
            : ""
        }
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            data-action="cancel"
            class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            ${cancelText}
          </button>
          <button
            type="button"
            data-action="confirm"
            class="px-3 py-1.5 rounded-lg text-xs sm:text-sm text-white ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            } transition-colors"
          >
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    root.appendChild(overlay);

    const card = overlay.firstElementChild as HTMLDivElement | null;

    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.classList.add("opacity-100");
      card?.classList.remove("translate-y-2");
      card?.classList.add("translate-y-0");
    });

    const cleanup = (result: boolean) => {
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0");
      card?.classList.remove("translate-y-0");
      card?.classList.add("translate-y-2");

      setTimeout(() => {
        if (overlay.parentNode === root) {
          root.removeChild(overlay);
        }
        resolve(result);
      }, 180);
    };

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        cleanup(false);
      }
    });

    const confirmBtn = overlay.querySelector<HTMLButtonElement>(
      'button[data-action="confirm"]'
    );
    const cancelBtn = overlay.querySelector<HTMLButtonElement>(
      'button[data-action="cancel"]'
    );

    confirmBtn?.addEventListener("click", () => cleanup(true));
    cancelBtn?.addEventListener("click", () => cleanup(false));
  });
}

/* ---------- Hook ---------- */

export function useToast() {
  return {
    toast: showToast,
    confirm: showConfirm,
  };
}

// v.1.1.3 ===============================================

// v.1.1.2 ===============================================
// // src/components/ui/use-toast.ts

// type ToastOptions = {
//   title?: string;
//   description?: string;
//   variant?: "default" | "destructive";
//   duration?: number; // ms, default 3500
// };

// const TOAST_ROOT_ID = "app-toast-root";

// function createToastRoot() {
//   if (typeof window === "undefined") return null;

//   let root = document.getElementById(TOAST_ROOT_ID);
//   if (!root) {
//     root = document.createElement("div");
//     root.id = TOAST_ROOT_ID;
//     root.className =
//       "fixed z-[9999] inset-x-0 bottom-0 flex flex-col items-center sm:items-end gap-2 px-4 pb-4 pointer-events-none";
//     document.body.appendChild(root);
//   }
//   return root;
// }

// export function useToast() {
//   function toast(options: ToastOptions) {
//     const { title, description, variant = "default", duration = 3500 } =
//       options;

//     if (typeof window === "undefined") {
//       // เรียกจากฝั่ง server – แค่ log เฉย ๆ
//       console.log("Toast (server):", options);
//       return;
//     }

//     const root = createToastRoot();
//     if (!root) return;

//     // สร้าง card แต่ละใบทับ React เลย (ไม่ใช้ state)
//     const el = document.createElement("div");

//     const baseClasses =
//       "pointer-events-auto w-full sm:max-w-sm rounded-xl border shadow-lg bg-white text-slate-900 p-4 flex gap-3 items-start translate-y-2 opacity-0 transition-all duration-200";
//     const variantClasses =
//       variant === "destructive"
//         ? "border-red-200 bg-red-50 text-red-900"
//         : "border-emerald-200 bg-emerald-50 text-emerald-900";

//     el.className = `${baseClasses} ${variantClasses}`;

//     el.innerHTML = `
//       <div class="mt-0.5">
//         ${
//           variant === "destructive"
//             ? '<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-semibold">!</span>'
//             : '<span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✓</span>'
//         }
//       </div>
//       <div class="flex-1 space-y-1">
//         ${
//           title
//             ? `<p class="text-sm font-semibold leading-snug">${title}</p>`
//             : ""
//         }
//         ${
//           description
//             ? `<p class="text-xs text-slate-600 whitespace-pre-line">${description}</p>`
//             : ""
//         }
//       </div>
//       <button
//         type="button"
//         class="ml-2 mt-0.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
//         aria-label="ปิด"
//       >
//         ✕
//       </button>
//     `;

//     // ใส่เข้า root
//     root.appendChild(el);

//     // trigger animation เข้ามา
//     requestAnimationFrame(() => {
//       el.classList.remove("translate-y-2", "opacity-0");
//       el.classList.add("translate-y-0", "opacity-100");
//     });

//     // ปิดเมื่อกดปุ่ม ✕
//     const closeBtn = el.querySelector("button");
//     const remove = () => {
//       el.classList.remove("translate-y-0", "opacity-100");
//       el.classList.add("translate-y-2", "opacity-0");
//       setTimeout(() => {
//         if (el.parentNode === root) {
//           root.removeChild(el);
//         }
//       }, 200);
//     };
//     closeBtn?.addEventListener("click", remove);

//     // auto close หลัง duration
//     const timeout = window.setTimeout(remove, duration);

//     // กัน memory leak
//     el.addEventListener("mouseenter", () => window.clearTimeout(timeout));
//     el.addEventListener("mouseleave", () => {
//       window.setTimeout(remove, 1500);
//     });
//   }

//   return { toast };
// }

// v.1.1.2 ===============================================

// // src/components/ui/use-toast.ts

// type ToastOptions = {
//   title?: string;
//   description?: string;
//   variant?: "default" | "destructive";
// };

// export function useToast() {
//   function toast(options: ToastOptions) {
//     const { title, description, variant } = options;
//     const message = [title, description].filter(Boolean).join("\n");

//     if (typeof window !== "undefined") {
//       if (variant === "destructive") {
//         window.alert(message || "เกิดข้อผิดพลาด");
//       } else {
//         window.alert(message || "ดำเนินการสำเร็จ");
//       }
//     } else {
//       // เผื่อถูกเรียกจากฝั่ง server (จะไม่ error แต่จะ log เฉยๆ)
//       console.log("Toast:", options);
//     }
//   }

//   return { toast };
// }
