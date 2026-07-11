import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: path.join(import.meta.dirname),
  },
};

export default nextConfig;
