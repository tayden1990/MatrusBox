import './globals.css';
import '@matrus/ui/dist/styles.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

// Using system fonts instead of Google Fonts to avoid network issues
const fontClass = 'font-sans';

export const metadata: Metadata = {
  title: 'Matrus - AI-powered Leitner System',
  description: 'Master languages with intelligent spaced repetition',
  keywords: ['flashcards', 'language learning', 'spaced repetition', 'AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClass}>
      <body className="bg-white text-gray-900 min-h-screen" style={{fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}