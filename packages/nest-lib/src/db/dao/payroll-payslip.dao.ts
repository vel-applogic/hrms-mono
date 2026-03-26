import { Injectable } from '@nestjs/common';
import type { PayrollPayslip, PayrollPayslipLineItem, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

export type PayrollPayslipWithUserType = PayrollPayslip & {
  user: { firstname: string; lastname: string; email: string };
};

export type PayrollPayslipWithDetailsType = PayrollPayslip & {
  user: { firstname: string; lastname: string; email: string; employees?: { designation: string }[] };
  payrollPayslipLineItems: PayrollPayslipLineItem[];
};

@Injectable()
export class PayrollPayslipDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.PayrollPayslipCreateInput; tx?: Prisma.TransactionClient }): Promise<PayrollPayslipWithDetailsType> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollPayslip.create({
      data: params.data,
      include: {
        user: { select: { firstname: true, lastname: true, email: true } },
        payrollPayslipLineItems: true,
      },
    });
  }

  async getById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<PayrollPayslipWithDetailsType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollPayslip.findFirst({
      where: { id: params.id, organizationId: params.organizationId },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            employees: { select: { designation: true }, take: 1 },
          },
        },
        payrollPayslipLineItems: { orderBy: { type: 'asc' } },
      },
    });
  }

  async findByUserAndMonthYear(params: { userId: number; organizationId: number; month: number; year: number; tx?: Prisma.TransactionClient }): Promise<PayrollPayslip | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollPayslip.findFirst({
      where: {
        userId: params.userId,
        month: params.month,
        year: params.year,
        organizationId: params.organizationId,
      },
    });
  }

  async findManyByMonthYear(params: {
    month: number;
    year: number;
    organizationId: number;
    employeeIds?: number[];
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollPayslipWithUserType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.payrollPayslip.findMany({
      where: {
        organizationId: params.organizationId,
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
    organizationId: number;
    month?: number;
    year?: number;
    employeeIds?: number[];
    tx?: Prisma.TransactionClient;
  }): Promise<{ payslips: PayrollPayslipWithUserType[]; totalRecords: number }> {
    const pc = this.getPrismaClient(params.tx);
    const { take, skip } = this.getPagination({ pageNo: params.page, pageSize: params.limit });

    const where: Prisma.PayrollPayslipWhereInput = {
      organizationId: params.organizationId,
      ...(params.month != null ? { month: params.month } : {}),
      ...(params.year != null ? { year: params.year } : {}),
      ...(params.employeeIds?.length ? { userId: { in: params.employeeIds } } : {}),
    };

    const [totalRecords, payslips] = await Promise.all([
      pc.payrollPayslip.count({ where }),
      pc.payrollPayslip.findMany({
        where,
        include: { user: { select: { firstname: true, lastname: true, email: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { user: { firstname: 'asc' } }],
        take,
        skip,
      }),
    ]);

    return { payslips, totalRecords };
  }

  async deleteById(params: { id: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    const payslip = await pc.payrollPayslip.findFirst({ where: { id: params.id, organizationId: params.organizationId } });
    if (!payslip) throw new Error(`Payslip ${params.id} not found in organization`);
    await pc.payrollPayslipLineItem.deleteMany({ where: { payslipId: params.id } });
    await pc.payrollPayslip.delete({ where: { id: params.id } });
  }

  async updatePdfS3Key(params: { id: number; s3Key: string; tx?: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollPayslip.update({
      where: { id: params.id },
      data: { pdfS3Key: params.s3Key },
    });
  }

  async replaceLineItems(params: {
    payslipId: number;
    lineItems: Array<{ type: string; title: string; amount: number }>;
    tx?: Prisma.TransactionClient;
  }): Promise<PayrollPayslipWithDetailsType | null> {
    const pc = this.getPrismaClient(params.tx);
    await pc.payrollPayslipLineItem.deleteMany({ where: { payslipId: params.payslipId } });
    await pc.payrollPayslipLineItem.createMany({
      data: params.lineItems.map((item) => ({
        payslipId: params.payslipId,
        type: item.type as 'earning' | 'deduction',
        title: item.title,
        amount: item.amount,
      })),
    });

    const earnings = params.lineItems.filter((i) => i.type === 'earning').reduce((s, i) => s + i.amount, 0);
    const deductions = params.lineItems.filter((i) => i.type === 'deduction').reduce((s, i) => s + i.amount, 0);

    return pc.payrollPayslip.update({
      where: { id: params.payslipId },
      data: {
        grossAmount: earnings,
        deductionAmount: deductions,
        netAmount: earnings - deductions,
      },
      include: {
        user: { select: { firstname: true, lastname: true, email: true } },
        payrollPayslipLineItems: { orderBy: { type: 'asc' } },
      },
    });
  }
}
