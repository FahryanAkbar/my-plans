import type { Metadata } from "next";
import { Toaster } from "@/components/atoms/sonner/sonner";

import { ClerkProvider } from "@clerk/nextjs";
import { EdgeStoreProvider } from "@/lib/api/edgestore";

import ConvexClientProvider from "@/components/providers/convex-provider";
import { ThemeProvider, ModalProvider } from "@/components/providers";
import { RootLayoutContent } from "@/components/organisms/layouts";

import "./globals.css";
import { cn } from "@/lib";
import {
  outfitHeading, 
  jakartaSans, 
  geistSans, 
  geistMono 
} from "@/types";

export const metadata: Metadata = {
  title: "My Plans",
  description: "A Project Management Platform for everyone",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.png",  
        href: "/logo.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo.png",  
        href: "/logo.png",
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", jakartaSans.variable, outfitHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
            storageKey="notion-theme-2"
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <EdgeStoreProvider>
                <Toaster 
                  position="top-right" 
                />
                <ModalProvider />
                <RootLayoutContent>
                  {children}
                </RootLayoutContent>
              </EdgeStoreProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

