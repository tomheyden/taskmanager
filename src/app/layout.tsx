import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Stichtag", template: "%s · Stichtag" },
  description: "Aufgaben mit klaren Fristen für zwei Partner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${instrument.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
