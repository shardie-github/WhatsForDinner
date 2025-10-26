'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { i18n } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'select' | 'popover' | 'dropdown';
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'select', 
  showFlags = true, 
  showNativeNames = true,
  className = '' 
}: LanguageSelectorProps) {
  const { locale, changeLocale, loading } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const locales = i18n.getLocales();
  const currentLocale = locales.find(l => l.code === locale);

  const handleLocaleChange = async (newLocale: string) => {
    await changeLocale(newLocale);
    setOpen(false);
  };

  if (variant === 'select') {
    return (
      <Select value={locale} onValueChange={handleLocaleChange} disabled={loading}>
        <SelectTrigger className={`w-[200px] ${className}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {showFlags && currentLocale && (
                <span className="text-lg">{currentLocale.flag}</span>
              )}
              <span>{showNativeNames ? currentLocale?.nativeName : currentLocale?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              <div className="flex items-center gap-2">
                {showFlags && <span className="text-lg">{locale.flag}</span>}
                <div className="flex flex-col">
                  <span>{showNativeNames ? locale.nativeName : locale.name}</span>
                  {showNativeNames && locale.nativeName !== locale.name && (
                    <span className="text-xs text-muted-foreground">{locale.name}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'popover') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`justify-between ${className}`}>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {showFlags && currentLocale && (
                <span className="text-lg">{currentLocale.flag}</span>
              )}
              <span>{showNativeNames ? currentLocale?.nativeName : currentLocale?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-1">
            {locales.map((locale) => (
              <Button
                key={locale.code}
                variant={locale.code === locale ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleLocaleChange(locale.code)}
                disabled={loading}
              >
                <div className="flex items-center gap-2 w-full">
                  {showFlags && <span className="text-lg">{locale.flag}</span>}
                  <div className="flex flex-col flex-1 text-left">
                    <span className="font-medium">
                      {showNativeNames ? locale.nativeName : locale.name}
                    </span>
                    {showNativeNames && locale.nativeName !== locale.name && (
                      <span className="text-xs text-muted-foreground">{locale.name}</span>
                    )}
                  </div>
                  {locale.code === locale && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="justify-between"
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {showFlags && currentLocale && (
            <span className="text-lg">{currentLocale.flag}</span>
          )}
          <span>{showNativeNames ? currentLocale?.nativeName : currentLocale?.name}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50">
          <div className="p-2 space-y-1">
            {locales.map((locale) => (
              <Button
                key={locale.code}
                variant={locale.code === locale ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleLocaleChange(locale.code)}
                disabled={loading}
              >
                <div className="flex items-center gap-2 w-full">
                  {showFlags && <span className="text-lg">{locale.flag}</span>}
                  <div className="flex flex-col flex-1 text-left">
                    <span className="font-medium">
                      {showNativeNames ? locale.nativeName : locale.name}
                    </span>
                    {showNativeNames && locale.nativeName !== locale.name && (
                      <span className="text-xs text-muted-foreground">{locale.name}</span>
                    )}
                  </div>
                  {locale.code === locale && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Translation progress component
export function TranslationProgress() {
  const [stats, setStats] = useState({
    totalKeys: 0,
    translatedKeys: 0,
    completionPercentage: 0,
    byLocale: {} as Record<string, { total: number; translated: number; percentage: number }>,
  });

  React.useEffect(() => {
    i18n.getTranslationStats().then(setStats);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Translation Progress</h3>
        <Badge variant="outline">
          {Math.round(stats.completionPercentage)}% Complete
        </Badge>
      </div>
      
      <div className="space-y-2">
        {Object.entries(stats.byLocale).map(([locale, data]) => (
          <div key={locale} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{locale.toUpperCase()}</span>
              <span>{data.translated}/{data.total} ({Math.round(data.percentage)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}