import * as yup from 'yup'
import { parse } from 'date-fns'

export function parseDateId(value: Date | number | string): Date {
  if (typeof value === 'number') {
    return new Date(value)
  }
  if (typeof value === 'object' && value instanceof Date) {
    return value
  }
  if (typeof value !== 'string') {
    return new Date(NaN)
  }
  if (value.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    return parse(value, 'yyyy-MM-dd', new Date())
  }
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    return parse(value, 'dd/MM/yyyy', new Date())
  }
  if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
    return parse(value, 'dd/MM/yy', new Date())
  }
  if (value.match(/^\d{1,2}\/\d{1,2}$/)) {
    return parse(value, 'dd/MM', new Date())
  }
  return new Date(value)
}

export const dateSchemaId = yup.date().transform((value, originalValue) => {
  return parseDateId(originalValue)
})
