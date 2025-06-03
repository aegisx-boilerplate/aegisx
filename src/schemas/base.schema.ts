// Base schema using TypeBox
import { Type } from '@fastify/type-provider-typebox';

import { TSchema } from '@sinclair/typebox';

export const SuccessResponse = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: dataSchema,
  });

export const Pagination = Type.Object({
  page: Type.Number({ minimum: 1 }),
  pageSize: Type.Number({ minimum: 1 }),
  total: Type.Number({ minimum: 0 }),
  pageCount: Type.Number({ minimum: 1 }),
});
