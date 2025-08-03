import {  useContext } from 'react';
import { StockContext } from '../context/stock.context';
export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}