
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://inscarled-site.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  verification: {
  google: "HsbW2y1hnD9Hs5rseUOrM4evmPChJxcDbrnqrVStGiM",
},

  title: {
    default: "inScarled（インスカーレッド）| Official Website",
    template: "%s | inScarled Official Website",
  },

  description:
    "青森を拠点に活動するオルタナティブロックバンド、inScarled（インスカーレッド）の公式サイト。最新ライブ情報、楽曲、試聴音源、ニュースを掲載。",

  keywords: [
    "inScarled",
    "インスカーレッド",
    "inScarled バンド",
    "インスカーレッド バンド",
    "inScarled 青森",
    "青森 バンド",
    "オルタナティブロック",
    "サトウハヤト",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
  type: "website",
  locale: "ja_JP",
  url: "https://inscarled-site.vercel.app/",
  siteName: "inScarled Official Website",
  title: "inScarled（インスカーレッド）| Official Website",
  description:
    "青森を拠点に活動するオルタナティブロックバンド、inScarledの公式サイト。",
  images: [
    {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "inScarled Official Website",
    },
  ],
},

twitter: {
  card: "summary_large_image",
  title: "inScarled（インスカーレッド）| Official Website",
  description:
    "青森を拠点に活動するオルタナティブロックバンド、inScarledの公式サイト。",
  images: ["/og-image.png"],
},

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
