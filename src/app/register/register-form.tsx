// src/app/register/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "form" | "verify" | "success";

export function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Step 1: ขอรหัสยืนยัน */
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    // validate ฝั่ง client เบื้องต้น
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!password || password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({ ok: false }));

      if (!data.ok) {
        if (data.error === "EMAIL_IN_USE") {
          setError("อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ");
        } else if (data.error === "INVALID_EMAIL") {
          setError("รูปแบบอีเมลไม่ถูกต้อง");
        } else if (data.error === "EMAIL_SEND_FAILED") {
          setError("ไม่สามารถส่งรหัสยืนยันได้ กรุณาลองใหม่อีกครั้ง");
        } else {
          setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
        return;
      }

      // ส่งรหัสแล้ว → ไปขั้นตอนกรอกรหัสยืนยัน
      setStep("verify");
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  }

  /** Step 2: ยืนยันโค้ด + สร้างบัญชี */
  async function handleConfirmRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!code.trim()) {
      setError("กรุณากรอกรหัสยืนยัน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          code,
        }),
      });

      const data = await res.json().catch(() => ({ ok: false }));

      if (!data.ok) {
        if (data.error === "INVALID_CODE") {
          setError("รหัสยืนยันไม่ถูกต้อง");
        } else if (data.error === "EXPIRED_CODE") {
          setError("รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่");
        } else if (data.error === "EMAIL_IN_USE") {
          setError("อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ");
        } else if (data.error === "WEAK_PASSWORD") {
          setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
        } else if (data.error === "PASSWORD_MISMATCH") {
          setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
        } else if (data.error === "INVALID_EMAIL") {
          setError("รูปแบบอีเมลไม่ถูกต้อง");
        } else {
          setError("ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่");
        }
        return;
      }

      // สำเร็จ → แสดงข้อความ แล้ว redirect ไปหน้าแรกหรือหน้าโปรไฟล์
      setStep("success");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="mt-4 text-center space-y-4">
        <p className="text-green-600">
          สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
        >
          ไปหน้าแรก
        </Button>
      </div>
    );
  }

  return (
    <>
      {step === "form" && (
        <form className="space-y-4" onSubmit={handleRequestCode}>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="อย่างน้อย 8 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                <span>กำลังส่งรหัสยืนยัน...</span>
              </span>
            ) : (
              "สมัครสมาชิก"
            )}
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form className="space-y-4" onSubmit={handleConfirmRegister}>
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <p className="text-sm text-muted-foreground text-center">
            เราได้ส่งรหัสยืนยันไปที่{" "}
            <span className="font-semibold">{email}</span><br />
            กรุณากรอกรหัส 6 หลักด้านล่างภายใน 15 นาที
          </p>

          <div className="space-y-2">
            <Label htmlFor="code">รหัสยืนยัน</Label>
            <Input
              id="code"
              placeholder="กรอกรหัส 6 หลัก"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                <span>กำลังตรวจสอบ...</span>
              </span>
            ) : (
              "ยืนยันสมัครสมาชิก"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs"
            onClick={(e) => handleRequestCode(e as any)}
            disabled={loading}
          >
            ขอรหัสยืนยันใหม่
          </Button>
        </form>
      )}
    </>
  );
}
