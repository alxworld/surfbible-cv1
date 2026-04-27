import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function OgImage() {
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#d4a843", fontSize: 30, fontWeight: "bold" }}>
          + SurfBible
        </span>
      </div>

      {/* Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: "#ffffff", fontSize: 88, fontWeight: "bold", lineHeight: 1.05 }}>
          Read the Bible.
        </div>
        <div style={{ color: "#d4a843", fontSize: 88, fontWeight: "bold", lineHeight: 1.05 }}>
          Every Day.
        </div>
        <div style={{ color: "#94a3b8", fontSize: 30, marginTop: 8 }}>
          Structured daily reading plans for churches and individuals.
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 26, fontWeight: "bold" }}>5+</span>
            <span style={{ color: "#d4a843", fontSize: 15 }}>Plans</span>
          </div>
          <div style={{ width: 1, height: 32, background: "#ffffff22" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 26, fontWeight: "bold" }}>300</span>
            <span style={{ color: "#d4a843", fontSize: 15 }}>Days</span>
          </div>
          <div style={{ width: 1, height: 32, background: "#ffffff22" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 26, fontWeight: "bold" }}>Free</span>
            <span style={{ color: "#d4a843", fontSize: 15 }}>Forever</span>
          </div>
        </div>
        <div style={{ color: "#d4a84380", fontSize: 22 }}>surfbible.in</div>
      </div>
    </div>,
    { ...size }
  );
}
