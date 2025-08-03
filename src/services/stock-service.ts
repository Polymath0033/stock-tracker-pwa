import type {
  Stock,
  StockQuote,
  StockChart,
  StockSearch,
  StockOverview,
  ApiResponse,
  AlphaVantageSearchResponse,
  AlphaVantageSearchMatch,
  AlphaVantageQuoteResponse,
  AlphaVantageTimeSeriesResponse,
  AlphaVantageTimeSeriesData,
  AlphaVantageOverviewResponse,
} from "../types";

class StockService {
  private baseUrl = "https://www.alphavantage.co/query";
  private apiKey: string;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 30000;

  constructor() {
    this.apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "demo";
  }

  private async fetchWithCache<T>(
    url: string,
    cacheKey: string
  ): Promise<ApiResponse<T>> {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        data: cached.data as T,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data["Error Message"]) {
        throw new Error(data["Error Message"]);
      }

      if (data["Note"]) {
        throw new Error(
          "API call frequency limit reached. Please try again later."
        );
      }

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return {
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: null as T,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      };
    }
  }

  async searchStocks(keywords: string): Promise<ApiResponse<StockSearch[]>> {
    const url = `${
      this.baseUrl
    }?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${
      this.apiKey
    }`;
    const cacheKey = `search_${keywords}`;

    const response = await this.fetchWithCache<AlphaVantageSearchResponse>(
      url,
      cacheKey
    );
    if (response.error) {
      return response as ApiResponse<StockSearch[]>;
    }

    const matches = response.data?.bestMatches || [];
    const searchResults: StockSearch[] = matches.map(
      (match: AlphaVantageSearchMatch) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
        marketOpen: match["5. marketOpen"],
        marketClose: match["6. marketClose"],
        timezone: match["7. timezone"],
        currency: match["8. currency"],
        matchScore: parseFloat(match["9. matchScore"]),
      })
    );

    return {
      data: searchResults,
      timestamp: response.timestamp,
    };
  }

  async getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
    const cacheKey = `quote_${symbol}`;

    const response = await this.fetchWithCache<AlphaVantageQuoteResponse>(
      url,
      cacheKey
    );

    if (response.error) {
      return response as unknown as ApiResponse<StockQuote>;
    }

    const quote = response.data["Global Quote"];
    if (!quote) {
      return {
        data: null as unknown as StockQuote,
        error: "No quote data available",
        timestamp: response.timestamp,
      };
    }

    const stockQuote: StockQuote = {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      open: parseFloat(quote["02. open"]),
      previousClose: parseFloat(quote["08. previous close"]),
      timestamp: quote["07. latest trading day"],
    };

    return {
      data: stockQuote,
      timestamp: response.timestamp,
    };
  }

  async getStockChart(
    symbol: string,
    interval: "daily" | "weekly" | "monthly" = "daily"
  ): Promise<ApiResponse<StockChart[]>> {
    const functionMap = {
      daily: "TIME_SERIES_DAILY",
      weekly: "TIME_SERIES_WEEKLY",
      monthly: "TIME_SERIES_MONTHLY",
    };

    const url = `${this.baseUrl}?function=${functionMap[interval]}&symbol=${symbol}&apikey=${this.apiKey}`;
    const cacheKey = `chart_${symbol}_${interval}`;

    const response = await this.fetchWithCache<AlphaVantageTimeSeriesResponse>(
      url,
      cacheKey
    );

    if (response.error) {
      return response as ApiResponse<StockChart[]>;
    }

    const timeSeriesKey =
      interval === "daily"
        ? "Time Series (Daily)"
        : interval === "weekly"
        ? "Weekly Time Series"
        : "Monthly Time Series";

    const timeSeries = response.data[timeSeriesKey];
    if (!timeSeries) {
      return {
        data: [],
        error: "No chart data available",
        timestamp: response.timestamp,
      };
    }

    const chartData: StockChart[] = Object.entries(timeSeries)
      .map(([timestamp, data]: [string, AlphaVantageTimeSeriesData]) => ({
        timestamp,
        open: parseFloat(data["1. open"]),
        high: parseFloat(data["2. high"]),
        low: parseFloat(data["3. low"]),
        close: parseFloat(data["4. close"]),
        volume: parseInt(data["5. volume"]),
      }))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    return {
      data: chartData,
      timestamp: response.timestamp,
    };
  }

  async getStockOverview(symbol: string): Promise<ApiResponse<StockOverview>> {
    const url = `${this.baseUrl}?function=OVERVIEW&symbol=${symbol}&apikey=${this.apiKey}`;
    const cacheKey = `overview_${symbol}`;

    const response = await this.fetchWithCache<AlphaVantageOverviewResponse>(
      url,
      cacheKey
    );

    if (response.error) {
      return response as unknown as ApiResponse<StockOverview>;
    }

    const overview = response.data;
    if (!overview.Symbol) {
      return {
        data: null as unknown as StockOverview,
        error: "No overview data available",
        timestamp: response.timestamp,
      };
    }

    const stockOverview: StockOverview = {
      symbol: overview.Symbol,
      name: overview.Name,
      description: overview.Description,
      sector: overview.Sector,
      industry: overview.Industry,
      marketCap: parseInt(overview.MarketCapitalization) || 0,
      peRatio: parseFloat(overview.PERatio) || 0,
      pegRatio: parseFloat(overview.PEGRatio) || 0,
      bookValue: parseFloat(overview.BookValue) || 0,
      dividendPerShare: parseFloat(overview.DividendPerShare) || 0,
      dividendYield: parseFloat(overview.DividendYield) || 0,
      eps: parseFloat(overview.EPS) || 0,
      revenuePerShareTTM: parseFloat(overview.RevenuePerShareTTM) || 0,
      profitMargin: parseFloat(overview.ProfitMargin) || 0,
      operatingMarginTTM: parseFloat(overview.OperatingMarginTTM) || 0,
      returnOnAssetsTTM: parseFloat(overview.ReturnOnAssetsTTM) || 0,
      returnOnEquityTTM: parseFloat(overview.ReturnOnEquityTTM) || 0,
      revenueTTM: parseFloat(overview.RevenueTTM) || 0,
      grossProfitTTM: parseFloat(overview.GrossProfitTTM) || 0,
      dilutedEPSTTM: parseFloat(overview.DilutedEPSTTM) || 0,
      quarterlyEarningsGrowthYOY:
        parseFloat(overview.QuarterlyEarningsGrowthYOY) || 0,
      quarterlyRevenueGrowthYOY:
        parseFloat(overview.QuarterlyRevenueGrowthYOY) || 0,
      analystTargetPrice: parseFloat(overview.AnalystTargetPrice) || 0,
      trailingPE: parseFloat(overview.TrailingPE) || 0,
      forwardPE: parseFloat(overview.ForwardPE) || 0,
      priceToSalesRatioTTM: parseFloat(overview.PriceToSalesRatioTTM) || 0,
      priceToBookRatio: parseFloat(overview.PriceToBookRatio) || 0,
      evToRevenue: parseFloat(overview.EVToRevenue) || 0,
      evToEbitda: parseFloat(overview.EVToEBITDA) || 0,
      beta: parseFloat(overview.Beta) || 0,
      week52High: parseFloat(overview["52WeekHigh"]) || 0,
      week52Low: parseFloat(overview["52WeekLow"]) || 0,
      day50MovingAverage: parseFloat(overview["50DayMovingAverage"]) || 0,
      day200MovingAverage: parseFloat(overview["200DayMovingAverage"]) || 0,
      sharesOutstanding: parseInt(overview.SharesOutstanding) || 0,
      sharesFloat: parseInt(overview.SharesFloat) || 0,
      sharesShort: parseInt(overview.SharesShort) || 0,
      sharesShortPriorMonth: parseInt(overview.SharesShortPriorMonth) || 0,
      shortRatio: parseFloat(overview.ShortRatio) || 0,
      shortPercentOutstanding:
        parseFloat(overview.ShortPercentOutstanding) || 0,
      shortPercentFloat: parseFloat(overview.ShortPercentFloat) || 0,
      percentInsiders: parseFloat(overview.PercentInsiders) || 0,
      percentInstitutions: parseFloat(overview.PercentInstitutions) || 0,
      forwardAnnualDividendRate:
        parseFloat(overview.ForwardAnnualDividendRate) || 0,
      forwardAnnualDividendYield:
        parseFloat(overview.ForwardAnnualDividendYield) || 0,
      payoutRatio: parseFloat(overview.PayoutRatio) || 0,
      dividendDate: overview.DividendDate || "",
      exDividendDate: overview.ExDividendDate || "",
      lastSplitFactor: overview.LastSplitFactor || "",
      lastSplitDate: overview.LastSplitDate || "",
    };

    return {
      data: stockOverview,
      timestamp: response.timestamp,
    };
  }

  async getPopularStocks(): Promise<ApiResponse<Stock[]>> {
    const popularSymbols = [
      "AAPL",
      "GOOGL",
      "MSFT",
      "AMZN",
      "TSLA",
      "META",
      "NVDA",
      "NFLX",
    ];
    const promises = popularSymbols.map((symbol) => this.getStockQuote(symbol));

    try {
      const responses = await Promise.all(promises);
      const stocks: Stock[] = responses
        .filter((response) => !response.error && response.data)
        .map((response) => {
          const quote = response.data as StockQuote;
          return {
            symbol: quote.symbol,
            name: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            lastUpdate: quote.timestamp,
          };
        });

      return {
        data: stocks,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch popular stocks",
        timestamp: new Date().toISOString(),
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const stockService = new StockService();
