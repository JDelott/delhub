import { NextRequest, NextResponse } from 'next/server';
import TradierService, { FilteredPutOption, FilteredCallOption } from '@/lib/tradier-service';

// Curated stocks under $50 with active options (verified periodically)
const UNDER_50_STOCKS = [
  // Major Banks & Finance (typically under $50)
  'BAC', 'WFC', 'C', 'USB', 'PNC', 'TFC', 'COF', 'KEY', 'RF', 'FITB',
  'ZION', 'CMA', 'HBAN', 'CFG', 'SIVB', 'SBNY', 'FRC', 'WAL', 'PBCT', 'MTB',
  'JPM', 'GS', 'MS', 'AXP', 'BLK', 'SCHW', 'STT', 'BK', 'NTRS', 'STATE',
  'DFS', 'SYF', 'ALLY', 'LPX', 'EWBC', 'PACW', 'WTFC', 'ONB', 'FHN', 'FULT',
  
  // Blue Chip Dividend Stocks (under $50)
  'F', 'GE', 'T', 'VZ', 'KO', 'PFE', 'MO', 'PM', 'BTI', 'SIRI',
  'KMI', 'ET', 'ENB', 'EPD', 'MPLX', 'WMB', 'TRP', 'KRP', 'PAA', 'ETP',
  'PG', 'JNJ', 'WMT', 'XOM', 'CVX', 'IBM', 'INTC', 'CSCO', 'MMM', 'CAT',
  'JPM', 'V', 'MA', 'HD', 'UNH', 'DIS', 'BA', 'NKE', 'MCD', 'CRM',
  
  // Energy & Oil (many under $50)
  'XOM', 'CVX', 'BP', 'COP', 'EOG', 'OXY', 'SLB', 'HAL', 'BKR', 'PSX',
  'MRO', 'APA', 'DVN', 'CNX', 'AR', 'SM', 'NOG', 'RRC', 'WLL', 'CLR',
  'FANG', 'EQT', 'SWN', 'CHK', 'REI', 'CRC', 'GPOR', 'MTDR', 'PBF', 'VLO',
  'OVV', 'PR', 'CTRA', 'PXD', 'HES', 'MPC', 'TPG', 'OKE', 'TRGP', 'LNG',
  'TELL', 'NEXT', 'CPE', 'MGY', 'CDEV', 'BORR', 'VAL', 'NE', 'VNOM', 'NINE',
  
  // Biotech & Pharmaceuticals (many under $50)
  'PFE', 'BMY', 'GILD', 'TAK', 'GSK', 'NVO', 'SNY', 'TEVA', 'ABBV', 'MRK',
  'BIIB', 'AMGN', 'VRTX', 'CELG', 'REGN', 'ILMN', 'INCY', 'ALXN', 'BMRN', 'TECH',
  'SRPT', 'BLUE', 'FOLD', 'RARE', 'PTCT', 'ACAD', 'HALO', 'SAGE', 'IONS', 'EXEL',
  'ARWR', 'RGNX', 'TGTX', 'CRISPR', 'EDIT', 'NTLA', 'BEAM', 'CRSP', 'VCYT', 'PACB',
  'VCEL', 'FATE', 'CGEM', 'BPMC', 'KURA', 'MRTX', 'ARVN', 'NRIX', 'RXRX', 'CGON',
  'ACHR', 'AGIO', 'ALNY', 'ARCT', 'ARNA', 'BCRX', 'BDTX', 'BGNE', 'BLCM', 'CBAY',
  'CLDX', 'CRBU', 'CYTK', 'DNLI', 'DSGX', 'DVAX', 'EPZM', 'ETNB', 'FOLD', 'FGEN',
  'HZNP', 'IMGN', 'IMMU', 'INVA', 'IRWD', 'KROS', 'LGND', 'LPCN', 'MDGL', 'MYGN',
  'NKTR', 'NVCR', 'OCGN', 'ONCY', 'PCRX', 'PDSB', 'PGEN', 'PRTA', 'QDEL', 'QURE',
  'RCKT', 'RLAY', 'RPTX', 'SAVA', 'SGMO', 'SIGA', 'SUPN', 'SYRS', 'TMDX', 'TPTX',
  'TWST', 'VCEL', 'VKTX', 'VSTM', 'XNCR', 'ZGNX', 'ZLAB', 'ZYME', 'ZYXI', 'ASND',
  'NVAX', 'MRNA', 'BNTX', 'CUR', 'SGEN', 'HUMA', 'ATRC', 'GLPG', 'NBIX', 'CYTH',
  
  // Small/Mid Cap Biotech ETFs
  'XBI', 'IBB', 'ARKG', 'SBIO', 'IDNA', 'GNOM', 'DTIL', 'HELX', 'CNRG', 'BMED',
  
  // REITs (most under $50)
  'O', 'STAG', 'NNN', 'WPC', 'STOR', 'ADC', 'GOOD', 'SRC', 'PINE', 'EPR',
  'LAND', 'GMRE', 'SAFE', 'MPW', 'LTC', 'OHI', 'WELL', 'PEAK', 'HR', 'GTY',
  'IRM', 'PSA', 'EXR', 'CUBE', 'LSI', 'NSA', 'REXR', 'EQR', 'AVB', 'UDR',
  'SPG', 'PLD', 'CCI', 'AMT', 'EQIX', 'DLR', 'VTR', 'VICI', 'NLY', 'AGNC',
  'ARCC', 'MAIN', 'PSEC', 'HTGC', 'ORCC', 'BXMT', 'MORT', 'PMT', 'CIM', 'NYMT',
  
  // Retail & Consumer (under $50)
  'TGT', 'COST', 'HD', 'LOW', 'NKE', 'SBUX', 'MCD', 'DG', 'FIVE', 'BBY',
  'GPS', 'ANF', 'AEO', 'EXPR', 'COTY', 'ELF', 'ULTA', 'LULU', 'DECK', 'CROX',
  'FL', 'DSW', 'SHOE', 'SHOO', 'SCVL', 'HIBB', 'BGFV', 'ASO', 'DICK', 'MODG',
  'WMT', 'KR', 'DLTR', 'CSTL', 'SFM', 'RGLD', 'UNFI', 'IMKTA', 'GO', 'SPTN',
  'VSCO', 'JWN', 'M', 'KSS', 'URBN', 'ROST', 'TJX', 'BURL', 'OLLI', 'BIG',
  
  // Food & Beverage (under $50)
  'KO', 'PEP', 'MDLZ', 'GIS', 'K', 'CPB', 'CAG', 'HRL', 'TSN', 'SJM',
  'MKC', 'CLX', 'CHD', 'PG', 'CL', 'KMB', 'EL', 'AVP', 'COKE', 'FIZZ',
  'CALM', 'LANC', 'SENEA', 'JJSF', 'FARM', 'SAFM', 'CHEF', 'BRID', 'FDP', 'AVO',
  
  // Tech Under $50
  'INTC', 'CSCO', 'IBM', 'HPQ', 'WDC', 'STX', 'MU', 'QCOM', 'TXN', 'AMAT',
  'MCHP', 'XLNX', 'LRCX', 'KLAC', 'MPWR', 'SWKS', 'QRVO', 'MRVL', 'CRUS', 'RMBS',
  'VIAV', 'LITE', 'OCLR', 'FEYE', 'CYBR', 'PFPT', 'MIME', 'CHKP', 'FTNT', 'PANW',
  'ORCL', 'ADBE', 'CRM', 'NOW', 'WDAY', 'TEAM', 'ZM', 'DDOG', 'CRWD', 'ZS',
  'OKTA', 'SPLK', 'TWLO', 'MDB', 'NET', 'FSLY', 'CFLT', 'S', 'DOCU', 'BOX',
  'DBX', 'WORK', 'VEEV', 'COUP', 'PAYC', 'PCTY', 'TTWO', 'EA',
  
  // Communications & Media (under $50)
  'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'CHTR', 'DISH', 'SIRI', 'FOXA', 'FOX',
  'PARA', 'WBD', 'AMC', 'CNK', 'IMAX', 'MSG', 'MSGS', 'LYV', 'EDR', 'REZI',
  'IAC', 'MTCH', 'BMBL', 'SNAP', 'PINS', 'TWTR', 'FB', 'SPOT', 'ROKU', 'FUBO',
  
  // Airlines & Travel (under $50)
  'AAL', 'UAL', 'DAL', 'LUV', 'ALK', 'JBLU', 'SAVE', 'HA', 'MESA', 'SKYW',
  'MAR', 'HLT', 'H', 'IHG', 'WH', 'EXPE', 'BKNG', 'TRIP', 'MMYT', 'ABNB',
  'CCL', 'RCL', 'NCLH', 'CUK', 'ONEW', 'PK', 'HTHT', 'CHH', 'STAY', 'RHP',
  
  // ETFs Under $50
  'IWM', 'XLF', 'XLE', 'XLU', 'XLI', 'XLP', 'XLY', 'XLV', 'XLB', 'XRT',
  'GDX', 'SLV', 'EEM', 'FXI', 'EWZ', 'VEA', 'VWO', 'TLT', 'HYG', 'JNK',
  'GDXJ', 'SILJ', 'URA', 'REMX', 'COPX', 'PICK', 'RING', 'MOO', 'DBA', 'JO',
  'WEAT', 'CORN', 'SOYB', 'CANE', 'BAL', 'COW', 'TAGS', 'FUE', 'CAFE', 'SGG',
  'EFA', 'IEFA', 'IEMG', 'VGK', 'VPL', 'VSS', 'BND', 'AGG', 'LQD', 'EMB',
  'XLK', 'VGT', 'IGV', 'SOXX', 'SMH', 'QTEC', 'TQQQ', 'SQQQ', 'SPXL', 'SPXS',
  
  // Meme/Volatile Stocks (under $50)
  'AMC', 'GME', 'BB', 'NOK', 'PLTR', 'SPCE', 'LCID', 'RIVN', 'NKLA', 'HOOD',
  'WISH', 'CLOV', 'SOFI', 'UPST', 'AFRM', 'SQ', 'PYPL', 'ROKU', 'PTON', 'PENN',
  'DKNG', 'SKLZ', 'FUBO', 'VLDR', 'LIDR', 'LAZR', 'MVIS', 'SENS', 'CLNE', 'PLUG',
  'SPRT', 'IRNT', 'OPAD', 'PROG', 'ATER', 'BBIG', 'CEI', 'SNDL', 'NAKD', 'EXPR',
  'CTRM', 'SHIP', 'TOPS', 'DRYS', 'GLBS', 'DCIX', 'EOSE', 'GREE', 'SUPPORT', 'WKHS',
  
  // Electric Vehicles & Clean Energy (under $50)
  'TSLA', 'NIO', 'XPEV', 'LI', 'LCID', 'RIVN', 'F', 'GM', 'NKLA', 'RIDE',
  'PLUG', 'FCEL', 'BLDP', 'BE', 'CLNE', 'HYLN', 'WKHS', 'CHPT', 'BLNK', 'SBE',
  'ENPH', 'SEDG', 'RUN', 'SPWR', 'NOVA', 'CSIQ', 'JKS', 'DQ', 'SOL', 'MAXN',
  'NEE', 'AES', 'ORSTED', 'ICLN', 'PBW', 'QCLN', 'SMOG', 'ACES', 'FAN', 'GRID',
  
  // Utilities (under $50)
  'NEE', 'DUK', 'SO', 'AEP', 'EXC', 'SRE', 'PEG', 'XEL', 'WEC', 'ES',
  'ED', 'ETR', 'FE', 'AES', 'LNT', 'NI', 'OGE', 'PNW', 'VST', 'AWK',
  'D', 'PCG', 'EIX', 'PPL', 'CMS', 'DTE', 'ATO', 'CNP', 'EVRG', 'PNM',
  'UGI', 'SWX', 'SR', 'NJR', 'NWE', 'MDU', 'BKH', 'AVA', 'HE', 'ALE',
  
  // Healthcare & Medical Devices (under $50)
  'JNJ', 'UNH', 'CVS', 'ANTM', 'CI', 'HUM', 'CNC', 'MOH', 'WCG', 'EHC',
  'MDT', 'ABT', 'TMO', 'DHR', 'SYK', 'BSX', 'ZBH', 'BDX', 'BAX', 'ISRG',
  'VAR', 'HOLX', 'ALGN', 'DXCM', 'ILMN', 'MASI', 'NEOG', 'TFX', 'NVST', 'OMCL',
  'EW', 'COO', 'RMD', 'PODD', 'TDOC', 'VEEV', 'IQV', 'CRL', 'LH', 'DGX',
  'TECH', 'TMDX', 'QGEN', 'EXAS', 'EXACT', 'PACB', 'ILMN', 'A', 'WST', 'PKI',
  
  // Industrial (under $50)
  'GE', 'CAT', 'BA', 'MMM', 'HON', 'UPS', 'FDX', 'LMT', 'RTX', 'DE',
  'EMR', 'ITW', 'PH', 'CMI', 'ETN', 'ROK', 'DOV', 'XYL', 'FLS', 'PNR',
  'AME', 'ROP', 'IEX', 'GNRC', 'CR', 'PWR', 'HUBB', 'AOS', 'BLDR', 'SWK',
  'NOC', 'GD', 'TDG', 'LHX', 'HWM', 'TXT', 'IR', 'OTIS', 'CARR', 'PCAR',
  'WAB', 'JKHY', 'FAST', 'PAYX', 'RSG', 'WM', 'WCN', 'CWST', 'CLH', 'GPN',
  
  // Transportation & Logistics (under $50)
  'UPS', 'FDX', 'CSX', 'UNP', 'NSC', 'KSU', 'CHRW', 'EXPD', 'LSTR', 'ARCB',
  'JBHT', 'KNX', 'SAIA', 'ODFL', 'XPO', 'GXO', 'HUBG', 'WERN', 'YELL', 'USF',
  'UBER', 'LYFT', 'DASH', 'GTLB', 'MRTN', 'MATX', 'KEX', 'SNDR', 'PERY', 'ECHO',
  'AAWW', 'ATSG', 'CAR', 'HTZ', 'AAN', 'CVNA', 'VRM', 'SFT', 'CPRT', 'IAA',
  
  // Cannabis/Alternative (under $50)
  'TLRY', 'CGC', 'ACB', 'CRON', 'SNDL', 'OGI', 'HEXO', 'APHA', 'GRWG', 'SMG',
  'CURLF', 'TCNNF', 'GTBIF', 'CRLBF', 'MSOS', 'THCX', 'YOLO', 'POTX', 'MJ', 'TOKE',
  'IIPR', 'HYFM', 'KERN', 'HMPQ', 'MDCL', 'GWPH', 'ZYNE', 'JAZZ', 'INSM', 'CBDS',
  
  // Mining & Materials (under $50)
  'NEM', 'GOLD', 'AUY', 'KGC', 'HL', 'PAAS', 'AG', 'EGO', 'SSRM', 'MTRN',
  'FCX', 'SCCO', 'TECK', 'BHP', 'RIO', 'VALE', 'CLF', 'X', 'NUE', 'STLD',
  'AA', 'CENX', 'ACH', 'MT', 'TX', 'SID', 'PKX', 'GGB', 'GGBR', 'TMST',
  'FNV', 'WPM', 'RGLD', 'SAND', 'SSL', 'AU', 'BTG', 'IAG', 'CDE', 'NGD',
  
  // Chinese ADRs (many under $50)
  'BABA', 'JD', 'PDD', 'BIDU', 'NIO', 'XPEV', 'LI', 'TME', 'NTES', 'WB',
  'DIDI', 'BEKE', 'IQ', 'VIPS', 'YMM', 'DOYU', 'HUYA', 'QD', 'TIGR', 'FUTU',
  'BILI', 'TAL', 'EDU', 'GOTU', 'COE', 'TEDU', 'DL', 'LAIX', 'GSX', 'UXIN',
  'BZUN', 'VNET', 'WDH', 'FENG', 'SOHU', 'SINA', 'WB', 'MOMO', 'YY', 'JMEI',
  
  // Crypto/Fintech (under $50)
  'COIN', 'HOOD', 'SOFI', 'AFRM', 'SQ', 'PYPL', 'LC', 'UPST', 'OPEN', 'RBLX',
  'MARA', 'RIOT', 'CAN', 'BTBT', 'SOS', 'EBON', 'ANY', 'OSTK', 'TSLA', 'MSTR',
  'HUT', 'BITF', 'HIVE', 'ARBK', 'BFRI', 'CUBI', 'CLSK', 'GREE', 'LGHL', 'SPRT',
  'V', 'MA', 'AXP', 'DFS', 'SYF', 'COF', 'ALLY', 'WFC', 'JPM', 'BAC',
  
  // Gaming & Entertainment (under $50)
  'ATVI', 'EA', 'TTWO', 'ZNGA', 'RBLX', 'U', 'SLGG', 'GNOG', 'DKNG', 'PENN',
  'MGM', 'LVS', 'WYNN', 'CZR', 'BYD', 'MLCO', 'GDEN', 'MCRI', 'PLAY', 'RRR',
  'DIS', 'NFLX', 'PARA', 'WBD', 'AMC', 'CNK', 'IMAX', 'MSG', 'MSGS', 'LYV',
  
  // Real Estate & Construction (under $50)
  'LEN', 'DHI', 'PHM', 'NVR', 'KBH', 'TOL', 'MTH', 'TMHC', 'MHO', 'LGIH',
  'GRBK', 'CCS', 'CVCO', 'TPH', 'ALCO', 'BZH', 'HOVNP', 'MDC', 'KFS', 'TRI',
  'HD', 'LOW', 'WSM', 'FL', 'TOL', 'LEN', 'DHI', 'PHM', 'KBH', 'NVR',
  
  // Specialty Retail & E-commerce (under $50)
  'AMZN', 'WMT', 'TGT', 'COST', 'HD', 'LOW', 'TJX', 'ROST', 'DG', 'DLTR',
  'BBY', 'FIVE', 'BIG', 'OLLI', 'BURL', 'URBN', 'ANF', 'AEO', 'GPS', 'M',
  'ETSY', 'EBAY', 'SHOP', 'W', 'OSTK', 'CHWY', 'PETS', 'PETQ', 'WOOF', 'BARK'
];

