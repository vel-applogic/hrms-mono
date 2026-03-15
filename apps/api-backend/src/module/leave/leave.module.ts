import { Module } from '@nestjs/common';

import { LeaveController } from './leave.controller.js';
import { LeaveApproveUc } from './uc/leave-approve.uc.js';
import { LeaveCancelUc } from './uc/leave-cancel.uc.js';
import { LeaveCountersListUc } from './uc/leave-counters-list.uc.js';
import { LeaveRejectUc } from './uc/leave-reject.uc.js';
import { LeaveCreateUc } from './uc/leave-create.uc.js';
import { LeaveListUc } from './uc/leave-list.uc.js';
import { LeaveUpdateUc } from './uc/leave-update.uc.js';

@Module({
  controllers: [LeaveController],
  providers: [LeaveListUc, LeaveCountersListUc, LeaveCreateUc, LeaveUpdateUc, LeaveCancelUc, LeaveApproveUc, LeaveRejectUc],
})
export class LeaveModule {}
