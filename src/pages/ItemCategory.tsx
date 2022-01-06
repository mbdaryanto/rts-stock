import { useState, useEffect } from 'react'
import { Heading, Box, List, ListItem, CircularProgress, Center, IconButton, HStack } from '@chakra-ui/react'
import * as yup from 'yup'
import { Formik, Field, Form, FieldProps } from 'formik'
import { useAuthContext } from '../components/auth'
import { FaPlus, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import { ItemCategorySchema, ItemCategoriesSchema } from '../schema/Item'


function ItemCategoryPage() {
  const [categories, setCategories] = useState<yup.TypeOf<typeof ItemCategoriesSchema>>([])
  const [isLoading, setLoading] = useState(false)
  const { getJson } = useAuthContext()

  useEffect(() => {
    let pageIsMounted = true
    setLoading(true)
    getJson<yup.TypeOf<typeof ItemCategoriesSchema>>('/item/category/list').then(
      (response) => pageIsMounted && setCategories(response)
    ).finally(() => pageIsMounted && setLoading(false))
    return () => {
      pageIsMounted = false
    }
  }, [getJson])

  return (
    <Box>
      <Heading>Item Categories</Heading>
      <ItemCategoryBody
        isLoading={isLoading}
        categories={categories}
      />
    </Box>
  )
}

function ItemCategoryBody({ isLoading, categories }: {
  isLoading: boolean,
  categories: yup.TypeOf<typeof ItemCategoriesSchema>,
}) {
  if (isLoading) return (
    <Center w="100%" h="200px">
      <CircularProgress isIndeterminate/>
    </Center>
  )

  return (
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
          <HStack>
            <Box flexGrow={1}>
              {category.name}
            </Box>
            <IconButton aria-label="Edit" icon={<FaEdit/>} onClick={() => {}} variant="ghost" size="sm"/>
            <IconButton aria-label="Delete" icon={<FaTrash/>} variant="ghost" size="sm"/>
          </HStack>
        </ListItem>
      )))}
    </List>
  )
}

export default ItemCategoryPage
