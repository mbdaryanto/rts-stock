import type { ComponentProps } from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  Heading, List, ListItem, IconButton, Button, VStack, Box, HStack,
  FormControl, Input, FormLabel, FormErrorMessage, Textarea, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, useToast, CircularProgress, Center
} from '@chakra-ui/react'
import * as yup from 'yup'
import { Formik, Field, Form, FieldProps } from 'formik'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import { ItemSchema, ItemType, ItemCategoriesSchema } from '../schema/Item'
import { EditorModeEnum } from './utils'


function ItemListPage() {
  const [isLoading, setLoading] = useState(false)
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [ editorMode, setEditorMode ] = useState<EditorModeEnum>(EditorModeEnum.insert)
  const [ items, setItems ] = useState<Array<ItemType>>([])
  const [ itemToEdit, setItemToEdit ] = useState<ItemType | undefined>()
  const { getItems, saveItem } = useAuthContext()

  useEffect(() => {
    let pageIsMounted = true
    setLoading(true)
    getItems().then(
      response => pageIsMounted && setItems(response)
    ).finally(() => pageIsMounted && setLoading(false))
    return () => {
      pageIsMounted = false
    }
  }, [getItems])

  const handleClose = async (item?: ItemType): Promise<void> => {
    if (!!item) {
      const response = await saveItem(item)
      if (editorMode === EditorModeEnum.insert) {
        setItems(oldValues => [...oldValues, response.data!])
      } else {
        setItems(oldValues => oldValues.map(value => value.id === item.id ? response.data! : value))
      }
    }
    onClose()
  }

  return (
    <>
      <Heading>Items</Heading>
      { isLoading ? (
        <Center w="100%" h="200px">
          <CircularProgress isIndeterminate/>
        </Center>
      ) : (
        <>
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

              <HStack spacing={5} paddingX={2} align="start" sx={{
                '& dt': {
                  textTransform: 'uppercase',
                  fontSize: 'xs',
                  color: 'gray.500',
                },
                '& dd': {
                  fontSize: 'sm',
                },
              }}>
                <Box as="dl">
                  <dt>Kode</dt>
                  <dd>{item.code}</dd>
                </Box>
                <Box as="dl">
                  <dt>Nama</dt>
                  <dd>{item.name}</dd>
                </Box>
                <Box as="dl">
                  <dt>Kategori</dt>
                  <dd>{item.category?.name}</dd>
                </Box>
                <Box as="dl">
                  <dt>Deskripsi</dt>
                  <dd>{item.description}</dd>
                </Box>
                <Box as="dl">
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
      )}
    </>
  )
}

interface ItemEditorDialogProps extends Omit<ComponentProps<typeof Modal>, 'children' | 'onClose'> {
  item?: yup.TypeOf<typeof ItemSchema>,
  mode: EditorModeEnum,
  onClose: (item?: yup.TypeOf<typeof ItemSchema>) => Promise<void>,
}

function ItemEditorDialog({ item, mode, onClose, ...rest }: ItemEditorDialogProps) {
  const initialFocusRef = useRef(null)
  const [categories, setCategories] = useState<yup.TypeOf<typeof ItemCategoriesSchema>>([])
  const toast = useToast()
  const { getItemCategories } = useAuthContext()

  useEffect(() => {
    getItemCategories().then(
      response => setCategories(ItemCategoriesSchema.cast(response))
    ).catch(
      error => console.log(error)
    )
  }, [getItemCategories])


  const initialValues: Partial<yup.TypeOf<typeof ItemSchema>> | undefined = {
    id: item?.id,
    code: item?.code ?? '',
    categoryId: item?.categoryId ?? 0,
    name: item?.name ?? '',
    description: item?.description ?? '',
    sellingPrice: item?.sellingPrice,
    // category: item?.category,
    isActive: item?.isActive ?? true,
  }

  return (
    <Modal {...rest} initialFocusRef={initialFocusRef} onClose={() => onClose(undefined)}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={initialValues}
          validationSchema={ItemSchema}
          onSubmit={async (values, {setSubmitting}) => {
            values.category = undefined
            const itemCast = ItemSchema.cast(values)
            // window.alert(JSON.stringify(itemCast, null, 2))
            await onClose(itemCast)
            setSubmitting(false)
          }}
        >
          {({ values , errors, setFieldValue }) => (
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
                      <FormControl isInvalid={!!meta.touched && !!meta.error} isRequired>
                        <FormLabel htmlFor={field.name}>Kategori</FormLabel>
                        <Select {...field} id={field.name} onChange={(ev) => {
                          console.log(ev)
                          field.onChange(ev)
                        }}>
                          <option value="">Pilih kategori</option>
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
                    // alert(JSON.stringify(values))
                    console.log(errors)
                    toast({
                      title: 'Perlu perbaikan input',
                      status: 'warning',
                      description: Object.values(errors).map(value => JSON.stringify(value)).join(', '),
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
