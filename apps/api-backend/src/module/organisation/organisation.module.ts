import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { OrganisationController } from './organisation.controller.js';
import { CountryListUc } from './uc/country-list.uc.js';
import { CurrencyListUc } from './uc/currency-list.uc.js';
import { OrganisationCreateUc } from './uc/organisation-create.uc.js';
import { OrganisationDeleteUc } from './uc/organisation-delete.uc.js';
import { OrganisationGetUc } from './uc/organisation-get.uc.js';
import { OrganisationSearchUc } from './uc/organisation-search.uc.js';
import { OrganisationUpdateUc } from './uc/organisation-update.uc.js';

@Module({
  imports: [ExternalServiceModule, ServiceModule],
  controllers: [OrganisationController],
  providers: [
    CurrencyListUc,
    CountryListUc,
    OrganisationSearchUc,
    OrganisationGetUc,
    OrganisationCreateUc,
    OrganisationUpdateUc,
    OrganisationDeleteUc,
  ],
})
export class OrganisationModule {}
