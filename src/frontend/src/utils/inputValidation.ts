/**
 * Input validation utilities for text, URLs, and file uploads.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates text length against min and max constraints.
 */
export function validateTextLength(
  text: string,
  minLength: number = 0,
  maxLength: number = Infinity,
  fieldName: string = 'Text'
): ValidationResult {
  const trimmed = text.trim();
  
  if (minLength > 0 && trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long.`,
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Validates username format (alphanumeric, underscores, hyphens).
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long.',
    };
  }
  
  if (trimmed.length > 30) {
    return {
      isValid: false,
      error: 'Username must not exceed 30 characters.',
    };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates URL format and protocol.
 */
export function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { isValid: true }; // Empty URLs are valid (optional field)
  }
  
  try {
    const urlObj = new URL(trimmed);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use http:// or https:// protocol.',
      };
    }
    
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com).',
    };
  }
}

/**
 * Validates file upload (type and size).
 */
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSizeBytes: number
): ValidationResult {
  // Check file type
  const fileType = file.type.toLowerCase();
  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return fileType.startsWith(category + '/');
    }
    return fileType === type;
  });
  
  if (!isTypeAllowed) {
    return {
      isValid: false,
      error: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}`,
    };
  }
  
  // Check file size
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size must not exceed ${maxSizeMB}MB.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Detects potentially dangerous HTML/script content.
 */
export function containsDangerousContent(text: string): boolean {
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<embed[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(text));
}
