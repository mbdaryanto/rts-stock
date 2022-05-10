import { AxiosInstance } from 'axios'
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

export const ItemCategoryListSchema = yup.array().of(ItemCategorySchema).ensure()

export type ItemType = yup.TypeOf<typeof ItemSchema> | yup.Asserts<typeof ItemSchema>
export type ItemCategoryType = yup.TypeOf<typeof ItemCategorySchema> | yup.Asserts<typeof ItemCategorySchema>

export const ItemListSchema = yup.array().of(ItemSchema).ensure()

export type ItemListType = yup.TypeOf<typeof ItemListSchema>

/**
 * getItemList - async function to get Item List
 * @param {AxiosInstance} .axios - Axios instance
 * @param {string?} .q - search items containing keywords
 * @param {number?} .offset - start offset
 * @param {number?} .limit - limit items returned
 * @returns {Promise<ItemListType>} array of items
 */
export async function getItemList({
  axios, ...params
}: {
  axios: AxiosInstance,
  q?: string,
  offset?: number,
  limit?: number,
}): Promise<ItemListType> {
  const response = await axios.get('/item/list', { params })
  if (response.status !== 200) {
    console.log('getItemList response', response)
    throw response
  }
  return ItemListSchema.validate(response.data)
}

/**
 * saveItem - async function to save Item
 * @param {AxiosInstance} .axios - Axios instance
 * @param {ItemType} .item - a validated ItemSchema, returned from await ItemSchema.validate(object)
 * @returns {Promise<ItemType>} saved item
 */
export async function saveItem({
  axios, item
}: {
  axios: AxiosInstance,
  item: ItemType,
}): Promise<ItemType> {
  const response = await axios.post('/item/save', item)
  if (response.status !== 200) {
    console.log('saveItem response', response)
    throw response
  }
  return ItemSchema.validate(response.data)
}
