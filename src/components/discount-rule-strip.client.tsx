// v.1.1.2 ======================================================

// v.1.1.2 ======================================================

// src/components/discount-rule-strip.client.tsx

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { DiscountRuleItem } from "./discount-rule-strip.server";

export function DiscountRuleStripClient({ items }: { items: DiscountRuleItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="bg-gradient-subtle py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <div
              key={String(it.id)}
              className="opacity-0 animate-fade-in rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
              style={{ border: it.borderCss, backgroundColor: it.cardBg, animationDelay: `${i * 80}ms` }}
            >
              <div className="p-4 pr-24">
                <div className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  DISCOUNT STYLING RULE
                </div>

                <div className="flex items-end justify-between gap-2 min-h-[2.4rem]">
                  <h3 className="font-bold text-base leading-[1.6] truncate">{it.title}</h3>

                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs whitespace-nowrap border self-end transition-colors"
                    style={{ backgroundColor: it.buttonBg, color: it.buttonText, borderColor: it.buttonBg }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBgHover;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBgHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = it.buttonBg;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = it.buttonBg;
                    }}
                  >
                    ดูโปรทั้งหมด
                  </Button>
                </div>
              </div>

              {it.decoType === "image" ? (
                <div
                  className="absolute inset-y-2 right-2 w-16 md:w-20 rounded-lg overflow-hidden pointer-events-none"
                  style={{ opacity: it.decoImageOpacity }}
                >
                  
                  <Image
                    src={it.decoImageUrl!}
                    alt="frame"
                    fill
                    className="object-contain"
                    style={{ objectFit: it.decoObjectFit }}
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-y-3 right-3 w-14 md:w-16 rounded-lg pointer-events-none"
                  style={{
                    border: it.decoBorderCss,
                    backgroundColor: "transparent",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
