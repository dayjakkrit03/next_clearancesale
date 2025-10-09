//  src/app/admin/components/products/Stars.tsx

"use client";

export default function Stars({ rating = 0 }: { rating?: number }) {
  const full = Math.max(0, Math.min(5, Math.floor(rating)));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
            fill={filled ? "currentColor" : "none"}
            stroke={filled ? "none" : "currentColor"}
            strokeWidth={filled ? 0 : 1.3}
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.954L10 0l2.947 5.956 6.562.954-4.755 4.634 1.123 6.545z" />
          </svg>
        );
      })}
    </div>
  );
}
