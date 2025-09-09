
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-12">
            Professional Paper Trading Platform
          </div>
          <h1 className="text-7xl lg:text-9xl font-light leading-none mb-12">
            Master
            <span className="block font-bold" style={{ color: 'var(--purple-400)' }}>
              Trading
            </span>
          </h1>
          <div className="h-px w-24 bg-purple-500 mx-auto mb-12"></div>
          <p className="text-2xl font-light text-zinc-300 mb-16 max-w-2xl mx-auto leading-relaxed">
            Professional-grade paper trading platform featuring real-time market data, 
            AI-powered analysis, and institutional-quality tools.
          </p>
          <div className="space-y-6">
            <a href="/dashboard" 
               className="inline-block bg-white text-black py-6 px-16 text-lg font-medium tracking-wide hover:bg-zinc-100 transition-colors">
              START TRADING NOW
            </a>
            <div>
              <button className="text-sm tracking-wide text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 hover:border-zinc-400 pb-1">
                VIEW FEATURES
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8 mb-24">
            <div className="col-span-12 lg:col-span-3">
              <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">
                Core Capabilities
              </div>
              <h2 className="text-4xl font-light">
                Everything you need for
                <span className="block font-bold text-purple-400">
                  professional trading
                </span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <div className="text-xl text-zinc-300 max-w-2xl">
                From AI-powered analysis to real-time execution, institutional-quality 
                tools for paper trading and market education.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="group">
              <div className="h-1 w-16 bg-purple-500 mb-8 group-hover:w-24 transition-all duration-300"></div>
              <h3 className="text-2xl font-bold mb-6">Real-Time Paper Trading</h3>
              <p className="text-zinc-300 leading-relaxed">
                Execute buy/sell orders with live market data, strategy-based trading 
                with stop losses and targets, plus comprehensive position management.
              </p>
            </div>

            <div className="group">
              <div className="h-1 w-16 bg-coral-500 mb-8 group-hover:w-24 transition-all duration-300"></div>
              <h3 className="text-2xl font-bold mb-6">AI-Powered Analysis</h3>
              <p className="text-zinc-300 leading-relaxed">
                Get BUY/HOLD/SELL recommendations, portfolio risk assessments, 
                market research with web search, and contextual trading insights.
              </p>
            </div>

            <div className="group">
              <div className="h-1 w-16 bg-zinc-400 mb-8 group-hover:w-24 transition-all duration-300"></div>
              <h3 className="text-2xl font-bold mb-6">Pattern Recognition</h3>
              <p className="text-zinc-300 leading-relaxed">
                Advanced pattern screener with confidence scoring, technical 
                indicators, and visual chart patterns for informed trading decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-32 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8 mb-24">
            <div className="col-span-12 lg:col-span-4">
              <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">
                Advanced Features
              </div>
              <h2 className="text-5xl font-light leading-tight">
                Professional
                <span className="block font-bold text-purple-400">
                  Grade Tools
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 border border-zinc-800">
            <div className="p-8 border-r border-b border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-purple-400 mb-4">01</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-purple-400 transition-colors">
                Live Portfolio Tracking
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Real-time portfolio values, P&L tracking, and performance analytics 
                with market status indicators.
              </p>
            </div>

            <div className="p-8 border-r border-b border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-coral-400 mb-4">02</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-coral-400 transition-colors">
                AI Trading Assistant
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Contextual chat support with stock knowledge, portfolio insights, 
                and trading recommendations.
              </p>
            </div>

            <div className="p-8 border-r border-b border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">03</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-zinc-300 transition-colors">
                Technical Analysis
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Built-in indicators, candlestick charts, support/resistance levels, 
                and pattern detection.
              </p>
            </div>

            <div className="p-8 border-b border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-purple-400 mb-4">04</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-purple-400 transition-colors">
                Strategy Automation
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Create trading strategies with auto-execution, position sizing, 
                and risk management rules.
              </p>
            </div>

            <div className="p-8 border-r border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-coral-400 mb-4">05</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-coral-400 transition-colors">
                Market Research
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AI-powered market search with real-time web data and comprehensive 
                stock screening tools.
              </p>
            </div>

            <div className="p-8 border-r border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-4">06</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-zinc-300 transition-colors">
                Risk Management
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Portfolio risk assessment, correlation analysis, and position 
                concentration monitoring.
              </p>
            </div>

            <div className="p-8 border-r border-zinc-800 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-purple-400 mb-4">07</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-purple-400 transition-colors">
                Smart Alerts
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Price and volume alerts with customizable triggers for market 
                opportunities and risks.
              </p>
            </div>

            <div className="p-8 hover:bg-zinc-900 transition-colors group">
              <div className="text-xs tracking-[0.3em] uppercase text-coral-400 mb-4">08</div>
              <h4 className="text-lg font-bold mb-4 group-hover:text-coral-400 transition-colors">
                Complete History
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Detailed transaction logs, position timelines, and portfolio 
                performance over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 mb-8">
              How It Works
            </div>
            <h2 className="text-6xl font-light">
              Start trading in
              <span className="block font-bold text-purple-400">
                minutes
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border border-purple-500 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <span className="text-2xl font-light group-hover:text-black">01</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Search & Analyze</h3>
              <div className="h-px w-16 bg-purple-500 mx-auto mb-6"></div>
              <p className="text-zinc-300 leading-relaxed">
                Use AI-powered stock search and pattern screener to discover 
                trading opportunities with confidence scores and technical analysis.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border border-coral-500 flex items-center justify-center group-hover:bg-coral-500 transition-colors">
                <span className="text-2xl font-light group-hover:text-black">02</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Execute Strategies</h3>
              <div className="h-px w-16 bg-coral-500 mx-auto mb-6"></div>
              <p className="text-zinc-300 leading-relaxed">
                Create and execute trading strategies with real market data, 
                automated stop losses, and position sizing recommendations.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 border border-zinc-400 flex items-center justify-center group-hover:bg-zinc-400 transition-colors">
                <span className="text-2xl font-light group-hover:text-black">03</span>
              </div>
              <h3 className="text-2xl font-bold mb-6">Track & Learn</h3>
              <div className="h-px w-16 bg-zinc-400 mx-auto mb-6"></div>
              <p className="text-zinc-300 leading-relaxed">
                Monitor your portfolio in real-time, analyze performance metrics, 
                and get AI insights to improve your trading skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-purple-500/10 to-coral-500/10 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl font-light leading-tight mb-8">
            Ready to master
            <span className="block font-bold text-purple-400">
              the markets?
            </span>
          </h2>
          <div className="h-px w-32 bg-purple-500 mx-auto mb-12"></div>
          <p className="text-xl text-zinc-300 mb-16 max-w-3xl mx-auto leading-relaxed">
            Join the next generation of traders using AI-powered analysis, 
            real-time data, and professional-grade tools to build winning strategies.
          </p>
          <a href="/dashboard" 
             className="inline-block bg-white text-black py-6 px-16 text-lg font-medium tracking-wide hover:bg-zinc-100 transition-colors">
            START TRADING FREE
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4 lg:mb-0">
              © 2024 Paper Trader AI. All rights reserved.
            </div>
            <div className="h-px flex-1 bg-zinc-900 mx-8 hidden lg:block"></div>
            <div className="text-xs tracking-[0.3em] uppercase text-zinc-500">
              Professional Trading Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
