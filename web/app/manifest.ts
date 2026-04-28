import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SurfBible",
    short_name: "SurfBible",
    description: "Daily Bible reading plans for churches and individuals.",
    start_url: "/",
    display: "standalone",
    background_color: "#080d1a",
    theme_color: "#080d1a",
    icons: [
      { src: "/api/pwa/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/api/pwa/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
