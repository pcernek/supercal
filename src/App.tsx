import React from 'react';
import { Panel } from './components/Panel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Panel />
    </QueryClientProvider>
  );
}
