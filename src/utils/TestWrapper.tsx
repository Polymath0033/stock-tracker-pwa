import { StockProvider } from "../context/stock-provider";

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StockProvider>
      {children}
    </StockProvider>
  );
};

export default TestWrapper;
