import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { OrganizationController } from './organization.controller.js';
import { CurrencyListUc } from './uc/currency-list.uc.js';
import { OrganizationCreateUc } from './uc/organization-create.uc.js';
import { OrganizationDeleteUc } from './uc/organization-delete.uc.js';
import { OrganizationGetUc } from './uc/organization-get.uc.js';
import { OrganizationSearchUc } from './uc/organization-search.uc.js';
import { OrganizationUpdateUc } from './uc/organization-update.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [OrganizationController],
  providers: [
    CurrencyListUc,
    OrganizationSearchUc,
    OrganizationGetUc,
    OrganizationCreateUc,
    OrganizationUpdateUc,
    OrganizationDeleteUc,
  ],
})
export class OrganizationModule {}
