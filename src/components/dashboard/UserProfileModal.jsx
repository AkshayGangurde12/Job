import { useState } from 'react';
import { X, User, Mail, Lock, FileText, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useResume } from '@/hooks/useResume';
import ProfileEditForm from './ProfileEditForm';
import PasswordChangeForm from './PasswordChangeForm';
import ActivityHistory from './ActivityHistory';
import ResumeInfo from './ResumeInfo';

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const {
    profile,
    updateProfile,
    changePassword,
    activityHistory,
    loadMoreActivity,
    isLoading,
    isUpdating,
    hasMoreActivity,
    error,
  } = useUserProfile();
  const { resume } = useResume();

  const handleClose = () => {
    setActiveTab('profile'); // Reset to first tab when closing
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
              <DialogDescription>
                Manage your account information and view your activity
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Resume</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="profile" className="mt-0 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your personal details and contact information.
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ProfileEditForm
                      profile={profile}
                      onUpdate={updateProfile}
                      isUpdating={isUpdating}
                      error={error}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="password" className="mt-0 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Change Password</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your password to keep your account secure.
                    </p>
                  </div>

                  <PasswordChangeForm
                    onChangePassword={changePassword}
                    isUpdating={isUpdating}
                    error={error}
                  />
                </div>
              </TabsContent>

              <TabsContent value="resume" className="mt-0 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Resume Information</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View details about your uploaded resume.
                    </p>
                  </div>

                  <ResumeInfo resume={resume} />
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Activity History</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View your recent account activity and changes.
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ActivityHistory
                      activities={activityHistory}
                      onLoadMore={loadMoreActivity}
                      hasMore={hasMoreActivity}
                      error={error}
                    />
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
