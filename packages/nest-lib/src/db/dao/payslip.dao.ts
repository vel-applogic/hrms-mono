import { Injectable } from '@nestjs/common';
import type { Payslip, PayslipLineItem, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

export type PayslipWithUserType = Payslip & {
  user: { firstname: string; lastname: string; email: string };
};

export type PayslipWithDetailsType = Payslip & {
  user: { firstname: string; lastname: string; email: string; employees?: { designation: string }[] };
  payslipLineItems: PayslipLineItem[];
};

@Injectable()
export class PayslipDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: {
    data: Prisma.PayslipCreateInput;
    tx?: Prisma.TransactionClient;
  }): Promise<PayslipWithDetailsType> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payslip.create({
      data: params.data,
      include: {
        user: { select: { firstname: true, lastname: true, email: true } },
        payslipLineItems: true,
      },
    });
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<PayslipWithDetailsType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payslip.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            employees: { select: { designation: true }, take: 1 },
          },
        },
        payslipLineItems: { orderBy: { type: 'asc' } },
      },
    });
  }

  async findByUserAndMonthYear(params: {
    userId: number;
    month: number;
    year: number;
    tx?: Prisma.TransactionClient;
  }): Promise<Payslip | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payslip.findUnique({
      where: { userId_month_year: { userId: params.userId, month: params.month, year: params.year } },
    });
  }

  async findManyByMonthYear(params: {
    month: number;
    year: number;
    employeeIds?: number[];
    tx?: Prisma.TransactionClient;
  }): Promise<PayslipWithUserType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payslip.findMany({
      where: {
        month: params.month,
        year: params.year,
        ...(params.employeeIds?.length ? { userId: { in: params.employeeIds } } : {}),
      },
      include: { user: { select: { firstname: true, lastname: true, email: true } } },
    });
  }

  async findWithPagination(params: {
    page: number;
    limit: number;
    month?: number;
    year?: number;
    employeeIds?: number[];
    tx?: Prisma.TransactionClient;
  }): Promise<{ payslips: PayslipWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({ pageNo: params.page, pageSize: params.limit });

    const where: Prisma.PayslipWhereInput = {
      ...(params.month != null ? { month: params.month } : {}),
      ...(params.year != null ? { year: params.year } : {}),
      ...(params.employeeIds?.length ? { userId: { in: params.employeeIds } } : {}),
    };

    const [totalRecords, payslips] = await Promise.all([
      pc.payslip.count({ where }),
      pc.payslip.findMany({
        where,
        include: { user: { select: { firstname: true, lastname: true, email: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { user: { firstname: 'asc' } }],
        take,
        skip,
      }),
    ]);

    return { payslips, totalRecords };
  }

  async deleteById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payslipLineItem.deleteMany({ where: { payslipId: params.id } });
    await pc.payslip.delete({ where: { id: params.id } });
  }

  async updatePdfS3Key(params: { id: number; s3Key: string; tx?: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payslip.update({
      where: { id: params.id },
      data: { pdfS3Key: params.s3Key },
    });
  }

  async replaceLineItems(params: {
    payslipId: number;
    lineItems: Array<{ type: string; title: string; amount: number }>;
    tx?: Prisma.TransactionClient;
  }): Promise<PayslipWithDetailsType | null> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payslipLineItem.deleteMany({ where: { payslipId: params.payslipId } });
    await pc.payslipLineItem.createMany({
      data: params.lineItems.map((item) => ({
        payslipId: params.payslipId,
        type: item.type as 'earning' | 'deduction',
        title: item.title,
        amount: item.amount,
      })),
    });

    const earnings = params.lineItems.filter((i) => i.type === 'earning').reduce((s, i) => s + i.amount, 0);
    const deductions = params.lineItems.filter((i) => i.type === 'deduction').reduce((s, i) => s + i.amount, 0);

    return pc.payslip.update({
      where: { id: params.payslipId },
      data: {
        grossAmount: earnings,
        deductionAmount: deductions,
        netAmount: earnings - deductions,
      },
      include: {
        user: { select: { firstname: true, lastname: true, email: true } },
        payslipLineItems: { orderBy: { type: 'asc' } },
      },
    });
  }
}
