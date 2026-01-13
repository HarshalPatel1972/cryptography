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

export const metadata: Metadata = {
  title: "Crypto-Verse | Interactive Cryptography Explorer",
  description: "Master the art of encryption. A 3D interactive journey from XOR to Elliptic Curves.",
  openGraph: {
    title: "Crypto-Verse | Interactive Cryptography Explorer",
    description: "Master the art of encryption. A 3D interactive journey from XOR to Elliptic Curves.",
    url: "https://crypto-verse.vercel.app",
    siteName: "Crypto-Verse",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Crypto-Verse Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto-Verse",
    description: "Master the art of encryption in 3D.",
    creator: "@TheCryptoVerse",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-void`}
      >
        {children}
      </body>
    </html>
  );
}
