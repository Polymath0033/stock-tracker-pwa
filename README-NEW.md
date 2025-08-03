# StockTracker PWA 📈

A modern, real-time stock tracking Progressive Web App built with React, TypeScript, and Vite. Features live stock prices, interactive charts, and comprehensive market data with offline capabilities.

## ✨ Features

- 🚀 **Progressive Web App** - Install on any device for native app experience
- 📊 **Real-time Data** - Live stock prices that update every few seconds
- 📈 **Interactive Charts** - Dynamic price charts with multiple time intervals
- 🔍 **Advanced Search** - Search stocks by symbol or company name
- 🎯 **Smart Filtering** - Filter by price, volume, and change percentage
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔄 **Offline Support** - Cached data available when offline
- ⚡ **Fast Performance** - Optimized for speed with Vite and modern bundling

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **PWA**: Vite PWA Plugin with Workbox
- **API**: Alpha Vantage Stock API
- **Testing**: Vitest, React Testing Library
- **Build**: Vite
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Alpha Vantage API key (free at [alphavantage.co](https://www.alphavantage.co/support/#api-key))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-tracker-pwa.git
   cd stock-tracker-pwa
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Alpha Vantage API key
   ```

4. **Start development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📖 Usage

### Landing Page
- Search for stocks by symbol or company name
- View popular stocks with real-time prices
- Install the PWA for offline access

### Stock Listing
- Browse all available stocks
- Use advanced filters (price range, change percentage)
- Sort by name, price, change, or volume
- Real-time price updates

### Stock Details
- View detailed company information
- Interactive price charts (daily, weekly, monthly)
- Key financial metrics
- Real-time price tracking

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test --watch

# Run tests with UI
bun run test:ui
```

## 🏗️ Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview

# Run linting
bun run lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**
   - `VITE_ALPHA_VANTAGE_API_KEY`

### Manual Deployment

1. **Build the project**
   ```bash
   bun run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🔧 Configuration

### API Configuration

The app uses Alpha Vantage API for stock data. Configure your API key in the `.env` file:

```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### PWA Configuration

PWA settings are configured in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Stock Tracker PWA',
    short_name: 'StockTracker',
    theme_color: '#1f2937',
    background_color: '#ffffff',
    display: 'standalone',
    // ... other settings
  }
})
```

## 🏃‍♂️ Performance

- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Load Time**: < 3 seconds on 3G
- **Real-time Updates**: 3-second polling interval
- **Caching**: 30-second API response cache

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

- **Testing**: Automated test suite with coverage
- **Building**: Production build generation
- **Deployment**: Automatic deployment to Vercel
- **Quality**: Lighthouse performance audits
- **Security**: Vulnerability scanning

## 📊 Technical Implementation

### Real-time Data Flow

1. **WebSocket Service** (with polling fallback)
2. **Stock Context** for state management
3. **React Query** for server state
4. **Chart.js** for data visualization

### Architecture

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── services/      # API and WebSocket services
├── context/       # React Context for state
├── hooks/         # Custom React hooks
├── types/         # TypeScript definitions
├── utils/         # Utility functions
└── __tests__/     # Unit tests
```

## 🐛 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Alpha Vantage free tier: 25 requests/minute
   - Implement caching and request queuing

2. **WebSocket Connection**
   - Falls back to polling if WebSocket fails
   - Check network connectivity

3. **PWA Installation**
   - Requires HTTPS in production
   - Check service worker registration

### Debug Mode

Enable debug logging:

```typescript
// In stock-service.ts
console.log('API Response:', response);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for stock market data
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for blazing fast development

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Made with ❤️ using React, TypeScript, and modern web technologies**
