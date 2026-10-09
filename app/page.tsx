import Header from "@/components/Header";
import Hero from "@/components/Hero";
import News from "@/components/News";
import About from "@/components/About";
import Music from "@/components/Music";
import Live from "@/components/Live";
import Media from "@/components/Media";

const siteUrl = "https://inscarled-site.vercel.app/";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: "inScarled",
    alternateName: "インスカーレッド",
    url: siteUrl,
    inLanguage: "ja-JP",
    description:
      "青森を拠点に活動するオルタナティブロックバンド、inScarled（インスカーレッド）の公式サイト。",
  },
  {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${siteUrl}#musicgroup`,
    name: "inScarled",
    alternateName: "インスカーレッド",
    url: siteUrl,
    description:
      "inScarled（インスカーレッド）は、青森を拠点に活動するオルタナティブロックバンド。傷と再生をテーマに、痛みや葛藤、希望を音楽で表現する。",
    genre: ["Alternative Rock", "オルタナティブロック"],
    foundingLocation: {
      "@type": "Place",
      name: "青森県",
      address: {
        "@type": "PostalAddress",
        addressRegion: "青森県",
        addressCountry: "JP",
      },
    },
    image: `${siteUrl}og-image.png`,
  },
];

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <Header />

      <Hero />

      <News />

      <About />

      <Music />

      <Live />

      <Media />
    </main>
  );
}