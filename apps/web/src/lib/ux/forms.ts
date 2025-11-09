/**
 * Form Validation Utilities
 * Provides validation helpers for forms
 */

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Common validation rules
 */
export const rules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),
};

/**
 * Validate a value against rules
 */
export function validate(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  rules.forEach((rule) => {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate form fields
 */
export function validateForm<T extends Record<string, unknown>>(
  values: T,
  validators: Partial<Record<keyof T, ValidationRule[]>>
): Partial<Record<keyof T, string[]>> {
  const errors: Partial<Record<keyof T, string[]>> = {};

  Object.entries(validators).forEach(([field, rules]) => {
    if (rules && rules.length > 0) {
      const result = validate(values[field], rules);
      if (!result.isValid) {
        errors[field as keyof T] = result.errors;
      }
    }
  });

  return errors;
}
