import { CommonLoggerService } from '../../logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, User } from '@repo/db';
import type { OrderByParam } from '../dao/_base.dao.js';
import type { FilterSortRequestType, AuditActivityFieldChangeType, AdminUserDetailResponseType } from '@repo/dto';
import deepDiff from 'deep-diff';
import { planDbEnumToDtoEnum, userRoleDbEnumToDtoEnum } from '../../util/enum.util.js';

const { diff } = deepDiff;

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export abstract class BaseUc {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly logger: CommonLoggerService,
  ) {}

  protected transaction<T>(fn: (ctx: Prisma.TransactionClient) => Promise<T>, options?: { timeout?: number }): Promise<T> {
    return this.prisma.$transaction(fn, options);
  }

  protected log(message: string, data?: Record<string, unknown>) {
    this.logger.i(message, data);
  }

  protected logWarning(message: string, data?: Record<string, unknown>) {
    this.logger.w(message, data);
  }

  protected logError(message: string, data?: Record<string, unknown>) {
    this.logger.e(message, data);
  }

  /**
   * Validates and returns Prisma orderBy object from sort parameter
   * @param sort - Sort object containing field and direction
   * @param sortableColumns - Array of allowed sortable column names (optional - if not provided, skips field validation)
   * @param fieldMapping - Optional mapping of frontend field names to database field paths (e.g., 'organisation' -> 'organisation.name')
   * @returns Prisma orderBy object if valid, defaults to createdAt desc if no sort provided
   */
  protected getSort<T extends readonly string[]>(sort?: FilterSortRequestType, sortableColumns?: T, fieldMapping?: Partial<Record<T[number], string>>): OrderByParam | undefined {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    // Validate sort direction
    if (sort.direction !== 'asc' && sort.direction !== 'desc') {
      return undefined;
    }

    // If sortableColumns provided, validate that the field is in the list
    if (sortableColumns && sortableColumns.length > 0) {
      if (!sortableColumns.includes(sort.field)) {
        return undefined;
      }
    }

    // Check if field mapping is provided and field exists in mapping
    const mappedField = fieldMapping?.[sort.field as T[number]];
    if (mappedField) {
      // Handle nested fields with dot notation (e.g., 'organisation.name' -> {organisation: {name: direction}})
      if (mappedField.includes('.')) {
        const parts = mappedField.split('.');

        let result: any = { [parts[parts.length - 1]!]: sort.direction };
        for (let i = parts.length - 2; i >= 0; i--) {
          result = { [parts[i]!]: result };
        }
        return result as OrderByParam;
      }

      return { [mappedField]: sort.direction };
    }

    // No mapping, return field as-is
    return { [sort.field]: sort.direction };
  }

  protected computeChanges(params: { oldValues: Record<string, unknown>; newValues: Record<string, unknown> }): Record<string, AuditActivityFieldChangeType> {
    const differences = diff(params.oldValues, params.newValues);
    const changes: Record<string, AuditActivityFieldChangeType> = {};

    if (differences && differences.length > 0) {
      for (const diff of differences) {
        if (diff.kind === 'E') {
          // Edited value
          const path = diff.path?.join('.') || 'unknown';
          const oldType = typeof diff.lhs;
          const newType = typeof diff.rhs;
          changes[path] = {
            old: { type: this.mapTypeToAuditType(oldType), value: diff.lhs },
            new: { type: this.mapTypeToAuditType(newType), value: diff.rhs },
          };
        } else if (diff.kind === 'N') {
          // New value
          const path = diff.path?.join('.') || 'unknown';
          const newType = typeof diff.rhs;
          changes[path] = {
            old: null,
            new: { type: this.mapTypeToAuditType(newType), value: diff.rhs },
          };
        } else if (diff.kind === 'D') {
          // Deleted value
          const path = diff.path?.join('.') || 'unknown';
          const oldType = typeof diff.lhs;
          changes[path] = {
            old: { type: this.mapTypeToAuditType(oldType), value: diff.lhs },
            new: null,
          };
        }
      }
    }

    return changes;
  }

  private mapTypeToAuditType(type: string): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (Array.isArray(type)) return 'array';
    return 'object';
  }

  protected dbToAdminUserDetailResponse(dbRec: User): AdminUserDetailResponseType {
    return {
      id: dbRec.id,
      email: dbRec.email,
      firstname: dbRec.firstname,
      lastname: dbRec.lastname,
      role: userRoleDbEnumToDtoEnum(dbRec.role),
      plan: planDbEnumToDtoEnum(dbRec.plan),
      isActive: dbRec.isActive,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
