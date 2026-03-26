import { UserRoleDtoEnum } from '@repo/dto';

export interface CurrentUserType {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  isSuperAdmin: boolean;
  roles: UserRoleDtoEnum[];
  organizationId: number;
  isActive: boolean;
}
