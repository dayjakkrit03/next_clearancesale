// v.1.1.2 ================================================
// src/app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">สรุปภาพรวม (mock)</p>
    </div>
  );
}

// v.1.1.2 ================================================

// // src/app/admin/page.tsx
// "use client";

// import { useState } from "react";

// type Panel = "categories" | "dashboard"; // เผื่ออนาคตเพิ่มเมนูอื่น

// export default function AdminHomePage() {
//   const [active, setActive] = useState<Panel>("categories");

//   return (
//     <div className="grid grid-cols-12 gap-6">
//       {/* Sidebar */}
//       <aside className="col-span-12 md:col-span-3 lg:col-span-2">
//         <div className="sticky top-6 rounded-xl border bg-white p-4 shadow-sm">
//           <h2 className="mb-3 text-sm font-semibold text-gray-600">Management</h2>
//           <nav className="space-y-1">
//             <button
//               onClick={() => setActive("categories")}
//               className={`w-full rounded-lg px-3 py-2 text-left text-sm transition
//                 ${active === "categories"
//                   ? "bg-blue-600 text-white"
//                   : "hover:bg-gray-100 text-gray-700"}`}
//             >
//               Categories Management
//             </button>

//             {/* ตัวอย่างเมนูอื่นในอนาคต */}
//             {/* <button
//               onClick={() => setActive("dashboard")}
//               className={`w-full rounded-lg px-3 py-2 text-left text-sm transition
//                 ${active === "dashboard"
//                   ? "bg-blue-600 text-white"
//                   : "hover:bg-gray-100 text-gray-700"}`}
//             >
//               Dashboard (coming soon)
//             </button> */}
//           </nav>
//         </div>
//       </aside>

//       {/* Content */}
//       <main className="col-span-12 md:col-span-9 lg:col-span-10">
//         <div className="rounded-xl border bg-white p-6 shadow-sm">
//           {active === "categories" && <CategoryManagementMock />}
//           {active === "dashboard" && <DashboardMock />}
//         </div>
//       </main>
//     </div>
//   );
// }

// /** ===== Mock Components (ยังไม่ผูก API) ===== */
// function CategoryManagementMock() {
//   return (
//     <div>
//       <h1 className="mb-4 text-2xl font-bold">Category Clearance</h1>
//       <p className="text-sm text-gray-600">
//         หน้านี้เป็น mock ยังไม่เชื่อม API — ขั้นต่อไปเราค่อยผูกกับ /api/admin/clearance/categories
//       </p>

//       <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-500">ตัวอย่างรายการ</div>
//           <div className="font-medium">LAN (UTP) System</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-500">ตัวอย่างรายการ</div>
//           <div className="font-medium">FIBER OPTIC System</div>
//         </div>
//         <div className="rounded-lg border p-4">
//           <div className="text-sm text-gray-500">ตัวอย่างรายการ</div>
//           <div className="font-medium">Telephone CABLE</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function DashboardMock() {
//   return (
//     <div>
//       <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
//       <p className="text-sm text-gray-600">หน้าตัวอย่างไว้สลับดู state เฉยๆ</p>
//     </div>
//   );
// }
