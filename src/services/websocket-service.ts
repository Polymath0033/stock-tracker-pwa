// import type { WebSocketMessage, StockQuote, ConnectionStatus } from '../types';
// import { stockService } from './stock-service';
// // import type { Timeout } from 'node:timers';

// export class WebSocketService {
//   private ws: WebSocket | null = null;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectInterval = 5000; // 5 seconds
//   private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
//   private subscribers = new Map<string, (message: WebSocketMessage) => void>();
//   private subscribedSymbols = new Set<string>();
//   private connectionStatus: ConnectionStatus = {
//     connected: false,
//     reconnectAttempts: 0
//   };

//   private pollingInterval: ReturnType<typeof setInterval> | null = null;
//   private pollingFrequency = 3000; 

//   constructor() {
   
//   }

//   private initializeConnection(): void {

//     this.startPolling();
//   }

//   private startPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//     }

//     this.pollingInterval = setInterval(async () => {
//       if (this.subscribedSymbols.size === 0) return;

//       for (const symbol of this.subscribedSymbols) {
//         try {
//           const response = await stockService.getStockQuote(symbol);
//           if (response.data && !response.error) {
//             const message: WebSocketMessage = {
//               type: 'quote',
//               data: response.data,
//               symbol
//             };
//             this.notifySubscribers(symbol, message);
//           }
//         } catch (error) {
//           const errorMessage: WebSocketMessage = {
//             type: 'error',
//             message: error instanceof Error ? error.message : 'Unknown error',
//             symbol
//           };
//           this.notifySubscribers(symbol, errorMessage);
//         }
//       }
//     }, this.pollingFrequency);

//     this.updateConnectionStatus(true);
//   }

//   private stopPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//       this.pollingInterval = null;
//     }
//   }

//   private updateConnectionStatus(connected: boolean, error?: string): void {
//     this.connectionStatus = {
//       connected,
//       lastConnected: connected ? new Date().toISOString() : this.connectionStatus.lastConnected,
//       reconnectAttempts: this.reconnectAttempts,
//       error
//     };

//     // Notify connection status subscribers
//     const connectionMessage: WebSocketMessage = {
//       type: 'connection',
//       message: connected ? 'Connected' : 'Disconnected'
//     };
    
//     this.subscribers.forEach((callback) => {
//       callback(connectionMessage);
//     });
//   }

//   private notifySubscribers(symbol: string, message: WebSocketMessage): void {
//     const callback = this.subscribers.get(symbol);
//     if (callback) {
//       callback(message);
//     }
//   }

//   subscribe(symbol: string, callback: (message: WebSocketMessage) => void): void {
//     this.subscribers.set(symbol, callback);
//     this.subscribedSymbols.add(symbol);

//     // If this is the first subscription, start polling
//     if (this.subscribedSymbols.size === 1 && !this.pollingInterval) {
//       this.startPolling();
//     }
//   }

//   unsubscribe(symbol: string): void {
//     this.subscribers.delete(symbol);
//     this.subscribedSymbols.delete(symbol);

//     // If no more subscriptions, stop polling
//     if (this.subscribedSymbols.size === 0) {
//       this.stopPolling();
//       this.updateConnectionStatus(false);
//     }
//   }

//   subscribeToConnectionStatus(callback: (status: ConnectionStatus) => void): void {
//     this.subscribers.set('__connection__', (message: WebSocketMessage) => {
//       if (message.type === 'connection') {
//         callback(this.connectionStatus);
//       }
//     });
//   }

//   unsubscribeFromConnectionStatus(): void {
//     this.subscribers.delete('__connection__');
//   }

//   getConnectionStatus(): ConnectionStatus {
//     return { ...this.connectionStatus };
//   }

//   reconnect(): void {
//     this.stopPolling();
//     this.reconnectAttempts = 0;
//     this.initializeConnection();
//   }

//   disconnect(): void {
//     this.stopPolling();
//     this.subscribers.clear();
//     this.subscribedSymbols.clear();
//     this.updateConnectionStatus(false);
//   }

//   // Method to simulate real-time price changes for demo purposes
//   private simulatePriceChange(basePrice: number): number {
//     const changePercent = (Math.random() - 0.5) * 0.02; // ±1% change
//     return basePrice * (1 + changePercent);
//   }

//   // Enhanced method for demo with simulated real-time data
//   subscribeWithSimulation(symbol: string, callback: (message: WebSocketMessage) => void): void {
//     this.subscribe(symbol, (message) => {
//       if (message.type === 'quote' && message.data) {
//         // Add some simulation for more realistic real-time feel
//         const simulatedData: StockQuote = {
//           ...message.data,
//           price: this.simulatePriceChange(message.data.price),
//           timestamp: new Date().toISOString()
//         };
        
//         // Recalculate change based on simulated price
//         const change = simulatedData.price - message.data.previousClose;
//         const changePercent = (change / message.data.previousClose) * 100;
        
//         simulatedData.change = change;
//         simulatedData.changePercent = changePercent;

//         callback({
//           ...message,
//           data: simulatedData
//         });
//       } else {
//         callback(message);
//       }
//     });
//   }

//   // Method to update polling frequency
//   setPollingFrequency(frequency: number): void {
//     this.pollingFrequency = Math.max(1000, frequency); // Minimum 1 second
//     if (this.pollingInterval) {
//       this.stopPolling();
//       this.startPolling();
//     }
//   }

