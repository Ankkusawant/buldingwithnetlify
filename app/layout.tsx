import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import BottomNav from "./components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zovira",
  description: "Rewards and earning platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}