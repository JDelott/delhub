import TradeDashboard from '@/components/TradeDashboard';
import TradingChatbot from '@/components/TradingChatbot';
import SideNavigation from '@/components/SideNavigation';

export default function StockQuantityCounterPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <SideNavigation />
      
      {/* Main Content */}
      <div className="flex-1">
        <TradeDashboard />
        <TradingChatbot />
      </div>
    </div>
  );
}
