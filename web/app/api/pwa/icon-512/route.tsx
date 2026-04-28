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
          gap: 20,
        }}
      >
        <div
          style={{
            color: "#d4a843",
            fontSize: 220,
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          +
        </div>
        <div
          style={{
            color: "#d4a843",
            fontSize: 72,
            fontWeight: "bold",
            letterSpacing: 2,
          }}
        >
          SurfBible
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
