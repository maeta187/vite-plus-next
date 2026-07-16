import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // PokeAPI の official-artwork 画像ホスト（next/image 用に許可）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
  turbopack: {
    root: path.join(import.meta.dirname),
  },
};

export default nextConfig;
