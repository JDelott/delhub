# Database Setup Guide

This guide will help you set up PostgreSQL for the DelHub trading analytics system.

## Prerequisites

1. **PostgreSQL Installation**
   - Install PostgreSQL on your system
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/

2. **Environment Variables**
   Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_DATABASE=delhub

# API Keys (existing)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TRADIER_API_KEY=your_tradier_api_key_here
TRADIER_BASE_URL=https://sandbox.tradier.com
```

## Database Setup Steps

1. **Start PostgreSQL Service**
   ```bash
   # macOS (with Homebrew)
   brew services start postgresql
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

2. **Create Database and User**
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres
   
   # Create database
   CREATE DATABASE delhub;
   
   # Create user (optional, you can use postgres user)
   CREATE USER delhub_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE delhub TO delhub_user;
   
   # Exit
   \q
   ```

3. **Run Database Schema**
   ```bash
   # Apply the schema to your database
   psql -U postgres -d delhub -f db/schema.sql
   ```

## Features

### Daily Trade Logging
- **Endpoint**: `POST /api/daily-summary`
- **Purpose**: Log daily trade results from the trade counter
- **Data Stored**: 
  - Daily summaries (total trades, P&L, win/loss counts)
  - Symbol performance by day
  - Individual trade entries

### Analytics Dashboard
- **Route**: `/analytics`
- **Features**:
  - Overview metrics (total days, trades, P&L, win rate)
  - Best/worst trading days
  - Top performing symbols
  - Monthly performance trends
  - Recent daily performance

### Database Schema

#### Tables:
1. **daily_trade_summaries** - Aggregated daily statistics
2. **daily_symbol_performance** - Symbol-specific daily performance
3. **trade_entries** - Individual trade records

#### Views:
1. **monthly_performance** - Monthly aggregated data
2. **top_symbols_all_time** - All-time symbol rankings

## Usage

1. **Log Daily Results**: Use the "Log Daily Summary" button in the Trade Counter dashboard
2. **View Analytics**: Navigate to the Analytics page to see historical performance
3. **API Access**: Use the `/api/analytics` endpoint for programmatic access

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready -U postgres`
- Check environment variables in `.env.local`
- Ensure database exists: `psql -U postgres -l`

### Permission Issues
- Grant proper permissions: `GRANT ALL ON SCHEMA public TO your_user;`
- For all tables: `GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;`

### Schema Issues
- Re-run schema: `psql -U postgres -d delhub -f db/schema.sql`
- Check table existence: `\dt` in psql

## Professional Color Palette

The analytics dashboard uses a modern, professional color palette with subtle hue changes, avoiding bootstrap-looking colors and heavy gradients, as preferred by the user.

## Development Notes

- No ORM is used - direct SQL queries for better performance
- Connection pooling is implemented for scalability
- Proper error handling and logging
- TypeScript interfaces for type safety
