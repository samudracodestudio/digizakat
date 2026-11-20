import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Neo Digizakat - Ensiklopedi & Radar Gerakan Zakat Indonesia",
  description: "Pusat khazanah gerakan zakat, radar rilis aksi 218 LAZ resmi Kemenag RI, dan gerbang donasi ke platform crowdfunding resmi anggota FOZ.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/digizakat_icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  other: {
    'referrer': 'no-referrer-when-downgrade',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={rubik.variable}>
      <body className={`${rubik.className} min-h-screen bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