//   getSubscribedSymbols(): string[] {
//     return Array.from(this.subscribedSymbols);
//   }
// }

// export const websocketService = new WebSocketService();
import type { WebSocketMessage, StockQuote, ConnectionStatus } from '../types';
import { stockService } from './stock-service';

export class WebSocketService {
  // private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  // private maxReconnectAttempts = 5;
  // private reconnectInterval = 5000;
  // private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Map<string, (message: WebSocketMessage) => void>();
  private subscribedSymbols = new Set<string>();
  private connectionStatus: ConnectionStatus = {
    connected: false,
    reconnectAttempts: 0,
  };

  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private pollingFrequency = 3000;
  private isPolling = false; // Add flag to prevent multiple polling instances

  constructor() {
    // Empty constructor
  }

  private initializeConnection(): void {
    this.startPolling();
  }

  private startPolling(): void {
    // Prevent multiple polling instances
    if (this.isPolling || this.pollingInterval) {
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isPolling = true;

    this.pollingInterval = setInterval(async () => {
      // Additional safety check
      if (this.subscribedSymbols.size === 0) {
        this.stopPolling();
        return;
      }

      try {
        // Process all symbols concurrently for better performance
        const promises = Array.from(this.subscribedSymbols).map(
          async (symbol) => {
            try {
              const response = await stockService.getStockQuote(symbol);
              if (response.data && !response.error) {
                const message: WebSocketMessage = {
                  type: "quote",
                  data: response.data,
                  symbol,
                };
                this.notifySubscribers(symbol, message);
              }
            } catch (error) {
              const errorMessage: WebSocketMessage = {
                type: "error",
                message:
                  error instanceof Error ? error.message : "Unknown error",
                symbol,
              };
              this.notifySubscribers(symbol, errorMessage);
            }
          }
        );

        await Promise.all(promises);
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, this.pollingFrequency);

    this.updateConnectionStatus(true);
  }

  private stopPolling(): void {
    this.isPolling = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private updateConnectionStatus(connected: boolean, error?: string): void {
    this.connectionStatus = {
      connected,
      lastConnected: connected
        ? new Date().toISOString()
        : this.connectionStatus.lastConnected,
      reconnectAttempts: this.reconnectAttempts,
      error,
    };

    // Notify connection status subscribers
    const connectionMessage: WebSocketMessage = {
      type: "connection",
      message: connected ? "Connected" : "Disconnected",
    };

    // Use a more specific callback for connection status
    const connectionCallback = this.subscribers.get("__connection__");
    if (connectionCallback) {
      connectionCallback(connectionMessage);
    }
  }

  private notifySubscribers(symbol: string, message: WebSocketMessage): void {
    const callback = this.subscribers.get(symbol);
    if (callback) {
      callback(message);
    }
  }

  subscribe(
    symbol: string,
    callback: (message: WebSocketMessage) => void
  ): void {
    this.subscribers.set(symbol, callback);
    this.subscribedSymbols.add(symbol);

    // If this is the first subscription, start polling
    if (this.subscribedSymbols.size === 1 && !this.isPolling) {
      this.startPolling();
    }
  }

  unsubscribe(symbol: string): void {
    this.subscribers.delete(symbol);
    this.subscribedSymbols.delete(symbol);

    // If no more subscriptions, stop polling
    if (this.subscribedSymbols.size === 0) {
      this.stopPolling();
      this.updateConnectionStatus(false);
    }
  }

  subscribeToConnectionStatus(
    callback: (status: ConnectionStatus) => void
  ): void {
    this.subscribers.set("__connection__", (message: WebSocketMessage) => {
      if (message.type === "connection") {
        callback(this.connectionStatus);
      }
    });
  }

  unsubscribeFromConnectionStatus(): void {
    this.subscribers.delete("__connection__");
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  reconnect(): void {
    this.stopPolling();
    this.reconnectAttempts = 0;
    this.initializeConnection();
  }

  disconnect(): void {
    this.stopPolling();
    this.subscribers.clear();
    this.subscribedSymbols.clear();
    this.updateConnectionStatus(false);
  }

  // Method to simulate real-time price changes for demo purposes
  private simulatePriceChange(basePrice: number): number {
    const changePercent = (Math.random() - 0.5) * 0.02; // ±1% change
    return basePrice * (1 + changePercent);
  }

  // Enhanced method for demo with simulated real-time data
  subscribeWithSimulation(
    symbol: string,
    callback: (message: WebSocketMessage) => void
  ): void {
    this.subscribe(symbol, (message) => {
      if (message.type === "quote" && message.data) {
        // Add some simulation for more realistic real-time feel
        const simulatedData: StockQuote = {
          ...message.data,
          price: this.simulatePriceChange(message.data.price),
          timestamp: new Date().toISOString(),
        };

        // Recalculate change based on simulated price
        const change = simulatedData.price - message.data.previousClose;
        const changePercent = (change / message.data.previousClose) * 100;

        simulatedData.change = change;
        simulatedData.changePercent = changePercent;

        callback({
          ...message,
          data: simulatedData,
        });
      } else {
        callback(message);
      }
    });
  }

  // Method to update polling frequency
  setPollingFrequency(frequency: number): void {
    this.pollingFrequency = Math.max(1000, frequency); // Minimum 1 second

    // If currently polling, restart with new frequency
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  // Useful for testing - check if currently polling
  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }
}

export const websocketService = new WebSocketService();