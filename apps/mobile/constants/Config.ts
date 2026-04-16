export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const CATEGORIES = [
  'vegetables',
  'fruits',
  'spices',
  'grains',
  'herbs',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
] as const;

export type District = (typeof SRI_LANKA_DISTRICTS)[number];

export const UNITS = ['kg', 'piece', 'bunch', 'litre', 'bag', 'crate'] as const;
export type Unit = (typeof UNITS)[number];
