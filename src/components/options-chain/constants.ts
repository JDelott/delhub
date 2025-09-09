import { SectorFilter, VolumeFilter } from './types';

export const SECTOR_FILTERS: SectorFilter[] = [
  {
    value: 'all',
    label: 'All Sectors',
    desc: 'Complete market coverage',
    color: 'slate',
    stocks: []
  },
  {
    value: 'finance',
    label: 'Financial Services',
    desc: 'Banks, finance, and REITs',
    color: 'blue',
    stocks: [
      'BAC', 'WFC', 'C', 'USB', 'PNC', 'TFC', 'COF', 'KEY', 'RF', 'FITB',
      'ZION', 'CMA', 'HBAN', 'CFG', 'SIVB', 'SBNY', 'FRC', 'WAL', 'PBCT', 'MTB',
      'O', 'STAG', 'NNN', 'WPC', 'STOR', 'ADC', 'GOOD', 'SRC', 'PINE', 'EPR',
      'LAND', 'GMRE', 'SAFE', 'MPW', 'LTC', 'OHI', 'WELL', 'PEAK', 'HR', 'GTY',
      'IRM', 'PSA', 'EXR', 'CUBE', 'LSI', 'NSA', 'REXR', 'EQR', 'AVB', 'UDR'
    ]
  },
  {
    value: 'energy',
    label: 'Energy & Oil',
    desc: 'Oil, gas, and energy infrastructure',
    color: 'amber',
    stocks: [
      'XOM', 'CVX', 'BP', 'COP', 'EOG', 'OXY', 'SLB', 'HAL', 'BKR', 'PSX',
      'MRO', 'APA', 'DVN', 'CNX', 'AR', 'SM', 'NOG', 'RRC', 'WLL', 'CLR',
      'FANG', 'EQT', 'SWN', 'CHK', 'REI', 'CRC', 'GPOR', 'MTDR', 'PBF', 'VLO',
      'KMI', 'ET', 'ENB', 'EPD', 'MPLX', 'WMB', 'TRP', 'KRP', 'PAA', 'ETP'
    ]
  },
  {
    value: 'biotech',
    label: 'Biotech & Pharma',
    desc: 'Biotechnology and pharmaceuticals',
    color: 'emerald',
    stocks: [
      'PFE', 'BMY', 'GILD', 'TAK', 'GSK', 'NVO', 'SNY', 'TEVA', 'ABBV', 'MRK',
      'BIIB', 'AMGN', 'VRTX', 'CELG', 'REGN', 'ILMN', 'INCY', 'ALXN', 'BMRN', 'TECH',
      'SRPT', 'BLUE', 'FOLD', 'RARE', 'PTCT', 'ACAD', 'HALO', 'SAGE', 'IONS', 'EXEL',
      'ARWR', 'RGNX', 'TGTX', 'CRISPR', 'EDIT', 'NTLA', 'BEAM', 'CRSP', 'VCYT', 'PACB',
      'XBI', 'IBB', 'ARKG', 'SBIO', 'IDNA', 'GNOM', 'DTIL', 'HELX', 'CNRG', 'BMED'
    ]
  },
  {
    value: 'tech',
    label: 'Technology',
    desc: 'Tech, semiconductors, and software',
    color: 'violet',
    stocks: [
      'INTC', 'CSCO', 'IBM', 'HPQ', 'WDC', 'STX', 'MU', 'QCOM', 'TXN', 'AMAT',
      'MCHP', 'XLNX', 'LRCX', 'KLAC', 'MPWR', 'SWKS', 'QRVO', 'MRVL', 'CRUS', 'RMBS',
      'AMD', 'NVDA', 'TSM', 'AVGO', 'ON', 'SLAB', 'CREE', 'WOLF', 'POWER', 'ADI', 'NXPI'
    ]
  },
  {
    value: 'consumer',
    label: 'Consumer & Retail',
    desc: 'Retail, consumer goods, and services',
    color: 'pink',
    stocks: [
      'TGT', 'COST', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD', 'DG', 'FIVE', 'BBY',
      'GPS', 'ANF', 'AEO', 'EXPR', 'COTY', 'ELF', 'ULTA', 'LULU', 'DECK', 'CROX',
      'F', 'GE', 'T', 'VZ', 'KO', 'MO', 'PM', 'BTI', 'SIRI'
    ]
  },
  {
    value: 'industrial',
    label: 'Industrial & Materials',
    desc: 'Manufacturing, mining, and materials',
    color: 'orange',
    stocks: [
      'NEM', 'GOLD', 'AUY', 'KGC', 'HL', 'PAAS', 'AG', 'EGO', 'SSRM', 'MTRN',
      'FCX', 'SCCO', 'TECK', 'BHP', 'RIO', 'VALE', 'CLF', 'X', 'NUE', 'STLD'
    ]
  },
  {
    value: 'crypto',
    label: 'Crypto & Fintech',
    desc: 'Cryptocurrency and financial technology',
    color: 'cyan',
    stocks: [
      'COIN', 'HOOD', 'SOFI', 'AFRM', 'SQ', 'PYPL', 'LC', 'UPST', 'OPEN', 'RBLX',
      'MARA', 'RIOT', 'CAN', 'BTBT', 'SOS', 'EBON', 'ANY', 'MSTR'
    ]
  }
];

