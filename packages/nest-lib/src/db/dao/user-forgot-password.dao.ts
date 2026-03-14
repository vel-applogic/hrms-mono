import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { BaseDao } from './_base.dao.js';
import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
@TrackQuery()
export class UserForgotPasswordDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async create(params: { data: UserForgotPasswordInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.userForgotPassword.create({
      data: params.data,
    });

    if (!dbRec?.id) {
      throw new DbOperationError('User forgot password not created');
    }
    return dbRec.id;
  }

  public async getByUserIdAndKey(params: { userId: number; key: string; tx?: Prisma.TransactionClient }): Promise<UserForgotPasswordSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);

    const dbRec = await pc.userForgotPassword.findFirst({
      where: {
        userId: params.userId,
        forgotPasswordKey: params.key,
      },
    });

    return dbRec ?? undefined;
  }

  public async updateById(params: { id: number; data: UserForgotPasswordUpdateTableRecordType; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);

    await pc.userForgotPassword.update({
      where: { id: params.id },
      data: params.data,
    });
  }
}

// Type definitions
type UserForgotPasswordSelectTableRecordType = Prisma.UserForgotPasswordGetPayload<{}>;
type UserForgotPasswordInsertTableRecordType = Prisma.UserForgotPasswordCreateInput;
type UserForgotPasswordUpdateTableRecordType = Prisma.UserForgotPasswordUpdateInput;
