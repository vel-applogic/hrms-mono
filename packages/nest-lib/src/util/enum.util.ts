import {
  AuditActivityStatusDbEnum,
  AuditEntityTypeDbEnum,
  AuditEventGroupDbEnum,
  AuditEventTypeDbEnum,
  CandidateProgress,
  CandidateSource,
  CandidateStatus,
  ContactType,
  EmployeeStatusEnum,
  HolidayType,
  LeaveStatusEnum,
  LeaveTypeEnum,
  MediaTypeDbEnum,
  NoOfDaysInMonthDbEnum,
  NoticePeriodUnit,
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
  EmployeeStatusDtoEnum,
  HolidayTypeDtoEnum,
  LeaveStatusDtoEnum,
  LeaveTypeDtoEnum,
  MediaTypeDtoEnum,
  NoOfDaysInMonthDtoEnum,
  NoticePeriodUnitDtoEnum,
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
