import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Compress responses
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "*.on-forge.com" },
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.digitaloceanspaces.com" },
      { protocol: "https", hostname: "*.cdn.digitaloceanspaces.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 96, 128, 160, 256],
  },

  async headers() {
    const rules = [
      {
        source: "/api/auth/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];

    if (process.env.NODE_ENV === "production") {
      rules.unshift({
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      });
    }

    return rules;
  },
};

export default nextConfig;
