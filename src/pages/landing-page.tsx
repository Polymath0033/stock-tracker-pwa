import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart3, Globe, Smartphone, Zap } from 'lucide-react';
import { useStock } from '../hooks/use-stock';

const LandingPage: React.FC = () => {
  const { state, actions } = useStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (state.popularStocks.length === 0 && !state.loading) {
      const fetchPopularStocks = async () => {
        await actions.loadPopularStocks();
      };

      fetchPopularStocks();
    }
  }, []); 

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/stocks?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navigateToStock = (symbol: string) => {
    window.location.href = `/stock/${symbol}`;
  };

  const navigateToStocks = () => {
    window.location.href = '/stocks';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
     
      {showInstallPrompt && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">Install StockTracker</span>
            </div>
            <button
              type='button'
              onClick={() => setShowInstallPrompt(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1 mb-3">
            Get the full app experience with offline access and notifications
          </p>
          <div className="flex space-x-2">
            <button
              type='button'
              onClick={handleInstallApp}
              className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
            <button
              type='button'
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}


      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">StockTracker</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button
                type="button"
                onClick={navigateToStocks}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Browse Stocks
              </button>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Stocks in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-3">
              Real-Time
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Get live stock prices, interactive charts, and comprehensive market data. 
            Built as a Progressive Web App for the ultimate mobile and desktop experience.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks by symbol or company name..."
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type='button'
              onClick={navigateToStocks}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Browse All Stocks
            </button>
            <button
              type='button'
              onClick={handleInstallApp}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl text-lg font-medium hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Install App
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Popular Stocks</h3>
            <p className="text-gray-600 text-lg">Most tracked stocks updated in real-time</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.popularStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigateToStock(stock.symbol)}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-200 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Live updates</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${stock.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose StockTracker?</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Built with modern web technologies to deliver a native app experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h4>
              <p className="text-gray-600">
                Live stock prices and charts that update every few seconds using WebSocket connections
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Progressive Web App</h4>
              <p className="text-gray-600">
                Install on any device for a native app experience with offline capabilities
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Data</h4>
              <p className="text-gray-600">
                Detailed stock information, interactive charts, and advanced filtering options
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">StockTracker</span>
          </div>
          <p className="text-gray-400 mb-4">
            Built with React, TypeScript, and modern web technologies
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 StockTracker. This is a demo application for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;