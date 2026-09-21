import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from "sonner";
import { ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from "react-router-dom";
import MainRoute from './routes/main.route';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: "#10b981",
        colorBgBase: "#0b1220",
        colorBgContainer: "#151e31",
        colorBorder: "#243049",
        borderRadius: 10,
      },
    }}
  >
    <BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" duration={1000} closeButton />
      <QueryClientProvider client={queryClient}>
        <MainRoute />
      </QueryClientProvider>
    </BrowserRouter>
  </ConfigProvider>
)