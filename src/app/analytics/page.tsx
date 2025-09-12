import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SideNavigation from '@/components/SideNavigation';

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <SideNavigation />
      
      {/* Main Content */}
      <div className="flex-1">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
