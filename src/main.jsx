import React from "react";
import { createRoot } from "react-dom/client"; // Importe createRoot de react-dom/client
import App from "./App.jsx";
import "./index.scss";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Context from "./context/Context.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Context>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Context>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);