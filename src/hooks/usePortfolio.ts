'use client';

import { useCallback } from 'react';

export const usePortfolio = () => {
  const refresh = useCallback(async () => {
    // TODO: Implement portfolio refresh logic
    // This is a placeholder that can be implemented later
    console.log('Portfolio refresh called');
  }, []);

  return {
    refresh
  };
};
