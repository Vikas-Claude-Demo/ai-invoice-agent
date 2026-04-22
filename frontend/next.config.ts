import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/_/backend/api/:path*",
      },
    ];
  },
};

export default nextConfig;
