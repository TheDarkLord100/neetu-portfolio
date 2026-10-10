import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

// Placeholder strings; moved to messages/hi.json in the i18n roadmap item.
export const metadata: Metadata = {
  title: "नीतू",
  description: "नीतू — हिंदी लेखिका। कविताएँ, कहानियाँ और उपन्यास।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hi" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
