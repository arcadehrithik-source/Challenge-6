import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { BreatheWiseProvider } from "@/components/providers/BreatheWiseProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BreatheWise AI | Urban Air Quality Decision Assistant",
  description:
    "Transform urban air quality data into personalized daily routines, safer commutes, cleaner indoor air, and measurable sustainability impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-[#f6f8f6] text-[#10201a] antialiased">
        <BreatheWiseProvider>{children}</BreatheWiseProvider>
      </body>
    </html>
  );
}
