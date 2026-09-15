import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { MentorModeProvider } from "@/context/MentorModeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScholarshipConnectBD | Bridging Bangladeshi Students to Global Opportunities",
  description: "A comprehensive platform to discover, track, and apply for international scholarships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <MentorModeProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </MentorModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
