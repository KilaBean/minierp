export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          currency: string;
          tax_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          tax_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          currency?: string;
          tax_rate?: number;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          business_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          business_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          sku: string | null;
          description: string | null;
          category_id: string | null;
          price: number;
          cost_price: number;
          quantity: number;
          low_stock_threshold: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          sku?: string | null;
          description?: string | null;
          category_id?: string | null;
          price: number;
          cost_price?: number;
          quantity?: number;
          low_stock_threshold?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          sku?: string | null;
          description?: string | null;
          category_id?: string | null;
          price?: number;
          cost_price?: number;
          quantity?: number;
          low_stock_threshold?: number;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          total_purchases: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          total_purchases?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          total_purchases?: number;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          cashier_id: string;
          sale_number: string;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          payment_method: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          cashier_id: string;
          sale_number: string;
          subtotal: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount: number;
          payment_method: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          status?: string;
          notes?: string | null;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          discount_amount?: number;
          total_price: number;
        };
        Update: never;
      };
      expenses: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          title: string;
          amount: number;
          date: string;
          notes: string | null;
          receipt_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          title: string;
          amount: number;
          date: string;
          notes?: string | null;
          receipt_url?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          category_id?: string | null;
          title?: string;
          amount?: number;
          date?: string;
          notes?: string | null;
          receipt_url?: string | null;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string | null;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          type: string;
          quantity: number;
          reference: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          type: string;
          quantity: number;
          reference?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
