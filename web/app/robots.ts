import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/plans"],
        disallow: ["/dashboard", "/settings", "/admin", "/groups", "/read/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://surfbible.in/sitemap.xml",
  };
}
