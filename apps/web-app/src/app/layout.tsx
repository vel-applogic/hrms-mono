import '@repo/ui/globals.css';
import './globals.css';

import type { Metadata } from 'next';

import { dmSans } from './fonts';
import { AuthProvider } from '@/lib/auth/auth-provider';

export const metadata: Metadata = {
  title: 'Hrms Admin',
  description: 'Hrms Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={dmSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
