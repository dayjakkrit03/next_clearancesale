// v.1.1.2 ======================================================
// src/app/profile/orders/components/OrderLinesTable.tsx
"use client";

type SalesLine = {
  item_NoField: string;
  quantityField: number;
  unit_of_Measure_CodeField: string;
  unit_PriceField: number;
  amountField: number;
  imageUrl?: string | null;
};

type Props = {
  lines: SalesLine[];
};

export default function OrderLinesTable({ lines }: Props) {
  if (!lines || lines.length === 0) return null;

  const total = lines.reduce(
    (sum, line) => sum + Number(line.amountField || 0),
    0,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-center text-gray-600">
            <th className="py-2">สินค้า</th>
            <th>จำนวน</th>
            <th>หน่วย</th>
            <th>ราคา</th>
            <th>ราคารวม</th>
          </tr>
        </thead>

        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} className="border-b text-center">
              <td className="py-2">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={line.imageUrl || "/placeholder.png"}
                    alt={line.item_NoField}
                    className="w-[70px] h-auto"
                  />
                  <span>{line.item_NoField}</span>
                </div>
              </td>

              <td>{line.quantityField}</td>
              <td>{line.unit_of_Measure_CodeField}</td>
              <td>{line.unit_PriceField.toLocaleString()} ฿</td>
              <td>{line.amountField.toLocaleString()} ฿</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={4} className="text-right font-semibold py-3">
              ยอดรวมทั้งหมด
            </td>
            <td className="text-center font-semibold text-blue-600">
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ฿
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}


// v.1.1.2 ======================================================

// // src/app/profile/orders/components/OrderLinesTable.tsx
// "use client";

// type SalesLine = {
//   item_NoField: string;
//   quantityField: number;
//   unit_of_Measure_CodeField: string;
//   unit_PriceField: number;
//   amountField: number;
// };

// type Props = {
//   dataSalesLine?: string | null;
// };

// export default function OrderLinesTable({ dataSalesLine }: Props) {
//   if (!dataSalesLine) return null;

//   let lines: SalesLine[] = [];
//   try {
//     lines = JSON.parse(dataSalesLine);
//   } catch {
//     return (
//       <div className="text-sm text-red-500">
//         ไม่สามารถอ่านข้อมูลสินค้าได้
//       </div>
//     );
//   }

//   if (lines.length === 0) return null;

//   const total = lines.reduce(
//     (sum, line) => sum + Number(line.amountField || 0),
//     0,
//   );

//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm border-collapse">
//         <thead>
//           <tr className="border-b text-center text-gray-600">
//             <th className="py-2">สินค้า</th>
//             <th>จำนวน</th>
//             <th>หน่วย</th>
//             <th>ราคา</th>
//             <th>ราคารวม</th>
//           </tr>
//         </thead>

//         <tbody>
//           {lines.map((line, idx) => (
//             <tr key={idx} className="border-b text-center">
//               <td className="py-2">
//                 <div className="flex flex-col items-center gap-2">
//                   <img
//                     src={`https://www.interlink.co.th/upload/product/${line.item_NoField}.jpg`}
//                     alt={line.item_NoField}
//                     className="w-[70px]"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src =
//                         "https://www.interlink.co.th/img/default.jpg";
//                     }}
//                   />
//                   <span>{line.item_NoField}</span>
//                 </div>
//               </td>

//               <td>{line.quantityField}</td>
//               <td>{line.unit_of_Measure_CodeField}</td>
//               <td>{line.unit_PriceField.toLocaleString()} ฿</td>
//               <td>{line.amountField.toLocaleString()} ฿</td>
//             </tr>
//           ))}
//         </tbody>

//         <tfoot>
//           <tr>
//             <td colSpan={4} className="text-right font-semibold py-3">
//               ยอดรวมทั้งหมด
//             </td>
//             <td className="text-center font-semibold text-blue-600">
//               {total.toLocaleString(undefined, {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}{" "}
//               ฿
//             </td>
//           </tr>
//         </tfoot>
//       </table>
//     </div>
//   );
// }
