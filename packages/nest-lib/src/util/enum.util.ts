import {
  AuditActivityStatusDbEnum,
  AuditEntityTypeDbEnum,
  AuditEventGroupDbEnum,
  AuditEventTypeDbEnum,
  CandidateProgress,
  CandidateSource,
  CandidateStatus,
  ContactType,
  DeviceStatus,
  DeviceType,
  EmployeeStatusEnum,
  ExpenseForecastFrequency,
    ExpenseType,
  HolidayType,
  LeaveDayHalfEnum,
  LeaveStatusEnum,
  LeaveTypeEnum,
  MediaTypeDbEnum,
  NoOfDaysInMonthDbEnum,
  NotificationLinkDbEnum,
  NoticePeriodUnit,
  ReimbursementStatusDbEnum,
  UserRoleDbEnum,
} from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  CandidateProgressDtoEnum,
  CandidateSourceDtoEnum,
  CandidateStatusDtoEnum,
  ContactTypeDtoEnum,
  DeviceStatusDtoEnum,
  DeviceTypeDtoEnum,
  EmployeeStatusDtoEnum,
  ExpenseForecastFrequencyDtoEnum,
  ExpenseTypeDtoEnum,
  HolidayTypeDtoEnum,
  LeaveDayHalfDtoEnum,
  LeaveStatusDtoEnum,
  LeaveTypeDtoEnum,
  MediaTypeDtoEnum,
  NoOfDaysInMonthDtoEnum,
  NotificationLinkDtoEnum,
  NoticePeriodUnitDtoEnum,
  ReimbursementStatusDtoEnum,
  UserRoleDtoEnum,
} from '@repo/dto';

