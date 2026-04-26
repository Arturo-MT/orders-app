import { SupabaseClient } from '@supabase/supabase-js'

export interface Product {
  id: string
  name: string
  category: string
  price: number
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
  table_id?: string | null
}

export type OrderItemDraft = {
  uid: string
  product_id: string
  name: string
  base_price: number
  quantity: number
  notes?: string
  price: number
}

export type OrderDraft = {
  type: 'DINE_IN' | 'TAKEAWAY'
  table_id: string | null
  customer_name: string | null
  table_name: string | null
  is_paid: boolean
  items: OrderItemDraft[]
}

export interface OrderResponse {
  id: string
  customer_name: string | null
  type: string
  items: OrderItem[]
  order_number: string
  status: string
  payment_status: string | null
  created_at: string
  opened_at?: string | null
  closed_at?: string | null
  dispatched_at?: string | null
  prepared_at?: string | null
  updated_at?: string | null
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

export type ProductInput = {
  name: string
  category_id: string
  price: number
}

export type ProductUpdatePayload = {
  name?: string
  category_id?: string
  price?: number
  is_active?: boolean
}

export type ProductUpdateInput = {
  id: string
  data: ProductUpdatePayload
}

export interface AuthContextType {
  user: any | null
  isSuperAdmin: boolean
  loginWithPassword: (credentials: {
    email: string
    password: string
  }) => Promise<{ error: string | null }>
  signUp: (credentials: {
    email: string
    password: string
  }) => Promise<{ error: string | null }>
  logout: () => void
  loading: boolean
  loginError: string | null
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
