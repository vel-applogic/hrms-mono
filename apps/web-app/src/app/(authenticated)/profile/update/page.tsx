import { UpdateProfileForm } from '@/feature/account/update-profile-form';
import { accountService } from '@/lib/service/account.service';

export default async function ProfileUpdatePage() {
  const profile = await accountService.getProfile();

  return <UpdateProfileForm initialFirstname={profile.firstname} initialLastname={profile.lastname} email={profile.email} />;
}
