import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Historical Conflict Map Explorer",
  description:
    "An interactive atlas of global conflicts from 1800 to the present day. Explore wars and their evolution through an animated timeline.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0d1117] text-[#e6edf3]">
        {children}
      </body>
    </html>
  );
}
