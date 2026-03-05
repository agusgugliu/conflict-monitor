import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Historical Conflict Map Explorer",
  description:
    "An interactive atlas of global conflicts from 1800 to the present day. Explore wars and their evolution through an animated timeline.",
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
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none opacity-80 mix-blend-screen mix-blend-plus-lighter">
          {/* Default to signature.gif as requested by the user */}
          <img src="/assets/signature.gif" alt="Developed by" className="h-16 w-auto object-contain brightness-0 invert drop-shadow-lg" />
        </div>
      </body>
    </html>
  );
}
