import TradeDashboard from '@/components/TradeDashboard';
import TradingChatbot from '@/components/TradingChatbot';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TradeDashboard />
      <TradingChatbot />
    </div>
  );
}
