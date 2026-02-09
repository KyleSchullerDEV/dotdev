import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/callback", "/sign-in", "/sign-up", "/sign-out"],
    },
    sitemap: "https://kyleschuller.dev/sitemap.xml",
  };
}
