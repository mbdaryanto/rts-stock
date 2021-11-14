import type { ComponentProps } from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  Heading, List, ListItem, IconButton, Button, VStack, Box, HStack,
  FormControl, Input, FormLabel, FormErrorMessage, Textarea, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, useToast
} from '@chakra-ui/react'
import * as yup from 'yup'
import { Formik, Field, Form, FieldProps } from 'formik'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'

const ItemCategorySchema = yup.object({
  id: yup.number().integer().required(),
  name: yup.string().max(100).required(),
})

const ItemSchema = yup.object({
  id: yup.number().nullable(),
  code: yup.string().max(50).required('Kode harus diisi'),
  categoryId: yup.number().integer(),
  name: yup.string().max(100).required('Nama harus diisi'),
  description: yup.string().nullable(),
  sellingPrice: yup.number(),
  category: ItemCategorySchema.nullable(),
})

const ItemCategoriesSchema = yup.array().of(ItemCategorySchema).ensure()

enum EditorModeEnum {
  insert,
  update,
}

function ItemListPage() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [ editorMode, setEditorMode ] = useState<EditorModeEnum>(EditorModeEnum.insert)
  const [ items, setItems ] = useState<Array<yup.TypeOf<typeof ItemSchema>>>([])
  const [ itemToEdit, setItemToEdit ] = useState<yup.TypeOf<typeof ItemSchema> | undefined>()
  const { getItems } = useAuthContext()

  useEffect(() => {
    getItems().then(
      response => setItems(response)
    )
  }, [getItems])

  const handleClose = (item?: yup.TypeOf<typeof ItemSchema>): void => {
    if (!!item) {
      if (editorMode === EditorModeEnum.insert) {
        setItems(oldValues => [...oldValues, item])
      } else {
        setItems(oldValues => oldValues.map(value => value.id === item.id ? item : value))
      }
    }
    onClose()
  }

  return (
    <>
      <Heading>Items</Heading>
      <List pt='8px' pb='8px' sx={{
        '& > li': {
          'padding': '4px',
        },
        '& > li ~ li': {
          'borderTopWidth': '1px',
          'borderTopColor': 'gray.300',
        },
        '& > li:nth-of-type(even)': {
          bgColor: 'gray.100',
        },
        '& > li:hover': {
          bgColor: 'blue.100',
        },
      }}>
        {items.map(item => (
          <ListItem key={item.id}>
            <Box as="dl" sx={{
              '& dt': {
                textTransform: 'uppercase',
                fontSize: 'xs',
                color: 'gray.500',
              },
              '& dd': {
                fontSize: 'sm',
              },
            }}>
              <HStack spacing={5}>
                <Box>
                  <dt>Kode</dt>
                  <dd>{item.code}</dd>
                </Box>
                <Box>
                  <dt>Nama</dt>
                  <dd>{item.name}</dd>
                </Box>
                <Box>
                  <dt>Kategori</dt>
                  <dd>{item.category?.name}</dd>
                </Box>
                <Box>
                  <dt>Deskripsi</dt>
                  <dd>{item.description}</dd>
                </Box>
                <Box>
                  <dt>Harga Jual</dt>
                  <dd>{item.sellingPrice}</dd>
                </Box>
                <Box flexGrow={1}/>
                <IconButton aria-label="Edit" icon={<FaEdit/>} onClick={() => {
                  setEditorMode(EditorModeEnum.update)
                  setItemToEdit(item)
                  onOpen()
                }} variant="ghost" size="sm"/>
                <IconButton aria-label="Delete" icon={<FaTrash/>} variant="ghost" size="sm"/>
              </HStack>
            </Box>
          </ListItem>
        ))}
      </List>
      <Button leftIcon={<FaPlus/>} onClick={() => {
        setEditorMode(EditorModeEnum.insert)
        setItemToEdit(undefined)
        onOpen()
      }} size="sm">
        New Item
      </Button>
      <ItemEditorDialog item={itemToEdit} mode={editorMode} isOpen={isOpen} onClose={handleClose}/>
    </>
  )
}

interface ItemEditorDialogProps extends Omit<ComponentProps<typeof Modal>, 'children' | 'onClose'> {
  item?: yup.TypeOf<typeof ItemSchema>,
  mode: EditorModeEnum,
  onClose: (item?: yup.TypeOf<typeof ItemSchema>) => void,
}

function ItemEditorDialog({ item, mode, onClose, ...rest }: ItemEditorDialogProps) {
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


  const initialValues: Partial<yup.Asserts<typeof ItemSchema>> | undefined = {
    id: item?.id,
    code: item?.code ?? '',
    categoryId: item?.categoryId,
    name: item?.name ?? '',
    description: item?.description ?? '',
    sellingPrice: item?.sellingPrice,
    category: !!item ? {
      id: item.category!.id!,
      name: item.category!.name!,
     } : null,
  }

  return (
    <Modal {...rest} initialFocusRef={initialFocusRef} onClose={() => onClose(undefined)}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={initialValues}
          validationSchema={ItemSchema}
          onSubmit={async (values, {setSubmitting}) => {
            const itemCast = ItemSchema.cast(values)
            window.alert(JSON.stringify(itemCast, null, 2))
            onClose(itemCast)
            setSubmitting(false)
          }}
        >
          {({ errors }) => (
            <Form>
              <ModalHeader>
                {mode === EditorModeEnum.insert ? 'New Item' : 'Edit Item'}
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
