
import type { MetadataRoute } from "next";

const siteUrl = "https://inscarled-site.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/admin",
          "/maintenance",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
