import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Admin-entered thumbnail URLs can point to any host. Instead of
     * maintaining an allow-list we disable the image optimisation proxy,
     * which accepts every remote URL at full resolution rather than
     * rejecting unknown hostnames with a 400.
     *
     * Plain <img> continues to work for all URLs regardless, so the
     * student side is unaffected.
     */
    unoptimized: true,
  },
};

export default nextConfig;
