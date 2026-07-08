import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftlyAI Chatbot for WhatsApp",
  description: "SaaS dashboard for managing an AI WhatsApp assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full bg-slate-50 font-sans text-slate-950">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}