// src/app/privacy/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | Interlink Shop",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Heading */}
        <header className="mb-6 lg:mb-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            นโยบายการคุ้มครองข้อมูลส่วนบุคคล
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            นโยบายฉบับนี้อธิบายถึงการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณ
            เมื่อใช้บริการ Interlink Shop
          </p>
        </header>

        {/* Content */}
        <article className="bg-white shadow-sm rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 leading-relaxed text-sm lg:text-base text-slate-800 space-y-6">
          {/* 👉 นำ “ข้อความ Privacy Policy ตัวเต็ม” วางแทนที่ส่วนด้านล่างนี้ */}

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              1. ข้อมูลส่วนบุคคลที่เก็บรวบรวม
            </h2>
            <p className="whitespace-pre-line">
              {/* วางเนื้อหาของข้อ 1 จากเอกสารเดิมได้เลย */}
              เราอาจเก็บข้อมูล เช่น ชื่อ–นามสกุล ที่อยู่ อีเมล เบอร์โทรศัพท์
              ข้อมูลการสั่งซื้อ และข้อมูลการชำระเงิน เพื่อใช้ในการให้บริการและปรับปรุงประสบการณ์การใช้งานของคุณ
            </p>
          </section>

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              2. วัตถุประสงค์ในการใช้ข้อมูล
            </h2>
            <p className="whitespace-pre-line">
              {/* ใส่รายละเอียดจากนโยบายเดิม */}
              เราใช้ข้อมูลของคุณเพื่อดำเนินการสั่งซื้อ จัดส่งสินค้า
              ให้บริการหลังการขาย ติดต่อสื่อสารด้านการบริการลูกค้า
              และปรับปรุงระบบให้ตอบโจทย์ผู้ใช้มากขึ้น
            </p>
          </section>

          <section>
            <h2 className="text-base lg:text-lg font-semibold mb-2">
              3. การเปิดเผยข้อมูลต่อบุคคลภายนอก
            </h2>
            <p className="whitespace-pre-line">
              ข้อมูลของคุณจะไม่ถูกขายหรือแลกเปลี่ยนกับบุคคลภายนอก
              ยกเว้นในกรณีที่จำเป็นต่อการให้บริการ เช่น บริษัทขนส่ง ผู้ให้บริการชำระเงิน
              หรือในกรณีที่กฎหมายกำหนด
            </p>
          </section>

          {/* เพิ่ม section อื่น ๆ ตามเอกสารเดิม เช่น การเก็บรักษาข้อมูล / สิทธิของเจ้าของข้อมูล ฯลฯ */}
        </article>

        <p className="mt-4 text-[11px] lg:text-xs text-right text-muted-foreground">
          ปรับปรุงล่าสุด: 15 พฤศจิกายน 2025
        </p>
      </div>
    </div>
  );
}