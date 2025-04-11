import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from './theme-provider';
import { WishlistProvider } from './wishlist-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}