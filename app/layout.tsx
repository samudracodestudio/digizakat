import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
