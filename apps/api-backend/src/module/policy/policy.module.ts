import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';

import { PolicyController } from './policy.controller.js';
import { PolicyCreateUc } from './uc/policy-create.uc.js';
import { PolicyDeleteUc } from './uc/policy-delete.uc.js';
import { PolicyGetUc } from './uc/policy-get.uc.js';
import { PolicySearchUc } from './uc/policy-search.uc.js';
import { PolicyUpdateUc } from './uc/policy-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [PolicyController],
  providers: [PolicySearchUc, PolicyGetUc, PolicyCreateUc, PolicyUpdateUc, PolicyDeleteUc],
})
export class PolicyModule {}
