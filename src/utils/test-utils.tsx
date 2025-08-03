import type { ReactElement } from 'react';
import { render,type RenderOptions } from '@testing-library/react';
import { StockProvider } from '../context/stock-provider';
import "@testing-library/jest-dom";
// import { jest } from '@jest/globals';
// Mock the WebSocket service
import {vi} from 'vitest';
vi.mock('../services/websocket-service', () => ({
  WebSocketService: vi.fn().mockImplementation(() => ({
    subscribeWithSimulation: vi.fn(),
    unsubscribe: vi.fn(),
    subscribeToConnectionStatus: vi.fn(),
    unsubscribeFromConnectionStatus: vi.fn(),
    getConnectionStatus: vi.fn(() => ({ connected: true, reconnectAttempts: 0 })),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

// Mock the stock service
vi.mock('../services/stock-service', () => ({
  stockService: {
    getPopularStocks: vi.fn(() => Promise.resolve({
      data: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 150.00,
          change: 2.50,
          changePercent: 1.69,
          volume: 50000000,
          lastUpdate: '2025-01-01T12:00:00Z'
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 2800.00,
          change: -15.00,
          changePercent: -0.53,
          volume: 1000000,
          lastUpdate: '2025-01-01T12:00:00Z'
        }
      ],
      timestamp: '2025-01-01T12:00:00Z'
    })),
    searchStocks: vi.fn(() => Promise.resolve({
      data: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'Equity',
          region: 'United States',
          marketOpen: '09:30',
          marketClose: '16:00',
          timezone: 'UTC-04',
          currency: 'USD',
          matchScore: 1.0
        }
      ],
      timestamp: '2025-01-01T12:00:00Z'
    })),
    getStockQuote: vi.fn(() => Promise.resolve({
      data: {
        symbol: 'AAPL',
        price: 150.00,
        change: 2.50,
        changePercent: 1.69,
        volume: 50000000,
        high: 152.00,
        low: 148.00,
        open: 149.00,
        previousClose: 147.50,
        timestamp: '2025-01-01T12:00:00Z'
      },
      timestamp: '2025-01-01T12:00:00Z'
    })),
    getStockChart: vi.fn(() => Promise.resolve({
      data: [
        {
          timestamp: '2025-01-01',
          open: 149.00,
          high: 152.00,
          low: 148.00,
          close: 150.00,
          volume: 50000000
        }
      ],
      timestamp: '2025-01-01T12:00:00Z'
    })),
    getStockOverview: vi.fn(() => Promise.resolve({
      data: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCap: 2500000000000,
        peRatio: 28.5,
        pegRatio: 1.5,
        bookValue: 4.2,
        dividendPerShare: 0.88,
        dividendYield: 0.59,
        eps: 5.67,
        revenuePerShareTTM: 23.45,
        profitMargin: 0.25,
        operatingMarginTTM: 0.30,
        returnOnAssetsTTM: 0.20,
        returnOnEquityTTM: 0.75,
        revenueTTM: 365000000000,
        grossProfitTTM: 150000000000,
        dilutedEPSTTM: 5.67,
        quarterlyEarningsGrowthYOY: 0.12,
        quarterlyRevenueGrowthYOY: 0.08,
        analystTargetPrice: 160.00,
        trailingPE: 28.5,
        forwardPE: 25.0,
        priceToSalesRatioTTM: 7.5,
        priceToBookRatio: 35.0,
        evToRevenue: 8.0,
        evToEbitda: 22.0,
        beta: 1.2,
        week52High: 180.00,
        week52Low: 120.00,
        day50MovingAverage: 155.00,
        day200MovingAverage: 140.00,
        sharesOutstanding: 16000000000,
        sharesFloat: 15500000000,
        sharesShort: 100000000,
        sharesShortPriorMonth: 95000000,
        shortRatio: 1.2,
        shortPercentOutstanding: 0.6,
        shortPercentFloat: 0.65,
        percentInsiders: 0.1,
        percentInstitutions: 60.0,
        forwardAnnualDividendRate: 0.92,
        forwardAnnualDividendYield: 0.61,
        payoutRatio: 0.16,
        dividendDate: '2025-02-15',
        exDividendDate: '2025-02-10',
        lastSplitFactor: '4:1',
        lastSplitDate: '2020-08-28'
      },
      timestamp: '2025-01-01T12:00:00Z'
    })),
    clearCache: vi.fn(),
  }
}));

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StockProvider>
      {children}
    </StockProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock fetch globally
window.fetch = vi.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  writable: true,
});

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Mock Chart
    </div>
  ),
}));

// Mock chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}));
