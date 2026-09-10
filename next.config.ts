import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    // Server Function arguments may contain ticket content and must not be printed in development.
    serverFunctions: false,
  },
};

export default nextConfig;
