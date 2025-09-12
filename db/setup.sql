-- Database setup script for DelHub
-- Run this as postgres superuser to create the database

-- Create the database
CREATE DATABASE delhub;

-- Connect to the new database
\c delhub;

-- Create the schema (tables, indexes, views)

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

-- Insert some sample data for testing (optional)
INSERT INTO daily_trade_summaries (trade_date, total_trades, total_amount, average_amount, positive_entries, negative_entries, total_gains, total_losses)
VALUES 
    ('2024-01-15', 5, 250.50, 50.10, 3, 2, 350.00, 99.50),
    ('2024-01-16', 8, -125.75, -15.72, 2, 6, 180.25, 306.00),
    ('2024-01-17', 12, 480.25, 40.02, 8, 4, 620.75, 140.50);

INSERT INTO daily_symbol_performance (trade_date, symbol, trade_count, total_amount, average_amount)
VALUES
    ('2024-01-15', 'AAPL', 2, 125.50, 62.75),
    ('2024-01-15', 'TSLA', 3, 125.00, 41.67),
    ('2024-01-16', 'NVDA', 4, -50.25, -12.56),
    ('2024-01-16', 'AAPL', 2, 75.50, 37.75),
    ('2024-01-17', 'SPY', 6, 300.00, 50.00);

-- Display success message
SELECT 'Database setup completed successfully!' as status;
