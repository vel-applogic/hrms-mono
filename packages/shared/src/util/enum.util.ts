import { ContactTypeDtoEnum, HolidayTypeDtoEnum } from '@repo/dto';

export function contactTypeDtoEnumToReadableLabel(dtoEnum: ContactTypeDtoEnum): string {
  const mapping: Record<ContactTypeDtoEnum, string> = {
    [ContactTypeDtoEnum.phone]: 'Phone',
    [ContactTypeDtoEnum.email]: 'Email',
    [ContactTypeDtoEnum.website]: 'Website',
    [ContactTypeDtoEnum.socialMediaLink]: 'Social Media',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}

export function holidayTypeDtoEnumToReadableLabel(dtoEnum: HolidayTypeDtoEnum): string {
  const mapping: Record<HolidayTypeDtoEnum, string> = {
    [HolidayTypeDtoEnum.national]: 'National',
    [HolidayTypeDtoEnum.state]: 'State',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}
