import { ContactTypeDtoEnum, DeviceStatusDtoEnum, DeviceTypeDtoEnum, ExpenseForecastFrequencyDtoEnum, ExpenseTypeDtoEnum, HolidayTypeDtoEnum, NotificationLinkDtoEnum, ReimbursementStatusDtoEnum } from '@repo/dto';

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

export function expenseTypeDtoEnumToReadableLabel(dtoEnum: ExpenseTypeDtoEnum): string {
  const mapping: Record<ExpenseTypeDtoEnum, string> = {
    [ExpenseTypeDtoEnum.salary]: 'Salary',
    [ExpenseTypeDtoEnum.incomeTax]: 'Income Tax',
    [ExpenseTypeDtoEnum.rent]: 'Rent',
    [ExpenseTypeDtoEnum.ai]: 'AI',
    [ExpenseTypeDtoEnum.emailService]: 'Email Service',
    [ExpenseTypeDtoEnum.server]: 'Server',
    [ExpenseTypeDtoEnum.internet]: 'Internet',
    [ExpenseTypeDtoEnum.phone]: 'Phone',
    [ExpenseTypeDtoEnum.account]: 'Account',
    [ExpenseTypeDtoEnum.auditor]: 'Auditor',
    [ExpenseTypeDtoEnum.roc]: 'ROC',
    [ExpenseTypeDtoEnum.digitalSignature]: 'Digital Signature',
    [ExpenseTypeDtoEnum.other]: 'Other',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}

export function expenseForecastFrequencyDtoEnumToReadableLabel(dtoEnum: ExpenseForecastFrequencyDtoEnum): string {
  const mapping: Record<ExpenseForecastFrequencyDtoEnum, string> = {
    [ExpenseForecastFrequencyDtoEnum.monthly]: 'Monthly',
    [ExpenseForecastFrequencyDtoEnum.yearly]: 'Yearly',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}

export function reimbursementStatusDtoEnumToReadableLabel(dtoEnum: ReimbursementStatusDtoEnum): string {
  const mapping: Record<ReimbursementStatusDtoEnum, string> = {
    [ReimbursementStatusDtoEnum.pending]: 'Pending',
    [ReimbursementStatusDtoEnum.approved]: 'Approved',
    [ReimbursementStatusDtoEnum.paid]: 'Paid',
    [ReimbursementStatusDtoEnum.rejected]: 'Rejected',
  };

  return mapping[dtoEnum] ?? dtoEnum;
}

export function notificationLinkDtoEnumToRoute(dtoEnum: NotificationLinkDtoEnum): string {
  const mapping: Record<NotificationLinkDtoEnum, string> = {
    [NotificationLinkDtoEnum.dashboard]: '/dashboard',
    [NotificationLinkDtoEnum.employee]: '/employee',
    [NotificationLinkDtoEnum.leaves]: '/leaves',
    [NotificationLinkDtoEnum.reimbursement]: '/reimbursement',
    [NotificationLinkDtoEnum.device]: '/device',
    [NotificationLinkDtoEnum.payroll]: '/payroll/compensation',
    [NotificationLinkDtoEnum.candidate]: '/candidate',
    [NotificationLinkDtoEnum.policy]: '/policy',
    [NotificationLinkDtoEnum.expense]: '/expense',
    [NotificationLinkDtoEnum.organization]: '/organization',
    [NotificationLinkDtoEnum.user]: '/user',
    [NotificationLinkDtoEnum.empDashboard]: '/emp/dashboard',
    [NotificationLinkDtoEnum.empLeave]: '/emp/leave',
    [NotificationLinkDtoEnum.empDetails]: '/emp/details',
    [NotificationLinkDtoEnum.empDocuments]: '/emp/documents',
    [NotificationLinkDtoEnum.empPayroll]: '/emp/payroll',
    [NotificationLinkDtoEnum.empDevice]: '/emp/device',
    [NotificationLinkDtoEnum.empReimbursement]: '/emp/reimbursement',
    [NotificationLinkDtoEnum.empFeedbacks]: '/emp/feedbacks',
    [NotificationLinkDtoEnum.empPolicy]: '/emp/policy',
  };

  return mapping[dtoEnum] ?? '/dashboard';
}
