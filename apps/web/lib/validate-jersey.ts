import { apiGet } from '@/lib/api';
import type { ApiResponse } from '@favorit/types';

export type JerseyValidationReason =
  | 'empty_surname'
  | 'surname_not_found'
  | 'empty_number'
  | 'invalid_number'
  | 'number_taken'
  | null;

export interface JerseyValidationResult {
  valid: boolean;
  reason: JerseyValidationReason;
  matches: number;
  occupiedNumbers: number[];
  takenBy?: string;
  children?: Array<{ firstName: string; jerseyNumber: number | null }>;
}

export interface OccupiedJerseyNumber {
  number: number;
  holder: string;
}

export async function validateJersey(
  surname: string,
  number?: string,
): Promise<JerseyValidationResult> {
  const params = new URLSearchParams();
  const trimmedSurname = surname.trim();
  if (trimmedSurname) {
    params.set('surname', trimmedSurname);
  }
  if (number?.trim()) {
    params.set('number', number.trim());
  }

  const res = await apiGet<ApiResponse<JerseyValidationResult>>(
    `/shop/validate-jersey?${params.toString()}`,
    { auth: false },
  );

  return (
    res.data ?? {
      valid: false,
      reason: 'empty_surname',
      matches: 0,
      occupiedNumbers: [],
    }
  );
}

export async function getOccupiedJerseyNumbers(): Promise<OccupiedJerseyNumber[]> {
  const res = await apiGet<ApiResponse<OccupiedJerseyNumber[]>>('/shop/jersey-numbers', {
    auth: false,
  });
  return res.data ?? [];
}

export function isJerseyNumberInRange(value: string) {
  if (!value.trim()) return false;
  const num = parseInt(value, 10);
  return Number.isInteger(num) && num >= 1 && num <= 99;
}
