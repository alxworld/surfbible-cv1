import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg viewBox="0 0 40 40" width={36} height={36} fill="#d4a843">
          <rect x="17" y="3" width="6" height="34" rx="3" />
          <rect x="5" y="13" width="30" height="6" rx="3" />
        </svg>
        <span style={{ color: "#d4a843", fontSize: 28, fontWeight: "bold", letterSpacing: 1 }}>
          SurfBible
        </span>
      </div>

      {/* Headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 86, fontWeight: "bold", color: "#ffffff", lineHeight: 1.05 }}>
          Read the Bible.
        </div>
        <div style={{ fontSize: 86, fontWeight: "bold", color: "#d4a843", lineHeight: 1.05 }}>
          Every Day.
        </div>
        <div style={{ fontSize: 30, color: "rgba(148,163,184,0.85)", marginTop: 8 }}>
          Structured daily reading plans for churches and individuals.
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: "bold" }}>5+</span>
            <span style={{ color: "rgba(212,168,67,0.6)", fontSize: 16 }}>Plans</span>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.10)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: "bold" }}>300</span>
            <span style={{ color: "rgba(212,168,67,0.6)", fontSize: 16 }}>Days</span>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.10)" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: "bold" }}>Free</span>
            <span style={{ color: "rgba(212,168,67,0.6)", fontSize: 16 }}>Forever</span>
          </div>
        </div>
        <div style={{ color: "rgba(212,168,67,0.5)", fontSize: 22, letterSpacing: 1 }}>
          surfbible.in
        </div>
      </div>
    </div>,
    { ...size }
  );
}
