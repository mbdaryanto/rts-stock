import * as yup from 'yup'
import { ItemSchema } from './Item'

export const MarketPlaceSchema = yup.object({
  id: yup.number().integer().nullable(),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  isActive: yup.boolean().default(true).required(),
});

export const SalesDSchema = yup.object({
  id: yup.number().nullable(),
  itemId: yup.number().integer(),
  item: ItemSchema,
  quantity: yup.number(),
  unitPrice: yup.number(),
})

export const SalesSchema = yup.object({
  id: yup.number().nullable(),
  code: yup.string().max(50).required('Kode harus diisi'),
  marketPlaceId: yup.number().integer().default(undefined).optional(),
  marketPlace: MarketPlaceSchema.default(undefined).optional(),
  salesd_collection: yup.array().of(SalesDSchema),
})

export type MarketPlaceType = yup.TypeOf<typeof MarketPlaceSchema> | yup.Asserts<typeof MarketPlaceSchema>
export type SalesType = yup.TypeOf<typeof SalesSchema> | yup.Asserts<typeof SalesSchema>
