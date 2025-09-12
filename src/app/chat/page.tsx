import ChatAssistant from '@/components/ChatAssistant';
import SideNavigation from '@/components/SideNavigation';

export default function ChatPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <SideNavigation />
      
      {/* Main Content */}
      <div className="flex-1">
        <ChatAssistant />
      </div>
    </div>
  );
}
