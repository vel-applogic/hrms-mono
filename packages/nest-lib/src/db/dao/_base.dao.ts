import { Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';

export type SortDirection = 'asc' | 'desc';
export type OrderByParam = Record<string, SortDirection>;

export class BaseDao {
  constructor(protected prisma: PrismaService) {}

  protected getPrismaClient(tx?: Prisma.TransactionClient): Prisma.TransactionClient {
    return tx ? tx : this.prisma;
  }

  protected getPagination(pagination?: { pageNo: number; pageSize: number }): {
    take: number;
    skip: number;
  } {
    if (!pagination) {
      return { take: 100, skip: 0 };
    }
    const take = pagination.pageSize;
    const skip = (pagination.pageNo - 1) * pagination.pageSize;
    return { take, skip };
  }

  protected toEnumArray<T extends Record<string, string>>(values: string[] | undefined, enumObj: T): Array<T[keyof T]> {
    if (!values || values.length === 0) {
      return [];
    }
    const validValues = Object.values(enumObj) as string[];
    return values.filter((v) => validValues.includes(v)) as Array<T[keyof T]>;
  }

  protected toBooleanArray(values: string[] | undefined): boolean[] {
    if (!values || values.length === 0) {
      return [];
    }
    return values.map((v) => v === 'true');
  }
}
