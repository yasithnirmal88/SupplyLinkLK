import { z } from 'zod';

/**
 * Profile field validation utilities.
 * Enforces strict constraints on editable user profile fields using Zod.
 */

// ─── Sri Lankan Districts ─────────────────────────────────────
const SriLankanDistricts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
] as const;

// ─── Profanity List (Simple blacklist) ─────────────────────
const PROFANITY_LIST = [
  'scam', 'spam', 'fake', 'hacker', 'fraud', 'cheat', 'abuse'
];

/**
 * Profile Update Schema
 */
const ProfileUpdateSchema = z.object({
  displayName: z.string().min(3).max(100).optional(),
  bio: z.string().max(300).optional(),
  district: z.enum(SriLankanDistricts).optional(),
  businessName: z.string().min(3).max(150).optional(),
  photoURL: z.string().url().optional(),
  photoUrl: z.string().url().optional(),
  photoSize: z.number().max(5 * 1024 * 1024).optional(), // 5MB
  photoMimeType: z.string().optional(),
  categories: z.array(z.string()).max(10).optional(),
  languages: z.array(z.string()).max(5).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
});

export interface ProfileUpdateValidationResult {
  valid: boolean;
  data?: any;
  error?: string;
  errorField?: string;
}

/**
 * Comprehensive profile update validation using Zod.
 */
export function validateProfileUpdate(body: any): ProfileUpdateValidationResult {
  try {
    const validatedData = ProfileUpdateSchema.parse(body);

    // Additional Profanity Check
    const profanityFields: (keyof typeof validatedData)[] = ['displayName', 'businessName', 'bio'];
    for (const field of profanityFields) {
      const val = validatedData[field];
      if (typeof val === 'string' && PROFANITY_LIST.some(p => val.toLowerCase().includes(p))) {
        return {
          valid: false,
          error: `${field} contains inappropriate content`,
          errorField: field as string
        };
      }
    }

    // MIME Type Validation (if provided)
    if (validatedData.photoMimeType) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(validatedData.photoMimeType.toLowerCase())) {
        return {
          valid: false,
          error: 'Invalid image format. Only JPG, PNG, and WebP are allowed',
          errorField: 'photoMimeType'
        };
      }
    }

    return { valid: true, data: validatedData };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0].message,
        errorField: error.errors[0].path[0] as string
      };
    }
    return { valid: false, error: 'Invalid request payload' };
  }
}
