import type { EmployeeBgvFeedbackResponseType, MediaResponseType } from '@repo/dto';
import type { EmployeeBgvFeedbackWithMediaType } from '@repo/nest-lib';
import { mediaTypeDbEnumToDtoEnum } from '@repo/nest-lib';

import type { S3Service } from '#src/external-service/s3.service.js';

export async function dbToResponse(dbRec: EmployeeBgvFeedbackWithMediaType, s3Service: S3Service): Promise<EmployeeBgvFeedbackResponseType> {
  const files: MediaResponseType[] = await Promise.all(
    dbRec.employyBgvFeedbackHasMedias.map(async (m) => {
      const urlFull = await s3Service.getSignedUrl(m.media.key);
      return {
        id: m.media.id,
        key: m.media.key,
        name: m.media.name,
        type: mediaTypeDbEnumToDtoEnum(m.media.type),
        size: m.media.size,
        ext: m.media.ext,
        urlFull,
      };
    }),
  );

  return {
    id: dbRec.id,
    employeeId: dbRec.userId,
    feedback: dbRec.feedback,
    createdAt: dbRec.createdAt.toISOString(),
    updatedAt: dbRec.updatedAt.toISOString(),
    files,
  };
}
