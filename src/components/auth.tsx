import { useState, createContext, ReactNode, useContext, useEffect } from 'react'
import { object, string, number } from 'yup'
import { isString } from 'lodash'
import { ApiContextType, createApiContext } from './api'


export interface ParsedAccessToken {
  sub: string;
  name: string;
  exp: number;
}

export interface AuthStateType extends Partial<ParsedAccessToken> {
  isAuthenticated: boolean;
  access_token?: string;
}

interface AuthContextType extends Omit<ApiContextType, 'login'> {
  auth: AuthStateType;
  setAuthState: (value: AuthStateType) => void;
  setAccessToken: (accessToken?: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  ...createApiContext(),
  auth: { isAuthenticated: false },
  setAuthState: () => {},
  setAccessToken: () => {},
  login: async () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const parsedAccessTokenSchema = object({
  sub: string().required().min(1),
  name: string().required().min(1),
  exp: number().integer().required(),
});

export function parseAccessToken(accessToken: string): ParsedAccessToken | undefined {
  const tokens = accessToken.split('.');
  if (tokens.length !== 3 || tokens[1] === '') {
    return undefined;
  }
  try {
    const json = atob(tokens[1]);
    const parsedToken = JSON.parse(json) as ParsedAccessToken;
    parsedAccessTokenSchema.validateSync(parsedToken);
    return parsedToken;
  } catch {
    return undefined;
  }
}

export class LoginError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
  }
}

export function AuthProvider({
  children
}: {
  children: ReactNode
}) {
  const [auth, setAuthState] = useState<AuthStateType>({ isAuthenticated: false });
  const [api, setApi] = useState<ApiContextType>(() => createApiContext(auth.access_token))

  useEffect(() => {
    setApi(createApiContext(auth.access_token))
  }, [auth])

  const setAccessToken = (accessToken?: string) => {
    if (!accessToken) {
      setAuthState({ isAuthenticated: false });
    } else {
      const parsedToken = parseAccessToken(accessToken);
      if (!parsedToken) {
        setAuthState({ isAuthenticated: false });
      } else {
        console.log('token expired at :', new Date(parsedToken.exp * 1000))
        setAuthState({
          isAuthenticated: true,
          access_token: accessToken,
          ...parsedToken
        })
      }
    }
  };

  const login = async (username: string, password: string) => {
    const responseJson = await api.login(username, password)
    // const formData = new URLSearchParams();
    // formData.append('username', username);
    // formData.append('password', password);

    // const response = await fetch("/token/login", {
    //   body: formData.toString(),
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // });

    // if (response.status === 401) {
    //   const responseJson = await response.json();
    //   throw new LoginError(responseJson.detail, response.status, response.statusText);
    // }

    // if (response.status !== 200) {
    //   throw new LoginError("Invalid login response", response.status, response.statusText);
    // }

    // const responseJson = await response.json() as TokenType;

    if (!responseJson.access_token || !isString(responseJson.access_token)) {
      throw new Error("Invalid login response");
    }

    setAccessToken(responseJson.access_token);
  };

  const logout = () => setAuthState({ isAuthenticated: false });

  return (
    <AuthContext.Provider value={{ ...api, auth, setAuthState, setAccessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

type ConsumerFunction = (authContext: AuthContextType) => ReactNode;

export function AuthConsumer({ children }: {
  children: ConsumerFunction
}) {
  return (
    <AuthContext.Consumer>
      {children}
    </AuthContext.Consumer>
  )
}
