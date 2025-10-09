/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  devIndicators: {
    position: false, // Disables the indicator
  },
}

module.exports = nextConfig