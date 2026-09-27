/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  // 관리 화면에서 사진(최대 5MB)을 올릴 수 있게
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};
export default nextConfig;
