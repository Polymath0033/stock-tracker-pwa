import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3,  Globe, DollarSign, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useStock } from '../hooks/use-stock';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { stockService } from '../services/stock-service';
import type { StockOverview, StockChart } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockDetailPageProps {
  symbol?: string;
}

const StockDetailPage: React.FC<StockDetailPageProps> = ({ symbol: propSymbol }) => {
  const { state, actions } = useStock();
  const [symbol, setSymbol] = useState('');
  const [overview, setOverview] = useState<StockOverview | null>(null);
  const [chartData, setChartData] = useState<StockChart[]>([]);
  const [chartInterval, setChartInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get symbol from props, URL path, or default to AAPL
    const pathSymbol = propSymbol || window.location.pathname.split('/stock/')[1]?.toUpperCase() || 'AAPL';
    setSymbol(pathSymbol);
    
    // Subscribe to real-time updates
    actions.subscribeToStock(pathSymbol);
    
    // Load initial data
    loadStockData(pathSymbol);

    return () => {
      actions.unsubscribeFromStock(pathSymbol);
    };
  }, [propSymbol]);

  const loadStockData = async (stockSymbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load overview and chart data in parallel
      const [overviewResponse, chartResponse] = await Promise.all([
        stockService.getStockOverview(stockSymbol),
        stockService.getStockChart(stockSymbol, chartInterval)
      ]);

      if (overviewResponse.error) {
        setError(overviewResponse.error);
      } else {
        setOverview(overviewResponse.data);
      }

      if (chartResponse.error) {
        console.warn('Chart data error:', chartResponse.error);
      } else {
        setChartData(chartResponse.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleIntervalChange = (interval: 'daily' | 'weekly' | 'monthly') => {
    setChartInterval(interval);
    loadStockData(symbol);
  };

  const goBack = () => {
    window.history.back();
  };

  const navigateToHome = () => {
    window.location.href = '/';
  };

  // Get current quote from state
  const currentQuote = state.quotes.get(symbol);
  const currentStock = state.popularStocks.find(s => s.symbol === symbol) || 
                      state.searchResults.find(s => s.symbol === symbol);

  // Prepare chart data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${symbol} Stock Price - ${chartInterval.charAt(0).toUpperCase() + chartInterval.slice(1)}`,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)',
        },
      },
    },
  };

  const lineChartData = {
    labels: chartData.slice(-30).map(point => new Date(point.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Price',
        data: chartData.slice(-30).map(point => point.close),
        borderColor: currentStock?.changePercent && currentStock.changePercent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: currentStock?.changePercent && currentStock.changePercent >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const currentPrice = currentStock?.price || currentQuote?.price || overview?.analystTargetPrice || 0;
  const currentChange = currentStock?.change || currentQuote?.change || 0;
  const currentChangePercent = currentStock?.changePercent || currentQuote?.changePercent || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                type='button'
                onClick={goBack}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <button onClick={navigateToHome} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">StockTracker</h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${state.connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={state.connectionStatus.connected ? 'Connected' : 'Disconnected'} />
              <span className="text-sm text-gray-600">
                {state.connectionStatus.connected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
                    <div className={`w-3 h-3 rounded-full ${currentChangePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <p className="text-lg text-gray-600 mt-1">{overview?.name || 'Loading...'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{overview?.sector || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{overview?.industry || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <div className="text-4xl font-bold text-gray-900">${currentPrice.toFixed(2)}</div>
                  <div className={`flex items-center justify-end space-x-2 mt-2 ${currentChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentChangePercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="text-lg font-medium">
                      {currentChangePercent >= 0 ? '+' : ''}{currentChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className={`text-sm ${currentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Market Cap</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${overview?.marketCap ? (overview.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Volume</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentStock?.volume?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">P/E Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {overview?.peRatio?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>


            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Price Chart</h2>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                    <button
                      key={interval}
                      onClick={() => handleIntervalChange(interval)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartInterval === interval
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interval.charAt(0).toUpperCase() + interval.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-96">
                {chartData.length > 0 ? (
                  <Line data={lineChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No chart data available
                  </div>
                )}
              </div>
            </div>


            {overview && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {overview.description || 'No description available.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">EPS:</span>
                        <span className="font-medium">{overview.eps?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dividend Yield:</span>
                        <span className="font-medium">{overview.dividendYield?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">52 Week High:</span>
                        <span className="font-medium">${overview.week52High?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">52 Week Low:</span>
                        <span className="font-medium">${overview.week52Low?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Beta:</span>
                        <span className="font-medium">{overview.beta?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StockDetailPage;
