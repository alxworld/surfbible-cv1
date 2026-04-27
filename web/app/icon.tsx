import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#080d1a",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 40 40" width={20} height={20} fill="#d4a843">
        <rect x="17" y="3" width="6" height="34" rx="3" />
        <rect x="5" y="13" width="30" height="6" rx="3" />
      </svg>
    </div>,
    { ...size }
  );
}
