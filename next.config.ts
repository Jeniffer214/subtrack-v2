import type { NextConfig } from "next";

// Vercel and Netlify package the app themselves; the standalone bundle is
// only for the self-hosted Docker image.
const managedHost = Boolean(process.env.VERCEL || process.env.NETLIFY);

const nextConfig: NextConfig = {
  output: managedHost ? undefined : "standalone",
  poweredByHeader: false,
};

export default nextConfig;
