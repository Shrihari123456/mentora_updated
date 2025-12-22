// src/app/layout.tsx
'use client'; // Add this to make it a client component

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import { Toaster } from "sonner";
import theme from "../theme";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

// Remove metadata export since client components can't export metadata
// You'll need to handle metadata differently

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <SessionProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {children}
              <Toaster richColors />
            </ThemeProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}