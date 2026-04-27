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
        justifyContent: "center",
        padding: "80px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ color: "#d4a843", fontSize: 26, marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
        ✝ SurfBible
      </div>
      <div
        style={{
          color: "#ffffff",
          fontSize: 72,
          fontWeight: "bold",
          lineHeight: 1.05,
          marginBottom: 28,
          maxWidth: 900,
        }}
      >
        {title}
      </div>
      <div style={{ color: "#94a3b8", fontSize: 32 }}>
        {days} days · surfbible.in
      </div>
    </div>,
    { ...size }
  );
}
