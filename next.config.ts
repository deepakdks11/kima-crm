import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false, // Enable PWA in development for testing
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);
