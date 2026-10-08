
import type { MetadataRoute } from "next";

const siteUrl = "https://inscarled-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/live/archive`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
