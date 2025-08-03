import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, BarChart3, ArrowUpDown, Eye } from 'lucide-react';
import { useStock } from '../hooks/use-stock';
import { LoadingSpinner } from '../components/common/loading-spinner';
import type { StockFilter } from '../types';

const StocksPage: React.FC = () => {
  const { state, actions } = useStock();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState<StockFilter>({
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      actions.searchStocks(searchParam);
    } else {
      if (state.popularStocks.length === 0) {
        actions.loadPopularStocks();
      }
    }
    console.log('StocksPage mounted');
    console.log('Current popular stocks:', state.popularStocks);
    console.log('Current search results:', state.searchResults);
    console.log(state);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      actions.searchStocks(searchQuery.trim());
      window.history.pushState({}, '', `?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFilterChange = (newFilter: Partial<StockFilter>) => {
    const updatedFilter = { ...localFilter, ...newFilter };
    setLocalFilter(updatedFilter);
    actions.updateFilter(updatedFilter);
  };

  const navigateToStock = (symbol: string) => {
    window.location.href = `/stock/${symbol}`;
  };

  const navigateToHome = () => {
    window.location.href = '/';
  };

  const stocksToDisplay = searchQuery.trim() ? state.searchResults : state.popularStocks;

  const sortedStocks = [...stocksToDisplay].sort((a, b) => {
    const { sortBy, sortOrder } = localFilter;
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'change':
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });


  const filteredStocks = sortedStocks.filter(stock => {
    if (localFilter.priceRange) {
      const { min, max } = localFilter.priceRange;
      if (stock.price < min || stock.price > max) return false;
    }
    if (localFilter.changeRange) {
      const { min, max } = localFilter.changeRange;
      if (stock.changePercent < min || stock.changePercent > max) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button onClick={navigateToHome} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">StockTracker</h1>
              </button>
            </div>
            <nav className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${state.connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={state.connectionStatus.connected ? 'Connected' : 'Disconnected'} />
              <span className="text-sm text-gray-600">
                {state.connectionStatus.connected ? 'Live' : 'Offline'}
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
          
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks by symbol or company name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Search
                </button>
              </div>
            </form>

        
            <button
              type='button'
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

       
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="space-y-2">
                    <select
                      value={localFilter.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="change">Change %</option>
                      <option value="volume">Volume</option>
                    </select>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFilterChange({ sortOrder: localFilter.sortOrder === 'asc' ? 'desc' : 'asc' })}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        <span>{localFilter.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={localFilter.priceRange?.min || ''}
                        onChange={(e) => handleFilterChange({
                          priceRange: {
                            min: parseFloat(e.target.value) || 0,
                            max: localFilter.priceRange?.max || 10000
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={localFilter.priceRange?.max || ''}
                        onChange={(e) => handleFilterChange({
                          priceRange: {
                            min: localFilter.priceRange?.min || 0,
                            max: parseFloat(e.target.value) || 10000
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

             
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change % Range</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min %"
                        value={localFilter.changeRange?.min || ''}
                        onChange={(e) => handleFilterChange({
                          changeRange: {
                            min: parseFloat(e.target.value) || -100,
                            max: localFilter.changeRange?.max || 100
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max %"
                        value={localFilter.changeRange?.max || ''}
                        onChange={(e) => handleFilterChange({
                          changeRange: {
                            min: localFilter.changeRange?.min || -100,
                            max: parseFloat(e.target.value) || 100
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Popular Stocks'}
          </h2>
          <span className="text-sm text-gray-600">
            {filteredStocks.length} stocks
          </span>
        </div>

        {(state.loading || state.searchLoading) && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {!state.loading && !state.searchLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigateToStock(stock.symbol)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-200 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${stock.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{stock.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</span>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Vol: {stock.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!state.loading && !state.searchLoading && filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
            <p className="text-gray-600">
              {searchQuery.trim() ? 
                'Try adjusting your search query or filters.' : 
                'Popular stocks will appear here once loaded.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StocksPage;
