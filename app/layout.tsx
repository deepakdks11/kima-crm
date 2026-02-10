import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// Trigger redeploy to resolve Vercel cloning issue
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Kima CRM",
  description: "Advanced Lead Management & Scoring System",
  applicationName: "Kima CRM",
  appleWebApp: {
    capable: true,
    title: "Kima CRM",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <WorkspaceProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
