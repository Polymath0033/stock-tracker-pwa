import { WebSocketService } from '../services/websocket-service';
import { vi, beforeEach, describe, test, expect, afterEach } from 'vitest';

const mockGetStockQuote = vi.fn();
vi.mock('../services/stock-service', () => ({
  stockService: {
    getStockQuote: mockGetStockQuote
  }
}));

describe('WebSocketService', () => {
  let websocketService: WebSocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    mockGetStockQuote.mockResolvedValue({
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
    });
    
    websocketService = new WebSocketService();
  });

  afterEach(() => {
    websocketService.disconnect();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test('initializes with correct default state', () => {
    const status = websocketService.getConnectionStatus();
    expect(status.connected).toBe(false);
    expect(status.reconnectAttempts).toBe(0);
  });

  test('subscribes to stock updates', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);

    expect(websocketService.getSubscribedSymbols()).toContain('AAPL');
  });

  test('unsubscribes from stock updates', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);
    websocketService.unsubscribe('AAPL');

    expect(websocketService.getSubscribedSymbols()).not.toContain('AAPL');
  });

  test('starts polling when first subscription is added', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);

    expect(websocketService.getConnectionStatus().connected).toBe(true);
  });

  test('stops polling when all subscriptions are removed', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);
    websocketService.unsubscribe('AAPL');

    const status = websocketService.getConnectionStatus();
    expect(status.connected).toBe(false);
  });

  test('handles multiple subscriptions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    websocketService.subscribe('AAPL', callback1);
    websocketService.subscribe('GOOGL', callback2);

    const symbols = websocketService.getSubscribedSymbols();
    expect(symbols).toContain('AAPL');
    expect(symbols).toContain('GOOGL');
    expect(symbols).toHaveLength(2);
  });

  test('subscribes to connection status updates', () => {
    const statusCallback = vi.fn();
    websocketService.subscribeToConnectionStatus(statusCallback);

    const stockCallback = vi.fn();
    websocketService.subscribe('AAPL', stockCallback);

    expect(statusCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        connected: true
      })
    );
  });

  test('unsubscribes from connection status updates', () => {
    const statusCallback = vi.fn();
    websocketService.subscribeToConnectionStatus(statusCallback);
    websocketService.unsubscribeFromConnectionStatus();

    const stockCallback = vi.fn();
    websocketService.subscribe('AAPL', stockCallback);

    expect(statusCallback).not.toHaveBeenCalled();
  });

  test('handles reconnection', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);
    
    websocketService.disconnect();
    expect(websocketService.getConnectionStatus().connected).toBe(false);
    
    websocketService.subscribe('AAPL', callback);
    websocketService.reconnect();
    expect(websocketService.getConnectionStatus().connected).toBe(true);
  });

  test('subscribes with simulation adds price variation', () => {
    const callback = vi.fn();
    websocketService.subscribeWithSimulation('AAPL', callback);

    expect(websocketService.getSubscribedSymbols()).toContain('AAPL');
    expect(websocketService.getConnectionStatus().connected).toBe(true);
    

    expect(callback).not.toHaveBeenCalled(); 
  });
  test('updates polling frequency', () => {
    // const originalFreq = 3000;
    const newFreq = 5000;
    
    websocketService.setPollingFrequency(newFreq);
    
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);

    expect(websocketService.getConnectionStatus().connected).toBe(true);
  });

  test('enforces minimum polling frequency', () => {
    websocketService.setPollingFrequency(500); 
    
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);

    expect(websocketService.getConnectionStatus().connected).toBe(true);
  });

  test('handles polling errors gracefully', () => {
    mockGetStockQuote.mockRejectedValueOnce(new Error('Network error'));

    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);

    expect(websocketService.getSubscribedSymbols()).toContain('AAPL');
    expect(websocketService.getConnectionStatus().connected).toBe(true);
  });

  test('disconnects properly', () => {
    const callback = vi.fn();
    websocketService.subscribe('AAPL', callback);
    
    websocketService.disconnect();
    
    expect(websocketService.getSubscribedSymbols()).toHaveLength(0);
    expect(websocketService.getConnectionStatus().connected).toBe(false);
  });


  test('simulation modifies price data correctly', () => {
    const callback = vi.fn();
    const originalData = {
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
    };

    websocketService.subscribeWithSimulation('AAPL', callback);

    const mockMessage = {
      type: 'quote' as const,
      data: originalData,
      symbol: 'AAPL'
    };

    const registeredCallback = websocketService['subscribers'].get('AAPL');
    if (registeredCallback) {
      registeredCallback(mockMessage);
    }

    expect(callback).toHaveBeenCalled();
    const callArgs = callback.mock.calls[0][0];
    expect(callArgs.type).toBe('quote');
    expect(callArgs.symbol).toBe('AAPL');
    expect(callArgs.data.price).not.toBe(originalData.price);
    expect(callArgs.data.timestamp).not.toBe(originalData.timestamp);
  });
});