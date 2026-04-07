import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.nike.com',
      },
      {
        protocol: 'https',
        hostname: 'www.nike.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.adidas.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.adidas.com',
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      // CloudFront CDN for S3 images - add hostname from NEXT_PUBLIC_CDN_URL (e.g. https://dxxxx.cloudfront.net)
      ...(process.env.NEXT_PUBLIC_CDN_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_CDN_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
 
      // Add more domains as needed when you encounter them
    ],
  },
};
 
export default nextConfig;