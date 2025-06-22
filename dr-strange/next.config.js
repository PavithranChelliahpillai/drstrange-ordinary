/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir has been promoted to a stable feature.
    // This key can be removed.
  },
  // If you were using appDir, you likely want to ensure the app directory is enabled.
  // However, in Next.js 13.4 and later, the `app` directory is stable and used by default
  // when present, so this configuration may not even be necessary.
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
}

module.exports = nextConfig 