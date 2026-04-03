export enum UserRoleDtoEnum {
  admin = 'admin',
  employee = 'employee',
}

// Common enums
export enum MediaTypeDtoEnum {
  doc = 'doc',
  image = 'image',
  zip = 'zip',
  video = 'video',
}

export enum SortDirectionDtoEnum {
  DESC = 'desc',
  ASC = 'asc',
}

// Audit enums
export enum AuditEventGroupDtoEnum {
  authentication = 'authentication',
  operation = 'operation',
}

export enum AuditActivityStatusDtoEnum {
  success = 'success',
  failure = 'failure',
}
export enum AuditEventTypeDtoEnum {
  login_success = 'login_success',
  login_failure = 'login_failure',
  create = 'create',
  update = 'update',
  delete = 'delete',
  password_reset = 'password_reset',
  password_reset_request = 'password_reset_request',
  otp_request = 'otp_request',
  register = 'register',
  email_verify = 'email_verify',
  account_activate = 'account_activate',
  confirm = 'confirm',
  block_user = 'block_user',
  unblock_user = 'unblock_user',
}

export enum AuditEntityTypeDtoEnum {
  user = 'user',
  user_admin = 'user_admin',
  candidate = 'candidate',
  employee = 'employee',
  policy = 'policy',
}

export enum CandidateSourceDtoEnum {
  email = 'email',
  googleSearch = 'googleSearch',
  lead = 'lead',
  linkedin = 'linkedin',
  referral = 'referral',
  websiteForm = 'websiteForm',
}

export enum NoticePeriodUnitDtoEnum {
  days = 'days',
  weeks = 'weeks',
  months = 'months',
}

export enum CandidateStatusDtoEnum {
  new = 'new',
  planed = 'planed',
  notReachable = 'notReachable',
  selected = 'selected',
  onHold = 'onHold',
  rejected = 'rejected',
}

export enum CandidateProgressDtoEnum {
  new = 'new',
  infoCollected = 'infoCollected',
  lev1InterviewScheduled = 'lev1InterviewScheduled',
  lev1InterviewCompleted = 'lev1InterviewCompleted',
  lev2InterviewScheduled = 'lev2InterviewScheduled',
  lev2InterviewCompleted = 'lev2InterviewCompleted',
  offerReleased = 'offerReleased',
  offerAccepted = 'offerAccepted',
}

export enum CandidateMediaTypeDtoEnum {
  resume = 'resume',
  offerLetter = 'offerLetter',
  otherDocuments = 'otherDocuments',
}

export enum EmployeeStatusDtoEnum {
  active = 'active',
  resigned = 'resigned',
  onLeave = 'onLeave',
  terminated = 'terminated',
}

export enum EmployeeMediaTypeDtoEnum {
  photo = 'photo',
  resume = 'resume',
  offerLetter = 'offerLetter',
  otherDocuments = 'otherDocuments',
}

export enum EmployeeFeedbackTrendDtoEnum {
  positive = 'positive',
  negative = 'negative',
  neutral = 'neutral',
}

export enum ContactTypeDtoEnum {
  phone = 'phone',
  email = 'email',
  website = 'website',
  socialMediaLink = 'socialMediaLink',
}

export enum NoOfDaysInMonthDtoEnum {
  dynamic = 'dynamic',
  thirty = 'thirty',
  thirtyOne = 'thirtyOne',
}
