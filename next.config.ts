import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: {
    unoptimized: true, // Image Optimization API server Next.js for static export
  },
  trailingSlash: true, // Membantu IIS membaca folder sebagai rute yang valid
};

export default nextConfig;