import { useRef, useState, KeyboardEventHandler } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, Input, InputRightAddon, InputGroup, Button, IconButton, Box,
  Table, Tbody, Thead, Tr, Th, Td
} from '@chakra-ui/react'
import { useAuthContext } from './auth'
import { SearchIcon } from '@chakra-ui/icons'


export interface ItemType {
  IDItem: number,
  Kode: string,
  Barcode?: string,
  Nama: string,
  Satuan: string,
  Merk?: string,
  HargaJual: number,
  HargaBeliTerakhir: number,
}

enum LoadingStateType {
  empty, loading, loaded, fullyLoaded
}

const limit = 20

export function BrowseItem({ isOpen, onClose, path, title }: {
  isOpen: boolean,
  onClose: (item?: ItemType) => void,
  path: string,
  title?: string,
}) {
  const { getJson } = useAuthContext()
  const [ q, setQ ] = useState<string>('')
  const [ oldQ, setOldQ ] = useState<string>('')
  const [ items, setItems ] = useState<Array<ItemType>>([])
  const initialRef = useRef(null)
  const [ loadingState, setLoadingState ] = useState<LoadingStateType>(LoadingStateType.empty)

  const handleSearch = async () => {
    setLoadingState(LoadingStateType.loading)
    try {
      const result = await getJson<Array<ItemType>>(path, { q, limit })
      setOldQ(q)
      setItems(result)
      if (result.length < limit) {
        setLoadingState(LoadingStateType.fullyLoaded)
      } else {
        setLoadingState(LoadingStateType.loaded)
      }
    } catch {
      setItems([])
      setLoadingState(LoadingStateType.empty)
    }
  }

  const handleSearchKeyPress: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === 'Enter') {
      handleSearch()
    }
  }

  const loadMore = async () => {
    setLoadingState(LoadingStateType.loading)
    try {
      const result = await getJson<Array<ItemType>>(path, { q: oldQ, limit, skip: items.length })
      setItems((prevState) => { return [...prevState, ...result] })
      if (result.length < limit) {
        setLoadingState(LoadingStateType.fullyLoaded)
      } else {
        setLoadingState(LoadingStateType.loaded)
      }
    } catch {
      setLoadingState(LoadingStateType.loaded)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} initialFocusRef={initialRef}>
      <ModalOverlay/>
      <ModalContent minH="60vh">
        <ModalHeader>{ title || 'Pilih Barang' }</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <VStack spacing={3}>
            <InputGroup w="100%">
              <Input
                ref={initialRef}
                id="q"
                name="q"
                value={q}
                onChange={(ev) => setQ(ev.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="masukkan kata kunci"
                disabled={loadingState === LoadingStateType.loading}
              />
              <InputRightAddon
                as={IconButton}
                icon={<SearchIcon/>}
                onClick={handleSearch}
                aria-label="search"
                isLoading={loadingState === LoadingStateType.loading}
              >
                {/* <IconButton
                  icon={<SearchIcon/>}
                  onClick={handleSearch}
                  aria-label="search"
                  isLoading={loadingState === LoadingStateType.loading}
                /> */}
              </InputRightAddon>
            </InputGroup>

            <Box overflowY="scroll" w="100%" maxH="60vh">
              <Table variant="simple" size="sm" w="100%">
                <Thead>
                  <Tr>
                    <Th>Kode</Th>
                    <Th>Nama</Th>
                    <Th>Barcode</Th>
                    <Th>Satuan</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((item, index) => (
                    <Tr
                      key={index}
                      onClick={() => onClose(item)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'gray.100',
                          color: 'blue.800',
                          cursor: 'pointer',
                        }
                      }}
                    >
                      <Td>{item.Kode}</Td>
                      <Td>{item.Nama}</Td>
                      <Td>{item.Barcode}</Td>
                      <Td>{item.Satuan}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {loadingState !== LoadingStateType.empty && (
                <Button
                  isFullWidth
                  size="sm"
                  mt={2}
                  variant="solid"
                  onClick={loadMore}
                  isLoading={loadingState === LoadingStateType.loading}
                  disabled={loadingState === LoadingStateType.fullyLoaded}
                >
                  more...
                </Button>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
