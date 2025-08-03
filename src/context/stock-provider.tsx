import { useReducer, useEffect, type ReactNode } from "react";
import { stockService } from "../services/stock-service";
import { WebSocketService } from "../services/websocket-service";
import type { StockState, StockAction, StockFilter, Stock } from "../types";
import { StockContext } from "./stock.context";

const websocketService = new WebSocketService();
const initialState: StockState = {
  stocks: [],
  quotes: new Map(),
  popularStocks: [],
  loading: false,
  error: null,
  filter: {
    sortBy: "name",
    sortOrder: "asc",
  },
  connectionStatus: {
    connected: false,
    reconnectAttempts: 0,
  },
  searchResults: [],
  searchLoading: false,
};

function stockReducer(state: StockState, action: StockAction): StockState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_STOCKS":
      return { ...state, stocks: action.payload, loading: false };

    case "SET_POPULAR_STOCKS":
      return { ...state, popularStocks: action.payload };

    case "UPDATE_QUOTE": {
      const newQuotes = new Map(state.quotes);
      newQuotes.set(action.payload.symbol, action.payload.quote);

      // Update corresponding stock in the stocks array
      const updatedStocks = state.stocks.map((stock) => {
        if (stock.symbol === action.payload.symbol) {
          return {
            ...stock,
            price: action.payload.quote.price,
            change: action.payload.quote.change,
            changePercent: action.payload.quote.changePercent,
            volume: action.payload.quote.volume,
            lastUpdate: action.payload.quote.timestamp,
          };
        }
        return stock;
      });

      const updatedPopularStocks = state.popularStocks.map((stock) => {
        if (stock.symbol === action.payload.symbol) {
          return {
            ...stock,
            price: action.payload.quote.price,
            change: action.payload.quote.change,
            changePercent: action.payload.quote.changePercent,
            volume: action.payload.quote.volume,
            lastUpdate: action.payload.quote.timestamp,
          };
        }
        return stock;
      });

      return {
        ...state,
        quotes: newQuotes,
        stocks: updatedStocks,
        popularStocks: updatedPopularStocks,
      };
    }

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.payload };

    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload };

    case "SET_SEARCH_LOADING":
      return { ...state, searchLoading: action.payload };

    case "ADD_STOCK": {
      if (
        !state.stocks.find((stock) => stock.symbol === action.payload.symbol)
      ) {
        return { ...state, stocks: [...state.stocks, action.payload] };
      }
      return state;
    }

    case "REMOVE_STOCK": {
      return {
        ...state,
        stocks: state.stocks.filter((stock) => stock.symbol !== action.payload),
      };
    }

    default:
      return state;
  }
}

export function StockProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);
  useEffect(() => {
    websocketService.subscribeToConnectionStatus((status) => {
      dispatch({ type: "SET_CONNECTION_STATUS", payload: status });
    });

    return () => {
      websocketService.unsubscribeFromConnectionStatus();
    };
  }, []);

  const actions = {
    loadPopularStocks: async () => {
      // Prevent multiple simultaneous calls
      if (state.loading) return;

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await stockService.getPopularStocks();
        if (response.error) {
          dispatch({ type: "SET_ERROR", payload: response.error });
        } else {
          dispatch({ type: "SET_POPULAR_STOCKS", payload: response.data });

          if (state.popularStocks.length === 0) {
            response.data.forEach((stock) => {
              websocketService.subscribeWithSimulation(
                stock.symbol,
                (message) => {
                  if (message.type === "quote" && message.data) {
                    dispatch({
                      type: "UPDATE_QUOTE",
                      payload: { symbol: stock.symbol, quote: message.data },
                    });
                  }
                }
              );
            });
          }
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error
              ? error.message
              : "Failed to load popular stocks",
        });
      }
    },

    searchStocks: async (query: string) => {
      if (!query.trim()) {
        dispatch({ type: "SET_SEARCH_RESULTS", payload: [] });
        return;
      }

      dispatch({ type: "SET_SEARCH_LOADING", payload: true });
      try {
        const response = await stockService.searchStocks(query);
        if (response.error) {
          dispatch({ type: "SET_ERROR", payload: response.error });
        } else {
          // Convert search results to Stock format
          const stocks: Stock[] = await Promise.all(
            response.data.slice(0, 10).map(async (result) => {
              const quoteResponse = await stockService.getStockQuote(
                result.symbol
              );
              if (quoteResponse.data && !quoteResponse.error) {
                return {
                  symbol: result.symbol,
                  name: result.name,
                  price: quoteResponse.data.price,
                  change: quoteResponse.data.change,
                  changePercent: quoteResponse.data.changePercent,
                  volume: quoteResponse.data.volume,
                  lastUpdate: quoteResponse.data.timestamp,
                };
              }
              return {
                symbol: result.symbol,
                name: result.name,
                price: 0,
                change: 0,
                changePercent: 0,
                volume: 0,
                lastUpdate: new Date().toISOString(),
              };
            })
          );
          dispatch({ type: "SET_SEARCH_RESULTS", payload: stocks });
        }
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to search stocks",
        });
      } finally {
        dispatch({ type: "SET_SEARCH_LOADING", payload: false });
      }
    },

    subscribeToStock: (symbol: string) => {
      websocketService.subscribeWithSimulation(symbol, (message) => {
        if (message.type === "quote" && message.data) {
          dispatch({
            type: "UPDATE_QUOTE",
            payload: { symbol, quote: message.data },
          });
        } else if (message.type === "error") {
          dispatch({
            type: "SET_ERROR",
            payload: message.message || "WebSocket error",
          });
        }
      });
    },

    unsubscribeFromStock: (symbol: string) => {
      websocketService.unsubscribe(symbol);
    },

    updateFilter: (filter: StockFilter) => {
      dispatch({ type: "SET_FILTER", payload: filter });
    },

    addStock: (stock: Stock) => {
      dispatch({ type: "ADD_STOCK", payload: stock });
      actions.subscribeToStock(stock.symbol);
    },

    removeStock: (symbol: string) => {
      dispatch({ type: "REMOVE_STOCK", payload: symbol });
      actions.unsubscribeFromStock(symbol);
    },

    reconnectWebSocket: () => {
      websocketService.reconnect();
    },
  };

  return (
    <StockContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </StockContext.Provider>
  );
}
