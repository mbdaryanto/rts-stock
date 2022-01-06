import * as yup from 'yup';

export const ItemCategorySchema = yup.object({
  id: yup.number().integer().nullable(),
  name: yup.string().max(100).required(),
});

export const ItemSchema = yup.object({
  id: yup.number().nullable(),
  code: yup.string().max(50).required('Kode harus diisi'),
  categoryId: yup.number().integer(),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  sellingPrice: yup.number(),
  category: ItemCategorySchema.nullable(),
})

export const ItemCategoriesSchema = yup.array().of(ItemCategorySchema).ensure()
