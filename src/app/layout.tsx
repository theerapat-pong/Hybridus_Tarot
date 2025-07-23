
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

// Since we are using a dynamic route, we can't use generateMetadata
// So we will handle metadata in the page layout instead.

export default function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  return (
    <html lang={locale} className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="Hybridus" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;1,400&family=Cinzel:wght@400;700&family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
