import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: {
    default: 'ФК «Фаворит» — Футбольная академия в Казани',
    template: '%s | ФК «Фаворит»',
  },
  description:
    'Футбольная академия «Фаворит» в Казани. Профессиональные тренировки для детей. Запишитесь на пробное занятие.',
  keywords: ['футбол', 'Казань', 'детская футбольная школа', 'Фаворит', 'академия'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ФК «Фаворит»',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className={manrope.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
