import type { ComponentProps } from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  Heading, List, ListItem, IconButton, Button, VStack,
  FormControl, Input, FormLabel, FormErrorMessage, Textarea, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, useToast
} from '@chakra-ui/react'
import * as yup from 'yup'
import { Formik, Field, Form, FieldProps } from 'formik'
import Navbar from '../components/Navbar'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'


const ItemSchema = yup.object({
  id: yup.number().nullable(),
  code: yup.string().max(50).required('Kode harus diisi'),
  categoryId: yup.number().integer(),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  sellingPrice: yup.number(),
})

const ItemCategoriesSchema = yup.array().of(yup.object({
  id: yup.number().integer().required(),
  name: yup.string().max(100).required(),
})).ensure()

function ItemListPage() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  return (
    <Navbar title="Items">
      <Heading>Items</Heading>
      <List>
        <ListItem>
          Name: Nama Barang
          <IconButton aria-label="Edit" icon={<FaEdit/>}/>
          <IconButton aria-label="Delete" icon={<FaTrash/>}/>
        </ListItem>
      </List>
      <Button leftIcon={<FaPlus/>} onClick={onOpen}>
        New Item
      </Button>
      <ItemEditorDialog isOpen={isOpen} onClose={onClose}/>
    </Navbar>
  )
}

interface ItemEditorDialogProps extends Omit<ComponentProps<typeof Modal>, 'children'> {
  title?: string,
  item?: yup.Asserts<typeof ItemSchema>,
}

function ItemEditorDialog({ title, item, ...rest }: ItemEditorDialogProps) {
  const initialFocusRef = useRef(null)
  const [categories, setCategories] = useState<yup.TypeOf<typeof ItemCategoriesSchema>>([])
  const toast = useToast()
  const { getJson } = useAuthContext()

  useEffect(() => {
    getJson<yup.Asserts<typeof ItemCategoriesSchema>>('/item/category/list').then(
      response => setCategories(ItemCategoriesSchema.cast(response))
    ).catch(
      error => console.log(error)
    )
  }, [getJson])

  const initialValues: yup.Asserts<typeof ItemSchema> = item || {
    id: null,
    code: '',
    categoryId: undefined,
    name: '',
    description: '',
    sellingPrice: undefined,
  }

  return (
    <Modal {...rest} initialFocusRef={initialFocusRef}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={initialValues}
          validationSchema={ItemSchema}
          onSubmit={async (values, {setSubmitting}) => {
            window.alert(JSON.stringify(values))
            setSubmitting(false)
          }}
        >
          {({ errors }) => (
            <Form>
              <ModalHeader>
                {title || 'Item Editor'}
              </ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <VStack spacing={5}>
                  <Field name="code">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error} isRequired>
                        <FormLabel htmlFor={field.name}>Kode</FormLabel>
                        <Input {...field} id={field.name} ref={initialFocusRef}/>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="name">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error} isRequired>
                        <FormLabel htmlFor={field.name}>Nama</FormLabel>
                        <Input {...field} id={field.name}/>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="categoryId">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error}>
                        <FormLabel htmlFor={field.name}>Kategori</FormLabel>
                        <Select {...field} id={field.name}>
                          {categories!.map((cat) => (
                            <option key={cat.id} value={`${cat.id}`}>{cat.name}</option>
                          ))}
                        </Select>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="sellingPrice" type="number">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error}>
                        <FormLabel htmlFor={field.name}>Harga Jual</FormLabel>
                        <Input {...field} id={field.name} textAlign="right"/>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="description">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error}>
                        <FormLabel htmlFor={field.name}>Deskripsi</FormLabel>
                        <Textarea {...field} id={field.name}/>
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button leftIcon={<FaSave/>} type="submit" onClick={() => {
                  if (!!errors && Object.keys(errors).length > 0) {
                    toast({
                      title: 'Perlu perbaikan input',
                      status: 'warning',
                      description: Object.values(errors).join(', '),
                    })
                  }
                }}>Save</Button>
                {/* <Button>Cancel</Button> */}
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}

export default ItemListPage
