import type { ReactNode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './components/auth'

const App = () => (
  <ChakraProvider>
    <AuthProvider>
      <Router>
        <Switch>
          <Route path="/login">
            Login Page
          </Route>
          <PrivateRoute path="/" exact>
            Main Page
          </PrivateRoute>
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

function PrivateRoute({ children, ...rest }: {
  children: ReactNode,
  [key: string]: any,
}) {
  const { auth } = useAuthContext();
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
