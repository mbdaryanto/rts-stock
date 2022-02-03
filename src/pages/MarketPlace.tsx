import { useState, useEffect, ComponentProps, useRef } from 'react'
import {
  Heading, Box, CircularProgress, Center, IconButton,
  Input, Button, VStack, Modal, useToast, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, FormControl, FormLabel,
  Table, Thead, Tbody, Tr, Th, Td,
  FormErrorMessage, Textarea, ModalFooter, useDisclosure } from '@chakra-ui/react'
import { Formik, Field, Form, FieldProps } from 'formik'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import { MarketPlaceSchema, MarketPlaceType } from '../schema/sales'
import { EditorModeEnum } from './utils'
import { Active, CheckboxField } from '../components/common'


function MarketPlacePage() {
  const [marketPlaces, setMarketPlaces] = useState<Array<MarketPlaceType>>([])
  const [isLoading, setLoading] = useState(false)
  const { getJson, postJson } = useAuthContext()

  useEffect(() => {
    let pageIsMounted = true
    setLoading(true)
    getJson('/market-place/list').then(
      (response) => pageIsMounted && setMarketPlaces(response)
    ).finally(() => pageIsMounted && setLoading(false))
    return () => {
      pageIsMounted = false
    }
  }, [getJson])

  const handleSave = async (marketPlace: MarketPlaceType, editorMode: EditorModeEnum) => {
    const response = await postJson('/market-place/save', marketPlace)
    const savedData = MarketPlaceSchema.cast(response.data)
    if (editorMode === EditorModeEnum.insert) {
      setMarketPlaces(old => [...old, savedData])
    } else {
      setMarketPlaces(old => old.map(row => row.id === savedData.id ? savedData : row))
    }
  }

  return (
    <Box>
      <Heading>Market Places</Heading>
      <MarketPlaceBody
        isLoading={isLoading}
        marketPlaces={marketPlaces}
        onSave={handleSave}
      />
    </Box>
  )
}

function MarketPlaceBody({ isLoading, marketPlaces, onSave }: {
  isLoading: boolean,
  marketPlaces: Array<MarketPlaceType>,
  onSave: (marketPlace: MarketPlaceType, editorMode: EditorModeEnum) => Promise<void>,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [ editorMode, setEditorMode ] = useState<EditorModeEnum>(EditorModeEnum.insert)
  const [ record, setRecord ] = useState<MarketPlaceType | undefined>()

  if (isLoading) return (
    <Center w="100%" h="200px">
      <CircularProgress isIndeterminate/>
    </Center>
  )

  const handleClose = async (marketPlace?: MarketPlaceType): Promise<void> => {
    if (!!marketPlace) {
      await onSave(marketPlace, editorMode)
      // if (editorMode === EditorModeEnum.insert) {
      //   setItems(oldValues => [...oldValues, item])
      // } else {
      //   setItems(oldValues => oldValues.map(value => value.id === item.id ? item : value))
      // }
    }
    onClose()
  }

  return (
    <VStack spacing={8} mt={8}>
      <Table size="sm" textAlign="start" sx={{
        // '& > tr': {
        //   'padding': '4px',
        // },
        // '& > tr ~ tr': {
        //   'borderTopWidth': '1px',
        //   'borderTopColor': 'gray.300',
        // },
        '& tbody > tr:nth-of-type(even)': {
          bgColor: 'gray.100',
        },
        '& tbody > tr:hover': {
          bgColor: 'blue.100',
        },
        // '& th': {
        //   textTransform: 'uppercase',
        //   fontSize: 'xs',
        //   color: 'gray.500',
        // },
        // '& td': {
        //   fontSize: 'sm',
        // },
        // '& tbody td.align-right': {
        //   display: 'flex',
        //   justifyContent: 'right',
        //   alignItems: 'center',
        // },
        // '& tbody td.align-center': {
        //   display: 'flex',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        // },
      }}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th textAlign="center">Active</Th>
            <Th textAlign="center">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {marketPlaces?.map((row => (
            <Tr key={row.id!}>
              <Td>{row.name}</Td>
              <Td>{row.description}</Td>
              <Td textAlign="center">
                <Active isActive={row.isActive}/>
              </Td>
              <Td textAlign="center">
                <IconButton aria-label="Edit" icon={<FaEdit/>} onClick={() => {
                  setEditorMode(EditorModeEnum.update)
                  setRecord(row)
                  onOpen()
                }} variant="ghost" size="sm"/>
                <IconButton aria-label="Delete" icon={<FaTrash/>} variant="ghost" size="sm"/>
              </Td>
            </Tr>
          )))}
        </Tbody>
      </Table>

      <Button
        leftIcon={<FaPlus/>}
        onClick={() => {
          setEditorMode(EditorModeEnum.insert)
          setRecord(undefined)
          onOpen()
        }}
        size="sm"
      >
        New Market Place
      </Button>
      <MarketPlaceEditorDialog marketPlace={record} mode={editorMode} isOpen={isOpen} onClose={handleClose}/>
    </VStack>
  )
}
interface ItemCategoryEditorDialogProps extends Omit<ComponentProps<typeof Modal>, 'children' | 'onClose'> {
  marketPlace?: MarketPlaceType,
  mode: EditorModeEnum,
  onClose: (marketPlace?: MarketPlaceType) => Promise<void>,
}

function MarketPlaceEditorDialog({ marketPlace, mode, onClose, ...rest }: ItemCategoryEditorDialogProps) {
  const initialFocusRef = useRef(null)
  const toast = useToast()

  const initialValues: Partial<MarketPlaceType> | undefined = {
    id: marketPlace?.id,
    name: marketPlace?.name ?? '',
    description: marketPlace?.description ?? '',
    isActive: marketPlace?.isActive ?? true,
  }

  return (
    <Modal {...rest} initialFocusRef={initialFocusRef} onClose={() => onClose(undefined)}>
      <ModalOverlay/>
      <ModalContent>
        <Formik
          initialValues={initialValues}
          validationSchema={MarketPlaceSchema}
          onSubmit={async (values, {setSubmitting}) => {
            const marketPlaceCast = MarketPlaceSchema.cast(values)
            // window.alert(JSON.stringify(marketPlaceCast, null, 2))
            await onClose(marketPlaceCast)
            setSubmitting(false)
          }}
        >
          {({ errors }) => (
            <Form>
              <ModalHeader>
                {mode === EditorModeEnum.insert ? 'New Market Place' : 'Edit Market Place'}
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

                  <CheckboxField name="isActive" label={'Aktif'}/>
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

export default MarketPlacePage
