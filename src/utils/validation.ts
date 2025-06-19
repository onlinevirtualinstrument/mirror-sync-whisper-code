
// Input validation utilities with rate limiting
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = config.identifier;
    const requests = this.requests.get(key) || [];
    
    // Clean old requests outside the window
    const validRequests = requests.filter(time => now - time < config.windowMs);
    
    if (validRequests.length >= config.maxRequests) {
      console.warn(`Rate limit exceeded for ${key}: ${validRequests.length}/${config.maxRequests}`);
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < 300000); // 5 minutes
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

export const validateRoomName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Room name is required');
  } else {
    if (name.length < 3) errors.push('Room name must be at least 3 characters');
    if (name.length > 100) errors.push('Room name must be less than 100 characters');
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.push('Room name contains invalid characters');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateRoomDescription = (description: string): ValidationResult => {
  const errors: string[] = [];
  
  if (description && typeof description === 'string') {
    if (description.length > 500) {
      errors.push('Room description must be less than 500 characters');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateChatMessage = (message: string, userId: string): ValidationResult => {
  const errors: string[] = [];
  
  // Rate limiting for chat messages
  if (!rateLimiter.isAllowed({
    maxRequests: 30,
    windowMs: 60000, // 1 minute
    identifier: `chat_${userId}`
  })) {
    errors.push('Too many messages. Please slow down.');
    return { isValid: false, errors };
  }
  
  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
  } else {
    if (message.length > 1000) errors.push('Message too long (max 1000 characters)');
    if (message.trim().length === 0) errors.push('Message cannot be empty');
    
    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /https?:\/\/[^\s]+/gi, // URLs (basic check)
    ];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(message)) {
        errors.push('Message contains spam-like content');
        break;
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateInstrumentNote = (note: any, userId: string): ValidationResult => {
  const errors: string[] = [];
  
  // Rate limiting for instrument notes
  if (!rateLimiter.isAllowed({
    maxRequests: 100,
    windowMs: 10000, // 10 seconds
    identifier: `instrument_${userId}`
  })) {
    errors.push('Playing too fast. Please slow down.');
    return { isValid: false, errors };
  }
  
  if (!note || typeof note !== 'object') {
    errors.push('Invalid note data');
    return { isValid: false, errors };
  }
  
  const { note: noteValue, instrument, userId: noteUserId } = note;
  
  if (!noteValue || typeof noteValue !== 'string') {
    errors.push('Note value is required');
  }
  
  if (!instrument || typeof instrument !== 'string') {
    errors.push('Instrument is required');
  }
  
  if (!noteUserId || noteUserId !== userId) {
    errors.push('Invalid user ID');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateJoinCode = (code: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!code || typeof code !== 'string') {
    errors.push('Join code is required');
  } else {
    if (!/^\d{6}$/.test(code)) {
      errors.push('Join code must be 6 digits');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential XSS content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};
