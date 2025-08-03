import { stockService } from '../services/stock-service';
import { vi, beforeEach, describe, test, expect, type Mock } from 'vitest';
// Mock fetch globally
window.fetch = vi.fn();

describe('StockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stockService.clearCache();
  });

  test('searches stocks successfully', async () => {
    const mockResponse = {
      'bestMatches': [
        {
          '1. symbol': 'AAPL',
          '2. name': 'Apple Inc.',
          '3. type': 'Equity',
          '4. region': 'United States',
          '5. marketOpen': '09:30',
          '6. marketClose': '16:00',
          '7. timezone': 'UTC-04',
          '8. currency': 'USD',
          '9. matchScore': '1.0000'
        }
      ]
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.searchStocks('AAPL');
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].symbol).toBe('AAPL');
    expect(result.data[0].name).toBe('Apple Inc.');
    expect(result.error).toBeUndefined();
  });

  test('gets stock quote successfully', async () => {
    const mockResponse = {
      'Global Quote': {
        '01. symbol': 'AAPL',
        '02. open': '149.00',
        '03. high': '152.00',
        '04. low': '148.00',
        '05. price': '150.00',
        '06. volume': '50000000',
        '07. latest trading day': '2025-01-01',
        '08. previous close': '147.50',
        '09. change': '2.50',
        '10. change percent': '1.69%'
      }
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.getStockQuote('AAPL');
    
    expect(result.data.symbol).toBe('AAPL');
    expect(result.data.price).toBe(150.00);
    expect(result.data.change).toBe(2.50);
    expect(result.data.changePercent).toBe(1.69);
    expect(result.error).toBeUndefined();
  });

  test('handles API errors gracefully', async () => {
    const mockResponse = {
      'Error Message': 'Invalid API call'
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.searchStocks('INVALID');
    
    expect(result.error).toBe('Invalid API call');
    expect(result.data).toBeNull();
  });

  test('handles network errors', async () => {
    (window.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await stockService.searchStocks('AAPL');
    
    expect(result.error).toBe('Network error');
    expect(result.data).toBeNull();
  });

  test('handles API rate limit', async () => {
    const mockResponse = {
      'Note': 'Thank you for using Alpha Vantage! Our standard API call frequency is 25 requests per minute'
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.searchStocks('AAPL');
    
    expect(result.error).toBe('API call frequency limit reached. Please try again later.');
    expect(result.data).toBeNull();
  });

  test('gets stock chart data successfully', async () => {
    const mockResponse = {
      'Time Series (Daily)': {
        '2025-01-01': {
          '1. open': '149.00',
          '2. high': '152.00',
          '3. low': '148.00',
          '4. close': '150.00',
          '5. volume': '50000000'
        }
      }
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.getStockChart('AAPL', 'daily');
    
    expect(result.data).toHaveLength(1);
    expect(result.data[0].timestamp).toBe('2025-01-01');
    expect(result.data[0].close).toBe(150.00);
    expect(result.error).toBeUndefined();
  });

  test('gets stock overview successfully', async () => {
    const mockResponse = {
      'Symbol': 'AAPL',
      'Name': 'Apple Inc.',
      'Description': 'Apple Inc. designs, manufactures, and markets smartphones',
      'Sector': 'Technology',
      'Industry': 'Consumer Electronics',
      'MarketCapitalization': '2500000000000',
      'PERatio': '28.5',
      'EPS': '5.67',
      'DividendYield': '0.0059',
      '52WeekHigh': '180.00',
      '52WeekLow': '120.00',
      'Beta': '1.2'
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await stockService.getStockOverview('AAPL');
    
    expect(result.data.symbol).toBe('AAPL');
    expect(result.data.name).toBe('Apple Inc.');
    expect(result.data.sector).toBe('Technology');
    expect(result.data.marketCap).toBe(2500000000000);
    expect(result.error).toBeUndefined();
  });

  test('gets popular stocks successfully', async () => {
    const mockQuoteResponse = {
      'Global Quote': {
        '01. symbol': 'AAPL',
        '02. open': '149.00',
        '03. high': '152.00',
        '04. low': '148.00',
        '05. price': '150.00',
        '06. volume': '50000000',
        '07. latest trading day': '2025-01-01',
        '08. previous close': '147.50',
        '09. change': '2.50',
        '10. change percent': '1.69%'
      }
    };

    (window.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockQuoteResponse,
    });

    const result = await stockService.getPopularStocks();
    
    expect(result.data).toHaveLength(8); // Popular symbols count
    expect(result.data[0].symbol).toBe('AAPL');
    expect(result.data[0].price).toBe(150.00);
    expect(result.error).toBeUndefined();
  });

  test('uses cache for repeated requests', async () => {
    const mockResponse = {
      'bestMatches': [
        {
          '1. symbol': 'AAPL',
          '2. name': 'Apple Inc.',
          '3. type': 'Equity',
          '4. region': 'United States',
          '5. marketOpen': '09:30',
          '6. marketClose': '16:00',
          '7. timezone': 'UTC-04',
          '8. currency': 'USD',
          '9. matchScore': '1.0000'
        }
      ]
    };

    (window.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // First call
    await stockService.searchStocks('AAPL');
    
    // Second call should use cache
    const result = await stockService.searchStocks('AAPL');

    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(result.data).toHaveLength(1);
  });

  test('handles HTTP errors', async () => {
    (window.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await stockService.searchStocks('AAPL');
    
    expect(result.error).toBe('HTTP error! status: 404');
    expect(result.data).toBeNull();
  });
});
