import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import type { Metadata } from 'next';
import LocaleSwitcher from '@/components/locale-switcher';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Metadata'});
 
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Provide the locale to getMessages
  const messages = await getMessages({locale});
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
       <div className="absolute top-4 right-4 z-50">
        <LocaleSwitcher />
      </div>
      {children}
    </NextIntlClientProvider>
  );
}
