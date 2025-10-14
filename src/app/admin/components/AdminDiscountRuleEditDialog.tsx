// v.1.1.7 ================================================
// src/app/admin/components/AdminDiscountRuleEditDialog.tsx
"use client";

import { useEffect, useRef, useState } from "react";

/** ===== Values ที่ dialog จะส่งกลับไปให้ Grid ===== */
export type DiscountRuleEditValues = {
  minPercent: number;
  maxPercent?: number | "";
  frameMode: "draw" | "image";
  borderWidth: number;
  borderColorHex: string;
  frameImageUrl?: string;
  frameImageInsetPx?: number;
  frameImageOpacity?: number;
  frameImageFit?: "contain" | "cover" | "stretch";
  badgeBgHex?: string;
  badgeTextHex?: string;
  enabled: boolean;
};

const UPLOAD_ENDPOINT = "/api/uploads/product_frame";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOW_TYPES = new Set(["image/png", "image/webp", "image/x-png"]);

type ImagePickMode = "stock" | "upload";

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

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pickMode, setPickMode] = useState<ImagePickMode>("stock");

  // <-- เก็บเป็น string เสมอ หลังนอร์มัลไลซ์
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setValues({
      minPercent: Number(initial.minPercent) || 0,
      maxPercent:
        initial.maxPercent === "" || initial.maxPercent == null
          ? ""
          : Number(initial.maxPercent),
      frameMode: initial.frameMode ?? "draw",
      borderWidth: Number(initial.borderWidth) || 1,
      borderColorHex: initial.borderColorHex || "#000000",
      frameImageUrl: initial.frameImageUrl ?? "",
      frameImageInsetPx:
        typeof initial.frameImageInsetPx === "number" ? initial.frameImageInsetPx : 0,
      frameImageOpacity:
        typeof initial.frameImageOpacity === "number" ? initial.frameImageOpacity : 1,
      frameImageFit: initial.frameImageFit ?? "contain",
      badgeBgHex: initial.badgeBgHex ?? "",
      badgeTextHex: initial.badgeTextHex ?? "",
      enabled: !!initial.enabled,
    });

    // โหลดรายการรูปจาก API แล้ว "นอร์มัลไลซ์" ให้เป็น string[]
    (async () => {
      try {
        setGalleryLoading(true);
        const res = await fetch(`${UPLOAD_ENDPOINT}?list=1`, { cache: "no-store" });
        if (!res.ok) {
          setGallery([]);
          return;
        }
        const data = await res.json().catch(() => ({} as any));
        const raw = Array.isArray(data?.items) ? data.items : [];

        const urls: string[] = raw
          .map((it: any) => {
            if (typeof it === "string") return it;
            if (it && typeof it === "object") {
              // รองรับ {url}, {path}, {href}
              return it.url || it.path || it.href || "";
            }
            return "";
          })
          .filter((u: any) => typeof u === "string" && u.trim().length > 0);

        setGallery(urls);
      } catch {
        setGallery([]);
      } finally {
        setGalleryLoading(false);
      }
    })();
  }, [open, initial]);

  const num = (v: string) => (v === "" ? "" : Number(v));

  const submit = async () => {
    setErr(null);
    if (uploading) {
      setErr("กำลังอัปโหลดรูปอยู่ กรุณารอก่อนกดบันทึก");
      return;
    }
    setSaving(true);
    try {
      const payload: DiscountRuleEditValues = {
        minPercent: Number(values.minPercent) || 0,
        maxPercent:
          values.maxPercent === "" || values.maxPercent == null
            ? undefined
            : Number(values.maxPercent),
        frameMode: values.frameMode,
        borderWidth: Number(values.borderWidth) || 1,
        borderColorHex: values.borderColorHex || "#000000",
        frameImageUrl: values.frameImageUrl?.trim()
          ? values.frameImageUrl.trim()
          : undefined,
        frameImageInsetPx:
          typeof values.frameImageInsetPx === "number" ? values.frameImageInsetPx : 0,
        frameImageOpacity:
          typeof values.frameImageOpacity === "number" ? values.frameImageOpacity : 1,
        frameImageFit: values.frameImageFit ?? "contain",
        badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
        badgeTextHex: values.badgeTextHex?.trim() ? values.badgeTextHex : undefined,
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

  const uploadWithProgress = (file: File) =>
    new Promise<string>((resolve, reject) => {
      try {
        const fd = new FormData();
        fd.append("file", file);

        const xhr = new XMLHttpRequest();
        uploadXhrRef.current = xhr;

        xhr.open("POST", UPLOAD_ENDPOINT, true);
        xhr.responseType = "json";

        xhr.upload.onprogress = (ev: ProgressEvent<EventTarget>) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(pct);
          } else {
            setUploadProgress((p) => (p < 95 ? p + 1 : p));
          }
        };

        xhr.onload = () => {
          uploadXhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            const res: any = xhr.response ?? JSON.parse(String(xhr.responseText || "{}"));
            const url: string | undefined = res?.url;
            if (!url) return reject(new Error("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL กลับมา"));
            resolve(url);
          } else {
            const msg =
              (xhr.response && (xhr.response as any)?.error) ||
              xhr.statusText ||
              "อัปโหลดไฟล์ไม่สำเร็จ";
            reject(new Error(String(msg)));
          }
        };

        xhr.onerror = () => {
          uploadXhrRef.current = null;
          reject(new Error("เกิดข้อผิดพลาดระหว่างอัปโหลด"));
        };

        xhr.onabort = () => {
          uploadXhrRef.current = null;
          reject(new Error("ยกเลิกการอัปโหลด"));
        };

        xhr.send(fd);
      } catch (e: any) {
        uploadXhrRef.current = null;
        reject(e);
      }
    });

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOW_TYPES.has(file.type)) {
      setErr("รองรับเฉพาะไฟล์ PNG หรือ WebP เท่านั้น");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErr("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const url = await uploadWithProgress(file);
      setValues((v) => ({ ...v, frameImageUrl: url }));
      setUploadProgress(100);
      setPickMode("stock"); // กลับไปดูคลัง
    } catch (e: any) {
      setErr(e?.message ?? "อัปโหลดไฟล์ไม่สำเร็จ");
      setUploadProgress(0);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelUpload = () => {
    if (uploading && uploadXhrRef.current) {
      uploadXhrRef.current.abort();
      setUploading(false);
      setUploadProgress(0);
      setErr("ยกเลิกการอัปโหลดแล้ว");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!open) return null;

  const isSelected = (url: string) => {
    const a = (values.frameImageUrl || "").toLowerCase();
    const b = typeof url === "string" ? url.toLowerCase() : "";
    return a === b && a !== "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b shrink-0">
          <div className="text-lg font-semibold">
            {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
          </div>
          <div className="text-xs text-muted-foreground">
            กำหนดช่วงเปอร์เซ็นต์ + โหมดกรอบ (วาดกรอบ/ใช้รูปกรอบ)
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
          {err && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          {uploading && (
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2" role="status" aria-live="polite">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>กำลังอัปโหลดรูปภาพ…</span>
                </div>
                <div className="tabular-nums">{uploadProgress}%</div>
              </div>
              <div className="h-2 w-full rounded bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-[width] duration-150 ease-out" style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }} />
              </div>
              <div className="flex justify-end">
                <button type="button" className="rounded-md border px-2 py-1 hover:bg-background" onClick={cancelUpload}>
                  ยกเลิกการอัปโหลด
                </button>
              </div>
            </div>
          )}

          {/* ช่วงเปอร์เซ็นต์ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Min %</label>
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={values.minPercent}
                onChange={(e) => setValues((v) => ({ ...v, minPercent: Number(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Max % (ว่าง = no limit)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setValues((x) => ({ ...x, maxPercent: v === "" ? "" : num(v) }));
                }}
              />
            </div>
          </div>

          {/* โหมดกรอบ */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">โหมดกรอบ</div>
            <div className="inline-flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={values.frameMode === "draw"} onChange={() => setValues((v) => ({ ...v, frameMode: "draw" }))} />
                วาดเส้นกรอบ (DRAW)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" checked={values.frameMode === "image"} onChange={() => setValues((v) => ({ ...v, frameMode: "image" }))} />
                ใช้รูปภาพกรอบ (IMAGE)
              </label>
            </div>
          </div>

          {/* ฟิลด์โหมด DRAW */}
          {values.frameMode === "draw" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Border width (px)</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.borderWidth}
                  onChange={(e) => setValues((v) => ({ ...v, borderWidth: Number(e.target.value) || 1 }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Border color</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded-md border"
                    value={values.borderColorHex || "#000000"}
                    onChange={(e) => setValues((v) => ({ ...v, borderColorHex: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                    value={values.borderColorHex}
                    onChange={(e) => setValues((v) => ({ ...v, borderColorHex: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ฟิลด์โหมด IMAGE */}
          {values.frameMode === "image" && (
            <div className="space-y-3">
              {/* Toggle pick mode */}
              <div className="inline-flex rounded-md border overflow-hidden text-sm">
                <button
                  type="button"
                  className={`px-3 py-1.5 ${pickMode === "stock" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  onClick={() => setPickMode("stock")}
                >
                  เลือกจากคลัง
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 border-l ${pickMode === "upload" ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  onClick={() => setPickMode("upload")}
                >
                  อัปโหลดไฟล์
                </button>
              </div>

              {/* STOCK gallery */}
              {pickMode === "stock" && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    เลือกกรอบจากคลัง {galleryLoading ? "(กำลังโหลด…)" : ""}
                  </div>

                  {(!galleryLoading && gallery.length === 0) ? (
                    <div className="rounded-md border p-3 text-xs text-muted-foreground">
                      ยังไม่มีรูปกรอบในคลัง
                      <button
                        type="button"
                        className="ml-2 underline decoration-dotted"
                        onClick={() => setPickMode("upload")}
                      >
                        อัปโหลดรูปแรก
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-auto pr-1">
                      {gallery.map((url) => (
                        <button
                          key={url}
                          type="button"
                          title={url}
                          onClick={() => setValues((v) => ({ ...v, frameImageUrl: url }))}
                          className={[
                            "relative rounded-lg border overflow-hidden bg-muted/30 aspect-square",
                            isSelected(url) ? "ring-2 ring-primary" : "hover:border-primary/50",
                          ].join(" ")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="absolute inset-0 w-full h-full object-contain" />
                          {isSelected(url) && (
                            <span className="absolute bottom-1 right-1 rounded bg-primary text-primary-foreground text-[10px] px-1">
                              ใช้รูปนี้
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      หรือใส่ URL เองด้านล่าง
                    </div>
                    {values.frameImageUrl && (
                      <button
                        type="button"
                        className="text-xs underline decoration-dotted"
                        onClick={() => setValues((v) => ({ ...v, frameImageUrl: "" }))}
                      >
                        ล้างรูปที่เลือก
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* UPLOAD panel */}
              {pickMode === "upload" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
                      onClick={handlePickFile}
                      disabled={uploading}
                    >
                      {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "อัปโหลดไฟล์ PNG/WebP"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <span className="text-xs text-muted-foreground">
                      แนะนำไฟล์โปร่งใส (PNG หรือ WebP) อัตราส่วนสี่เหลี่ยมจัตุรัส
                    </span>
                  </div>
                </div>
              )}

              {/* URL + options */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">
                    URL รูปภาพกรอบ (เลือกจากคลัง/อัปโหลดแล้วจะถูกใส่อัตโนมัติ)
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    value={values.frameImageUrl ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, frameImageUrl: e.target.value }))}
                    placeholder="/uploads/product_frame/frame.webp"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">ระยะขอบด้านใน (Inset px)</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    value={values.frameImageInsetPx ?? 0}
                    onChange={(e) => setValues((v) => ({ ...v, frameImageInsetPx: Number(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">ความทึบภาพ (Opacity 0–1)</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step="0.05"
                    className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    value={values.frameImageOpacity ?? 1}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const clamped = isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
                      setValues((v) => ({ ...v, frameImageOpacity: clamped }));
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">การย่อ/ขยาย (Object fit)</label>
                  <select
                    className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    value={values.frameImageFit ?? "contain"}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        frameImageFit: e.target.value as "contain" | "cover" | "stretch",
                      }))
                    }
                  >
                    <option value="contain">Contain (พอดีด้านใน)</option>
                    <option value="cover">Cover (คลุมเต็ม)</option>
                    <option value="stretch">Stretch (ยืดเต็มขอบ)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ป้าย badge (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Badge bg (optional)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded-md border"
                  value={values.badgeBgHex || "#ffffff"}
                  onChange={(e) => setValues((v) => ({ ...v, badgeBgHex: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="#ffffff"
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.badgeBgHex ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, badgeBgHex: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Badge text (optional)</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-12 rounded-md border"
                  value={values.badgeTextHex || "#000000"}
                  onChange={(e) => setValues((v) => ({ ...v, badgeTextHex: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="#000000"
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  value={values.badgeTextHex ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, badgeTextHex: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.enabled}
              onChange={(e) => setValues((v) => ({ ...v, enabled: e.target.checked }))}
            />
            Enabled
          </label>

          {/* live preview */}
          <div className="rounded-md border p-3">
            <div className="text-xs mb-2 text-muted-foreground">Preview</div>

            {values.frameMode === "draw" ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-md"
                  style={{ border: `${values.borderWidth}px solid ${values.borderColorHex}` }}
                />
                <div className="text-xs">
                  Range: {values.minPercent}%{" "}
                  {values.maxPercent !== "" && values.maxPercent != null ? `– ${values.maxPercent}%` : "+"}
                  <div>Mode: draw</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-md border bg-muted/30 overflow-hidden">
                  <div className="absolute inset-0" />
                  {values.frameImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={values.frameImageUrl}
                      alt="frame"
                      className="absolute inset-0"
                      style={{
                        objectFit: values.frameImageFit === "stretch" ? ("fill" as any) : values.frameImageFit,
                        opacity: values.frameImageOpacity ?? 1,
                        inset:
                          (values.frameImageInsetPx ?? 0) > 0
                            ? `${values.frameImageInsetPx}px`
                            : undefined,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
                      no image
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  Range: {values.minPercent}%{" "}
                  {values.maxPercent !== "" && values.maxPercent != null ? `– ${values.maxPercent}%` : "+"}
                  <div>Mode: image</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2 shrink-0">
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
            className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
            onClick={submit}
            disabled={saving || uploading}
          >
            {(saving || uploading) ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "Saving…"}
              </span>
            ) : (
              "บันทึก"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


// v.1.1.7 ================================================

// v.1.1.6 ================================================
// // src/app/admin/components/AdminDiscountRuleEditDialog.tsx
// "use client";

// import { useEffect, useState, useRef } from "react";

// /** ===== Values ที่ dialog จะส่งกลับไปให้ Grid ===== */
// export type DiscountRuleEditValues = {
//   minPercent: number;
//   maxPercent?: number | "";
//   frameMode: "draw" | "image";
//   borderWidth: number;
//   borderColorHex: string;
//   frameImageUrl?: string;
//   frameImageInsetPx?: number;
//   frameImageOpacity?: number;
//   frameImageFit?: "contain" | "cover" | "stretch";
//   badgeBgHex?: string;
//   badgeTextHex?: string;
//   enabled: boolean;
// };

// // ===== ปลายทาง API (ตามโครงสร้างใหม่ของคุณ) =====
// const UPLOAD_ENDPOINT = "/api/uploads/product_frame";
// const MAX_FILE_SIZE = 5 * 1024 * 1024;
// const ALLOW_TYPES = new Set(["image/png", "image/webp", "image/x-png"]);

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

//   // อัปโหลดแบบ XHR เพื่อได้ progress %
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const uploadXhrRef = useRef<XMLHttpRequest | null>(null);

//   const [err, setErr] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // รีเซ็ตค่าฟอร์มเมื่อเปิด/เปลี่ยน initial
//   useEffect(() => {
//     setValues({
//       minPercent: Number(initial.minPercent) || 0,
//       maxPercent:
//         initial.maxPercent === "" || initial.maxPercent == null
//           ? ""
//           : Number(initial.maxPercent),
//       frameMode: initial.frameMode ?? "draw",
//       borderWidth: Number(initial.borderWidth) || 1,
//       borderColorHex: initial.borderColorHex || "#000000",
//       frameImageUrl: initial.frameImageUrl ?? "",
//       frameImageInsetPx:
//         typeof initial.frameImageInsetPx === "number" ? initial.frameImageInsetPx : 0,
//       frameImageOpacity:
//         typeof initial.frameImageOpacity === "number" ? initial.frameImageOpacity : 1,
//       frameImageFit: initial.frameImageFit ?? "contain",
//       badgeBgHex: initial.badgeBgHex ?? "",
//       badgeTextHex: initial.badgeTextHex ?? "",
//       enabled: !!initial.enabled,
//     });
//   }, [open, initial]);

//   const num = (v: string) => (v === "" ? "" : Number(v));

//   // ===== Submit form =====
//   const submit = async () => {
//     setErr(null);
//     if (uploading) {
//       setErr("กำลังอัปโหลดรูปอยู่ กรุณารอก่อนกดบันทึก");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent) || 0,
//         maxPercent:
//           values.maxPercent === "" || values.maxPercent == null
//             ? undefined
//             : Number(values.maxPercent),
//         frameMode: values.frameMode,
//         borderWidth: Number(values.borderWidth) || 1,
//         borderColorHex: values.borderColorHex || "#000000",
//         frameImageUrl: values.frameImageUrl?.trim()
//           ? values.frameImageUrl.trim()
//           : undefined,
//         frameImageInsetPx:
//           typeof values.frameImageInsetPx === "number" ? values.frameImageInsetPx : 0,
//         frameImageOpacity:
//           typeof values.frameImageOpacity === "number" ? values.frameImageOpacity : 1,
//         frameImageFit: values.frameImageFit ?? "contain",
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

//   // ===== อัปโหลดไฟล์ด้วย XHR เพื่อได้เปอร์เซ็นต์ =====
//   const uploadWithProgress = (file: File) =>
//     new Promise<string>((resolve, reject) => {
//       try {
//         const fd = new FormData();
//         fd.append("file", file);

//         const xhr = new XMLHttpRequest();
//         uploadXhrRef.current = xhr;

//         xhr.open("POST", UPLOAD_ENDPOINT, true);
//         xhr.responseType = "json";

//         xhr.upload.onprogress = (ev: ProgressEvent<EventTarget>) => {
//           if (ev.lengthComputable) {
//             const pct = Math.round((ev.loaded / ev.total) * 100);
//             setUploadProgress(pct);
//           } else {
//             setUploadProgress((p) => (p < 95 ? p + 1 : p));
//           }
//         };

//         xhr.onload = () => {
//           uploadXhrRef.current = null;
//           if (xhr.status >= 200 && xhr.status < 300) {
//             const res: any = xhr.response ?? JSON.parse(String(xhr.responseText || "{}"));
//             const url: string | undefined = res?.url;
//             if (!url) return reject(new Error("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL กลับมา"));
//             resolve(url);
//           } else {
//             const msg =
//               (xhr.response && (xhr.response as any)?.error) ||
//               xhr.statusText ||
//               "อัปโหลดไฟล์ไม่สำเร็จ";
//             reject(new Error(String(msg)));
//           }
//         };

//         xhr.onerror = () => {
//           uploadXhrRef.current = null;
//           reject(new Error("เกิดข้อผิดพลาดระหว่างอัปโหลด"));
//         };

//         xhr.onabort = () => {
//           uploadXhrRef.current = null;
//           reject(new Error("ยกเลิกการอัปโหลด"));
//         };

//         xhr.send(fd);
//       } catch (e: any) {
//         uploadXhrRef.current = null;
//         reject(e);
//       }
//     });

//   const handlePickFile = () => fileInputRef.current?.click();

//   const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
//     setErr(null);
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!ALLOW_TYPES.has(file.type)) {
//       setErr("รองรับเฉพาะไฟล์ PNG หรือ WebP เท่านั้น");
//       e.target.value = "";
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE) {
//       setErr("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
//       e.target.value = "";
//       return;
//     }

//     try {
//       setUploading(true);
//       setUploadProgress(0);
//       const url = await uploadWithProgress(file);
//       setValues((v) => ({ ...v, frameImageUrl: url }));
//       setUploadProgress(100);
//     } catch (e: any) {
//       setErr(e?.message ?? "อัปโหลดไฟล์ไม่สำเร็จ");
//       setUploadProgress(0);
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const cancelUpload = () => {
//     if (uploading && uploadXhrRef.current) {
//       uploadXhrRef.current.abort();
//       setUploading(false);
//       setUploadProgress(0);
//       setErr("ยกเลิกการอัปโหลดแล้ว");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       {/* กล่องขาว: ทำเป็นคอลัมน์ + จำกัดความสูง + ให้สกรอลล์เฉพาะเนื้อหา */}
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border
//                       flex flex-col max-h-[90vh] sm:max-h-[85vh]">

//         {/* Header (ตรึงไว้) */}
//         <div className="p-4 border-b shrink-0">
//           <div className="text-lg font-semibold">
//             {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             กำหนดช่วงเปอร์เซ็นต์ + โหมดกรอบ (วาดกรอบ/ใช้รูปกรอบ)
//           </div>
//         </div>

//         {/* Content (เป็นส่วนที่สกรอลล์) */}
//         <div className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain touch-pan-y">
//           {err && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {err}
//             </div>
//           )}

//           {uploading && (
//             <div
//               className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2"
//               role="status"
//               aria-live="polite"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="inline-flex items-center gap-2">
//                   <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                   <span>กำลังอัปโหลดรูปภาพ…</span>
//                 </div>
//                 <div className="tabular-nums">{uploadProgress}%</div>
//               </div>
//               <div className="h-2 w-full rounded bg-muted overflow-hidden">
//                 <div
//                   className="h-full bg-primary transition-[width] duration-150 ease-out"
//                   style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }}
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   className="rounded-md border px-2 py-1 hover:bg-background"
//                   onClick={cancelUpload}
//                 >
//                   ยกเลิกการอัปโหลด
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ฟอร์มทั้งหมด (เหมือนเดิม) */}
//           {/* ช่วงเปอร์เซ็นต์ */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Min %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.minPercent}
//                 onChange={(e) =>
//                   setValues((v) => ({ ...v, minPercent: Number(e.target.value) || 0 }))
//                 }
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
//                   setValues((x) => ({ ...x, maxPercent: v === "" ? "" : num(v) }));
//                 }}
//               />
//             </div>
//           </div>

//           {/* โหมดกรอบ */}
//           <div className="space-y-2">
//             <div className="text-xs text-muted-foreground">โหมดกรอบ</div>
//             <div className="inline-flex items-center gap-3">
//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "draw"}
//                   onChange={() => setValues((v) => ({ ...v, frameMode: "draw" }))}
//                 />
//                 วาดเส้นกรอบ (DRAW)
//               </label>

//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "image"}
//                   onChange={() => setValues((v) => ({ ...v, frameMode: "image" }))}
//                 />
//                 ใช้รูปภาพกรอบ (IMAGE)
//               </label>
//             </div>
//           </div>

//           {/* ฟิลด์โหมด DRAW */}
//           {values.frameMode === "draw" && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-muted-foreground">Border width (px)</label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={16}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderWidth}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, borderWidth: Number(e.target.value) || 1 }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">Border color</label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <input
//                     type="color"
//                     className="h-9 w-12 rounded-md border"
//                     value={values.borderColorHex || "#000000"}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                   <input
//                     type="text"
//                     className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.borderColorHex}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ฟิลด์โหมด IMAGE */}
//           {values.frameMode === "image" && (
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
//                   onClick={handlePickFile}
//                   disabled={uploading}
//                 >
//                   {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "อัปโหลดไฟล์ PNG/WebP"}
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/png,image/webp"
//                   className="hidden"
//                   onChange={handleFileChange}
//                   disabled={uploading}
//                 />
//                 <span className="text-xs text-muted-foreground">
//                   แนะนำไฟล์โปร่งใส (PNG หรือ WebP) อัตราส่วนสี่เหลี่ยมจัตุรัส
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="col-span-2">
//                   <label className="text-xs text-muted-foreground">
//                     URL รูปภาพกรอบ (อัปโหลดสำเร็จแล้วจะถูกใส่อัตโนมัติ)
//                   </label>
//                   <input
//                     type="text"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageUrl ?? ""}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, frameImageUrl: e.target.value }))
//                     }
//                     placeholder="/uploads/product_frame/frame.webp"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">ระยะขอบด้านใน (Inset px)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageInsetPx ?? 0}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageInsetPx: Number(e.target.value) || 0,
//                       }))
//                     }
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">ความทึบภาพ (Opacity 0–1)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={1}
//                     step="0.05"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageOpacity ?? 1}
//                     onChange={(e) => {
//                       const n = Number(e.target.value);
//                       const clamped = isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
//                       setValues((v) => ({ ...v, frameImageOpacity: clamped }));
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">การย่อ/ขยาย (Object fit)</label>
//                   <select
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageFit ?? "contain"}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageFit: e.target.value as "contain" | "cover" | "stretch",
//                       }))
//                     }
//                   >
//                     <option value="contain">Contain (พอดีด้านใน)</option>
//                     <option value="cover">Cover (คลุมเต็ม)</option>
//                     <option value="stretch">Stretch (ยืดเต็มขอบ)</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ป้าย badge (optional) */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Badge bg (optional)</label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
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
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) => setValues((v) => ({ ...v, enabled: e.target.checked }))}
//             />
//             Enabled
//           </label>

//           {/* live preview */}
//           <div className="rounded-md border p-3">
//             <div className="text-xs mb-2 text-muted-foreground">Preview</div>

//             {values.frameMode === "draw" ? (
//               <div className="flex items-center gap-3">
//                 <div
//                   className="w-16 h-16 rounded-md"
//                   style={{
//                     border: `${values.borderWidth}px solid ${values.borderColorHex}`,
//                   }}
//                 />
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: draw</div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-3">
//                 <div className="relative w-16 h-16 rounded-md border bg-muted/30 overflow-hidden">
//                   <div className="absolute inset-0" />
//                   {values.frameImageUrl ? (
//                     <img
//                       src={values.frameImageUrl}
//                       alt="frame"
//                       className="absolute inset-0"
//                       style={{
//                         objectFit:
//                           values.frameImageFit === "stretch"
//                             ? ("fill" as any)
//                             : values.frameImageFit,
//                         opacity: values.frameImageOpacity ?? 1,
//                         inset:
//                           (values.frameImageInsetPx ?? 0) > 0
//                             ? `${values.frameImageInsetPx}px`
//                             : undefined,
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
//                       no image
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: image</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer (ตรึงไว้) */}
//         <div className="p-4 border-t flex items-center justify-end gap-2 shrink-0">
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
//             className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
//             onClick={submit}
//             disabled={saving || uploading}
//           >
//             {(saving || uploading) ? (
//               <span className="inline-flex items-center gap-2">
//                 <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                 {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "Saving…"}
//               </span>
//             ) : (
//               "บันทึก"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// v.1.1.6 ================================================

// v.1.1.5 ================================================
// // src/app/admin/components/AdminDiscountRuleEditDialog.tsx

// "use client";

// import { useEffect, useState, useRef } from "react";

// /** ===== Values ที่ dialog จะส่งกลับไปให้ Grid ===== */
// export type DiscountRuleEditValues = {
//   // ช่วงเปอร์เซ็นต์
//   minPercent: number;
//   maxPercent?: number | "";

//   // โหมดกรอบ
//   frameMode: "draw" | "image";

//   // วาดกรอบ (DRAW)
//   borderWidth: number;
//   borderColorHex: string;

//   // ใช้รูปภาพกรอบ (IMAGE)
//   frameImageUrl?: string;               // URL หลังอัปโหลด
//   frameImageInsetPx?: number;           // ระยะขอบด้านใน (px)
//   frameImageOpacity?: number;           // 0..1
//   frameImageFit?: "contain" | "cover" | "stretch";

//   // ป้ายมุม (optional)
//   badgeBgHex?: string;
//   badgeTextHex?: string;

//   enabled: boolean;
// };

// // ===== ปลายทาง API (ตามโครงสร้างใหม่ของคุณ) =====
// const UPLOAD_ENDPOINT = "/api/uploads/product_frame";
// const MAX_FILE_SIZE = 5 * 1024 * 1024;
// const ALLOW_TYPES = new Set(["image/png", "image/webp", "image/x-png"]);

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

//   // อัปโหลดแบบ XHR เพื่อได้ progress %
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const uploadXhrRef = useRef<XMLHttpRequest | null>(null);

//   const [err, setErr] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // รีเซ็ตค่าฟอร์มเมื่อเปิด/เปลี่ยน initial
//   useEffect(() => {
//     setValues({
//       minPercent: Number(initial.minPercent) || 0,
//       maxPercent:
//         initial.maxPercent === "" || initial.maxPercent == null
//           ? ""
//           : Number(initial.maxPercent),

//       frameMode: initial.frameMode ?? "draw",

//       borderWidth: Number(initial.borderWidth) || 1,
//       borderColorHex: initial.borderColorHex || "#000000",

//       frameImageUrl: initial.frameImageUrl ?? "",
//       frameImageInsetPx:
//         typeof initial.frameImageInsetPx === "number"
//           ? initial.frameImageInsetPx
//           : 0,
//       frameImageOpacity:
//         typeof initial.frameImageOpacity === "number"
//           ? initial.frameImageOpacity
//           : 1,
//       frameImageFit: initial.frameImageFit ?? "contain",

//       badgeBgHex: initial.badgeBgHex ?? "",
//       badgeTextHex: initial.badgeTextHex ?? "",
//       enabled: !!initial.enabled,
//     });
//   }, [open, initial]);

//   // helper: number จาก <input type="number" />
//   const num = (v: string) => (v === "" ? "" : Number(v));

//   // ===== Submit form =====
//   const submit = async () => {
//     setErr(null);
//     if (uploading) {
//       setErr("กำลังอัปโหลดรูปอยู่ กรุณารอก่อนกดบันทึก");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent) || 0,
//         maxPercent:
//           values.maxPercent === "" || values.maxPercent == null
//             ? undefined
//             : Number(values.maxPercent),

//         frameMode: values.frameMode,

//         borderWidth: Number(values.borderWidth) || 1,
//         borderColorHex: values.borderColorHex || "#000000",

//         frameImageUrl: values.frameImageUrl?.trim()
//           ? values.frameImageUrl.trim()
//           : undefined,
//         frameImageInsetPx:
//           typeof values.frameImageInsetPx === "number"
//             ? values.frameImageInsetPx
//             : 0,
//         frameImageOpacity:
//           typeof values.frameImageOpacity === "number"
//             ? values.frameImageOpacity
//             : 1,
//         frameImageFit: values.frameImageFit ?? "contain",

//         badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//         badgeTextHex: values.badgeTextHex?.trim()
//           ? values.badgeTextHex
//           : undefined,

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

//   // ===== อัปโหลดไฟล์ด้วย XHR เพื่อได้เปอร์เซ็นต์ =====
//   const uploadWithProgress = (file: File) =>
//     new Promise<string>((resolve, reject) => {
//       try {
//         const fd = new FormData();
//         fd.append("file", file);

//         const xhr = new XMLHttpRequest();
//         uploadXhrRef.current = xhr;

//         xhr.open("POST", UPLOAD_ENDPOINT, true);
//         xhr.responseType = "json";

//         xhr.upload.onprogress = (ev: ProgressEvent<EventTarget>) => {
//           if (ev.lengthComputable) {
//             const pct = Math.round((ev.loaded / ev.total) * 100);
//             setUploadProgress(pct);
//           } else {
//             setUploadProgress((p) => (p < 95 ? p + 1 : p));
//           }
//         };

//         xhr.onload = () => {
//           uploadXhrRef.current = null;
//           if (xhr.status >= 200 && xhr.status < 300) {
//             const res: any = xhr.response ?? JSON.parse(String(xhr.responseText || "{}"));
//             const url: string | undefined = res?.url;
//             if (!url) return reject(new Error("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL กลับมา"));
//             resolve(url);
//           } else {
//             const msg =
//               (xhr.response && (xhr.response as any)?.error) ||
//               xhr.statusText ||
//               "อัปโหลดไฟล์ไม่สำเร็จ";
//             reject(new Error(String(msg)));
//           }
//         };

//         xhr.onerror = () => {
//           uploadXhrRef.current = null;
//           reject(new Error("เกิดข้อผิดพลาดระหว่างอัปโหลด"));
//         };

//         xhr.onabort = () => {
//           uploadXhrRef.current = null;
//           reject(new Error("ยกเลิกการอัปโหลด"));
//         };

//         xhr.send(fd);
//       } catch (e: any) {
//         uploadXhrRef.current = null;
//         reject(e);
//       }
//     });

//   const handlePickFile = () => fileInputRef.current?.click();

//   const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
//     setErr(null);
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!ALLOW_TYPES.has(file.type)) {
//       setErr("รองรับเฉพาะไฟล์ PNG หรือ WebP เท่านั้น");
//       e.target.value = "";
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE) {
//       setErr("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
//       e.target.value = "";
//       return;
//     }

//     try {
//       setUploading(true);
//       setUploadProgress(0);
//       const url = await uploadWithProgress(file);
//       setValues((v) => ({ ...v, frameImageUrl: url }));
//       setUploadProgress(100);
//     } catch (e: any) {
//       setErr(e?.message ?? "อัปโหลดไฟล์ไม่สำเร็จ");
//       setUploadProgress(0);
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const cancelUpload = () => {
//     if (uploading && uploadXhrRef.current) {
//       uploadXhrRef.current.abort();
//       setUploading(false);
//       setUploadProgress(0);
//       setErr("ยกเลิกการอัปโหลดแล้ว");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
//         {/* Header */}
//         <div className="p-4 border-b">
//           <div className="text-lg font-semibold">
//             {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             กำหนดช่วงเปอร์เซ็นต์ + โหมดกรอบ (วาดกรอบ/ใช้รูปกรอบ)
//           </div>
//         </div>

//         <div className="p-4 space-y-4">
//           {/* Error */}
//           {err && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {err}
//             </div>
//           )}

//           {/* Upload status + progress */}
//           {uploading && (
//             <div
//               className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2"
//               role="status"
//               aria-live="polite"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="inline-flex items-center gap-2">
//                   <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                   <span>กำลังอัปโหลดรูปภาพ…</span>
//                 </div>
//                 <div className="tabular-nums">{uploadProgress}%</div>
//               </div>
//               <div className="h-2 w-full rounded bg-muted overflow-hidden">
//                 <div
//                   className="h-full bg-primary transition-[width] duration-150 ease-out"
//                   style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }}
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   className="rounded-md border px-2 py-1 hover:bg-background"
//                   onClick={cancelUpload}
//                 >
//                   ยกเลิกการอัปโหลด
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ช่วงเปอร์เซ็นต์ */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Min %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.minPercent}
//                 onChange={(e) =>
//                   setValues((v) => ({
//                     ...v,
//                     minPercent: Number(e.target.value) || 0,
//                   }))
//                 }
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Max % (ว่าง = no limit)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setValues((x) => ({
//                     ...x,
//                     maxPercent: v === "" ? "" : num(v),
//                   }));
//                 }}
//               />
//             </div>
//           </div>

//           {/* โหมดกรอบ */}
//           <div className="space-y-2">
//             <div className="text-xs text-muted-foreground">โหมดกรอบ</div>
//             <div className="inline-flex items-center gap-3">
//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "draw"}
//                   onChange={() =>
//                     setValues((v) => ({ ...v, frameMode: "draw" }))
//                   }
//                 />
//                 วาดเส้นกรอบ (DRAW)
//               </label>

//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "image"}
//                   onChange={() =>
//                     setValues((v) => ({ ...v, frameMode: "image" }))
//                   }
//                 />
//                 ใช้รูปภาพกรอบ (IMAGE)
//               </label>
//             </div>
//           </div>

//           {/* ฟิลด์ของโหมด DRAW */}
//           {values.frameMode === "draw" && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border width (px)
//                 </label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={16}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderWidth}
//                   onChange={(e) =>
//                     setValues((v) => ({
//                       ...v,
//                       borderWidth: Number(e.target.value) || 1,
//                     }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border color
//                 </label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <input
//                     type="color"
//                     className="h-9 w-12 rounded-md border"
//                     value={values.borderColorHex || "#000000"}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                   <input
//                     type="text"
//                     className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.borderColorHex}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ฟิลด์ของโหมด IMAGE */}
//           {values.frameMode === "image" && (
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
//                   onClick={handlePickFile}
//                   disabled={uploading}
//                 >
//                   {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "อัปโหลดไฟล์ PNG/WebP"}
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/png,image/webp"
//                   className="hidden"
//                   onChange={handleFileChange}
//                   disabled={uploading}
//                 />
//                 <span className="text-xs text-muted-foreground">
//                   แนะนำไฟล์โปร่งใส (PNG หรือ WebP) อัตราส่วนสี่เหลี่ยมจัตุรัส
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="col-span-2">
//                   <label className="text-xs text-muted-foreground">
//                     URL รูปภาพกรอบ (อัปโหลดสำเร็จแล้วจะถูกใส่อัตโนมัติ)
//                   </label>
//                   <input
//                     type="text"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageUrl ?? ""}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, frameImageUrl: e.target.value }))
//                     }
//                     placeholder="/uploads/product_frame/frame.webp"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     ระยะขอบด้านใน (Inset px)
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageInsetPx ?? 0}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageInsetPx: Number(e.target.value) || 0,
//                       }))
//                     }
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     ความทึบภาพ (Opacity 0–1)
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={1}
//                     step="0.05"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageOpacity ?? 1}
//                     onChange={(e) => {
//                       const n = Number(e.target.value);
//                       const clamped = isNaN(n)
//                         ? 1
//                         : Math.max(0, Math.min(1, n));
//                       setValues((v) => ({ ...v, frameImageOpacity: clamped }));
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     การย่อ/ขยาย (Object fit)
//                   </label>
//                   <select
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageFit ?? "contain"}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageFit: e.target.value as
//                           | "contain"
//                           | "cover"
//                           | "stretch",
//                       }))
//                     }
//                   >
//                     <option value="contain">Contain (พอดีด้านใน)</option>
//                     <option value="cover">Cover (คลุมเต็ม)</option>
//                     <option value="stretch">Stretch (ยืดเต็มขอบ)</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ป้าย badge (optional) */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge bg (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge text (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeTextHex || "#000000"}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) =>
//                 setValues((v) => ({ ...v, enabled: e.target.checked }))
//               }
//             />
//             Enabled
//           </label>

//           {/* live preview */}
//           <div className="rounded-md border p-3">
//             <div className="text-xs mb-2 text-muted-foreground">Preview</div>

//             {values.frameMode === "draw" ? (
//               <div className="flex items-center gap-3">
//                 <div
//                   className="w-16 h-16 rounded-md"
//                   style={{
//                     border: `${values.borderWidth}px solid ${values.borderColorHex}`,
//                   }}
//                 />
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: draw</div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-3">
//                 <div className="relative w-16 h-16 rounded-md border bg-muted/30 overflow-hidden">
//                   {/* พื้นหลังเทาแทนรูปสินค้า */}
//                   <div className="absolute inset-0" />
//                   {/* รูปกรอบ (PNG/WebP โปร่งใสแสดงได้) */}
//                   {values.frameImageUrl ? (
//                     <img
//                       src={values.frameImageUrl}
//                       alt="frame"
//                       className="absolute inset-0"
//                       style={{
//                         objectFit:
//                           values.frameImageFit === "stretch"
//                             ? ("fill" as any)
//                             : values.frameImageFit,
//                         opacity: values.frameImageOpacity ?? 1,
//                         inset:
//                           (values.frameImageInsetPx ?? 0) > 0
//                             ? `${values.frameImageInsetPx}px`
//                             : undefined,
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
//                       no image
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: image</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-4 border-t flex items-center justify-end gap-2">
//           <button
//             type="button"
//             className="rounded-md px-3 py-2 text-sm border hover:bg-muted"
//             onClick={onClose}
//             disabled={saving /* ถ้าต้องกันตอนอัปโหลดด้วย ใส่ || uploading */}
//           >
//             ยกเลิก
//           </button>
//           <button
//             type="button"
//             className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
//             onClick={submit}
//             disabled={saving || uploading}
//           >
//             {(saving || uploading) ? (
//               <span className="inline-flex items-center gap-2">
//                 <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                 {uploading ? `กำลังอัปโหลด… ${uploadProgress}%` : "Saving…"}
//               </span>
//             ) : (
//               "บันทึก"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// v.1.1.5 ================================================

// v.1.1.4 ================================================
// // src/app/admin/components/AdminDiscountRuleEditDialog.tsx

// "use client";

// import { useEffect, useState, useRef } from "react";

// /** ===== Values ที่ dialog จะส่งกลับไปให้ Grid =====
//  * - รองรับ 2 โหมด: frameMode = "draw" | "image"
//  * - ถ้าเป็น "image" ให้ใช้ frameImageUrl + options (inset/opacity/fit)
//  */
// export type DiscountRuleEditValues = {
//   // ช่วงเปอร์เซ็นต์
//   minPercent: number;
//   maxPercent?: number | "";

//   // โหมดกรอบ
//   frameMode: "draw" | "image";

//   // วาดกรอบ (DRAW)
//   borderWidth: number;
//   borderColorHex: string;

//   // ใช้รูปภาพกรอบ (IMAGE)
//   frameImageUrl?: string;              // url หลังอัปโหลด
//   frameImageInsetPx?: number;          // ระยะขอบด้านใน (px)
//   frameImageOpacity?: number;          // 0..1
//   frameImageFit?: "contain" | "cover" | "stretch";

//   // ป้ายมุม (optional)
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
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   // ✅ รีเซ็ตค่าฟอร์มเมื่อเปิด/เปลี่ยน initial
//   useEffect(() => {
//     setValues({
//       minPercent: Number(initial.minPercent) || 0,
//       maxPercent:
//         initial.maxPercent === "" || initial.maxPercent == null
//           ? ""
//           : Number(initial.maxPercent),

//       frameMode: initial.frameMode ?? "draw",

//       borderWidth: Number(initial.borderWidth) || 1,
//       borderColorHex: initial.borderColorHex || "#000000",

//       frameImageUrl: initial.frameImageUrl ?? "",
//       frameImageInsetPx:
//         typeof initial.frameImageInsetPx === "number"
//           ? initial.frameImageInsetPx
//           : 0,
//       frameImageOpacity:
//         typeof initial.frameImageOpacity === "number"
//           ? initial.frameImageOpacity
//           : 1,
//       frameImageFit: initial.frameImageFit ?? "contain",

//       badgeBgHex: initial.badgeBgHex ?? "",
//       badgeTextHex: initial.badgeTextHex ?? "",
//       enabled: !!initial.enabled,
//     });
//   }, [open, initial]);

//   // helper ป้องกัน NaN จาก number inputs
//   const num = (v: string) => (v === "" ? "" : Number(v));

//   const submit = async () => {
//     setErr(null);
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent) || 0,
//         maxPercent:
//           values.maxPercent === "" || values.maxPercent == null
//             ? undefined
//             : Number(values.maxPercent),

//         frameMode: values.frameMode,

//         borderWidth: Number(values.borderWidth) || 1,
//         borderColorHex: values.borderColorHex || "#000000",

//         frameImageUrl: values.frameImageUrl?.trim()
//           ? values.frameImageUrl.trim()
//           : undefined,
//         frameImageInsetPx:
//           typeof values.frameImageInsetPx === "number"
//             ? values.frameImageInsetPx
//             : 0,
//         frameImageOpacity:
//           typeof values.frameImageOpacity === "number"
//             ? values.frameImageOpacity
//             : 1,
//         frameImageFit: values.frameImageFit ?? "contain",

//         badgeBgHex: values.badgeBgHex?.trim() ? values.badgeBgHex : undefined,
//         badgeTextHex: values.badgeTextHex?.trim()
//           ? values.badgeTextHex
//           : undefined,

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

//   // ===== Upload รูป PNG ไปยัง /api/mock/uploads (คุณจะเพิ่ม API ในขั้นถัดไป) =====
//   const handlePickFile = () => fileInputRef.current?.click();

//   const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
//     e
//   ) => {
//     setErr(null);
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.type !== "image/png") {
//       setErr("รองรับเฉพาะไฟล์ PNG เท่านั้น");
//       e.target.value = "";
//       return;
//     }

//     try {
//       const fd = new FormData();
//       fd.append("file", file);

//       const res = await fetch("/api/mock/uploads", {
//         method: "POST",
//         body: fd,
//       });

//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         throw new Error(t || "อัปโหลดไฟล์ไม่สำเร็จ");
//       }

//       const data = await res.json().catch(() => ({}));
//       // สมมติ API ส่ง { url: "/uploads/xxx.png" }
//       const url: string | undefined = data?.url;
//       if (!url) throw new Error("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL กลับมา");

//       setValues((v) => ({ ...v, frameImageUrl: url }));
//     } catch (e: any) {
//       setErr(e?.message ?? "อัปโหลดไฟล์ไม่สำเร็จ");
//     } finally {
//       // clear เพื่อให้อัปโหลดไฟล์เดิมซ้ำได้ถ้าต้องการ
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
//         <div className="p-4 border-b">
//           <div className="text-lg font-semibold">
//             {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             กำหนดช่วงเปอร์เซ็นต์ + โหมดกรอบ (วาดกรอบ/ใช้รูปกรอบ)
//           </div>
//         </div>

//         <div className="p-4 space-y-4">
//           {err && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {err}
//             </div>
//           )}

//           {/* ช่วงเปอร์เซ็นต์ */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Min %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.minPercent}
//                 onChange={(e) =>
//                   setValues((v) => ({
//                     ...v,
//                     minPercent: Number(e.target.value) || 0,
//                   }))
//                 }
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Max % (ว่าง = no limit)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setValues((x) => ({
//                     ...x,
//                     maxPercent: v === "" ? "" : num(v),
//                   }));
//                 }}
//               />
//             </div>
//           </div>

//           {/* โหมดกรอบ */}
//           <div className="space-y-2">
//             <div className="text-xs text-muted-foreground">โหมดกรอบ</div>
//             <div className="inline-flex items-center gap-3">
//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "draw"}
//                   onChange={() =>
//                     setValues((v) => ({ ...v, frameMode: "draw" }))
//                   }
//                 />
//                 วาดเส้นกรอบ (DRAW)
//               </label>

//               <label className="inline-flex items-center gap-2 text-sm">
//                 <input
//                   type="radio"
//                   checked={values.frameMode === "image"}
//                   onChange={() =>
//                     setValues((v) => ({ ...v, frameMode: "image" }))
//                   }
//                 />
//                 ใช้รูปภาพกรอบ (IMAGE)
//               </label>
//             </div>
//           </div>

//           {/* ฟิลด์ของโหมด DRAW */}
//           {values.frameMode === "draw" && (
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border width (px)
//                 </label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={16}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderWidth}
//                   onChange={(e) =>
//                     setValues((v) => ({
//                       ...v,
//                       borderWidth: Number(e.target.value) || 1,
//                     }))
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border color
//                 </label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <input
//                     type="color"
//                     className="h-9 w-12 rounded-md border"
//                     value={values.borderColorHex || "#000000"}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                   <input
//                     type="text"
//                     className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.borderColorHex}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, borderColorHex: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ฟิลด์ของโหมด IMAGE */}
//           {values.frameMode === "image" && (
//             <div className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
//                   onClick={handlePickFile}
//                 >
//                   อัปโหลดไฟล์ PNG
//                 </button>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/png"
//                   className="hidden"
//                   onChange={handleFileChange}
//                 />
//                 <span className="text-xs text-muted-foreground">
//                   แนะนำภาพโปร่งใส (PNG) อัตราส่วนสี่เหลี่ยมจัตุรัส
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="col-span-2">
//                   <label className="text-xs text-muted-foreground">
//                     URL รูปภาพกรอบ (อัปโหลดสำเร็จแล้วจะถูกใส่อัตโนมัติ)
//                   </label>
//                   <input
//                     type="text"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageUrl ?? ""}
//                     onChange={(e) =>
//                       setValues((v) => ({ ...v, frameImageUrl: e.target.value }))
//                     }
//                     placeholder="/uploads/frame.png"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     ระยะขอบด้านใน (Inset px)
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageInsetPx ?? 0}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageInsetPx: Number(e.target.value) || 0,
//                       }))
//                     }
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     ความทึบภาพ (Opacity 0–1)
//                   </label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={1}
//                     step="0.05"
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageOpacity ?? 1}
//                     onChange={(e) => {
//                       const n = Number(e.target.value);
//                       const clamped = isNaN(n)
//                         ? 1
//                         : Math.max(0, Math.min(1, n));
//                       setValues((v) => ({ ...v, frameImageOpacity: clamped }));
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="text-xs text-muted-foreground">
//                     การย่อ/ขยาย (Object fit)
//                   </label>
//                   <select
//                     className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.frameImageFit ?? "contain"}
//                     onChange={(e) =>
//                       setValues((v) => ({
//                         ...v,
//                         frameImageFit: e.target.value as
//                           | "contain"
//                           | "cover"
//                           | "stretch",
//                       }))
//                     }
//                   >
//                     <option value="contain">Contain (พอดีด้านใน)</option>
//                     <option value="cover">Cover (คลุมเต็ม)</option>
//                     <option value="stretch">Stretch (ยืดเต็มขอบ)</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ป้าย badge (optional) */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge bg (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeBgHex: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge text (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeTextHex || "#000000"}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) =>
//                     setValues((v) => ({ ...v, badgeTextHex: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) =>
//                 setValues((v) => ({ ...v, enabled: e.target.checked }))
//               }
//             />
//             Enabled
//           </label>

//           {/* live preview */}
//           <div className="rounded-md border p-3">
//             <div className="text-xs mb-2 text-muted-foreground">Preview</div>

//             {values.frameMode === "draw" ? (
//               <div className="flex items-center gap-3">
//                 <div
//                   className="w-16 h-16 rounded-md"
//                   style={{
//                     border: `${values.borderWidth}px solid ${values.borderColorHex}`,
//                   }}
//                 />
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: draw</div>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-3">
//                 <div className="relative w-16 h-16 rounded-md border bg-muted/30 overflow-hidden">
//                   {/* พื้นหลังเทาแทนรูปสินค้า */}
//                   <div className="absolute inset-0" />
//                   {/* รูปกรอบ */}
//                   {values.frameImageUrl ? (
//                     <img
//                       src={values.frameImageUrl}
//                       alt="frame"
//                       className="absolute inset-0"
//                       style={{
//                         objectFit:
//                           values.frameImageFit === "stretch"
//                             ? ("fill" as any)
//                             : values.frameImageFit,
//                         opacity: values.frameImageOpacity ?? 1,
//                         inset:
//                           (values.frameImageInsetPx ?? 0) > 0
//                             ? `${values.frameImageInsetPx}px`
//                             : undefined,
//                       }}
//                     />
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
//                       no image
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-xs">
//                   Range: {values.minPercent}%{" "}
//                   {values.maxPercent !== "" && values.maxPercent != null
//                     ? `– ${values.maxPercent}%`
//                     : "+"}
//                   <div>Mode: image</div>
//                 </div>
//               </div>
//             )}
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

// v.1.1.4 ================================================

// v.1.1.3 ================================================
// src/app/admin/components/AdminDiscountRuleEditDialog.tsx

// "use client";

// import { useEffect, useState } from "react";

// export type DiscountRuleEditValues = {
//   minPercent: number;
//   maxPercent?: number | "";

//   // draw mode fields (ของเดิม)
//   borderWidth: number;
//   borderColorHex: string;

//   // badge (ของเดิม)
//   badgeBgHex?: string;
//   badgeTextHex?: string;

//   enabled: boolean;

//   // NEW: frame image mode
//   frameMode?: "draw" | "image";
//   frameImageUrl?: string;
//   frameInsetPx?: number;
//   frameOpacity?: number; // 0..1
//   frameObjectFit?: "contain" | "cover";
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

//   // ✅ รีเซ็ตค่าฟอร์มทุกครั้งที่เปิด dialog หรือ initial เปลี่ยน
//   useEffect(() => {
//     setValues({
//       minPercent: Number(initial.minPercent) || 0,
//       maxPercent:
//         initial.maxPercent === "" || initial.maxPercent == null
//           ? ""
//           : Number(initial.maxPercent),

//       // draw mode (เดิม)
//       borderWidth: Number(initial.borderWidth) || 1,
//       borderColorHex: initial.borderColorHex || "#000000",

//       // badge (เดิม)
//       badgeBgHex: initial.badgeBgHex ?? "",
//       badgeTextHex: initial.badgeTextHex ?? "",

//       enabled: !!initial.enabled,

//       // NEW: frame image mode defaults
//       frameMode: initial.frameMode === "image" ? "image" : "draw",
//       frameImageUrl: initial.frameImageUrl ?? "",
//       frameInsetPx: Number(initial.frameInsetPx ?? 0) || 0,
//       frameOpacity:
//         typeof initial.frameOpacity === "number" ? initial.frameOpacity : 1,
//       frameObjectFit:
//         initial.frameObjectFit === "cover" ? "cover" : "contain",
//     });
//   }, [open, initial]);

//   const submit = async () => {
//     setErr(null);
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent) || 0,
//         maxPercent:
//           values.maxPercent === "" || values.maxPercent == null
//             ? undefined
//             : Number(values.maxPercent),

//         // draw (ส่งไว้เสมอ เผื่อสลับโหมดกลับมา)
//         borderWidth: Number(values.borderWidth) || 1,
//         borderColorHex: values.borderColorHex || "#000000",

//         // badge
//         badgeBgHex: values.badgeBgHex?.trim()
//           ? values.badgeBgHex
//           : undefined,
//         badgeTextHex: values.badgeTextHex?.trim()
//           ? values.badgeTextHex
//           : undefined,

//         enabled: !!values.enabled,

//         // NEW: frame image mode
//         frameMode: values.frameMode === "image" ? "image" : "draw",
//         frameImageUrl:
//           values.frameMode === "image" && values.frameImageUrl?.trim()
//             ? values.frameImageUrl.trim()
//             : undefined,
//         frameInsetPx:
//           values.frameMode === "image"
//             ? Math.max(0, Number(values.frameInsetPx) || 0)
//             : undefined,
//         frameOpacity:
//           values.frameMode === "image"
//             ? Math.max(0, Math.min(1, Number(values.frameOpacity ?? 1) || 1))
//             : undefined,
//         frameObjectFit:
//           values.frameMode === "image"
//             ? (values.frameObjectFit === "cover" ? "cover" : "contain")
//             : undefined,
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

//   // helper ป้องกัน NaN จาก number inputs
//   const num = (v: string) => (v === "" ? "" : Number(v));

//   const isImageMode = (values.frameMode ?? "draw") === "image";
//   const inset = Math.max(0, Number(values.frameInsetPx) || 0);
//   const opacity =
//     typeof values.frameOpacity === "number"
//       ? Math.max(0, Math.min(1, values.frameOpacity))
//       : 1;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
//         <div className="p-4 border-b">
//           <div className="text-lg font-semibold">
//             {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             กำหนดช่วงเปอร์เซ็นต์ + สไตล์กรอบ (วาดเส้น / ใช้รูปภาพกรอบ)
//           </div>
//         </div>

//         <div className="p-4 space-y-4">
//           {err && (
//             <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               {err}
//             </div>
//           )}

//           {/* ช่วงเปอร์เซ็นต์ส่วนลด */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">Min %</label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.minPercent}
//                 onChange={(e) =>
//                   setValues({
//                     ...values,
//                     minPercent: Number(e.target.value) || 0,
//                   })
//                 }
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Max % (ว่าง = no limit)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setValues({
//                     ...values,
//                     maxPercent: v === "" ? "" : num(v),
//                   });
//                 }}
//               />
//             </div>
//           </div>

//           {/* โหมดกรอบ */}
//           <div className="space-y-2">
//             <div className="text-xs text-muted-foreground">โหมดกรอบ</div>
//             <div className="inline-flex rounded-md border overflow-hidden">
//               <button
//                 type="button"
//                 className={`px-3 py-1.5 text-sm ${
//                   !isImageMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"
//                 }`}
//                 onClick={() => setValues((v) => ({ ...v, frameMode: "draw" }))}
//               >
//                 วาดเส้น
//               </button>
//               <button
//                 type="button"
//                 className={`px-3 py-1.5 text-sm ${
//                   isImageMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"
//                 }`}
//                 onClick={() => setValues((v) => ({ ...v, frameMode: "image" }))}
//               >
//                 ใช้รูปภาพกรอบ
//               </button>
//             </div>
//           </div>

//           {/* อินพุตตามโหมด */}
//           {!isImageMode ? (
//             // -------- Draw mode (ของเดิม) --------
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border width (px)
//                 </label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={16}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderWidth}
//                   onChange={(e) =>
//                     setValues({
//                       ...values,
//                       borderWidth: Number(e.target.value) || 1,
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">
//                   Border color
//                 </label>
//                 <div className="mt-1 flex items-center gap-2">
//                   <input
//                     type="color"
//                     className="h-9 w-12 rounded-md border"
//                     value={values.borderColorHex || "#000000"}
//                     onChange={(e) =>
//                       setValues({ ...values, borderColorHex: e.target.value })
//                     }
//                   />
//                   <input
//                     type="text"
//                     className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                     value={values.borderColorHex}
//                     onChange={(e) =>
//                       setValues({ ...values, borderColorHex: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // -------- Image mode (NEW) --------
//             <div className="grid grid-cols-2 gap-3">
//               <div className="col-span-2">
//                 <label className="text-xs text-muted-foreground">ลิงก์รูปภาพกรอบ (PNG โปร่งใส)</label>
//                 <input
//                   type="text"
//                   placeholder="https://.../frame.png"
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.frameImageUrl ?? ""}
//                   onChange={(e) =>
//                     setValues({ ...values, frameImageUrl: e.target.value })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">ระยะขอบด้านใน (Inset px)</label>
//                 <input
//                   type="number"
//                   min={0}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.frameInsetPx ?? 0}
//                   onChange={(e) =>
//                     setValues({
//                       ...values,
//                       frameInsetPx: Math.max(0, Number(e.target.value) || 0),
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">ความทึบกรอบ (Opacity 0–1)</label>
//                 <input
//                   type="number"
//                   min={0}
//                   max={1}
//                   step={0.05}
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.frameOpacity ?? 1}
//                   onChange={(e) =>
//                     setValues({
//                       ...values,
//                       frameOpacity: Math.max(
//                         0,
//                         Math.min(1, Number(e.target.value) || 0)
//                       ),
//                     })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-xs text-muted-foreground">การย่อ/ขยายกรอบ</label>
//                 <select
//                   className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.frameObjectFit ?? "contain"}
//                   onChange={(e) =>
//                     setValues({
//                       ...values,
//                       frameObjectFit:
//                         e.target.value === "cover" ? "cover" : "contain",
//                     })
//                   }
//                 >
//                   <option value="contain">Contain (พอดีด้านยาว)</option>
//                   <option value="cover">Cover (คลุมเต็ม)</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {/* Badge (ของเดิม) */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge bg (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeBgHex: e.target.value })
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeBgHex: e.target.value })
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge text (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeTextHex || "#000000"}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeTextHex: e.target.value })
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeTextHex: e.target.value })
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) =>
//                 setValues({ ...values, enabled: e.target.checked })
//               }
//             />
//             Enabled
//           </label>

//           {/* live preview */}
//           <div className="rounded-md border p-3">
//             <div className="text-xs mb-2 text-muted-foreground">Preview</div>

//             {/* พรีวิวรูปสินค้า + กรอบ */}
//             <div className="flex items-center gap-3">
//               <div className="relative w-16 h-16 rounded-md overflow-hidden bg-slate-100">
//                 {/* dummy product */}
//                 <img
//                   src="/placeholder.png"
//                   alt=""
//                   className="absolute inset-0 w-full h-full object-cover"
//                 />

//                 {/* frame layer */}
//                 {!isImageMode ? (
//                   <div
//                     className="absolute inset-0 rounded-md pointer-events-none"
//                     style={{
//                       border: `${values.borderWidth}px solid ${values.borderColorHex}`,
//                     }}
//                   />
//                 ) : values.frameImageUrl ? (
//                   <img
//                     src={values.frameImageUrl}
//                     alt=""
//                     className="absolute pointer-events-none"
//                     style={{
//                       top: inset,
//                       left: inset,
//                       right: inset,
//                       bottom: inset,
//                       opacity,
//                       objectFit: values.frameObjectFit ?? "contain",
//                     }}
//                   />
//                 ) : (
//                   <div className="absolute inset-0 grid place-items-center text-[10px] text-muted-foreground">
//                     no image
//                   </div>
//                 )}
//               </div>

//               <div className="text-xs">
//                 Range: {values.minPercent}%{" "}
//                 {values.maxPercent !== "" && values.maxPercent != null
//                   ? `– ${values.maxPercent}%`
//                   : "+"}
//                 <div className="text-muted-foreground">
//                   Mode: {isImageMode ? "image" : "draw"}
//                 </div>
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

// v.1.1.3 ================================================

// v.1.1.2 ================================================
// // src/app/admin/components/AdminDiscountRuleEditDialog.tsx

// "use client";

// import { useEffect, useState } from "react";

// export type DiscountRuleEditValues = {
//   minPercent: number;
//   maxPercent?: number | "";
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

//   // ✅ รีเซ็ตค่าฟอร์มทุกครั้งที่เปิด dialog หรือ initial เปลี่ยน
//   useEffect(() => {
//     setValues({
//       minPercent: Number(initial.minPercent) || 0,
//       maxPercent:
//         initial.maxPercent === "" || initial.maxPercent == null
//           ? ""
//           : Number(initial.maxPercent),
//       borderWidth: Number(initial.borderWidth) || 1,
//       borderColorHex: initial.borderColorHex || "#000000",
//       badgeBgHex: initial.badgeBgHex ?? "",
//       badgeTextHex: initial.badgeTextHex ?? "",
//       enabled: !!initial.enabled,
//     });
//   }, [open, initial]);

//   const submit = async () => {
//     setErr(null);
//     setSaving(true);
//     try {
//       const payload: DiscountRuleEditValues = {
//         minPercent: Number(values.minPercent) || 0,
//         maxPercent:
//           values.maxPercent === "" || values.maxPercent == null
//             ? undefined
//             : Number(values.maxPercent),
//         borderWidth: Number(values.borderWidth) || 1,
//         borderColorHex: values.borderColorHex || "#000000",
//         badgeBgHex: values.badgeBgHex?.trim()
//           ? values.badgeBgHex
//           : undefined,
//         badgeTextHex: values.badgeTextHex?.trim()
//           ? values.badgeTextHex
//           : undefined,
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

//   // helper ป้องกัน NaN จาก number inputs
//   const num = (v: string) => (v === "" ? "" : Number(v));

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
//       <div className="w-full max-w-lg rounded-xl bg-card shadow-lg border border-border">
//         <div className="p-4 border-b">
//           <div className="text-lg font-semibold">
//             {mode === "create" ? "เพิ่มกฎใหม่" : "แก้ไขกฎ"}
//           </div>
//           <div className="text-xs text-muted-foreground">
//             กำหนดช่วงเปอร์เซ็นต์ + สี/ความหนาเส้นกรอบ
//           </div>
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
//                 onChange={(e) =>
//                   setValues({
//                     ...values,
//                     minPercent: Number(e.target.value) || 0,
//                   })
//                 }
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Max % (ว่าง = no limit)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.maxPercent === "" ? "" : values.maxPercent ?? ""}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setValues({
//                     ...values,
//                     maxPercent: v === "" ? "" : num(v),
//                   });
//                 }}
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Border width (px)
//               </label>
//               <input
//                 type="number"
//                 min={1}
//                 max={16}
//                 className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
//                 value={values.borderWidth}
//                 onChange={(e) =>
//                   setValues({
//                     ...values,
//                     borderWidth: Number(e.target.value) || 1,
//                   })
//                 }
//               />
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Border color
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.borderColorHex || "#000000"}
//                   onChange={(e) =>
//                     setValues({ ...values, borderColorHex: e.target.value })
//                   }
//                 />
//                 <input
//                   type="text"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.borderColorHex}
//                   onChange={(e) =>
//                     setValues({ ...values, borderColorHex: e.target.value })
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge bg (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeBgHex || "#ffffff"}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeBgHex: e.target.value })
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#ffffff"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeBgHex ?? ""}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeBgHex: e.target.value })
//                   }
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-xs text-muted-foreground">
//                 Badge text (optional)
//               </label>
//               <div className="mt-1 flex items-center gap-2">
//                 <input
//                   type="color"
//                   className="h-9 w-12 rounded-md border"
//                   value={values.badgeTextHex || "#000000"}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeTextHex: e.target.value })
//                   }
//                 />
//                 <input
//                   type="text"
//                   placeholder="#000000"
//                   className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
//                   value={values.badgeTextHex ?? ""}
//                   onChange={(e) =>
//                     setValues({ ...values, badgeTextHex: e.target.value })
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <label className="inline-flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={values.enabled}
//               onChange={(e) =>
//                 setValues({ ...values, enabled: e.target.checked })
//               }
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
//                 Range: {values.minPercent}%{" "}
//                 {values.maxPercent !== "" && values.maxPercent != null
//                   ? `– ${values.maxPercent}%`
//                   : "+"}
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

