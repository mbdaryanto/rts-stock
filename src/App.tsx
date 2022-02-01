import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './components/auth'
import Navbar from './components/Navbar'
import ItemListPage from './pages/ItemList'
import ItemCategoryPage from './pages/ItemCategory'
import MarketPlacePage from './pages/MarketPlace'

const App = () => (
  <ChakraProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LayoutPage/>}>
            <Route index element={'Main Page'}/>
            <Route path="login" element={'Login Page'}/>
            <Route path="items" element={<ItemListPage/>}/>
            <Route path="item-categories" element={<ItemCategoryPage/>}/>
            <Route path="market-place" element={<MarketPlacePage/>}/>
            <Route path="kartu-stok" element={
              <RequireAuth>
                <div>Kartu Stok</div>
              </RequireAuth>
            }/>
            <Route path="ringkasan-stok" element={
              <RequireAuth>
                <div>Ringkasan Stok</div>
              </RequireAuth>
            }/>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </ChakraProvider>
)

const LayoutPage = () => (
  <Navbar title="Stock App">
    <Outlet/>
  </Navbar>
)

function RequireAuth({ children }: { children: JSX.Element }) {
  const { auth } = useAuthContext()
  let location = useLocation();

  if (!auth.isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default App;
