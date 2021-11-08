import type { ComponentProps } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './components/auth'
import ItemListPage from './pages/ItemList'

const App = () => (
  <ChakraProvider>
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/login">
            Login Page
          </Route>
          <Route path="/" exact>
            Main Page
          </Route>
          <Route path="/items">
            <ItemListPage/>
          </Route>
          <PrivateRoute path="/kartu-stok">
            Kartu Stok
          </PrivateRoute>
          <PrivateRoute path="/ringkasan-stok">
            Ringkasan Stok
          </PrivateRoute>
          <Route path="/test">
            Test
          </Route>
        </Switch>
      </Router>
    </AuthProvider>
  </ChakraProvider>
)

type PrivateRouteProps = ComponentProps<typeof Route>

function PrivateRoute({ children, ...rest }: PrivateRouteProps) {
  const { auth } = useAuthContext()
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default App;
