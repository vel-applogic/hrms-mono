import * as z from 'zod';

import { SortDirectionDtoEnum } from './enum.js';

const FilterPaginationRequestSchema = z.object({
  page: z.number(),
  limit: z.number(),
});
// export type FilterPaginationRequestType = z.infer<typeof FilterPaginationRequestSchema>;

const FilterSortRequestSchema = z.object({
  field: z.string(),
  direction: z.enum(SortDirectionDtoEnum),
});
export type FilterSortRequestType = z.infer<typeof FilterSortRequestSchema>;

export const FilterRequestSchema = z.object({
  pagination: FilterPaginationRequestSchema,
  sort: FilterSortRequestSchema.optional(),
  search: z.string().optional(),
});
export type FilterRequestType = z.infer<typeof FilterRequestSchema>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(responseSchema: T) =>
  z.object({
    page: z.number(),
    limit: z.number(),
    totalRecords: z.number(),
    results: z.array(responseSchema),
  });

// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// export const PaginatedWithAllIdsResponseSchema = <T extends z.ZodTypeAny>(responseSchema: T) =>
//   z.object({
//     page: z.number(),
//     limit: z.number(),
//     totalRecords: z.number(),
//     results: z.array(responseSchema),
//     allIds: z.array(z.number()),
//   });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const AllDataResponseSchema = <T extends z.ZodTypeAny>(responseSchema: T) =>
  z.object({
    results: z.array(responseSchema),
  });

export type AllDataResponseType<T> = {
  results: T[];
};

export type PaginatedResponseType<T> = AllDataResponseType<T> & {
  page: number;
  limit: number;
  totalRecords: number;
};

export type PaginatedWithAllIdsResponseType<T> = PaginatedResponseType<T> & {
  allIds: number[];
};

export const SearchParamsSchema = z.object({
  page: z.string().regex(/^\d+$/, { message: 'Search param page must be a number' }).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/, { message: 'Search param pageSize must be a number' }).transform(Number).optional(),
  search: z.string().optional(),
  sKey: z.string().optional(),
  sVal: z.string().optional(),
  chapterId: z.string().regex(/^\d+$/, { message: 'Search param chapterId must be a number' }).transform(Number).optional(),
  topicId: z.string().regex(/^\d+$/, { message: 'Search param topicId must be a number' }).transform(Number).optional(),
  themeIds: z
    .string()
    .regex(/^(\d+,)*\d+$/, { message: 'Search param themeIds must be comma-separated numbers' })
    .transform((val) => val.split(',').map(Number))
    .optional(),
  status: z.enum(['active', 'inactive']).optional(),
  plan: z.enum(['free', 'premium']).optional(),
});

export type SearchParamsType = z.infer<typeof SearchParamsSchema>;
