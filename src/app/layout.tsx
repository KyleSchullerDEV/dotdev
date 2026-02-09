import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PostHogPageView } from "@/components/providers/PostHogPageView";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kyleschuller.dev"),
  title: {
    default: "Kyle Schuller | Frontend Engineer",
    template: "%s | Kyle Schuller",
  },
  description: "Personal blog and portfolio of Kyle Schuller, Frontend Engineer.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Kyle Schuller",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
          </PostHogProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
