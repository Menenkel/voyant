import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgressBar from '@/components/ScrollProgressBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VOYANT - Travel Smart, Stay Safe',
  description: 'Get comprehensive risk assessments and real-time travel insights for destinations worldwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <Navbar />
        <ScrollProgressBar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
