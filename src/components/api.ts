import { toString, toPairs } from 'lodash'
import type { ItemType, ItemCategoryType } from '../schema/Item'
import type { SaveResponseType } from '../schema/common'

interface Dictionary {
  [key: string]: string | number
}

interface TokenType {
  access_token: string
  token_type: string
}

export interface ApiContextType {
  getJson: <T=any>(path: string, query?: URLSearchParams | Dictionary) => Promise<T>
  postJson: <T=any>(path: string, body: any) => Promise<T>
  postFormData: <T=any>(path: string, formData: URLSearchParams | Dictionary) => Promise<T>
  login: (username: string, password: string) => Promise<TokenType>
  getItems: () => Promise<Array<ItemType>>
  saveItem: (item: ItemType) => Promise<SaveResponseType>
  getItemCategories: () => Promise<Array<ItemCategoryType>>
  saveItemCategory: (itemCategory: ItemCategoryType) => Promise<SaveResponseType>
}

export function createApiContext(accessToken?: string): ApiContextType {
  let authHeaders: HeadersInit
  if (!!accessToken) {
    authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
    }
  } else {
    authHeaders = {}
  }

  const processJsonResponse = async <T=any>(response: Response): Promise<T> => {
    if (response.headers.get('Content-Type') !== 'application/json') {
      throw Error('Error response type is not json')
    }

    const result = await response.json()

    if (response.status === 401) {
      // need to login
      console.log(result)
      throw Error(result.detail)
    }

    if (response.status !== 200) {
      console.log(response.statusText, response.status, result)
      throw Error('Error response')
    }

    return result as T
  }

  const getJson: ApiContextType["getJson"] = async <T=any>(path: string, query?: URLSearchParams | Dictionary): Promise<T> => {
    // const url = new window.URL(path, window.location.href)
    let url: string
    if (!query) {
      url = path
    }
    if (query instanceof URLSearchParams) {
      url = `${path}?${query.toString()}`
    } else {
      const searchParams = new URLSearchParams(toPairs(query).map(([key, value]) => [key, toString(value)]))
      url = `${path}?${searchParams.toString()}`
    }

    console.log(`fetch ${url}...`)

    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...authHeaders,
      },
    })

    return await processJsonResponse<T>(response)
  }

  const postJson: ApiContextType["postJson"] = async <T=any>(path: string, body: any): Promise<T> => {
    console.log(`fetch ${path}...`)
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(body),
    })

    return await processJsonResponse<T>(response)
  }

  const postFormData: ApiContextType["postFormData"] = async <T=any>(path: string, formData: URLSearchParams | Dictionary): Promise<T> => {
    console.log(`fetch ${path}...`)
    let body: string
    if (formData instanceof URLSearchParams) {
      body = formData.toString()
    } else {
      const formFields = new URLSearchParams(toPairs(formData).map(([key, value]) => [key, toString(value)]))
      body = formFields.toString()
    }

    const response = await fetch(path, {
      body,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        ...authHeaders,
      },
    })

    return await processJsonResponse<T>(response)
  }

  return {
    getJson,
    postJson,
    postFormData,
    login: (username: string, password: string): Promise<TokenType> => postFormData<TokenType>('/token/login', {username, password}),
    getItems: (query?: URLSearchParams | Dictionary) => getJson<Array<ItemType>>('/item/list', query),
    saveItem: (item: ItemType) => postJson<SaveResponseType>('/item/save', item),
    getItemCategories: (query?: URLSearchParams | Dictionary) => getJson<Array<ItemCategoryType>>('/item/category/list', query),
    saveItemCategory: (itemCategory: ItemCategoryType) => postJson<SaveResponseType>('/item/category/save', itemCategory),
  }
}
