import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jotly - Your AI Workspace for Smarter Notes",
  description: "Boost your productivity with Jotly, the AI-powered note-taking app designed to help you organize, summarize, and enhance your notes effortlessly.",
  icons: {
    icon: "/jotly-small-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.className} ${geistMono.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
