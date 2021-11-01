import * as Yup from 'yup'
import { parse } from 'date-fns'
import id from 'date-fns/locale/id'

function dateSchema(format?: string) {
  return Yup.date().transform(function (value, originalValue) {
    // console.log(value, originalValue)
    // if (!!value && value instanceof Date && !isNaN(value.valueOf())) {
    //   return value;
    // }
    // if (this.isType(value)) return value
    const dateValue = parse(originalValue, format || 'P', new Date(), {locale: id})
    // console.log(dateValue)
    return dateValue
  });
}

export default dateSchema
