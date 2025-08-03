import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import StocksPage from '../pages/stocks-page';
import {vi, beforeEach, describe, test, expect} from 'vitest';
describe('StocksPage', () => {
  beforeEach(() => {
    
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
        back: vi.fn(),
       
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/stocks',
        pathname: '/stocks',
        search: '',
        hash: '',
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
    });
  });

  test('renders stocks page with title', () => {
    render(<StocksPage />);
    
    expect(screen.getByText('StockTracker')).toBeInTheDocument();
    expect(screen.getByText('Popular Stocks')).toBeInTheDocument();
  });

  test('renders search bar', () => {
    render(<StocksPage />);
    
    const searchInput = screen.getByPlaceholderText('Search stocks by symbol or company name...');
    expect(searchInput).toBeInTheDocument();
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
  });

  test('renders filters toggle button', () => {
    render(<StocksPage />);
    
    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    expect(filtersButton).toBeInTheDocument();
  });

  test('shows filters panel when filters button is clicked', () => {
    render(<StocksPage />);
    
    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    fireEvent.click(filtersButton);
    
    expect(screen.getByText('Sort By')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Change % Range')).toBeInTheDocument();
  });

  test('handles search form submission', async () => {
    render(<StocksPage />);
    
    const searchInput = screen.getByPlaceholderText('Search stocks by symbol or company name...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    fireEvent.click(searchButton);
    
    // Should update URL
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '?search=AAPL');
    });
  });

  test('renders connection status', () => {
    render(<StocksPage />);
    
    // Should show live status
   expect(screen.getByText('Offline')).toBeInTheDocument();

   const statusIndicator = screen.getByTitle('Disconnected');
   expect(statusIndicator).toBeInTheDocument();
   expect(statusIndicator).toHaveClass('bg-red-500');
  });

  test('renders back to home button', () => {
    render(<StocksPage />);
    
    const homeButton = screen.getByRole('button', { name: 'StockTracker' });
    expect(homeButton).toBeInTheDocument();
  });

  test('handles sort by change', () => {
    render(<StocksPage />);
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    fireEvent.click(filtersButton);
    
    // Change sort option
    const sortSelect = screen.getByDisplayValue('Name');
    fireEvent.change(sortSelect, { target: { value: 'price' } });
    
    expect(sortSelect).toHaveValue('price');
  });

  test('handles price range filter', () => {
    render(<StocksPage />);
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: 'Filters' });
    fireEvent.click(filtersButton);
    
    // Set price range
    const minPriceInput = screen.getByPlaceholderText('Min');
    const maxPriceInput = screen.getByPlaceholderText('Max');
    
    fireEvent.change(minPriceInput, { target: { value: '100' } });
    fireEvent.change(maxPriceInput, { target: { value: '200' } });
    
    expect(minPriceInput).toHaveValue(100);
    expect(maxPriceInput).toHaveValue(200);
  });

  test('handles URL search parameter', () => {
    // Mock URL with search parameter
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/stocks?search=AAPL',
        pathname: '/stocks',
        search: '?search=AAPL',
        hash: '',
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
    });

    render(<StocksPage />);
    
    // Should show search results title
    expect(screen.getByText('Search Results for "AAPL"')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<StocksPage />);
    
    // Should show loading spinner initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('does not submit empty search', async () => {
    render(<StocksPage />);


    const searchInput = screen.getByPlaceholderText('Search stocks by symbol or company name...');
    fireEvent.change(searchInput, { target: { value: '' } });

    vi.clearAllMocks();
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    // Should not update URL
    await waitFor(() => {
      expect(window.history.pushState).not.toHaveBeenCalled();
    });
  });
});
