// src/app/api/debug/image-path/route.ts

import { debugProductImagePath, debugAllProductImages } from "@/lib/image-path";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "single";

  if (mode === "all") {
    await debugAllProductImages(1);
  } else {
    await debugProductImagePath(1);
  }

  return Response.json({ mode });
}