// Premium stocks (mix of prices, some over $50)
const PREMIUM_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'DIS',
  'BABA', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'SPOT', 'SQ', 'SHOP',
  'ZOOM', 'DOCU', 'SNOW', 'COIN', 'RBLX', 'NET', 'CRWD', 'ZS', 'DDOG', 'MDB',
  'SPY', 'QQQ', 'VOO', 'VTI', 'GLD', 'ARKK', 'ARKQ', 'ARKG', 'ARKF', 'ARKW'
];

export const STRIKE_RANGES = [
  { 
    value: 'tight', 
    label: '1-2% Away', 
    desc: 'Very close to current price',
    minPercentage: 1,
    maxPercentage: 2
  },
  { 
    value: 'moderate', 
    label: '2-3% Away', 
    desc: 'Moderate distance from price',
    minPercentage: 2,
    maxPercentage: 3
  },
  { 
    value: 'wide', 
    label: '3-5% Away', 
    desc: 'Standard trading range',
    minPercentage: 3,
    maxPercentage: 5
  },
  { 
    value: 'extended', 
    label: '5-10% Away', 
    desc: 'Extended range for volatility',
    minPercentage: 5,
    maxPercentage: 10
  }
] as const;

export interface OptionsScreenerRequest {
  symbols?: string[];
  exactSpreads?: number[]; // Changed to array
  minBid?: number;
  maxResults?: number;
  expirationFilter?: 'all' | 'near' | 'far';
  priceFilter?: 'all' | 'under50' | 'under25' | 'verified50'; // Enhanced price filter
  maxStockPrice?: number; // New: explicit price cap
  minAverageVolume?: number; // New: minimum average volume requirement
  optionType?: 'puts' | 'calls' | 'both'; // New: option type selection
  strikeRange?: 'tight' | 'moderate' | 'wide' | 'extended'; // New: predefined ranges
  minOptionVolume?: number; // New: minimum option volume filter
  minOpenInterest?: number; // New: minimum open interest filter
}

