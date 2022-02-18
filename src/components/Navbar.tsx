import { useState, useRef, useEffect, useLayoutEffect, ReactNode, ComponentProps } from 'react'
import {
  Box, HStack, Button, Text, IconButton,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
} from '@chakra-ui/react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuthContext } from './auth'

import { FaHome, FaUserCircle } from 'react-icons/fa'
import { MdOutlineMenu } from 'react-icons/md'


function Navbar({ title, children }: {
  title?: string,
  children: ReactNode,
}) {
  const navbarRef = useRef<HTMLDivElement>(null)
  const [ scrollY, setScrollY ] = useState<number>(0)
  const [ navbarHeight, setNavbarHeight ] = useState<number>(60);

  useEffect(() => {
    const scrollListener = () => {
      setScrollY(window.scrollY)
    }
    document.addEventListener('scroll', scrollListener)
    return () => {
      document.removeEventListener('scroll', scrollListener)
    }
  }, [])

  useLayoutEffect(() => {
    if (!!navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
    }
  }, [])

  const { auth, logout } = useAuthContext()
  const location = useLocation()

  const containerProps: ComponentProps<typeof Box> = {
    w: { base: "100%", md: "42em", lg: "56em" },
    paddingLeft: "1em",
    paddingRight: "1em",
  }

  const navbarButtonProps: ComponentProps<typeof Button> = {
    variant: 'ghost',
    size: 'sm',
    colorScheme: 'teal',
    // sx: {
    //   '&.active': {
    //     backgroundColor: 'gray.200'
    //   }
    // }
  }

  const getNavProps = (to: string): ComponentProps<typeof Button> => ({
    ...navbarButtonProps,
    variant: location.pathname === to ? 'solid' : 'ghost',
    'as': NavLink,
    to,
  })

  const getMenuItemProps = (to: string) : ComponentProps<typeof MenuItem> => ({
    borderLeftWidth: location.pathname === to ? '3px' : undefined,
    borderLeftStyle: location.pathname === to ? 'inset' : undefined,
    borderLeftColor: location.pathname === to ? 'teal' : undefined,
    borderRightWidth: location.pathname === to ? '3px' : undefined,
    borderRightStyle: location.pathname === to ? 'inset' : undefined,
    borderRightColor: location.pathname === to ? 'teal' : undefined,
    backgroundColor: location.pathname === to ? 'teal.50' : undefined,
    'as': NavLink,
    to,
  })

  return (
    <Box minH="100vh" w="100%">
      <Box
        ref={navbarRef}
        bgColor={scrollY > 30 ? "green.100" : "rgba(0,0,0,0.02)"}
        boxShadow={scrollY > 30 ? "lg" : undefined}
        pos="fixed" top="0" w="100%" pt={2} pb={2} zIndex={3}
        display="flex" justifyContent="center" alignItems="center"
      >
        <HStack spacing={5} align="center" justify="start" display={{ base: "flex", md: "none" }} {...containerProps}>
          <Menu>
            <MenuButton
              as={IconButton}
              variant="outline"
              aria-label="Navigation"
              icon={<MdOutlineMenu/>}
              size="sm"
            />
            <MenuList>
              <MenuItem {...getMenuItemProps("/")}>
                Home
              </MenuItem>
              <MenuItem {...getMenuItemProps("/item-categories")}>
                Categories
              </MenuItem>
              <MenuItem {...getMenuItemProps("/items")}>
                Items
              </MenuItem>
              <MenuItem {...getMenuItemProps("/market-place")}>
                Market Place
              </MenuItem>
              <MenuItem {...getMenuItemProps("/kartu-stok")}>
                Kartu Stok
              </MenuItem>
              <MenuItem {...getMenuItemProps("/ringkasan-stok")}>
                Ringkasan Stok
              </MenuItem>
              <MenuDivider/>
              { auth.isAuthenticated ? (
                <MenuItem onClick={logout}>
                  Logout
                </MenuItem>
              ) : (
                <MenuItem {...getMenuItemProps("/login")}>
                  Login
                </MenuItem>
              )}
            </MenuList>
          </Menu>
          <Text fontWeight="bold">{ title || process.env.REACT_APP_NAMA || 'QSoft' }</Text>
        </HStack>
        <HStack spacing={5} display={{ base: "none", md: "flex" }} {...containerProps}>
          <Button {...getNavProps("/")}><FaHome/></Button>
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              colorScheme="teal"
            >
              Master
            </MenuButton>
            <MenuList>
              <MenuItem {...getMenuItemProps("/item-categories")}>
                Categories
              </MenuItem>
              <MenuItem {...getMenuItemProps("/items")}>
                Items
              </MenuItem>
              <MenuItem {...getMenuItemProps("/market-place")}>
                Market Place
              </MenuItem>
            </MenuList>
          </Menu>
          {/* <Button {...getNavProps("/item-categories")}>Categories</Button>
          <Button {...getNavProps("/items")}>Items</Button>
          <Button {...getNavProps("/kartu-stok")}>Kartu Stok</Button>
          <Button {...getNavProps("/ringkasan-stok")}>Ringkasan Stok</Button> */}
          <Box flexGrow={1}></Box>
          { auth.isAuthenticated ? (
            <>
            <Box sx={{
              '& > svg': {
                display: 'inline'
              }
            }}>
              <FaUserCircle/> <Text fontSize="sm" as="span"> {auth.name} [{auth.sub}] </Text>
            </Box>

            <Button {...navbarButtonProps} onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
            <Text fontSize="sm">Welcome, guest!</Text>
            <Button as={Link} to="/login" {...navbarButtonProps}>Login</Button>
            </>
          )}
        </HStack>
      </Box>
      <Box w="100%"
        display="flex" justifyContent="center" alignItems="center"
      >
        <Box mt={`${navbarHeight}px`} pt={2} pb={2} {...containerProps}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Navbar
