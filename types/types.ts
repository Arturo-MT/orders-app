import { AxiosInstance } from 'axios'

export interface Product {
  id: number
  name: string
  category: string
  price: number
}

export interface OrderItem {
  id: number
  product: number
  name: string
  quantity: number
  price: number
  basePrice: number
  description?: string
}

export interface Order {
  customer_name: string
  type: string
  items: OrderItem[]
}

export interface Category {
  id: number
  name: string
}

export interface ProductData {
  id: number
  name: string
  category: number
  price: number
}

export interface Device {
  name: string
  address: string
}

export interface AuthContextType {
  user: any | null
  loginWithPassword: (credentials: {
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  renewToken: () => Promise<{ access: string }>
  loading: boolean
  loginError: string | null
  registerUser?: (details: {
    username: string
    email: string
    password: string
  }) => Promise<void>
}

export interface AuthState {
  user: any | null
  loading: boolean
  loginError: string | null
}

export type AuthAction =
  | { type: 'FETCH_USER' }
  | { type: 'SET_USER'; payload: { user: any } }
  | { type: 'REMOVE_USER' }
  | { type: 'SET_LOGIN_ERROR'; payload: { loginError: string | null } }

export interface UserResponseData {
  access?: string
  refresh?: string
  [key: string]: any
}

export interface FetchContextType {
  client: AxiosInstance
}
