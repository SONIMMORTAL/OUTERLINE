export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin' | 'vendor'
          discount_code_used: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'vendor'
          discount_code_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'vendor'
          discount_code_used?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          editorial_story: string | null
          price: number
          compare_at_price: number | null
          category: 'hoodies' | 'tees' | 'bottoms' | 'headwear' | 'accessories'
          collection: string
          tags: string[] | null
          is_featured: boolean
          is_drop_active: boolean
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          editorial_story?: string | null
          price: number
          compare_at_price?: number | null
          category: 'hoodies' | 'tees' | 'bottoms' | 'headwear' | 'accessories'
          collection?: string
          tags?: string[] | null
          is_featured?: boolean
          is_drop_active?: boolean
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          editorial_story?: string | null
          price?: number
          compare_at_price?: number | null
          category?: 'hoodies' | 'tees' | 'bottoms' | 'headwear' | 'accessories'
          collection?: string
          tags?: string[] | null
          is_featured?: boolean
          is_drop_active?: boolean
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'OS' | null
          color: string | null
          color_hex: string | null
          inventory_quantity: number
          vendor_id: string
          vendor_sku: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'OS' | null
          color?: string | null
          color_hex?: string | null
          inventory_quantity?: number
          vendor_id?: string
          vendor_sku?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'OS' | null
          color?: string | null
          color_hex?: string | null
          inventory_quantity?: number
          vendor_id?: string
          vendor_sku?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: number
          stripe_session_id: string | null
          customer_id: string | null
          customer_email: string | null
          customer_phone: string | null
          shipping_address: Json | null
          billing_address: Json | null
          total_amount: number
          subtotal: number
          discount_applied: number
          discount_code: string | null
          status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled'
          vendor_notified: boolean
          vendor_notified_at: string | null
          tracking_number: string | null
          carrier: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_number?: number
          stripe_session_id?: string | null
          customer_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          total_amount: number
          subtotal: number
          discount_applied?: number
          discount_code?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled'
          vendor_notified?: boolean
          vendor_notified_at?: string | null
          tracking_number?: string | null
          carrier?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_number?: number
          stripe_session_id?: string | null
          customer_id?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          total_amount?: number
          subtotal?: number
          discount_applied?: number
          discount_code?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled'
          vendor_notified?: boolean
          vendor_notified_at?: string | null
          tracking_number?: string | null
          carrier?: string | null
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          product_title: string | null
          sku: string | null
          size: string | null
          color: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          variant_id?: string | null
          product_title?: string | null
          sku?: string | null
          size?: string | null
          color?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string | null
          product_title?: string | null
          sku?: string | null
          size?: string | null
          color?: string | null
          quantity?: number
          unit_price?: number
        }
      }
      discounts: {
        Row: {
          id: string
          code: string
          percentage: number | null
          is_active: boolean
          max_uses: number
          uses_count: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          percentage?: number | null
          is_active?: boolean
          max_uses?: number
          uses_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          percentage?: number | null
          is_active?: boolean
          max_uses?: number
          uses_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: {
          p_variant_id: string
          p_qty: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Discount = Database['public']['Tables']['discounts']['Row']

export interface ShippingAddress {
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  variant_id: string
  product_id: string
  title: string
  slug: string
  sku: string
  size: string | null
  color: string | null
  color_hex: string | null
  price: number
  quantity: number
  image_url: string
  inventory_quantity: number
}
