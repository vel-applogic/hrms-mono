import { Injectable } from '@nestjs/common';
import { CommonAuthenticateMiddleware } from '@repo/nest-lib';

@Injectable()
export class AuthenticateMiddleware extends CommonAuthenticateMiddleware {}
