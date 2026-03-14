import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { MediaService } from '#src/service/media.service.js';

import { CandidateController } from './candidate.controller.js';
import { CandidateCreateUc } from './uc/candidate-create.uc.js';
import { CandidateDeleteUc } from './uc/candidate-delete.uc.js';
import { CandidateGetUc } from './uc/candidate-get.uc.js';
import { CandidateSearchUc } from './uc/candidate-search.uc.js';
import { CandidateUpdateUc } from './uc/candidate-update.uc.js';
import { CandidateUpdateProgressUc } from './uc/candidate-update-progress.uc.js';
import { CandidateUpdateStatusUc } from './uc/candidate-update-status.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [CandidateController],
  providers: [
    CandidateSearchUc,
    CandidateGetUc,
    CandidateCreateUc,
    CandidateUpdateUc,
    CandidateUpdateStatusUc,
    CandidateUpdateProgressUc,
    CandidateDeleteUc,
    MediaService,
  ],
})
export class CandidateModule {}