export function auditEventGroupDtoEnumToDbEnum(dtoEnum: AuditEventGroupDtoEnum): AuditEventGroupDbEnum {
  const mapping: Record<AuditEventGroupDtoEnum, AuditEventGroupDbEnum> = {
    [AuditEventGroupDtoEnum.authentication]: 'authentication',
    [AuditEventGroupDtoEnum.operation]: 'operation',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown AuditEventGroupDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function auditEventGroupDbEnumToDtoEnum(dbEnum: AuditEventGroupDbEnum): AuditEventGroupDtoEnum {
  const mapping: Record<AuditEventGroupDbEnum, AuditEventGroupDtoEnum> = {
    authentication: AuditEventGroupDtoEnum.authentication,
    operation: AuditEventGroupDtoEnum.operation,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown AuditEventGroup: ${dbEnum}`);
  }

  return dtoEnum;
}

export function auditEventTypeDtoEnumToDbEnum(dtoEnum: AuditEventTypeDtoEnum): AuditEventTypeDbEnum {
  const mapping: Record<AuditEventTypeDtoEnum, AuditEventTypeDbEnum> = {
    [AuditEventTypeDtoEnum.login_success]: 'login_success',
    [AuditEventTypeDtoEnum.login_failure]: 'login_failure',
    [AuditEventTypeDtoEnum.create]: 'create',
    [AuditEventTypeDtoEnum.update]: 'update',
    [AuditEventTypeDtoEnum.delete]: 'delete',
    [AuditEventTypeDtoEnum.password_reset]: 'password_reset',
    [AuditEventTypeDtoEnum.password_reset_request]: 'password_reset_request',
    [AuditEventTypeDtoEnum.otp_request]: 'otp_request',
    [AuditEventTypeDtoEnum.register]: 'register',
    [AuditEventTypeDtoEnum.email_verify]: 'email_verify',
    [AuditEventTypeDtoEnum.account_activate]: 'account_activate',
    [AuditEventTypeDtoEnum.confirm]: 'confirm',
    [AuditEventTypeDtoEnum.block_user]: 'block_user',
    [AuditEventTypeDtoEnum.unblock_user]: 'unblock_user',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown AuditEventTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function auditEventTypeDbEnumToDtoEnum(dbEnum: AuditEventTypeDbEnum): AuditEventTypeDtoEnum {
  const mapping: Record<AuditEventTypeDbEnum, AuditEventTypeDtoEnum> = {
    login_success: AuditEventTypeDtoEnum.login_success,
    login_failure: AuditEventTypeDtoEnum.login_failure,
    create: AuditEventTypeDtoEnum.create,
    update: AuditEventTypeDtoEnum.update,
    delete: AuditEventTypeDtoEnum.delete,
    password_reset: AuditEventTypeDtoEnum.password_reset,
    password_reset_request: AuditEventTypeDtoEnum.password_reset_request,
    otp_request: AuditEventTypeDtoEnum.otp_request,
    register: AuditEventTypeDtoEnum.register,
    email_verify: AuditEventTypeDtoEnum.email_verify,
    account_activate: AuditEventTypeDtoEnum.account_activate,
    confirm: AuditEventTypeDtoEnum.confirm,
    block_user: AuditEventTypeDtoEnum.block_user,
    unblock_user: AuditEventTypeDtoEnum.unblock_user,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown AuditEventType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function auditEntityTypeDtoEnumToDbEnum(dtoEnum: AuditEntityTypeDtoEnum): AuditEntityTypeDbEnum {
  const mapping: Record<AuditEntityTypeDtoEnum, AuditEntityTypeDbEnum> = {
    [AuditEntityTypeDtoEnum.user]: 'user',
    [AuditEntityTypeDtoEnum.user_admin]: 'user_admin',
    [AuditEntityTypeDtoEnum.candidate]: 'candidate',
    [AuditEntityTypeDtoEnum.employee]: 'employee',
    [AuditEntityTypeDtoEnum.policy]: 'policy',
    [AuditEntityTypeDtoEnum.device]: 'device',
    [AuditEntityTypeDtoEnum.announcement]: 'announcement',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown AuditEntityTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function auditEntityTypeDbEnumToDtoEnum(dbEnum: AuditEntityTypeDbEnum): AuditEntityTypeDtoEnum {
  const mapping: Record<string, AuditEntityTypeDtoEnum> = {
    user: AuditEntityTypeDtoEnum.user,
    user_admin: AuditEntityTypeDtoEnum.user_admin,
    candidate: AuditEntityTypeDtoEnum.candidate,
    employee: AuditEntityTypeDtoEnum.employee,
    policy: AuditEntityTypeDtoEnum.policy,
    device: AuditEntityTypeDtoEnum.device,
    announcement: AuditEntityTypeDtoEnum.announcement,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown AuditEntityType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function auditActivityStatusDtoEnumToDbEnum(dtoEnum: AuditActivityStatusDtoEnum): AuditActivityStatusDbEnum {
  const mapping: Record<AuditActivityStatusDtoEnum, AuditActivityStatusDbEnum> = {
    [AuditActivityStatusDtoEnum.success]: 'success',
    [AuditActivityStatusDtoEnum.failure]: 'failure',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown AuditActivityStatusDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function auditActivityStatusDbEnumToDtoEnum(dbEnum: AuditActivityStatusDbEnum): AuditActivityStatusDtoEnum {
  const mapping: Record<AuditActivityStatusDbEnum, AuditActivityStatusDtoEnum> = {
    success: AuditActivityStatusDtoEnum.success,
    failure: AuditActivityStatusDtoEnum.failure,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown AuditActivityStatus: ${dbEnum}`);
  }

  return dtoEnum;
}

export function userRoleDtoEnumToDbEnum(dtoEnum: UserRoleDtoEnum): UserRoleDbEnum {
  const mapping: Record<UserRoleDtoEnum, UserRoleDbEnum> = {
    [UserRoleDtoEnum.employee]: 'employee',
    [UserRoleDtoEnum.admin]: 'admin',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown UserRoleDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function userRoleDbEnumToDtoEnum(dbEnum: UserRoleDbEnum): UserRoleDtoEnum {
  const mapping: Record<UserRoleDbEnum, UserRoleDtoEnum> = {
    admin: UserRoleDtoEnum.admin,
    employee: UserRoleDtoEnum.employee,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown UserRoleDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function leaveTypeDbEnumToDtoEnum(dbEnum: LeaveTypeEnum): LeaveTypeDtoEnum {
  const mapping: Record<LeaveTypeEnum, LeaveTypeDtoEnum> = {
    casual: LeaveTypeDtoEnum.casual,
    sick: LeaveTypeDtoEnum.sick,
    medical: LeaveTypeDtoEnum.medical,
    earned: LeaveTypeDtoEnum.earned,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown LeaveTypeEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function leaveTypeDtoEnumToDbEnum(dtoEnum: LeaveTypeDtoEnum): LeaveTypeEnum {
  const mapping: Record<LeaveTypeDtoEnum, LeaveTypeEnum> = {
    [LeaveTypeDtoEnum.casual]: 'casual',
    [LeaveTypeDtoEnum.sick]: 'sick',
    [LeaveTypeDtoEnum.medical]: 'medical',
    [LeaveTypeDtoEnum.earned]: 'earned',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown LeaveTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function leaveStatusDbEnumToDtoEnum(dbEnum: LeaveStatusEnum): LeaveStatusDtoEnum {
  const mapping: Record<LeaveStatusEnum, LeaveStatusDtoEnum> = {
    pending: LeaveStatusDtoEnum.pending,
    approved: LeaveStatusDtoEnum.approved,
    rejected: LeaveStatusDtoEnum.rejected,
    cancelled: LeaveStatusDtoEnum.cancelled,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown LeaveStatusEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function leaveDayHalfDbEnumToDtoEnum(dbEnum: LeaveDayHalfEnum): LeaveDayHalfDtoEnum {
  const mapping: Record<LeaveDayHalfEnum, LeaveDayHalfDtoEnum> = {
    full: LeaveDayHalfDtoEnum.full,
    firstHalf: LeaveDayHalfDtoEnum.firstHalf,
    secondHalf: LeaveDayHalfDtoEnum.secondHalf,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown LeaveDayHalfEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function leaveDayHalfDtoEnumToDbEnum(dtoEnum: LeaveDayHalfDtoEnum): LeaveDayHalfEnum {
  const mapping: Record<LeaveDayHalfDtoEnum, LeaveDayHalfEnum> = {
    [LeaveDayHalfDtoEnum.full]: 'full',
    [LeaveDayHalfDtoEnum.firstHalf]: 'firstHalf',
    [LeaveDayHalfDtoEnum.secondHalf]: 'secondHalf',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown LeaveDayHalfDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function leaveStatusDtoEnumToDbEnum(dtoEnum: LeaveStatusDtoEnum): LeaveStatusEnum {
  const mapping: Record<LeaveStatusDtoEnum, LeaveStatusEnum> = {
    [LeaveStatusDtoEnum.pending]: 'pending',
    [LeaveStatusDtoEnum.approved]: 'approved',
    [LeaveStatusDtoEnum.rejected]: 'rejected',
    [LeaveStatusDtoEnum.cancelled]: 'cancelled',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown LeaveStatusDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function candidateSourceDbEnumToDtoEnum(dbEnum: CandidateSource): CandidateSourceDtoEnum {
  const mapping: Record<CandidateSource, CandidateSourceDtoEnum> = {
    email: CandidateSourceDtoEnum.email,
    googleSearch: CandidateSourceDtoEnum.googleSearch,
    lead: CandidateSourceDtoEnum.lead,
    linkedin: CandidateSourceDtoEnum.linkedin,
    referral: CandidateSourceDtoEnum.referral,
    websiteForm: CandidateSourceDtoEnum.websiteForm,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown CandidateSource: ${dbEnum}`);
  }

  return dtoEnum;
}

export function candidateStatusDbEnumToDtoEnum(dbEnum: CandidateStatus): CandidateStatusDtoEnum {
  const mapping: Record<CandidateStatus, CandidateStatusDtoEnum> = {
    new: CandidateStatusDtoEnum.new,
    planed: CandidateStatusDtoEnum.planed,
    notReachable: CandidateStatusDtoEnum.notReachable,
    selected: CandidateStatusDtoEnum.selected,
    onHold: CandidateStatusDtoEnum.onHold,
    rejected: CandidateStatusDtoEnum.rejected,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown CandidateStatus: ${dbEnum}`);
  }

  return dtoEnum;
}

export function candidateProgressDbEnumToDtoEnum(dbEnum: CandidateProgress): CandidateProgressDtoEnum {
  const mapping: Record<CandidateProgress, CandidateProgressDtoEnum> = {
    new: CandidateProgressDtoEnum.new,
    infoCollected: CandidateProgressDtoEnum.infoCollected,
    lev1InterviewScheduled: CandidateProgressDtoEnum.lev1InterviewScheduled,
    lev1InterviewCompleted: CandidateProgressDtoEnum.lev1InterviewCompleted,
    lev2InterviewScheduled: CandidateProgressDtoEnum.lev2InterviewScheduled,
    lev2InterviewCompleted: CandidateProgressDtoEnum.lev2InterviewCompleted,
    offerReleased: CandidateProgressDtoEnum.offerReleased,
    offerAccepted: CandidateProgressDtoEnum.offerAccepted,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown CandidateProgress: ${dbEnum}`);
  }

  return dtoEnum;
}

export function noticePeriodUnitDbEnumToDtoEnum(dbEnum: NoticePeriodUnit): NoticePeriodUnitDtoEnum {
  const mapping: Record<NoticePeriodUnit, NoticePeriodUnitDtoEnum> = {
    days: NoticePeriodUnitDtoEnum.days,
    weeks: NoticePeriodUnitDtoEnum.weeks,
    months: NoticePeriodUnitDtoEnum.months,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown NoticePeriodUnit: ${dbEnum}`);
  }

  return dtoEnum;
}

export function employeeStatusDbEnumToDtoEnum(dbEnum: EmployeeStatusEnum): EmployeeStatusDtoEnum {
  const mapping: Record<EmployeeStatusEnum, EmployeeStatusDtoEnum> = {
    active: EmployeeStatusDtoEnum.active,
    resigned: EmployeeStatusDtoEnum.resigned,
    onLeave: EmployeeStatusDtoEnum.onLeave,
    terminated: EmployeeStatusDtoEnum.terminated,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown EmployeeStatusEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function noOfDaysInMonthDtoEnumToDbEnum(dtoEnum: NoOfDaysInMonthDtoEnum): NoOfDaysInMonthDbEnum {
  const mapping: Record<NoOfDaysInMonthDtoEnum, NoOfDaysInMonthDbEnum> = {
    [NoOfDaysInMonthDtoEnum.dynamic]: 'dynamic',
    [NoOfDaysInMonthDtoEnum.thirty]: 'thirty',
    [NoOfDaysInMonthDtoEnum.thirtyOne]: 'thirtyOne',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown NoOfDaysInMonthDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function noOfDaysInMonthDbEnumToDtoEnum(dbEnum: NoOfDaysInMonthDbEnum): NoOfDaysInMonthDtoEnum {
  const mapping: Record<NoOfDaysInMonthDbEnum, NoOfDaysInMonthDtoEnum> = {
    dynamic: NoOfDaysInMonthDtoEnum.dynamic,
    thirty: NoOfDaysInMonthDtoEnum.thirty,
    thirtyOne: NoOfDaysInMonthDtoEnum.thirtyOne,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown NoOfDaysInMonthDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function mediaTypeDbEnumToDtoEnum(dbEnum: MediaTypeDbEnum): MediaTypeDtoEnum {
  const mapping: Record<MediaTypeDbEnum, MediaTypeDtoEnum> = {
    doc: MediaTypeDtoEnum.doc,
    image: MediaTypeDtoEnum.image,
    zip: MediaTypeDtoEnum.zip,
    video: MediaTypeDtoEnum.video,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown MediaTypeDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function mediaTypeDtoEnumToDbEnum(dtoEnum: MediaTypeDtoEnum): MediaTypeDbEnum {
  const mapping: Record<MediaTypeDtoEnum, MediaTypeDbEnum> = {
    [MediaTypeDtoEnum.doc]: 'doc',
    [MediaTypeDtoEnum.image]: 'image',
    [MediaTypeDtoEnum.zip]: 'zip',
    [MediaTypeDtoEnum.video]: 'video',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown MediaTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function contactTypeDbEnumToDtoEnum(dbEnum: ContactType): ContactTypeDtoEnum {
  const mapping: Record<ContactType, ContactTypeDtoEnum> = {
    phone: ContactTypeDtoEnum.phone,
    email: ContactTypeDtoEnum.email,
    website: ContactTypeDtoEnum.website,
    socialMediaLink: ContactTypeDtoEnum.socialMediaLink,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown ContactType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function holidayTypeDbEnumToDtoEnum(dbEnum: HolidayType): HolidayTypeDtoEnum {
  const mapping: Record<HolidayType, HolidayTypeDtoEnum> = {
    national: HolidayTypeDtoEnum.national,
    state: HolidayTypeDtoEnum.state,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown HolidayType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function holidayTypeDtoEnumToDbEnum(dtoEnum: HolidayTypeDtoEnum): HolidayType {
  const mapping: Record<HolidayTypeDtoEnum, HolidayType> = {
    [HolidayTypeDtoEnum.national]: 'national',
    [HolidayTypeDtoEnum.state]: 'state',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown HolidayTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function contactTypeDtoEnumToDbEnum(dtoEnum: ContactTypeDtoEnum): ContactType {
  const mapping: Record<ContactTypeDtoEnum, ContactType> = {
    [ContactTypeDtoEnum.phone]: 'phone',
    [ContactTypeDtoEnum.email]: 'email',
    [ContactTypeDtoEnum.website]: 'website',
    [ContactTypeDtoEnum.socialMediaLink]: 'socialMediaLink',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown ContactTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function deviceTypeDbEnumToDtoEnum(dbEnum: DeviceType): DeviceTypeDtoEnum {
  const mapping: Record<DeviceType, DeviceTypeDtoEnum> = {
    mobile: DeviceTypeDtoEnum.mobile,
    tablet: DeviceTypeDtoEnum.tablet,
    laptop: DeviceTypeDtoEnum.laptop,
    cpu: DeviceTypeDtoEnum.cpu,
    keyboard: DeviceTypeDtoEnum.keyboard,
    mouse: DeviceTypeDtoEnum.mouse,
    headphone: DeviceTypeDtoEnum.headphone,
    other: DeviceTypeDtoEnum.other,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown DeviceType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function deviceTypeDtoEnumToDbEnum(dtoEnum: DeviceTypeDtoEnum): DeviceType {
  const mapping: Record<DeviceTypeDtoEnum, DeviceType> = {
    [DeviceTypeDtoEnum.mobile]: 'mobile',
    [DeviceTypeDtoEnum.tablet]: 'tablet',
    [DeviceTypeDtoEnum.laptop]: 'laptop',
    [DeviceTypeDtoEnum.cpu]: 'cpu',
    [DeviceTypeDtoEnum.keyboard]: 'keyboard',
    [DeviceTypeDtoEnum.mouse]: 'mouse',
    [DeviceTypeDtoEnum.headphone]: 'headphone',
    [DeviceTypeDtoEnum.other]: 'other',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown DeviceTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function deviceStatusDbEnumToDtoEnum(dbEnum: DeviceStatus): DeviceStatusDtoEnum {
  const mapping: Record<DeviceStatus, DeviceStatusDtoEnum> = {
    good: DeviceStatusDtoEnum.good,
    physicallyDamaged: DeviceStatusDtoEnum.physicallyDamaged,
    notWorking: DeviceStatusDtoEnum.notWorking,
    lost: DeviceStatusDtoEnum.lost,
    stolen: DeviceStatusDtoEnum.stolen,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown DeviceStatus: ${dbEnum}`);
  }

  return dtoEnum;
}

export function deviceStatusDtoEnumToDbEnum(dtoEnum: DeviceStatusDtoEnum): DeviceStatus {
  const mapping: Record<DeviceStatusDtoEnum, DeviceStatus> = {
    [DeviceStatusDtoEnum.good]: 'good',
    [DeviceStatusDtoEnum.physicallyDamaged]: 'physicallyDamaged',
    [DeviceStatusDtoEnum.notWorking]: 'notWorking',
    [DeviceStatusDtoEnum.lost]: 'lost',
    [DeviceStatusDtoEnum.stolen]: 'stolen',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown DeviceStatusDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function expenseTypeDbEnumToDtoEnum(dbEnum: ExpenseType): ExpenseTypeDtoEnum {
  const mapping: Record<  ExpenseType, ExpenseTypeDtoEnum> = {
    salary: ExpenseTypeDtoEnum.salary,
    incomeTax: ExpenseTypeDtoEnum.incomeTax,
    rent: ExpenseTypeDtoEnum.rent,
    ai: ExpenseTypeDtoEnum.ai,
    emailService: ExpenseTypeDtoEnum.emailService,
    server: ExpenseTypeDtoEnum.server,
    internet: ExpenseTypeDtoEnum.internet,
    phone: ExpenseTypeDtoEnum.phone,
    account: ExpenseTypeDtoEnum.account,
    auditor: ExpenseTypeDtoEnum.auditor,
    roc: ExpenseTypeDtoEnum.roc,
    digitalSignature: ExpenseTypeDtoEnum.digitalSignature,
    other: ExpenseTypeDtoEnum.other,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown ExpenseType: ${dbEnum}`);
  }

  return dtoEnum;
}

export function expenseTypeDtoEnumToDbEnum(dtoEnum: ExpenseTypeDtoEnum): ExpenseType {
  const mapping: Record<ExpenseTypeDtoEnum, ExpenseType> = {
    [ExpenseTypeDtoEnum.salary]: 'salary',
    [ExpenseTypeDtoEnum.incomeTax]: 'incomeTax',
    [ExpenseTypeDtoEnum.rent]: 'rent',
    [ExpenseTypeDtoEnum.ai]: 'ai',
    [ExpenseTypeDtoEnum.emailService]: 'emailService',
    [ExpenseTypeDtoEnum.server]: 'server',
    [ExpenseTypeDtoEnum.internet]: 'internet',
    [ExpenseTypeDtoEnum.phone]: 'phone',
    [ExpenseTypeDtoEnum.account]: 'account',
    [ExpenseTypeDtoEnum.auditor]: 'auditor',
    [ExpenseTypeDtoEnum.roc]: 'roc',
    [ExpenseTypeDtoEnum.digitalSignature]: 'digitalSignature',
    [ExpenseTypeDtoEnum.other]: 'other',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown ExpenseTypeDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function expenseForecastFrequencyDbEnumToDtoEnum(dbEnum: ExpenseForecastFrequency): ExpenseForecastFrequencyDtoEnum {
  const mapping: Record<ExpenseForecastFrequency, ExpenseForecastFrequencyDtoEnum> = {
    monthly: ExpenseForecastFrequencyDtoEnum.monthly,
    yearly: ExpenseForecastFrequencyDtoEnum.yearly,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown ExpenseForecastFrequency: ${dbEnum}`);
  }

  return dtoEnum;
}

export function expenseForecastFrequencyDtoEnumToDbEnum(dtoEnum: ExpenseForecastFrequencyDtoEnum): ExpenseForecastFrequency {
  const mapping: Record<ExpenseForecastFrequencyDtoEnum, ExpenseForecastFrequency> = {
    [ExpenseForecastFrequencyDtoEnum.monthly]: 'monthly',
    [ExpenseForecastFrequencyDtoEnum.yearly]: 'yearly',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown ExpenseForecastFrequencyDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function reimbursementStatusDbEnumToDtoEnum(dbEnum: ReimbursementStatusDbEnum): ReimbursementStatusDtoEnum {
  const mapping: Record<ReimbursementStatusDbEnum, ReimbursementStatusDtoEnum> = {
    pending: ReimbursementStatusDtoEnum.pending,
    approved: ReimbursementStatusDtoEnum.approved,
    paid: ReimbursementStatusDtoEnum.paid,
    rejected: ReimbursementStatusDtoEnum.rejected,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown ReimbursementStatusDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function reimbursementStatusDtoEnumToDbEnum(dtoEnum: ReimbursementStatusDtoEnum): ReimbursementStatusDbEnum {
  const mapping: Record<ReimbursementStatusDtoEnum, ReimbursementStatusDbEnum> = {
    [ReimbursementStatusDtoEnum.pending]: 'pending',
    [ReimbursementStatusDtoEnum.approved]: 'approved',
    [ReimbursementStatusDtoEnum.paid]: 'paid',
    [ReimbursementStatusDtoEnum.rejected]: 'rejected',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown ReimbursementStatusDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}

export function notificationLinkDbEnumToDtoEnum(dbEnum: NotificationLinkDbEnum): NotificationLinkDtoEnum {
  const mapping: Record<NotificationLinkDbEnum, NotificationLinkDtoEnum> = {
    dashboard: NotificationLinkDtoEnum.dashboard,
    employee: NotificationLinkDtoEnum.employee,
    leaves: NotificationLinkDtoEnum.leaves,
    reimbursement: NotificationLinkDtoEnum.reimbursement,
    device: NotificationLinkDtoEnum.device,
    payroll: NotificationLinkDtoEnum.payroll,
    candidate: NotificationLinkDtoEnum.candidate,
    policy: NotificationLinkDtoEnum.policy,
    expense: NotificationLinkDtoEnum.expense,
    organization: NotificationLinkDtoEnum.organization,
    user: NotificationLinkDtoEnum.user,
    empDashboard: NotificationLinkDtoEnum.empDashboard,
    empLeave: NotificationLinkDtoEnum.empLeave,
    empDetails: NotificationLinkDtoEnum.empDetails,
    empDocuments: NotificationLinkDtoEnum.empDocuments,
    empPayroll: NotificationLinkDtoEnum.empPayroll,
    empDevice: NotificationLinkDtoEnum.empDevice,
    empReimbursement: NotificationLinkDtoEnum.empReimbursement,
    empFeedbacks: NotificationLinkDtoEnum.empFeedbacks,
    empPolicy: NotificationLinkDtoEnum.empPolicy,
    announcement: NotificationLinkDtoEnum.announcement,
    empAnnouncement: NotificationLinkDtoEnum.empAnnouncement,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown NotificationLinkDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function notificationLinkDtoEnumToDbEnum(dtoEnum: NotificationLinkDtoEnum): NotificationLinkDbEnum {
  const mapping: Record<NotificationLinkDtoEnum, NotificationLinkDbEnum> = {
    [NotificationLinkDtoEnum.dashboard]: 'dashboard',
    [NotificationLinkDtoEnum.employee]: 'employee',
    [NotificationLinkDtoEnum.leaves]: 'leaves',
    [NotificationLinkDtoEnum.reimbursement]: 'reimbursement',
    [NotificationLinkDtoEnum.device]: 'device',
    [NotificationLinkDtoEnum.payroll]: 'payroll',
    [NotificationLinkDtoEnum.candidate]: 'candidate',
    [NotificationLinkDtoEnum.policy]: 'policy',
    [NotificationLinkDtoEnum.expense]: 'expense',
    [NotificationLinkDtoEnum.organization]: 'organization',
    [NotificationLinkDtoEnum.user]: 'user',
    [NotificationLinkDtoEnum.empDashboard]: 'empDashboard',
    [NotificationLinkDtoEnum.empLeave]: 'empLeave',
    [NotificationLinkDtoEnum.empDetails]: 'empDetails',
    [NotificationLinkDtoEnum.empDocuments]: 'empDocuments',
    [NotificationLinkDtoEnum.empPayroll]: 'empPayroll',
    [NotificationLinkDtoEnum.empDevice]: 'empDevice',
    [NotificationLinkDtoEnum.empReimbursement]: 'empReimbursement',
    [NotificationLinkDtoEnum.empFeedbacks]: 'empFeedbacks',
    [NotificationLinkDtoEnum.empPolicy]: 'empPolicy',
    [NotificationLinkDtoEnum.announcement]: 'announcement',
    [NotificationLinkDtoEnum.empAnnouncement]: 'empAnnouncement',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown NotificationLinkDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}
