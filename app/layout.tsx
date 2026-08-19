import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Widget } from "@/components/widget/Widget";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { buildRestaurantStructuredData } from "@/lib/structuredData";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Copper Larder | Modern British Bistro in Birmingham",
  description:
    "The Copper Larder is a modern British bistro at Brindley Place, Birmingham, serving seasonal British cooking, Sunday roasts and carefully sourced local ingredients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = buildRestaurantStructuredData();

  return (
    <html
      lang="en"
      className={`${display.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-offwhite text-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SmoothScroll>
          <Navbar />
          {children}
        </SmoothScroll>
        <Widget />
      </body>
    </html>
  );
}
