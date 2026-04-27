import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);

  const title = plan?.title ?? "Bible Reading Plan";
  const days = plan?.totalDays ?? 0;

  return new ImageResponse(
    <div
      style={{
        background: "#080d1a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
      }}
    >
      {/* Brand */}
      <div style={{ color: "#d4a843", fontSize: 26, fontWeight: "bold" }}>
        + SurfBible
      </div>

      {/* Plan title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: "bold",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div style={{ color: "#d4a843", fontSize: 32 }}>
          {days} days
        </div>
      </div>

      {/* Footer */}
      <div style={{ color: "#94a3b8", fontSize: 24 }}>surfbible.in</div>
    </div>,
    { ...size }
  );
}