export interface StockOptionsResult {
  symbol: string;
  success: boolean;
  error?: string;
  expirations: string[];
  bestPutOptions: FilteredPutOption[]; // Renamed for clarity
  bestCallOptions: FilteredCallOption[]; // New: call options
  totalPutOptionsFound: number; // Renamed for clarity
  totalCallOptionsFound: number; // New: call options count
  stockPrice?: number;
  averageVolume?: number; // New: include average volume in results
  priceFilterPassed?: boolean; // New: indicates if stock passed price filter
  volumeFilterPassed?: boolean; // New: indicates if stock passed volume filter
}

export interface OptionsScreenerResponse {
  success: boolean;
  data: {
    results: StockOptionsResult[];
    criteria: {
      exactSpreads: number[]; // Changed to array
      minBid: number;
      symbolsScanned: number;
      successfulScans: number;
      maxStockPrice?: number; // New
      minAverageVolume?: number; // New
      strikeRange?: string; // New
    };
    summary: {
      totalOptionsFound: number;
      stocksWithResults: number;
      stocksFiltered: number; // New: how many filtered by price
      stocksFilteredByVolume: number; // New: count of stocks filtered by volume
      topPerformers: StockOptionsResult[];
    };
  };
}



export async function POST(request: NextRequest) {
  try {
    const {
      symbols,
      exactSpreads = [0.15], // Changed to array with default
      minBid = 0.05,
      maxResults = 75,
      expirationFilter = 'all',
      priceFilter = 'under50',
      maxStockPrice,
      minAverageVolume = 1000000,
      optionType = 'puts',
      strikeRange = 'moderate',
      minOptionVolume = 0,
      minOpenInterest = 0
    }: OptionsScreenerRequest = await request.json();

    // Determine price cap and symbol list
    let defaultSymbols = UNDER_50_STOCKS; // Default to under $50 list
    let priceLimit = maxStockPrice;
    
    switch (priceFilter) {
      case 'all':
        defaultSymbols = [...UNDER_50_STOCKS, ...PREMIUM_STOCKS];
        priceLimit = undefined; // No price limit
        break;
      case 'under25':
        defaultSymbols = UNDER_50_STOCKS;
        priceLimit = 25.00;
        break;
      case 'under50':
      case 'verified50':
        defaultSymbols = UNDER_50_STOCKS;
        priceLimit = 50.00;
        break;
    }

    // Use explicit price cap if provided
    if (maxStockPrice) {
      priceLimit = maxStockPrice;
    }

    // Check daily usage limits (simple in-memory tracking)
    const estimatedRequests = (symbols?.length || defaultSymbols.length) * 4; // Rough estimate: quote + expirations + 2 option chains per stock
    
    console.log(`📊 Estimated API requests for this screening: ~${estimatedRequests}`);
    
    // Warn if usage seems high (optional safeguard)
    if (estimatedRequests > 2000) {
      console.warn(`⚠️ High API usage estimated: ${estimatedRequests} requests. Consider reducing stock count or running in smaller batches.`);
    }

    const symbolsToUse = symbols || defaultSymbols;

    console.log(`🔍 Options Screener: Scanning ${symbolsToUse.length} stocks for ${optionType} options`);
    console.log(`📊 Criteria: Spreads=[${exactSpreads.join(', ')}], MinBid=${minBid}, Strike%=${strikeRange}, ExpFilter=${expirationFilter}, PriceFilter=${priceFilter}`);
    console.log(`📊 Volume: MinAvgVolume=${minAverageVolume?.toLocaleString()}, MaxPrice=${priceLimit ? `$${priceLimit}` : 'None'}`);
    
    const symbolsToScan = symbolsToUse;
    
    console.log(`📈 Processing all ${symbolsToScan.length} stocks`);
    
    // Create a single TradierService instance to track stats across the entire screening
    const tradierService = new TradierService();
    
    // Process in batches to respect API rate limits
    const batchSize = 6;
    const results: StockOptionsResult[] = [];
    const totalBatches = Math.ceil(symbolsToScan.length / batchSize);
    
    for (let i = 0; i < symbolsToScan.length; i += batchSize) {
      const batch = symbolsToScan.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📈 Processing batch ${batchNumber}/${totalBatches} (${batch.length} stocks): ${batch.join(', ')}`);
      
      const batchPromises = batch.map(symbol => 
        screenStockWithService(tradierService, symbol, exactSpreads, minBid, expirationFilter, priceLimit, minAverageVolume, optionType, strikeRange, minOptionVolume, minOpenInterest)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress update every 5 batches
      if (batchNumber % 5 === 0 || batchNumber === totalBatches) {
        const processed = Math.min(i + batchSize, symbolsToScan.length);
        console.log(`📊 Progress: ${processed}/${symbolsToScan.length} stocks processed (${Math.round(processed/symbolsToScan.length*100)}%)`);
        
        // Show API stats at intervals
        const stats = tradierService.getApiStats();
        console.log(`📊 Current API usage: ${stats.totalRequests} requests, ${stats.requestsPerSecond.toFixed(1)} req/sec`);
      }
      
      // Longer delay to respect rate limits
      if (i + batchSize < symbolsToScan.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Final API stats
    const finalStats = tradierService.getApiStats();
    console.log(`📊 Final API Stats:`, finalStats);
    console.log(`📊 Total requests: ${finalStats.totalRequests}, Duration: ${finalStats.elapsedSeconds.toFixed(0)}s, Avg rate: ${finalStats.requestsPerSecond.toFixed(1)} req/sec`);
    
    const priceFilteredResults = results.filter(r => r.priceFilterPassed !== false);
    const volumeFilteredResults = priceFilteredResults.filter(r => r.volumeFilterPassed !== false);
    
    // Filter successful results based on option type AND minimum 2 results per company
    const successfulResults = volumeFilteredResults.filter(r => {
      if (optionType === 'puts') return r.success && r.bestPutOptions.length >= 2;
      if (optionType === 'calls') return r.success && r.bestCallOptions.length >= 2;
      return r.success && ((r.bestPutOptions.length >= 2) || (r.bestCallOptions.length >= 2));
    });
    
    const stocksFilteredByPrice = results.length - priceFilteredResults.length;
    const stocksFilteredByVolume = priceFilteredResults.length - volumeFilteredResults.length;
    const totalStocksFiltered = stocksFilteredByPrice + stocksFilteredByVolume;
    
    // Sort by highest individual option volume for better scalping opportunities
    const topPerformers = successfulResults
      .sort((a, b) => {
        // Get highest volume option for each stock based on option type
        const getHighestVolume = (result: StockOptionsResult) => {
          if (optionType === 'puts') {
            return result.bestPutOptions.length > 0 ? Math.max(...result.bestPutOptions.map(opt => opt.volume)) : 0;
          } else if (optionType === 'calls') {
            return result.bestCallOptions.length > 0 ? Math.max(...result.bestCallOptions.map(opt => opt.volume)) : 0;
          } else {
            // For 'both', get the highest volume across all options
            const putVolumes = result.bestPutOptions.map(opt => opt.volume);
            const callVolumes = result.bestCallOptions.map(opt => opt.volume);
            const allVolumes = [...putVolumes, ...callVolumes];
            return allVolumes.length > 0 ? Math.max(...allVolumes) : 0;
          }
        };
        
        const aHighestVolume = getHighestVolume(a);
        const bHighestVolume = getHighestVolume(b);
        
        return bHighestVolume - aHighestVolume; // Sort highest volume first
      })
      .slice(0, maxResults);
    
    const totalOptionsFound = successfulResults.reduce((sum, r) => {
      if (optionType === 'puts') return sum + r.totalPutOptionsFound;
      if (optionType === 'calls') return sum + r.totalCallOptionsFound;
      return sum + r.totalPutOptionsFound + r.totalCallOptionsFound;
    }, 0);
    
    const successfulScans = volumeFilteredResults.filter(r => r.success).length;
    
    console.log(`✅ Options screening complete: ${successfulResults.length}/${symbolsToScan.length} stocks with matching ${optionType}`);
    console.log(`🔍 Filtering results: ${stocksFilteredByPrice} filtered by price, ${stocksFilteredByVolume} filtered by volume`);
    
    return NextResponse.json({
      success: true,
      data: {
        results: topPerformers,
        criteria: {
          exactSpreads,
          minBid,
          symbolsScanned: symbolsToScan.length,
          successfulScans,
          maxStockPrice: priceLimit,
          minAverageVolume,
          strikeRange
        },
        summary: {
          totalOptionsFound,
          stocksWithResults: successfulResults.length,
          stocksFiltered: totalStocksFiltered,
          stocksFilteredByVolume,
          topPerformers: topPerformers.slice(0, 10)
        },
        apiStats: finalStats // Include API usage stats in response
      }
    });

  } catch (error) {
    console.error('Options screener error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Helper function to pass the same TradierService instance
async function screenStockWithService(
  tradierService: TradierService,
  symbol: string,
  exactSpreads: number[], // Changed to array
  minBid: number,
  expirationFilter: 'all' | 'near' | 'far',
  maxStockPrice?: number,
  minAverageVolume?: number,
  optionType: 'puts' | 'calls' | 'both' = 'puts',
  strikeRange: 'tight' | 'moderate' | 'wide' | 'extended' = 'moderate',
  minOptionVolume: number = 0,
  minOpenInterest: number = 0
): Promise<StockOptionsResult> {
  // Same logic as your existing screenStock function, but using the passed tradierService instance
  // instead of creating a new one each time
  try {
    // Get stock quote for current price and volume data
    const quote = await tradierService.getQuote(symbol);
    const stockPrice = quote.last;
    const averageVolume = quote.average_volume;
    
    // Check price filter first
    const priceFilterPassed = !maxStockPrice || stockPrice <= maxStockPrice;
    
    // Check volume filter
    const volumeFilterPassed = !minAverageVolume || averageVolume >= minAverageVolume;
    
    // If either filter fails, return early
    if (!priceFilterPassed || !volumeFilterPassed) {
      return {
        symbol,
        success: false,
        error: !priceFilterPassed 
          ? `Stock price $${stockPrice.toFixed(2)} exceeds maximum $${maxStockPrice?.toFixed(2)}`
          : `Average volume ${averageVolume.toLocaleString()} below minimum ${minAverageVolume?.toLocaleString()}`,
        expirations: [],
        bestPutOptions: [],
        bestCallOptions: [],
        totalPutOptionsFound: 0,
        totalCallOptionsFound: 0,
        stockPrice,
        averageVolume,
        priceFilterPassed,
        volumeFilterPassed
      };
    }
    
    // Get available expirations with debugging
    const expirationResult = await tradierService.getOptionsExpirationsWithDebug(symbol);
    const allExpirations = expirationResult.expirations;
    
    console.log(`📊 ${symbol}: Found ${allExpirations.length} valid expirations`);
    
    if (allExpirations.length === 0) {
      return {
        symbol,
        success: false,
        error: 'No options available',
        expirations: [],
        bestPutOptions: [],
        bestCallOptions: [],
        totalPutOptionsFound: 0,
        totalCallOptionsFound: 0,
        stockPrice,
        averageVolume,
        priceFilterPassed: true,
        volumeFilterPassed: true
      };
    }
    
    // Filter expirations based on criteria
    let expirations = allExpirations;
    const now = new Date();
    
    if (expirationFilter === 'near') {
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expirations = allExpirations.filter(exp => new Date(exp) <= thirtyDaysFromNow);
      console.log(`📅 ${symbol}: Filtered to ${expirations.length} near-term expirations (≤30 days)`);
    } else if (expirationFilter === 'far') {
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expirations = allExpirations.filter(exp => new Date(exp) > thirtyDaysFromNow);
      console.log(`📅 ${symbol}: Filtered to ${expirations.length} long-term expirations (>30 days)`);
    }
    
    if (expirations.length === 0) {
      return {
        symbol,
        success: false,
        error: `No expirations match ${expirationFilter} filter`,
        expirations: allExpirations, // Return all expirations for reference
        bestPutOptions: [],
        bestCallOptions: [],
        totalPutOptionsFound: 0,
        totalCallOptionsFound: 0,
        stockPrice,
        averageVolume,
        priceFilterPassed: true,
        volumeFilterPassed: true
      };
    }
    
    // IMPROVED: Check more expirations, not just first 3
    const maxExpirationsToCheck = Math.min(expirations.length, 6); // Check up to 6 expirations
    const expirationsToCheck = expirations.slice(0, maxExpirationsToCheck);
    
    console.log(`🔍 ${symbol}: Checking ${expirationsToCheck.length} expirations: ${expirationsToCheck.join(', ')}`);
    
    const allFilteredPuts: FilteredPutOption[] = [];
    const allFilteredCalls: FilteredCallOption[] = [];
    
    for (const expiration of expirationsToCheck) {
      try {
        console.log(`   📅 Processing ${symbol} ${expiration}...`);
        
        // Get puts if requested
        if (optionType === 'puts' || optionType === 'both') {
          const filteredPuts = await tradierService.getFilteredPutOptions(
            symbol,
            expiration,
            exactSpreads,
            minBid,
            stockPrice,
            strikeRange,
            minOptionVolume,
            minOpenInterest
          );
          allFilteredPuts.push(...filteredPuts);
          console.log(`      📉 Found ${filteredPuts.length} matching puts`);
        }
        
        // Get calls if requested
        if (optionType === 'calls' || optionType === 'both') {
          const filteredCalls = await tradierService.getFilteredCallOptions(
            symbol,
            expiration,
            exactSpreads,
            minBid,
            stockPrice,
            strikeRange,
            minOptionVolume,
            minOpenInterest
          );
          allFilteredCalls.push(...filteredCalls);
          console.log(`      📈 Found ${filteredCalls.length} matching calls`);
        }
      } catch (error) {
        console.warn(`❌ Failed to get options for ${symbol} ${expiration}:`, error);
        
        // NEW: Categorize errors for better handling
        if (error instanceof Error) {
          if (error.message.includes('Quota')) {
            console.log(`⏳ Rate limited: ${symbol} ${expiration}`);
            // Could add to retry queue here
          } else if (error.message.includes('404')) {
            console.log(`📭 No options available: ${symbol} ${expiration}`);
          } else if (error.message.includes('500')) {
            console.log(`🔧 Server error: ${symbol} ${expiration}`);
          } else {
            console.log(`❓ Unknown error: ${symbol} ${expiration} - ${error.message}`);
          }
        }
      }
    }
    
    // Sort by volume and take top results
    allFilteredPuts.sort((a, b) => b.volume - a.volume);
    allFilteredCalls.sort((a, b) => b.volume - a.volume);
    const bestPutOptions = allFilteredPuts.slice(0, 10); // Increased from 5 to 10
    const bestCallOptions = allFilteredCalls.slice(0, 10); // Increased from 5 to 10
    
    console.log(`✅ ${symbol}: Final results - ${bestPutOptions.length} puts, ${bestCallOptions.length} calls from ${allExpirations.length} total expirations`);
    
    return {
      symbol,
      success: true,
      expirations: allExpirations, // Return ALL available expirations
      bestPutOptions,
      bestCallOptions,
      totalPutOptionsFound: allFilteredPuts.length,
      totalCallOptionsFound: allFilteredCalls.length,
      stockPrice,
      averageVolume,
      priceFilterPassed: true,
      volumeFilterPassed: true
    };
    
  } catch (error) {
    console.error(`❌ Error screening ${symbol}:`, error);
    return {
      symbol,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      expirations: [],
      bestPutOptions: [],
      bestCallOptions: [],
      totalPutOptionsFound: 0,
      totalCallOptionsFound: 0,
      priceFilterPassed: false,
      volumeFilterPassed: false
    };
  }
}
