import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
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
    <html lang="id" className={roboto.variable}>
      <body className={`${roboto.className} min-h-screen bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
