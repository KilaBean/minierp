import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
    business_name: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  cost_price: z.coerce.number().min(0, "Cost price must be a positive number"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  low_stock_threshold: z.coerce
    .number()
    .min(0, "Threshold must be a positive number"),
  is_active: z.boolean().default(true),
});

// Customer schemas
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// Expense schemas
export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  category_id: z.string().optional(),
  notes: z.string().optional(),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

// Business settings schema
export const businessSettingsSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(3).max(3),
  tax_rate: z.coerce.number().min(0).max(100),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
