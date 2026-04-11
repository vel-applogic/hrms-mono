import { Module } from '@nestjs/common';

import { BranchController } from './branch.controller.js';
import { BranchCreateUc } from './uc/branch-create.uc.js';
import { BranchDeleteUc } from './uc/branch-delete.uc.js';
import { BranchGetUc } from './uc/branch-get.uc.js';
import { BranchSearchUc } from './uc/branch-search.uc.js';
import { BranchUpdateUc } from './uc/branch-update.uc.js';

@Module({
  controllers: [BranchController],
  providers: [
    BranchCreateUc,
    BranchUpdateUc,
    BranchSearchUc,
    BranchGetUc,
    BranchDeleteUc,
  ],
})
export class BranchModule {}
