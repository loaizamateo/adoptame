import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.adoptame.app' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
}

export default nextConfig
