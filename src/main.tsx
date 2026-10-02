import '@fontsource-variable/manrope';
import '@fontsource-variable/oswald';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { queryClient } from '@/app/query-client';
import { router } from '@/app/router';
import { ThemeProvider } from '@/shared/components/theme-provider';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} useTransitions />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
