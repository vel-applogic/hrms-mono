export interface ForgotPasswordRequestEmailDto {
  userDisplayName: string;
  link: string;
}

export interface UserActivationRequestEmailDto {
  userDisplayName: string;
  link: string;
}

export interface UserInviteEmailDto {
  userDisplayName: string;
  organizationName: string;
  link: string;
}
