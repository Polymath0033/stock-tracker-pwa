export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  industry?: string;
  lastUpdate: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface StockChart {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearch {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: number;
}

export interface StockOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  pegRatio: number;
  bookValue: number;
  dividendPerShare: number;
  dividendYield: number;
  eps: number;
  revenuePerShareTTM: number;
  profitMargin: number;
  operatingMarginTTM: number;
  returnOnAssetsTTM: number;
  returnOnEquityTTM: number;
  revenueTTM: number;
  grossProfitTTM: number;
  dilutedEPSTTM: number;
  quarterlyEarningsGrowthYOY: number;
  quarterlyRevenueGrowthYOY: number;
  analystTargetPrice: number;
  trailingPE: number;
  forwardPE: number;
  priceToSalesRatioTTM: number;
  priceToBookRatio: number;
  evToRevenue: number;
  evToEbitda: number;
  beta: number;
  week52High: number;
  week52Low: number;
  day50MovingAverage: number;
  day200MovingAverage: number;
  sharesOutstanding: number;
  sharesFloat: number;
  sharesShort: number;
  sharesShortPriorMonth: number;
  shortRatio: number;
  shortPercentOutstanding: number;
  shortPercentFloat: number;
  percentInsiders: number;
  percentInstitutions: number;
  forwardAnnualDividendRate: number;
  forwardAnnualDividendYield: number;
  payoutRatio: number;
  dividendDate: string;
  exDividendDate: string;
  lastSplitFactor: string;
  lastSplitDate: string;
}

export interface WebSocketMessage {
  type: 'quote' | 'error' | 'connection';
  data?: StockQuote;
  message?: string;
  symbol?: string;
}

export interface StockFilter {
  sector?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  volumeRange?: {
    min: number;
    max: number;
  };
  changeRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'price' | 'change' | 'volume' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: string;
  reconnectAttempts: number;
  error?: string;
}



export interface StockState {
  stocks: Stock[];
  quotes: Map<string, StockQuote>;
  popularStocks: Stock[];
  loading: boolean;
  error: string | null;
  filter: StockFilter;
  connectionStatus: ConnectionStatus;
  searchResults: Stock[];
  searchLoading: boolean;
}

export type StockAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STOCKS'; payload: Stock[] }
  | { type: 'SET_POPULAR_STOCKS'; payload: Stock[] }
  | { type: 'UPDATE_QUOTE'; payload: { symbol: string; quote: StockQuote } }
  | { type: 'SET_FILTER'; payload: StockFilter }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_SEARCH_RESULTS'; payload: Stock[] }
  | { type: 'SET_SEARCH_LOADING'; payload: boolean }
  | { type: 'ADD_STOCK'; payload: Stock }
  | { type: 'REMOVE_STOCK'; payload: string };



export interface StockContextValue {
  state: StockState;
  dispatch: React.Dispatch<StockAction>;
  actions: {
    loadPopularStocks: () => Promise<void>;
    searchStocks: (query: string) => Promise<void>;
    subscribeToStock: (symbol: string) => void;
    unsubscribeFromStock: (symbol: string) => void;
    updateFilter: (filter: StockFilter) => void;
    addStock: (stock: Stock) => void;
    removeStock: (symbol: string) => void;
    reconnectWebSocket: () => void;
  };
}