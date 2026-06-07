export type UserRole = "admin" | "manager" | "cashier";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  business_id: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
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
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category_id: string | null;
  category?: Category;
  price: number;
  cost_price: number;
  quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Customer {
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
}

export interface Sale {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer?: Customer;
  cashier_id: string;
  cashier?: UserProfile;
  sale_number: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  notes: string | null;
  items?: SaleItem[];
  created_at: string;
}

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "mobile_money";
export type SaleStatus = "completed" | "pending" | "cancelled" | "refunded";

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface Expense {
  id: string;
  business_id: string;
  category_id: string | null;
  category?: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  notes: string | null;
  receipt_url: string | null;
  created_by: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  business_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  product?: Product;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export type StockMovementType = "in" | "out" | "adjustment" | "sale" | "return";

// Dashboard analytics types
export interface DashboardStats {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_sales: number;
  revenue_change: number;
  sales_change: number;
  expenses_change: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  sales: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: number;
}

// Cart types for POS
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_amount: number;
}

export interface Cart {
  items: CartItem[];
  customer_id: string | null;
  discount_amount: number;
  payment_method: PaymentMethod;
  notes: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filter and sort types
export interface ProductFilters {
  search?: string;
  category_id?: string;
  low_stock?: boolean;
  is_active?: boolean;
}

export interface SaleFilters {
  search?: string;
  status?: SaleStatus;
  payment_method?: PaymentMethod;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ExpenseFilters {
  search?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Cart types — defined here (not in useCartStore) so server actions can import without pulling in Zustand
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_amount: number;
}