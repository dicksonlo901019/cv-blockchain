import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Dickson Lo | Web3 Product Manager";
const description =
  "Web3 product manager with experience across CEX platforms, trading systems, wallets, NFT products, and digital-asset infrastructure.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const baseUrl = host ? protocol + "://" + host : "https://localhost";

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "profile",
      locale: "en_US",
      title,
      description,
      url: baseUrl,
      siteName: "Dickson Lo Blockchain CV",
      images: [{ url: baseUrl + "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [baseUrl + "/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
