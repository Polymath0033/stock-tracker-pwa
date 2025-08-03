import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { StockProvider } from "./context/stock-provider";
import LandingPage from "./pages/landing-page";
import StocksPage from "./pages/stocks-page";
import StockDetailPage from "./pages/stock-detail-page";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/stocks",
      element: <StocksPage />,
    },
    {
      path: "/stock/:symbol",
      element: <StockDetailPage />,
    },
    {
      path: "/about",
      element: <div>About</div>,
    },
  ]);

  return (
    <ErrorBoundary>
      <StockProvider>
        <RouterProvider router={router} />
      </StockProvider>
    </ErrorBoundary>
  );
}

export default App;
