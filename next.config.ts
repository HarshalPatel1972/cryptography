import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile heavy 3D libs
  transpilePackages: ['three', 'gsap', '@react-three/drei', '@react-three/postprocessing'],
  // Strict mode helps catch 3D cleanup bugs
  reactStrictMode: true,
  // We don't need image optimization for 3D textures usually, but good to keep default
  images: {
    unoptimized: true, // often better for local textures in WebGL
  },
};

export default nextConfig;
