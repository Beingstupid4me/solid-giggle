import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development";
const enablePwaInDev = process.env.NEXT_PUBLIC_ENABLE_PWA_IN_DEV === "true";

const pwaEnabled = !isDev || enablePwaInDev;

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  scope: "/portal",
  disable: !pwaEnabled,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default pwaEnabled ? withPWA(nextConfig) : nextConfig;
