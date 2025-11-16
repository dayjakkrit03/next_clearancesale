// src/app/terms/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้งาน | Interlink Shop",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Heading */}
        <header className="mb-6 lg:mb-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            เอกสารฉบับนี้กำหนดเงื่อนไขการใช้บริการเว็บไซต์ Interlink Shop
            โปรดอ่านรายละเอียดอย่างละเอียดก่อนใช้งาน
          </p>
        </header>

        {/* Content */}
        <article className="bg-white shadow-sm rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 leading-relaxed text-sm lg:text-base text-slate-800 space-y-6">
          {/* 👉 ตรงนี้ให้คุณนำ “ข้อความ Term of Use ตัวเต็ม” มาวางแทน <p> / <section> ได้เลย */}

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              1. บทนำ
            </h2>
            <p className="whitespace-pre-line">
              {/* วางเนื้อหาบทนำของคุณแทนที่ข้อความตัวอย่างนี้ได้เลย */}
              ข้อความส่วนนี้ใช้สำหรับอธิบายภาพรวมของข้อตกลงและเงื่อนไขการใช้งานเว็บไซต์
              Interlink Shop รวมถึงการยอมรับข้อตกลงของผู้ใช้บริการ ฯลฯ
            </p>
          </section>

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              2. การยอมรับเงื่อนไข
            </h2>
            <p className="whitespace-pre-line">
              ผู้ใช้บริการตกลงยอมรับและปฏิบัติตามข้อกำหนดและเงื่อนไขทั้งหมดของเว็บไซต์
              หากไม่ยอมรับเงื่อนไขดังกล่าว กรุณาหยุดการใช้งานเว็บไซต์ทันที
            </p>
          </section>

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              3. การใช้งานบัญชีผู้ใช้
            </h2>
            <p className="whitespace-pre-line">
              {/* วางรายละเอียดเรื่องบัญชีผู้ใช้ การรักษาความลับรหัสผ่าน ฯลฯ */}
              ผู้ใช้มีหน้าที่ดูแลรักษาข้อมูลบัญชีและรหัสผ่านของตนเองให้ปลอดภัย
              และรับผิดชอบต่อการใช้งานบัญชีของตนเองแต่เพียงผู้เดียว
            </p>
          </section>

          {/* เพิ่ม section ย่อยเท่าที่คุณต้องการ เช่น การสั่งซื้อ / การชำระเงิน / การจัดส่ง / ข้อจำกัดความรับผิด ฯลฯ */}
        </article>

        {/* last update */}
        <p className="mt-4 text-[11px] lg:text-xs text-right text-muted-foreground">
          ปรับปรุงล่าสุด: 15 พฤศจิกายน 2025
        </p>
      </div>
    </div>
  );
}
