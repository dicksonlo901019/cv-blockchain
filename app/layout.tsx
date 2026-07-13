import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "盧駿軒 Dickson Lo｜Blockchain 產品經理";
const description = "Web3 產品經理履歷，聚焦 CEX、交易系統、Wallet、NFT 與虛擬資產平台產品。";

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
      locale: "zh_TW",
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
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
