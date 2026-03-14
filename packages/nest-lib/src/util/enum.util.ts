import { AuditActivityStatusDbEnum, AuditEntityTypeDbEnum, AuditEventGroupDbEnum, AuditEventTypeDbEnum, MediaTypeDbEnum, PlanEnum, UserRoleDbEnum } from '@repo/db';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, MediaTypeDtoEnum, PlanDtoEnum, UserRoleDtoEnum } from '@repo/dto';

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
    [AuditEventTypeDtoEnum.upgrade_plan]: 'upgrade_plan',
    [AuditEventTypeDtoEnum.downgrade_plan]: 'downgrade_plan',
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
    upgrade_plan: AuditEventTypeDtoEnum.upgrade_plan,
    downgrade_plan: AuditEventTypeDtoEnum.downgrade_plan,
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
    [UserRoleDtoEnum.admin]: 'admin',
    [UserRoleDtoEnum.user]: 'user',
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
    user: UserRoleDtoEnum.user,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown UserRoleDbEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function planDbEnumToDtoEnum(dbEnum: PlanEnum): PlanDtoEnum {
  const mapping: Record<PlanEnum, PlanDtoEnum> = {
    free: PlanDtoEnum.free,
    premium: PlanDtoEnum.premium,
  };

  const dtoEnum = mapping[dbEnum];
  if (!dtoEnum) {
    throw new Error(`Unknown PlanEnum: ${dbEnum}`);
  }

  return dtoEnum;
}

export function planDtoEnumToDbEnum(dtoEnum: PlanDtoEnum): PlanEnum {
  const mapping: Record<PlanDtoEnum, PlanEnum> = {
    [PlanDtoEnum.free]: 'free',
    [PlanDtoEnum.premium]: 'premium',
  };

  const dbEnum = mapping[dtoEnum];
  if (!dbEnum) {
    throw new Error(`Unknown PlanDtoEnum: ${dtoEnum}`);
  }

  return dbEnum;
}
