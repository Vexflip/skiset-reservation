/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output standalone for optimized production builds
    output: 'standalone',

    // Reduce memory usage during runtime
    experimental: {
        // Disable memory-intensive features if not needed
        optimizePackageImports: ['recharts'],
    },

    // Optimize production builds
    swcMinify: true,

    // Reduce memory during build
    typescript: {
        // Already type-checked in workflow, skip in production
        ignoreBuildErrors: false,
    },

    eslint: {
        // Already linted in workflow
        ignoreDuringBuilds: false,
    },
};

module.exports = nextConfig;
