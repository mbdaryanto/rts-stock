import { useState, useEffect, ComponentProps, useRef } from 'react'
import {
  Heading, Box, List, ListItem, CircularProgress, Center, IconButton,
  HStack, Input, Button, VStack, Modal, useToast, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel,
  FormErrorMessage, Textarea, ModalFooter, useDisclosure } from '@chakra-ui/react'
import { Formik, Field, Form, FieldProps } from 'formik'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import { ItemCategorySchema, ItemCategoryType } from '../schema/Item'
import { EditorModeEnum } from './utils'


function ItemCategoryPage() {
  const [categories, setCategories] = useState<Array<ItemCategoryType>>([])
  const [isLoading, setLoading] = useState(false)
  const { getItemCategories, saveItemCategory } = useAuthContext()

  useEffect(() => {
    let pageIsMounted = true
    setLoading(true)
    getItemCategories().then(
      (response) => pageIsMounted && setCategories(response)
    ).finally(() => pageIsMounted && setLoading(false))
    return () => {
      pageIsMounted = false
    }
  }, [getItemCategories])

  const handleSave = async (itemCategory: ItemCategoryType, editorMode: EditorModeEnum) => {
    const response = await saveItemCategory(itemCategory)
    if (editorMode === EditorModeEnum.insert) {
      setCategories(old => [...old, response.itemCategory!])
    } else {
      setCategories(old => old.map(row => row.id === response.itemCategory!.id ? response.itemCategory! : row))
    }
  }

  return (
    <Box>
      <Heading>Item Categories</Heading>
      <ItemCategoryBody
        isLoading={isLoading}
        categories={categories}
        onSave={handleSave}
      />
    </Box>
  )
}

function ItemCategoryBody({ isLoading, categories, onSave }: {
  isLoading: boolean,
  categories: Array<ItemCategoryType>,
  onSave: (itemCategory: ItemCategoryType, editorMode: EditorModeEnum) => Promise<void>,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [ editorMode, setEditorMode ] = useState<EditorModeEnum>(EditorModeEnum.insert)
  const [ record, setRecord ] = useState<ItemCategoryType | undefined>()

  if (isLoading) return (
    <Center w="100%" h="200px">
      <CircularProgress isIndeterminate/>
    </Center>
  )

  const handleClose = async (itemCategory?: ItemCategoryType): Promise<void> => {
    if (!!itemCategory) {
      await onSave(itemCategory, editorMode)
      // if (editorMode === EditorModeEnum.insert) {
      //   setItems(oldValues => [...oldValues, item])
      // } else {
      //   setItems(oldValues => oldValues.map(value => value.id === item.id ? item : value))
      // }
    }
    onClose()
  }

  return (
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
      {categories?.map((category => (
        <ListItem key={category.id!}>
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
              <dt>Name</dt>
              <dd>{category.name}</dd>
            </Box>
            <Box as="dl">
              <dt>Description</dt>
              <dd>{category.description}</dd>
            </Box>
            <Box flexGrow={1}>
            </Box>
            <IconButton aria-label="Edit" icon={<FaEdit/>} onClick={() => {
              setEditorMode(EditorModeEnum.update)
              setRecord(category)
              onOpen()
            }} variant="ghost" size="sm"/>
            <IconButton aria-label="Delete" icon={<FaTrash/>} variant="ghost" size="sm"/>
          </HStack>
        </ListItem>
      )))}
    </List>

    <Button
      leftIcon={<FaPlus/>}
      onClick={() => {
        setEditorMode(EditorModeEnum.insert)
        setRecord(undefined)
        onOpen()
      }}
      size="sm"
    >
      New Category
    </Button>
    <ItemCategoryEditorDialog itemCategory={record} mode={editorMode} isOpen={isOpen} onClose={handleClose}/>
    </>
  )
}
interface ItemCategoryEditorDialogProps extends Omit<ComponentProps<typeof Modal>, 'children' | 'onClose'> {
  itemCategory?: ItemCategoryType,
  mode: EditorModeEnum,
  onClose: (itemCategory?: ItemCategoryType) => Promise<void>,
}

function ItemCategoryEditorDialog({ itemCategory, mode, onClose, ...rest }: ItemCategoryEditorDialogProps) {
  const initialFocusRef = useRef(null)
  const toast = useToast()

  const initialValues: Partial<ItemCategoryType> | undefined = {
    id: itemCategory?.id,
    name: itemCategory?.name ?? '',
    description: itemCategory?.description ?? '',
    isActive: itemCategory?.isActive ?? true,
  }

  return (
    <Modal {...rest} initialFocusRef={initialFocusRef} onClose={() => onClose(undefined)}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={initialValues}
          validationSchema={ItemCategorySchema}
          onSubmit={async (values, {setSubmitting}) => {
            const itemCategoryCast = ItemCategorySchema.cast(values)
            // window.alert(JSON.stringify(itemCategoryCast, null, 2))
            await onClose(itemCategoryCast)
            setSubmitting(false)
          }}
        >
          {({ errors }) => (
            <Form>
              <ModalHeader>
                {mode === EditorModeEnum.insert ? 'New Category' : 'Edit Category'}
              </ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <VStack spacing={5}>
                  <Field name="name">
                    {({ field, meta }: FieldProps<string>) => (
                      <FormControl isInvalid={!!meta.touched && !!meta.error} isRequired>
                        <FormLabel htmlFor={field.name}>Nama</FormLabel>
                        <Input {...field} id={field.name}  ref={initialFocusRef}/>
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

export default ItemCategoryPage
