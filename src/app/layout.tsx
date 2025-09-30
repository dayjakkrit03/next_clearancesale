// v.1.1.2 ================================================
// src/app/layout.tsx
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import AppShell from "@/components/app-shell"; // <— เพิ่มอันนี้

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "ilink-shop",
  description: "Interlink Shop - Your one-stop shop for networking equipment.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

// v.1.1.2 ================================================

// // src/app/layout.tsx
// import type { Metadata } from "next";
// import { Sarabun } from "next/font/google";
// import "./globals.css";
// import { Providers } from "@/components/providers";

// const sarabun = Sarabun({
//   variable: "--font-sarabun",
//   weight: ["300", "400", "500", "600", "700"],
//   subsets: ["latin", "thai"],
// });

// export const metadata: Metadata = {
//   title: "ilink-shop",
//   description: "Interlink Shop - Your one-stop shop for networking equipment.",
//   icons: {
//     icon: "/favicon.svg",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${sarabun.variable} font-sans antialiased`}>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }