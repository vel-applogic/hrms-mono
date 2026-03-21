import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Res } from '@nestjs/common';
import type {
  PaginatedResponseType,
  PayslipDetailResponseType,
  PayslipFilterRequestType,
  PayslipGenerateRequestType,
  PayslipGenerateResponseType,
  PayslipListResponseType,
  PayslipUpdateLineItemsRequestType,
} from '@repo/dto';
import { PayslipFilterRequestSchema, PayslipGenerateRequestSchema, PayslipUpdateLineItemsRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';
import type { Response } from 'express';

import { PayslipDownloadUc } from './uc/payslip-download.uc.js';
import { PayslipGenerateUc } from './uc/payslip-generate.uc.js';
import { PayslipGetUc } from './uc/payslip-get.uc.js';
import { PayslipListUc } from './uc/payslip-list.uc.js';
import { PayslipUpdateLineItemsUc } from './uc/payslip-update-line-items.uc.js';

@Controller('api/payslip')
export class PayslipController {
  constructor(
    private readonly listUc: PayslipListUc,
    private readonly generateUc: PayslipGenerateUc,
    private readonly getUc: PayslipGetUc,
    private readonly updateLineItemsUc: PayslipUpdateLineItemsUc,
    private readonly downloadUc: PayslipDownloadUc,
  ) {}

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(PayslipFilterRequestSchema)) filterDto: PayslipFilterRequestType,
  ): Promise<PaginatedResponseType<PayslipListResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Post('/generate')
  async generate(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(PayslipGenerateRequestSchema)) dto: PayslipGenerateRequestType,
  ): Promise<PayslipGenerateResponseType> {
    return this.generateUc.execute({ currentUser, dto });
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType, @Res() res: Response): Promise<void> {
    const pdf = await this.downloadUc.execute({ currentUser, id });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="payslip-${id}.pdf"`,
      'Content-Length': String(pdf.length),
    });
    res.end(pdf);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<PayslipDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Put(':id/line-items')
  async updateLineItems(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(PayslipUpdateLineItemsRequestSchema)) dto: PayslipUpdateLineItemsRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<PayslipDetailResponseType> {
    return this.updateLineItemsUc.execute({ currentUser, id, dto });
  }
}
