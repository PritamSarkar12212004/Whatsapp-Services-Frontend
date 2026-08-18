import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from "react-router-dom";
import MainRoute from './routes/main.route';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Toaster position="top-right" richColors duration={1000} closeButton />
    <QueryClientProvider client={queryClient}>
      <MainRoute />
    </QueryClientProvider>
  </BrowserRouter>
)