// v.1.1.2 ================================================
// src/app/admin/components/AdminDiscountRuleEditDialog.tsx

"use client";

import { useEffect, useState } from "react";

export type DiscountRuleEditValues = {
  minPercent: number;
  maxPercent?: number | "";
  borderWidth: number;
  borderColorHex: string;
  badgeBgHex?: string;
  badgeTextHex?: string;
  enabled: boolean;
};

export default function AdminDiscountRuleEditDialog({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: DiscountRuleEditValues;
  onClose: () => void;
  onSave: (values: DiscountRuleEditValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<DiscountRuleEditValues>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ รีเซ็ตค่าฟอร์มทุกครั้งที่เปิด dialog หรือ initial เปลี่ยน
  useEffect(() => {
    setValues({
      minPercent: Number(initial.minPercent) || 0,
      maxPercent:
        initial.maxPercent === "" || initial.maxPercent == null
          ? ""
          : Number(initial.maxPercent),
      borderWidth: Number(initial.borderWidth) || 1,
      borderColorHex: initial.borderColorHex || "#000000",
      badgeBgHex: initial.badgeBgHex ?? "",
      badgeTextHex: initial.badgeTextHex ?? "",
      enabled: !!initial.enabled,
    });
  }, [open, initial]);

  const submit = async () => {
    setErr(null);
    setSaving(true);
    try {
      const payload: DiscountRuleEditValues = {
        minPercent: Number(values.minPercent) || 0,
        maxPercent:
          values.maxPercent === "" || values.maxPercent == null
            ? undefined
            : Number(values.maxPercent),
        borderWidth: Number(values.borderWidth) || 1,
        borderColorHex: values.borderColorHex || "#000000",
        badgeBgHex: values.badgeBgHex?.trim()
          ? values.badgeBgHex
          : undefined,
        badgeTextHex: values.badgeTextHex?.trim()
          ? values.badgeTextHex
          : undefined,
        enabled: !!values.enabled,
      };
      await onSave(payload);
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  if (!open) return null;

  // helper ป้องกัน NaN จาก number inputs
  const num = (v: string) => (v === "" ? "" : Number(v));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">
            {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
          </div>
          <div className="text-xs text-muted-foreground">
            กำหนดช่วงเปอร์เซ็นต์ + สี/ความหนาเส้นกรอบ
          </div>
        </div>

        <div className="p-4 space-y-4">
          {err && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Min %</label>
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={values.minPercent}
                onChange={(e) =>
                  setValues({
                    ...values,
                    minPercent: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Max % (ว่าง = no limit)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setValues({
                    ...values,
                    maxPercent: v === "" ? "" : num(v),
                  });
                }}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Border width (px)
              </label>
              <input
                type="number"
                min={1}
                max={16}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={values.borderWidth}
                onChange={(e) =>
                  setValues({
                    ...values,
                    borderWidth: Number(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Border color
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded-md border"
                  value={values.borderColorHex || "#000000"}
                  onChange={(e) =>
                    setValues({ ...values, borderColorHex: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.borderColorHex}
                  onChange={(e) =>
                    setValues({ ...values, borderColorHex: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Badge bg (optional)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded-md border"
                  value={values.badgeBgHex || "#ffffff"}
                  onChange={(e) =>
                    setValues({ ...values, badgeBgHex: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="#ffffff"
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.badgeBgHex ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, badgeBgHex: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Badge text (optional)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded-md border"
                  value={values.badgeTextHex || "#000000"}
                  onChange={(e) =>
                    setValues({ ...values, badgeTextHex: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="#000000"
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.badgeTextHex ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, badgeTextHex: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.enabled}
              onChange={(e) =>
                setValues({ ...values, enabled: e.target.checked })
              }
            />
            Enabled
          </label>

          {/* live preview */}
          <div className="rounded-md border p-3">
            <div className="text-xs mb-2 text-muted-foreground">Preview</div>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-md"
                style={{
                  border: `${values.borderWidth}px solid ${values.borderColorHex}`,
                  background:
                    values.badgeBgHex && values.badgeTextHex
                      ? `linear-gradient(135deg, ${values.badgeBgHex}22 0%, transparent 60%)`
                      : "transparent",
                }}
              />
              <div className="text-xs">
                Range: {values.minPercent}%{" "}
                {values.maxPercent !== "" && values.maxPercent != null
                  ? `– ${values.maxPercent}%`
                  : "+"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm border hover:bg-muted"
            onClick={onClose}
            disabled={saving}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Saving…" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

// v.1.1.2 ================================================

// // src/app/admin/components/AdminDiscountRulesGrid.tsx

// "use client";

// import { useState } from "react";

// export type DiscountRuleEditValues = {
//   minPercent: number;
//   maxPercent?: number | "" ;
//   borderWidth: number;
//   borderColorHex: string;
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   enabled: boolean;
// };

// export default function AdminDiscountRuleEditDialog({
//   open,
//   mode,
//   initial,
//   onClose,
//   onSave,
// }: {
//   open: boolean;
//   mode: "create" | "edit";
//   initial: DiscountRuleEditValues;
//   onClose: () => void;
//   onSave: (values: DiscountRuleEditValues) => Promise<void> | void;
// }) {
//   const [values, setValues] = useState<DiscountRuleEditValues>(initial);
//   const [saving, setSaving] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   // sync when initial changes (open new)
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   useState(() => setValues(initial));

//   const submit = async () => {
//     setErr(null);
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent),
//         maxPercent: values.maxPercent === "" ? undefined : Number(values.maxPercent),
//         borderWidth: Number(values.borderWidth),
//         borderColorHex: values.borderColorHex,
//         badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//         badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
//         enabled: !!values.enabled,
//       };
//       await onSave(payload);
//     } catch (e: any) {
//       setErr(e?.message ?? "Save failed");
//       setSaving(false);
//       return;
//     }
//     setSaving(false);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
//         <div className="p-4 border-b">
//           <div className="text-lg font-semibold">{mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}</div>
//           <div className="text-xs text-muted-foreground">กำหนดช่วงเปอร์เซ็นต์ + สี/ความหนาเส้นกรอบ</div>
//         </div>

//         <div className="p-4 space-y-4">
//           {err && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {err}
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Min %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.minPercent}
//                 onChange={(e) => setValues({ ...values, minPercent: Number(e.target.value) })}
//               />
//             </div>
//             <div>
//               <label className="text-xs text-muted-foreground">Max % (ว่าง = no limit)</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setValues({ ...values, maxPercent: v === "" ? "" : Number(v) });
//                 }}
//               />
//             </div>
//             <div>
//               <label className="text-xs text-muted-foreground">Border width (px)</label>
//               <input
//                 type="number"
//                 min={1}
//                 max={16}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.borderWidth}
//                 onChange={(e) => setValues({ ...values, borderWidth: Number(e.target.value) })}
//               />
//             </div>
//             <div>
//               <label className="text-xs text-muted-foreground">Border color</label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.borderColorHex}
//                   onChange={(e) => setValues({ ...values, borderColorHex: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderColorHex}
//                   onChange={(e) => setValues({ ...values, borderColorHex: e.target.value })}
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-xs text-muted-foreground">Badge bg (optional)</label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) => setValues({ ...values, badgeBgHex: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) => setValues({ ...values, badgeBgHex: e.target.value })}
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-xs text-muted-foreground">Badge text (optional)</label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeTextHex || "#000000"}
//                   onChange={(e) => setValues({ ...values, badgeTextHex: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) => setValues({ ...values, badgeTextHex: e.target.value })}
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) => setValues({ ...values, enabled: e.target.checked })}
//             />
//             Enabled
//           </label>

//           {/* live preview */}
//           <div className="rounded-md border p-3">
//             <div className="text-xs mb-2 text-muted-foreground">Preview</div>
//             <div className="flex items-center gap-3">
//               <div
//                 className="w-16 h-16 rounded-md"
//                 style={{
//                   border: `${values.borderWidth}px solid ${values.borderColorHex}`,
//                   background:
//                     values.badgeBgHex && values.badgeTextHex
//                       ? `linear-gradient(135deg, ${values.badgeBgHex}22 0%, transparent 60%)`
//                       : "transparent",
//                 }}
//               />
//               <div className="text-xs">
//                 Range: {values.minPercent}% {values.maxPercent !== "" && values.maxPercent != null ? `– ${values.maxPercent}%` : "+"}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 border-t flex items-center justify-end gap-2">
//           <button
//             type="button"
//             className="rounded-md px-3 py-2 text-sm border hover:bg-muted"
//             onClick={onClose}
//             disabled={saving}
//           >
//             ยกเลิก
//           </button>
//           <button
//             type="button"
//             className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90"
//             onClick={submit}
//             disabled={saving}
//           >
//             {saving ? "Saving…" : "บันทึก"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

