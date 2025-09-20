import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable dev overlay to prevent the error
    appDocumentPreloading: false,
  },
  // Disable dev tools in development
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
