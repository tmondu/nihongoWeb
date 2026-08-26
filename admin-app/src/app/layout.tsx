import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'PTham Admin Dashboard',
  description: 'Hệ thống quản trị Nihongo PThamSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='vi' className='dark'>
      <body className='min-h-screen bg-[#09090b] text-slate-100 antialiased'>
        <div className='flex min-h-screen'>
          <Sidebar />
          <div className='flex flex-1 flex-col pl-64'>
            <Header />
            <main className='flex-1 p-8'>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
