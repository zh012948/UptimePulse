import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Uptime Pulse",
  description: "Keeps your Render Free tier wake up even it's Idle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
<Analytics />