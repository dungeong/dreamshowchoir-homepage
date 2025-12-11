import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Dream Show Choir",
  description: "Dreams, Harmony, Hope - Official Website of Dream Show Choir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <QueryProvider>
          <AuthGuard>
            <Header />
            <main className="flex-grow pt-36">
              {children}
            </main>
            <Footer />
          </AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
