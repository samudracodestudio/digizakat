import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/digizakat',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
