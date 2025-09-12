-- Migration to add commission tracking to trade counter database
-- Run this script to add commission fields to existing tables

-- 1. Add commission fields to trade_entries table
ALTER TABLE trade_entries 
ADD COLUMN commission_rate DECIMAL(10,2) DEFAULT 0.16,
ADD COLUMN contract_count INTEGER DEFAULT 2,
ADD COLUMN total_commission DECIMAL(10,2) GENERATED ALWAYS AS (commission_rate * contract_count) STORED,
ADD COLUMN net_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - (commission_rate * contract_count)) STORED;

-- 2. Add commission fields to daily_trade_summaries table
ALTER TABLE daily_trade_summaries
ADD COLUMN total_commissions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN average_net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 3. Add commission fields to daily_symbol_performance table  
ALTER TABLE daily_symbol_performance
ADD COLUMN total_commissions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN average_net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 4. Update existing trade_entries to have default commission values (if any exist)
UPDATE trade_entries 
SET commission_rate = 0.16, contract_count = 2
WHERE commission_rate IS NULL OR contract_count IS NULL;

-- 5. Create indexes for new commission fields
CREATE INDEX idx_trade_entries_net_amount ON trade_entries(net_amount DESC);
CREATE INDEX idx_trade_entries_commission ON trade_entries(total_commission);

-- 6. Update the monthly_performance view to include commission data
DROP VIEW IF EXISTS monthly_performance;
CREATE VIEW monthly_performance AS
SELECT 
    DATE_TRUNC('month', trade_date) as month,
    COUNT(*) as trading_days,
    SUM(total_trades) as total_trades,
    SUM(total_amount) as total_amount,
    SUM(total_net_amount) as total_net_amount,
    SUM(total_commissions) as total_commissions,
    AVG(total_amount) as avg_daily_amount,
    AVG(total_net_amount) as avg_daily_net_amount,
    SUM(total_gains) as total_gains,
    SUM(total_losses) as total_losses,
    SUM(positive_entries) as total_wins,
    SUM(negative_entries) as total_losses_count
FROM daily_trade_summaries
GROUP BY DATE_TRUNC('month', trade_date)
ORDER BY month DESC;

-- 7. Update the top_symbols_all_time view to include commission data
DROP VIEW IF EXISTS top_symbols_all_time;
CREATE VIEW top_symbols_all_time AS
SELECT 
    symbol,
    COUNT(*) as days_traded,
    SUM(trade_count) as total_trades,
    SUM(total_amount) as total_amount,
    SUM(total_net_amount) as total_net_amount,
    SUM(total_commissions) as total_commissions,
    AVG(total_amount) as avg_daily_amount,
    AVG(total_net_amount) as avg_daily_net_amount
FROM daily_symbol_performance
GROUP BY symbol
ORDER BY total_net_amount DESC;

-- 8. Create a new view for commission analysis
CREATE VIEW commission_analysis AS
SELECT 
    trade_date,
    total_trades,
    total_amount as gross_amount,
    total_net_amount as net_amount,
    total_commissions,
    CASE 
        WHEN total_amount != 0 THEN ROUND((total_commissions / ABS(total_amount)) * 100, 2)
        ELSE 0 
    END as commission_percentage,
    (total_amount - total_net_amount) as commission_impact
FROM daily_trade_summaries
ORDER BY trade_date DESC;
