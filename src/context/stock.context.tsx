import { createContext } from 'react';
import type {StockContextValue} from "../types"


export const StockContext = createContext<StockContextValue | undefined>(undefined);