import { ContactTypeDtoEnum } from '@repo/dto';

export function contactTypeDtoEnumToReadableLabel(dtoEnum: ContactTypeDtoEnum): string {
  const mapping: Record<ContactTypeDtoEnum, string> = {
    [ContactTypeDtoEnum.phone]: 'Phone',
    [ContactTypeDtoEnum.email]: 'Email',
    [ContactTypeDtoEnum.website]: 'Website',
    [ContactTypeDtoEnum.socialMediaLink]: 'Social Media',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}
