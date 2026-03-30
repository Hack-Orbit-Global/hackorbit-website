/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Expose only NEXT_PUBLIC_ vars to the client bundle.
  // Server-only secrets (GOOGLE_SCRIPT_URL, GITHUB_TOKEN) are NOT exposed.
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
}

module.exports = nextConfig
