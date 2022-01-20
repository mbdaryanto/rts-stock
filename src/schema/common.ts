import * as yup from 'yup'

export const SaveResponseSchema = yup.object({
  success: yup.bool().required(),
  error: yup.string().nullable(),
  data: yup.object().optional(),
})

export type SaveResponseType = yup.TypeOf<typeof SaveResponseSchema> | yup.Asserts<typeof SaveResponseSchema>
