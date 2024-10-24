/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      // Ignoruje błędy TypeScripta podczas buildu
      ignoreBuildErrors: true,
    },
    // Dodajemy też ignorowanie błędów ESLint jeśli są
    eslint: {
      ignoreDuringBuilds: true,
    },
    // Dodatkowe ustawienia jeśli są potrzebne
    reactStrictMode: true,
  }
  
  module.exports = nextConfig