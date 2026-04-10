import { ContactTypeDtoEnum, DeviceStatusDtoEnum, DeviceTypeDtoEnum, HolidayTypeDtoEnum } from '@repo/dto';

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

export function deviceTypeDtoEnumToReadableLabel(dtoEnum: DeviceTypeDtoEnum): string {
  const mapping: Record<DeviceTypeDtoEnum, string> = {
    [DeviceTypeDtoEnum.mobile]: 'Mobile',
    [DeviceTypeDtoEnum.tablet]: 'Tablet',
    [DeviceTypeDtoEnum.laptop]: 'Laptop',
    [DeviceTypeDtoEnum.cpu]: 'CPU',
    [DeviceTypeDtoEnum.keyboard]: 'Keyboard',
    [DeviceTypeDtoEnum.mouse]: 'Mouse',
    [DeviceTypeDtoEnum.headphone]: 'Headphone',
    [DeviceTypeDtoEnum.other]: 'Other',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}

export function deviceStatusDtoEnumToReadableLabel(dtoEnum: DeviceStatusDtoEnum): string {
  const mapping: Record<DeviceStatusDtoEnum, string> = {
    [DeviceStatusDtoEnum.good]: 'Good',
    [DeviceStatusDtoEnum.physicallyDamaged]: 'Physically Damaged',
    [DeviceStatusDtoEnum.notWorking]: 'Not Working',
    [DeviceStatusDtoEnum.lost]: 'Lost',
    [DeviceStatusDtoEnum.stolen]: 'Stolen',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}
