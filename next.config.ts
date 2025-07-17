import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Increase the limit to 5MB (or more if needed)
    },
  },
};

export default nextConfig;
