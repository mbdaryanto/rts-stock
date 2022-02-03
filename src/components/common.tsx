import type { ReactNode } from 'react'
import { Icon, FormControl, FormErrorMessage, Checkbox } from '@chakra-ui/react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { Field, FieldProps } from 'formik'


export function Active({ isActive }:{ isActive: boolean }) {
  if (isActive) return <Icon as={FaCheck} color="green"/>
  return <Icon as={FaTimes} color="red"/>
}

export const CheckboxField = ({ name, label }: { name: string, label: ReactNode }) => (
  <Field name="isActive">
    {({ field, meta, form }: FieldProps<boolean>) => (
      <FormControl isInvalid={!!meta.touched && !!meta.error}>
        <Checkbox
          name={field.name} id={field.name}
          isChecked={field.value}
          onChange={(ev) => form.setFieldValue(field.name, ev.target.checked)}
        >{label}</Checkbox>
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    )}
  </Field>
)