export const VOLUME_FILTERS: VolumeFilter[] = [
  {
    value: 0,
    label: 'No Volume Filter',
    desc: 'Include all stocks regardless of volume',
    displayValue: 'No Filter'
  },
  {
    value: 100000,
    label: '100K+ Volume',
    desc: 'Minimum 100,000 average daily volume',
    displayValue: '100K+'
  },
  {
    value: 500000,
    label: '500K+ Volume',
    desc: 'Minimum 500,000 average daily volume',
    displayValue: '500K+'
  },
  {
    value: 1000000,
    label: '1M+ Volume',
    desc: 'Minimum 1 million average daily volume',
    displayValue: '1M+'
  },
  {
    value: 2000000,
    label: '2M+ Volume',
    desc: 'Minimum 2 million average daily volume',
    displayValue: '2M+'
  },
  {
    value: 5000000,
    label: '5M+ Volume',
    desc: 'Minimum 5 million average daily volume',
    displayValue: '5M+'
  },
  {
    value: 10000000,
    label: '10M+ Volume',
    desc: 'Minimum 10 million average daily volume',
    displayValue: '10M+'
  }
];

export const STRIKE_RANGES = [
  { 
    value: 'tight', 
    label: '1%+ Away', 
    desc: 'Very close to current price',
    minPercentage: 1,
    isMinimumThreshold: true
  },
  { 
    value: 'moderate', 
    label: '3%+ Away', 
    desc: 'Standard distance (original)',
    minPercentage: 3,
    isMinimumThreshold: true
  },
  { 
    value: 'wide', 
    label: '5%+ Away', 
    desc: 'Conservative distance',
    minPercentage: 5,
    isMinimumThreshold: true
  },
  { 
    value: 'extended', 
    label: '10%+ Away', 
    desc: 'Deep out-of-the-money',
    minPercentage: 10,
    isMinimumThreshold: true
  }
] as const;

export const SPREAD_OPTIONS = [
  { value: 0.05, label: '$0.05', desc: 'Very tight spreads' },
  { value: 0.10, label: '$0.10', desc: 'Tight spreads' },
  { value: 0.15, label: '$0.15', desc: 'Standard spreads' },
  { value: 0.20, label: '$0.20', desc: 'Moderate spreads' },
  { value: 0.25, label: '$0.25', desc: 'Wide spreads' },
  { value: 0.30, label: '$0.30', desc: 'Wider spreads' },
  { value: 0.50, label: '$0.50', desc: 'Very wide spreads' }
] as const;
