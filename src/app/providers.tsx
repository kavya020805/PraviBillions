'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import { AccessibilityProvider } from '@/lib/accessibility-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
