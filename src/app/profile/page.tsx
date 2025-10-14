import { ProfileLayout } from '@/components/sections/profile/layout';
import { ProfileTabs } from '@/components/sections/profile/tabs';
import MainLayout from '../main-layout';
import { ProfileChecker } from '@/components/sections/profile/profile-checker';

export default function ProfilePage() {
  return (
    <MainLayout>
      <ProfileChecker />
      <ProfileLayout 
        title="Profile Settings" 
        description="Manage your profile information and preferences"
      >
        <ProfileTabs />
      </ProfileLayout>
    </MainLayout>
  );
}