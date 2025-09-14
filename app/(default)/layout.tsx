import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "My Project",
  description: "Make and shake",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen font-sans selection:bg-purple-300 selection:text-purple-900">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
