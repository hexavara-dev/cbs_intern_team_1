import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["zeaqrblyxcmxgmdhntas.supabase.co"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // Tambahkan domain production kamu di sini nanti, contoh:
      // { protocol: "https", hostname: "api.domainmu.com" }
    ],
  },
};

export default nextConfig;
