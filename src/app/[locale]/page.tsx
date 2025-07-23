'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { format, getDay, getYear } from 'date-fns';
import { th, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, LogIn } from 'lucide-react';
import { MysticalIcon } from '@/components/brand-icon';


export default function UserInfoPage() {
  const t = useTranslations("UserInfoForm");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWednesday, setIsWednesday] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formSchema = z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    middleName: z.string().optional(),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    dob: z.date({
      required_error: t('validation.dobRequired'),
    }),
    wednesdayShift: z.string().optional(),
  }).refine((data) => {
    if (data.dob && getDay(data.dob) === 3) { // Wednesday is 3
      return !!data.wednesdayShift;
    }
    return true;
  }, {
    message: t('validation.wednesdayShiftRequired'),
    path: ["wednesdayShift"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const { firstName, middleName, lastName, dob, wednesdayShift } = values;
      const params = new URLSearchParams();
      
      params.set('firstName', firstName);
      if (middleName) params.set('middleName', middleName);
      params.set('lastName', lastName);
      // Format to YYYY-MM-DD to avoid timezone issues
      params.set('dob', format(dob, 'yyyy-MM-dd')); 
      if (wednesdayShift) params.set('wednesdayShift', wednesdayShift);
      
      router.push(`/${locale}/tarot?${params.toString()}`);

    } catch (error) {
        console.error("An error occurred during form submission:", error);
        toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
        setIsSubmitting(false);
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("dob", date, { shouldValidate: true });
      const day = getDay(date);
      setIsWednesday(day === 3);
      if (day !== 3) {
        form.setValue("wednesdayShift", undefined);
        form.clearErrors("wednesdayShift");
      }
      setIsCalendarOpen(false);
    }
  };

  const formatDateForDisplay = (date: Date, locale: string) => {
    const localeObject = locale === 'th' ? th : enUS;
    if (locale === 'th') {
      const thaiYear = getYear(date) + 543;
      return format(date, 'd MMMM', { locale: localeObject }) + ' ' + thaiYear;
    }
    return format(date, "d MMMM yyyy", { locale: localeObject });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center text-foreground p-4 font-body antialiased">
      <div className="w-full max-w-md mx-auto animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8 gap-4">
          <MysticalIcon className="w-14 h-14 md:w-16 md:h-16" />
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-wide">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2 font-body text-sm md:text-base">{t('subtitle')}</p>
          </div>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('middleName')} <span className='text-sm text-muted-foreground'>({t('middleNameDescription')})</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('dob')}</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDateForDisplay(field.value, locale)
                          ) : (
                            <span>{t('dobPlaceholder')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={locale as 'en' | 'th'}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        selected={field.value}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isWednesday && (
              <FormField
                control={form.control}
                name="wednesdayShift"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('wednesdayShift')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="day" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t('wednesdayShiftDay')}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="night" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t('wednesdayShiftNight')}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? t('submittingButton') : t('submitButton')}
                <LogIn className="ml-2 h-5 w-5"/>
            </Button>
          </form>
        </FormProvider>
      </div>
    </main>
  );
}
