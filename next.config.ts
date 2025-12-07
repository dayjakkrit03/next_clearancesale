import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // บอก Next (runtime) ให้ตัดโฟลเดอร์ชื่อ "Application Data" ออกจากการ trace ไฟล์
  // TS ยังไม่รู้จัก field นี้ เลยต้อง ignore type check ตรงนี้
  // @ts-ignore - Next 15 รองรับ outputFileTracingExcludes แล้ว แต่ type ยังไม่ตาม
  outputFileTracingExcludes: {
    "*": ["**/Application Data/**"],
  },

  webpack(config, { dev }) {
    if (dev) {
      config.module.rules.push({
        test: /\.([jt]sx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }
    return config;
  },
};

export default nextConfig;





// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   webpack: (config) => {
//     // if (process.env.NODE_ENV === "development") {
//     //   config.module.rules.push({
//     //     test: /\.(jsx|tsx)$/,
//     //     exclude: /node_modules/,
//     //     enforce: "pre",
//     //     use: "@dyad-sh/nextjs-webpack-component-tagger",
//     //   });
//     // }
//     return config;
//   },
// };

// export default nextConfig;
