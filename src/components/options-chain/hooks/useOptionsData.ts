


import { useCallback } from 'react';
import { OptionsScreenerRequest, ScreenerResults, OptionsData } from '../types';
import { SECTOR_FILTERS } from '../constants';

interface UseOptionsDataProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setExpirations: (expirations: string[]) => void;
  setSelectedExpiration: (expiration: string) => void;
  setOptionsData: (data: OptionsData | null) => void;
  setScreenerResults: (results: ScreenerResults | null) => void;
  setSelectedOptions: (options: Set<string>) => void;
}

export const useOptionsData = ({
  setLoading,
  setError,
  setExpirations,
  setSelectedExpiration,
  setOptionsData,
  setScreenerResults,
  setSelectedOptions
}: UseOptionsDataProps) => {

  const fetchExpirations = useCallback(async (symbol: string) => {
    if (!symbol.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/options/${symbol.toUpperCase()}?action=expirations`);
      const result = await response.json();
      
      if (result.success) {
        setExpirations(result.data.expirations);
        setSelectedExpiration(result.data.expirations[0] || '');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expirations');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setExpirations, setSelectedExpiration]);

  const fetchFilteredPuts = useCallback(async (
    symbol: string,
    selectedExpiration: string,
    selectedSpreads: number[],
    minBid: number,
    strikeRange: 'tight' | 'moderate' | 'wide' | 'extended' = 'moderate'
  ) => {
    if (!symbol.trim() || !selectedExpiration || selectedSpreads.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        action: 'filtered-puts',
        expiration: selectedExpiration,
        exactSpreads: selectedSpreads.join(','), // Join array as comma-separated string
        minBid: minBid.toString(),
        strikeRange: strikeRange
      });
      
      const response = await fetch(`/api/options/${symbol.toUpperCase()}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setOptionsData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch options data');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setOptionsData]);

  const runScreener = useCallback(async (
    customSymbols: string,
    selectedSpreads: number[],
    minBid: number,
    expirationFilter: 'all' | 'near' | 'far',
    priceFilter: 'all' | 'under50' | 'under25' | 'verified50',
    maxStockPrice: number,
    minAverageVolume: number,
    optionType: 'puts' | 'calls',
    sectorFilter: string,
    strikeRange: 'tight' | 'moderate' | 'wide' | 'extended' = 'moderate',
    minOptionVolume: number = 0,
    minOpenInterest: number = 0
  ) => {
    if (selectedSpreads.length === 0) {
      setError('Please select at least one spread value');
      return;
    }

    setLoading(true);
    setError(null);
    setScreenerResults(null);
    setSelectedOptions(new Set());
    
    try {
      let symbols: string[] | undefined;
      
      if (customSymbols.trim()) {
        symbols = customSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
      } else if (sectorFilter !== 'all') {
        const selectedSector = SECTOR_FILTERS.find(s => s.value === sectorFilter);
        symbols = selectedSector?.stocks || undefined;
      }
      
      const requestBody: OptionsScreenerRequest = {
        symbols,
        exactSpreads: selectedSpreads,
        minBid,
        maxResults: 75,
        expirationFilter,
        priceFilter,
        maxStockPrice: maxStockPrice > 0 ? maxStockPrice : undefined,
        minAverageVolume: minAverageVolume > 0 ? minAverageVolume : undefined,
        optionType,
        strikeRange,
        minOptionVolume: minOptionVolume > 0 ? minOptionVolume : undefined,
        minOpenInterest: minOpenInterest > 0 ? minOpenInterest : undefined
      };
      
      const response = await fetch('/api/options/screener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setScreenerResults(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run screener');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setScreenerResults, setSelectedOptions]);

  return {
    fetchExpirations,
    fetchFilteredPuts,
    runScreener
  };
};
