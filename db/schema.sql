-- PostgreSQL Schema for Trade Counter Daily Results
-- This schema tracks daily aggregated results from the trade counter

-- Table to store daily trade summaries
CREATE TABLE daily_trade_summaries (
    id SERIAL PRIMARY KEY,
    trade_date DATE NOT NULL UNIQUE,
    total_trades INTEGER NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    average_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    positive_entries INTEGER NOT NULL DEFAULT 0,
    negative_entries INTEGER NOT NULL DEFAULT 0,
    total_gains DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_losses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store daily symbol performance
CREATE TABLE daily_symbol_performance (
    id SERIAL PRIMARY KEY,
    trade_date DATE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    trade_count INTEGER NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    average_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trade_date, symbol)
);

-- Table to store individual trade entries (for detailed analysis)
CREATE TABLE trade_entries (
    id SERIAL PRIMARY KEY,
    trade_date DATE NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    entry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_daily_summaries_date ON daily_trade_summaries(trade_date DESC);
CREATE INDEX idx_symbol_performance_date ON daily_symbol_performance(trade_date DESC);
CREATE INDEX idx_symbol_performance_symbol ON daily_symbol_performance(symbol);
CREATE INDEX idx_trade_entries_date ON trade_entries(trade_date DESC);
CREATE INDEX idx_trade_entries_symbol ON trade_entries(symbol);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_daily_trade_summaries_updated_at 
    BEFORE UPDATE ON daily_trade_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW monthly_performance AS
SELECT 
    DATE_TRUNC('month', trade_date) as month,
    COUNT(*) as trading_days,
    SUM(total_trades) as total_trades,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_daily_amount,
    SUM(total_gains) as total_gains,
    SUM(total_losses) as total_losses,
    SUM(positive_entries) as total_wins,
    SUM(negative_entries) as total_losses_count
FROM daily_trade_summaries
GROUP BY DATE_TRUNC('month', trade_date)
ORDER BY month DESC;

CREATE VIEW top_symbols_all_time AS
SELECT 
    symbol,
    COUNT(*) as days_traded,
    SUM(trade_count) as total_trades,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_daily_amount
FROM daily_symbol_performance
GROUP BY symbol
ORDER BY total_amount DESC;
