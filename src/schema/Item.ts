import * as yup from 'yup'

export const ItemCategorySchema = yup.object({
  id: yup.number().integer().nullable(),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  isActive: yup.boolean().default(true).required(),
});

export const ItemSchema = yup.object({
  id: yup.number().nullable(),
  code: yup.string().max(50).required('Kode harus diisi'),
  categoryId: yup.number().integer().required('Kategori harus dipilih'),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  sellingPrice: yup.number(),
  category: ItemCategorySchema.default(undefined).optional(),
  isActive: yup.boolean().default(true).required(),
})

export const ItemCategoriesSchema = yup.array().of(ItemCategorySchema).ensure()

export type ItemType = yup.TypeOf<typeof ItemSchema> | yup.Asserts<typeof ItemSchema>
export type ItemCategoryType = yup.TypeOf<typeof ItemCategorySchema> | yup.Asserts<typeof ItemCategorySchema>
