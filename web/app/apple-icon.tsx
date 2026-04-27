import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "#080d1a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <svg viewBox="0 0 40 40" width={72} height={72} fill="#d4a843">
        <rect x="17" y="3" width="6" height="34" rx="3" />
        <rect x="5" y="13" width="30" height="6" rx="3" />
      </svg>
      <div style={{ color: "#d4a843", fontSize: 22, fontWeight: "bold", fontFamily: "Georgia, serif" }}>
        SurfBible
      </div>
    </div>,
    { ...size }
  );
}
