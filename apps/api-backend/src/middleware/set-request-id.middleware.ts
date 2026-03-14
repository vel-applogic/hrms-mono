import { Injectable } from '@nestjs/common';
import { CommonSetRequestIdMiddleware } from '@repo/nest-lib';

@Injectable()
export class SetRequestIdMiddleware extends CommonSetRequestIdMiddleware {}
