import { useState, createContext, ReactNode, useContext } from 'react'
import { object, string, number } from 'yup'
import { isString, forEach, toString } from 'lodash'


export interface ParsedAccessToken {
  sub: string;
  name: string;
  exp: number;
}

interface TokenType {
  access_token: string;
  token_type: string;
}

export interface AuthStateType extends Partial<ParsedAccessToken> {
  isAuthenticated: boolean;
  access_token?: string;
}

interface AuthContextType {
  auth: AuthStateType;
  setAuthState: (value: AuthStateType) => void;
  setAccessToken: (accessToken?: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getJson: <T = any>(path: string, params?: {[key: string]: string | number}) => Promise<T>;
  postJson: <T = any>(path: string, body: any) => Promise<T>;
}

export const AuthContext = createContext<AuthContextType>({
  auth: { isAuthenticated: false },
  setAuthState: () => {},
  setAccessToken: () => {},
  login: async () => {},
  logout: () => {},
  getJson: async function<T = any>() {return {} as T},
  postJson: async function<T = any>() {return {} as T},
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
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch("/token/login", {
      body: formData.toString(),
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.status === 401) {
      const responseJson = await response.json();
      throw new LoginError(responseJson.detail, response.status, response.statusText);
    }

    if (response.status !== 200) {
      throw new LoginError("Invalid login response", response.status, response.statusText);
    }

    const responseJson = await response.json() as TokenType;

    if (!responseJson.access_token || !isString(responseJson.access_token)) {
      throw new Error("Invalid login response");
    }

    setAccessToken(responseJson.access_token);
  };

  const logout = () => setAuthState({ isAuthenticated: false });

  async function getJson<T = any>(path: string, params?: {[key: string]: string | number}): Promise<T> {

    let requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }

    if (auth.isAuthenticated && auth.access_token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${auth.access_token}`
      }
    }

    // if (!auth.isAuthenticated || !auth.access_token) {
    //   throw Error('User is not authenticated')
    // }

    const url = new window.URL(path, window.location.href)
    if (!!params) {
      forEach(params, (value, key) => url.searchParams.append(key, toString(value)))
    }

    console.log(`fetch ${url.href}...`)

    const response = await fetch(url.href, requestOptions)

    if (response.headers.get('Content-Type') !== 'application/json') {
      throw Error('Error response type is not json')
    }

    const result = await response.json()

    if (response.status === 401) {
      // need to login
      logout()
      console.log(result)
      throw Error(result.detail)
    }

    if (response.status !== 200) {
      console.log(response.statusText, response.status, result)
      throw Error('Error response')
    }

    return result as T
  }

  async function postJson<T = any>(path: string, body: any): Promise<T> {
    let requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }

    if (auth.isAuthenticated && auth.access_token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${auth.access_token}`
      }
    }
    // if (!auth.isAuthenticated || !auth.access_token) {
    //   throw Error('User is not authenticated')
    // }
    console.log(`fetch ${path}...`)
    const response = await fetch(path, requestOptions)

    if (response.headers.get('Content-Type') !== 'application/json') {
      throw Error('Error response type is not json')
    }

    const result = await response.json()

    if (response.status === 401) {
      // need to login
      logout()
      console.log(result)
      throw Error(result.detail)
    }

    if (response.status !== 200) {
      console.log(response.statusText, response.status, result)
      throw Error('Error response')
    }

    return result as T
  }

  return (
    <AuthContext.Provider value={{ auth, setAuthState, setAccessToken, login, logout, getJson, postJson }}>
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
