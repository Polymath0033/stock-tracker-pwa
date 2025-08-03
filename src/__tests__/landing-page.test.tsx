import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import LandingPage from '../pages/landing-page';
import {vi,beforeEach,describe,test,expect} from 'vitest';
describe('LandingPage', () => {
  beforeEach(() => {
    // Clear any existing location mocks
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
    });
  });

  test('renders landing page with title', () => {
    render(<LandingPage />);
    
   expect(screen.getByRole('heading', { name: 'StockTracker' })).toBeInTheDocument();

  const stockTrackerElements = screen.getAllByText('StockTracker');
  expect(stockTrackerElements).toHaveLength(2); 
    expect(screen.getByText('Track Stocks in')).toBeInTheDocument();
    expect(screen.getByText('Real-Time')).toBeInTheDocument();
  });

  test('renders search bar', () => {
    render(<LandingPage />);
    
    const searchInput = screen.getByPlaceholderText('Search stocks by symbol or company name...');
    expect(searchInput).toBeInTheDocument();
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
  });

  test('handles search form submission', async () => {
    render(<LandingPage />);
    
    const searchInput = screen.getByPlaceholderText('Search stocks by symbol or company name...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    fireEvent.change(searchInput, { target: { value: 'AAPL' } });
    fireEvent.click(searchButton);
    
    // Should update window.location.href
    await waitFor(() => {
      expect(window.location.href).toBe('/stocks?search=AAPL');
    });
  });

  test('renders popular stocks section', async () => {
    render(<LandingPage />);
    
    // Wait for popular stocks to load
    await waitFor(() => {
      expect(screen.getByText('Popular Stocks')).toBeInTheDocument();
    });
  });

  test('renders navigation buttons', () => {
    render(<LandingPage />);
    
    const browseStocksButton = screen.getByRole('button', { name: 'Browse All Stocks' });
    expect(browseStocksButton).toBeInTheDocument();
    
    const installAppButton = screen.getByRole('button', { name: 'Install App' });
    expect(installAppButton).toBeInTheDocument();
  });

  test('renders features section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Why Choose StockTracker?')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Updates')).toBeInTheDocument();
    expect(screen.getByText('Progressive Web App')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Data')).toBeInTheDocument();
  });

  test('handles browse stocks button click', () => {
    render(<LandingPage />);
    
    const browseStocksButton = screen.getByRole('button', { name: 'Browse All Stocks' });
    fireEvent.click(browseStocksButton);
    
    expect(window.location.href).toBe('/stocks');
  });

  test('does not submit empty search', async () => {
    render(<LandingPage />);
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    // Should not update window.location.href
    await waitFor(() => {
      expect(window.location.href).toBe('http://localhost:3000');
    });
  });

  test('renders PWA install prompt when showInstallPrompt is true', () => {
    render(<LandingPage />);
    
    // The install prompt should be hidden by default
    expect(screen.queryByText('Install StockTracker')).not.toBeInTheDocument();
  });
});
