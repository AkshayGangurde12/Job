import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardHeader = ({ userName, onSettingsClick }) => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {getGreeting()}, {userName || 'User'}!
        </h1>
        <p className="text-gray-600">
          Welcome to your dashboard. Manage your resume and job preferences here.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="flex items-center gap-2 hover:bg-gray-50"
          aria-label="Open user settings"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
