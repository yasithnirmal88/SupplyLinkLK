import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────
export const phoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+94\d{9}$/, 'Must be a valid Sri Lankan phone number (+94XXXXXXXXX)'),
});

export const otpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+94\d{9}$/, 'Must be a valid Sri Lankan phone number'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric'),
});

// ─── Role Selection ──────────────────────────────────────────
export const roleSelectSchema = z.object({
  role: z.enum(['supplier', 'business'], {
    required_error: 'Please select a role',
  }),
});

// ─── Profile Schemas ─────────────────────────────────────────
export const supplierProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  district: z.string().min(1, 'District is required'),
  supplyCategories: z
    .array(z.string())
    .min(1, 'Select at least one category'),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer').optional(),
});

export const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.enum(['importer', 'distributor', 'restaurant', 'hotel', 'other']),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  district: z.string().min(1, 'District is required'),
  address: z.string().min(5, 'Address is required'),
});

// ─── Supply Ad ───────────────────────────────────────────────
export const supplyAdSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'piece', 'bunch', 'litre', 'bag', 'crate']),
  pricePerUnit: z.number().positive('Price must be positive'),
  district: z.string().min(1, 'District is required'),
  availableFrom: z.string().min(1, 'Available date is required'),
  availableUntil: z.string().optional(),
});

// ─── Demand Post ─────────────────────────────────────────────
export const demandPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  quantityNeeded: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'piece', 'bunch', 'litre', 'bag', 'crate']),
  priceRangeMin: z.number().nonnegative().optional(),
  priceRangeMax: z.number().positive().optional(),
  district: z.string().min(1, 'District is required'),
  deadline: z.string().min(1, 'Deadline is required'),
});

// ─── Offer ───────────────────────────────────────────────────
export const offerSchema = z.object({
  demandPostId: z.string().min(1),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kg', 'piece', 'bunch', 'litre', 'bag', 'crate']),
  pricePerUnit: z.number().positive('Price must be positive'),
  message: z.string().max(300).optional(),
});

// ─── Review ──────────────────────────────────────────────────
export const reviewSchema = z.object({
  revieweeId: z.string().min(1),
  offerId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ─── Type Exports ────────────────────────────────────────────
export type PhoneNumberInput = z.infer<typeof phoneNumberSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type RoleSelectInput = z.infer<typeof roleSelectSchema>;
export type SupplierProfileInput = z.infer<typeof supplierProfileSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type SupplyAdInput = z.infer<typeof supplyAdSchema>;
export type DemandPostInput = z.infer<typeof demandPostSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
