import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/common/ReduxProvider";
import QueryProvider from "@/components/common/QueryProvider";
import AuthListener from "@/components/common/AuthListener";
import AppLayout from "@/components/layout/AppLayout";
import DynamicProvider from "@/components/providers/DynamicProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Anihush - Your Anime AI Companion",
  description: "Your Anime AI Companion Social Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#0f0f12]`}>
        <QueryProvider>
          <ReduxProvider>
            <AuthListener>
              <DynamicProvider>
                <AppLayout>{children}</AppLayout>
              </DynamicProvider>
            </AuthListener>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
