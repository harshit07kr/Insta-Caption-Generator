import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button"; // Ensure you have this or standard html button
import { Moon, Sun } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle"; // We will create this next

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "Insta Caption Gen", description: "AI Powered Captions" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <header className="flex justify-between items-center p-4 border-b">
              <h1 className="font-bold text-xl">CaptionGen</h1>
              <div className="flex gap-4 items-center">
                <ThemeToggle />
                <SignedOut><SignInButton mode="modal"><Button>Sign In</Button></SignInButton></SignedOut>
                <SignedIn><UserButton /></SignedIn>
              </div>
            </header>
            <main className="p-4">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}