import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Photos of products created in the Stripe dashboard.
      {
        protocol: "https",
        hostname: "files.stripe.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 95],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Ensure Three.js packages are bundled correctly
  transpilePackages: ["three"],
};

export default nextConfig;
