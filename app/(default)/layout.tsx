import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Phoenix Sound",
  description: "Move and listen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen font-sans selection:bg-purple-300 selection:text-purple-900">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
