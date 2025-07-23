'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';
import { Globe } from 'lucide-react';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Manually replace the locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.replace(newPathname);
    });
  }

  return (
    <div className="relative">
      <Globe className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground pointer-events-none" />
      <select
        className="inline-flex appearance-none bg-transparent py-1 pl-8 pr-5 text-xs sm:py-2 sm:pl-10 sm:pr-6 sm:text-sm rounded-md border border-input focus:ring-ring focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-background"
        defaultValue={locale}
        disabled={isPending}
        onChange={onSelectChange}
      >
        {['en', 'th'].map((cur) => (
          <option key={cur} value={cur} className="text-foreground bg-background">
            {t(cur)}
          </option>
        ))}
      </select>
    </div>
  );
}
