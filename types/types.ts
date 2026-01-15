import { SupabaseClient } from '@supabase/supabase-js'

export interface Product {
  id: string
  name: string
  category: string
  price: number
}

export interface StoreConfig {
  printer_name: string
  printer_address: string
}

export interface OrderItem {
  id: string
  product: string
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
  order_number?: string
  status: string
}

export interface OrderResponse {
  id: string
  customer_name: string
  type: string
  items: OrderItem[]
  order_number: string
  status: string
  created_at: string
}

export interface OrderUpdate {
  status?: string
  customer_name?: string
  type?: string
  items?: OrderItem[]
  order_number?: string
}

export interface Category {
  id: string
  name: string
}

export interface ProductData {
  id: string
  name: string
  category: string
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
  client: SupabaseClient
}
