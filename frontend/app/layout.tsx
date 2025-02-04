import { Inter } from "next/font/google";
import "./globals.css";
import type React from "react";
import { FileProvider } from "./context/fileContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Finsights - AI-Powered Bank Statement Analysis</title>
        <meta
          name="description"
          content="Transform your bank statements into actionable insights with AI-powered analysis"
        />
      </head>
      <body className={`${inter.className} bg-casca-50`}>
        <FileProvider>{children}</FileProvider>
      </body>
    </html>
  );
}
