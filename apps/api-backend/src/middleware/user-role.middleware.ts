import { Injectable } from '@nestjs/common';
import { CommonAdminUserMiddleware } from '@repo/nest-lib';

@Injectable()
export class AdminUserMiddleware extends CommonAdminUserMiddleware {}
