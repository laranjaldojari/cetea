/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // build enxuto para container (Dokploy/Docker)
  reactStrictMode: true,
  poweredByHeader: false,
};
module.exports = nextConfig;
