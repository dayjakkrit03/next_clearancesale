
// v.1.1.3 =====================================================================
// src/app/profile/components/LocationSelect.tsx

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LocationOption } from "@/types/profile";

type Endpoint = "sub-districts" | "districts" | "provinces" | "postal-codes";

/**
 * Option ที่ใช้ใน combobox
 */
type Option = LocationOption<any>;

type Props = {
  label: string;
  endpoint: Endpoint;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;

  /** callback เมื่อ user เลือก option จาก list (ส่ง raw กลับไปให้ parent ใช้งาน) */
  onOptionSelected?: (option: Option) => void;

  /** filter ตาม id ของต้นทาง (ใช้กับ district/sub-district/postal-code) */
  provinceId?: number | null;
  districtId?: number | null;
  subDistrictId?: number | null;
};

export default function LocationSelect({
  label,
  endpoint,
  value,
  onChange,
  placeholder,
  onOptionSelected,
  provinceId,
  districtId,
  subDistrictId,
}: Props) {
  const [query, setQuery] = React.useState(value ?? "");
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const fetchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // sync ค่า value จาก parent -> ช่อง input
  React.useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  const search = (q: string) => {
    const trimmed = (q ?? "").trim();

    // กำหนดเงื่อนไขว่าเมื่อไรควรยิง API
    const hasFilter =
      !!provinceId || !!districtId || !!subDistrictId;

    // provinces: อนุญาตให้โหลดทั้งหมดแม้ยังไม่พิมพ์
    // endpoints อื่น: ถ้าไม่มี filter และยังพิมพ์น้อยกว่า 2 ตัว ไม่ต้องโหลด
    if (endpoint !== "provinces" && !hasFilter && trimmed.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    setLoading(true);

    const params = new URLSearchParams();
    if (trimmed) {
      params.set("search", trimmed);
    }

    // ใส่ filter ตาม endpoint
    switch (endpoint) {
      case "districts":
        if (provinceId) params.set("provinceId", String(provinceId));
        break;
      case "sub-districts":
        if (districtId) params.set("districtId", String(districtId));
        break;
      case "postal-codes":
        if (provinceId) params.set("provinceId", String(provinceId));
        if (districtId) params.set("districtId", String(districtId));
        if (subDistrictId) params.set("subDistrictId", String(subDistrictId));
        break;
      case "provinces":
      default:
        // provinces ไม่ต้องใส่ filter อะไร
        break;
    }

    const qs = params.toString();
    const url = qs
      ? `/api/locations/${endpoint}?${qs}`
      : `/api/locations/${endpoint}`;

    fetch(url)
      .then((res) => res.json())
      .then((data: any[]) => {
        const mapped: Option[] = data.map((item) => {
          const label =
            item.label ??
            item.name ??
            item.code?.toString() ??
            "";

          return {
            id: item.id ?? label,
            label,
            raw: item,
          };
        });

        setOptions(mapped);
        setOpen(mapped.length > 0);
      })
      .catch(() => {
        setOptions([]);
        setOpen(false);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    // พิมพ์เองก็เก็บค่าไปด้วย (เหมือนระบบเดิม)
    onChange(q);

    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
    }
    fetchTimeout.current = setTimeout(() => search(q), 300);
  };

  const handleSelect = (option: Option) => {
    setQuery(option.label);
    onChange(option.label); // เก็บชื่อ/รหัสตามที่แสดง
    setOpen(false);

    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  return (
    <div className="space-y-1 relative">
      <Label>{label}</Label>
      <Input
        value={query}
        placeholder={placeholder ?? "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา"}
        onChange={handleChange}
        onFocus={() => {
          // ถ้ายังไม่มี options ให้ลองโหลดตาม filter / endpoint
          if (options.length === 0) {
            search(query);
          } else {
            setOpen(true);
          }
        }}
        onBlur={() => {
          // หน่วงหน่อยให้ onMouseDown ของปุ่มทำงานทัน
          setTimeout(() => setOpen(false), 150);
        }}
      />
      {loading && (
        <div className="absolute right-3 top-8 text-[10px] text-muted-foreground">
          กำลังค้นหา...
        </div>
      )}
      {open && options.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow">
          {options.map((opt) => (
            <button
              key={opt.label + String(opt.raw?.id ?? "")}
              type="button"
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// v.1.1.3 =====================================================================

// v.1.1.2 =====================================================================
// // src/app/profile/components/LocationSelect.tsx

// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import type { LocationOption } from "@/types/profile";

// type Endpoint = "sub-districts" | "districts" | "provinces" | "postal-codes";

// /**
//  * Option ที่ใช้ใน combobox
//  * - value: string ที่เก็บลง state (ส่วนใหญ่ = label)
//  * - label: ข้อความที่แสดงใน list
//  * - raw: ข้อมูลดิบจาก API (ไว้ใช้ทำ dependent select / auto-fill)
//  */
// type Option = LocationOption<any>;

// type Props = {
//   label: string;
//   endpoint: Endpoint;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;

//   /** callback เมื่อ user เลือก option จาก list (ส่ง raw กลับไปให้ parent ใช้งาน) */
//   onOptionSelected?: (option: Option) => void;
// };

// export default function LocationSelect({
//   label,
//   endpoint,
//   value,
//   onChange,
//   placeholder,
//   onOptionSelected,
// }: Props) {
//   const [query, setQuery] = React.useState(value ?? "");
//   const [options, setOptions] = React.useState<Option[]>([]);
//   const [loading, setLoading] = React.useState(false);
//   const [open, setOpen] = React.useState(false);
//   const fetchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

//   // sync ค่า value จาก parent -> ช่อง input
//   React.useEffect(() => {
//     setQuery(value ?? "");
//   }, [value]);

//   const search = (q: string) => {
//     if (!q || q.length < 2) {
//       setOptions([]);
//       return;
//     }

//     setLoading(true);
//     fetch(`/api/locations/${endpoint}?search=${encodeURIComponent(q)}`)
//       .then((res) => res.json())
//       .then((data: any[]) => {
//         // ให้ API แต่ละตัวส่งข้อมูลมารูปแบบไหนก็ได้
//         // เราจะ map ให้กลายเป็น Option ที่มี label/value/raw เหมือนกัน
//         const mapped: Option[] = data.map((item) => {
//           const label =
//             item.label ??
//             item.name ??
//             item.code?.toString() ??
//             ""; // กันเหนียวทุกกรณี

//          return {
//             id: item.id ?? label,  // ใช้ id จาก DB หากไม่มีใช้ label แทน
//             label,
//             raw: item,
//          };

//         });

//         setOptions(mapped);
//         setOpen(mapped.length > 0);
//       })
//       .catch(() => {
//         setOptions([]);
//       })
//       .finally(() => setLoading(false));
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const q = e.target.value;
//     setQuery(q);
//     // ให้พิมพ์เองก็เก็บค่าไปด้วย (เหมือนระบบเดิม)
//     onChange(q);

//     if (fetchTimeout.current) {
//       clearTimeout(fetchTimeout.current);
//     }
//     fetchTimeout.current = setTimeout(() => search(q), 300);
//   };

//   const handleSelect = (option: Option) => {
//     setQuery(option.label);
//     onChange(option.label); // เราเก็บชื่อ/รหัสไปตามที่แสดง
//     setOpen(false);

//     if (onOptionSelected) {
//       onOptionSelected(option);
//     }
//   };

//   return (
//     <div className="space-y-1 relative">
//       <Label>{label}</Label>
//       <Input
//         value={query}
//         placeholder={placeholder ?? "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา"}
//         onChange={handleChange}
//         onFocus={() => {
//           if (options.length > 0) setOpen(true);
//         }}
//         onBlur={() => {
//           // หน่วงหน่อยให้ onMouseDown ของปุ่มทำงานทัน
//           setTimeout(() => setOpen(false), 150);
//         }}
//       />
//       {loading && (
//         <div className="absolute right-3 top-8 text-[10px] text-muted-foreground">
//           กำลังค้นหา...
//         </div>
//       )}
//       {open && options.length > 0 && (
//         <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow">
//           {options.map((opt) => (
//             <button
//               key={opt.label + String(opt.raw?.id ?? "")}
//               type="button"
//               className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 handleSelect(opt);
//               }}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// v.1.1.2 =====================================================================

// // src/app/profile/components/LocationSelect.tsx
// "use client";

// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// type Endpoint = "sub-districts" | "districts" | "provinces" | "postal-codes";

// type Option = { id: number | string; label: string };

// type Props = {
//   label: string;
//   endpoint: Endpoint;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
// };

// export default function LocationSelect({
//   label,
//   endpoint,
//   value,
//   onChange,
//   placeholder,
// }: Props) {
//   const [query, setQuery] = React.useState(value ?? "");
//   const [options, setOptions] = React.useState<Option[]>([]);
//   const [loading, setLoading] = React.useState(false);
//   const [open, setOpen] = React.useState(false);
//   const fetchTimeout = React.useRef<NodeJS.Timeout | null>(null);

//   React.useEffect(() => {
//     setQuery(value ?? "");
//   }, [value]);

//   const search = (q: string) => {
//     if (!q || q.length < 2) {
//       setOptions([]);
//       return;
//     }
//     setLoading(true);
//     fetch(`/api/locations/${endpoint}?search=${encodeURIComponent(q)}`)
//       .then((res) => res.json())
//       .then((data: Option[]) => {
//         setOptions(data);
//         setOpen(true);
//       })
//       .catch(() => {
//         setOptions([]);
//       })
//       .finally(() => setLoading(false));
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const q = e.target.value;
//     setQuery(q);
//     onChange(q); // ให้พิมพ์เองก็เก็บค่าไปด้วย

//     if (fetchTimeout.current) {
//       clearTimeout(fetchTimeout.current);
//     }
//     fetchTimeout.current = setTimeout(() => search(q), 300);
//   };

//   const handleSelect = (option: Option) => {
//     setQuery(option.label);
//     onChange(option.label);
//     setOpen(false);
//   };

//   return (
//     <div className="space-y-1 relative">
//       <Label>{label}</Label>
//       <Input
//         value={query}
//         placeholder={placeholder ?? "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา"}
//         onChange={handleChange}
//         onFocus={() => {
//           if (options.length > 0) setOpen(true);
//         }}
//         onBlur={() => {
//           setTimeout(() => setOpen(false), 150);
//         }}
//       />
//       {loading && (
//         <div className="absolute right-3 top-8 text-[10px] text-muted-foreground">
//           กำลังค้นหา...
//         </div>
//       )}
//       {open && options.length > 0 && (
//         <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow">
//           {options.map((opt) => (
//             <button
//               key={opt.id}
//               type="button"
//               className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
//               onMouseDown={(e) => {
//                 e.preventDefault();
//                 handleSelect(opt);
//               }}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
