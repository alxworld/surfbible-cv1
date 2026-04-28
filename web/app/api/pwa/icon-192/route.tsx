import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080d1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            color: "#d4a843",
            fontSize: 80,
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          +
        </div>
        <div
          style={{
            color: "#d4a843",
            fontSize: 28,
            fontWeight: "bold",
            letterSpacing: 1,
          }}
        >
          SurfBible
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
