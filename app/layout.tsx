import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Widget } from "@/components/widget/Widget";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
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
  title: "The Copper Larder — Modern British Bistro, Birmingham",
  description:
    "Modern British bistro at 42 Brindley Place, Birmingham. Seasonal menu, Sunday roast, and a proper feather blade of beef. Chat with Hannah for recommendations or book a table.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <Widget />
      </body>
    </html>
  );
}
