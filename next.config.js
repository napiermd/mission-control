/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '*': ['data/**/*.json']
  }
}
module.exports = nextConfig
