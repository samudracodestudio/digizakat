import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Neo Digizakat - Ensiklopedi & Radar Gerakan Zakat Indonesia",
  description: "Pusat khazanah gerakan zakat, radar rilis aksi 218 LAZ resmi Kemenag RI, dan gerbang donasi ke platform crowdfunding resmi anggota FOZ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${openSans.variable}`}>
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
