/**
 * Normalizes backend errors into user-friendly English messages.
 * Handles authorization traps and other common backend errors.
 */
export function normalizeActorError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Handle authorization errors
    if (message.includes('Unauthorized')) {
      if (message.includes('Only admins')) {
        return 'You need admin privileges to perform this action.';
      }
      if (message.includes('Only the author')) {
        return 'You can only delete your own posts.';
      }
      if (message.includes('Only authenticated users')) {
        return 'Please sign in to perform this action.';
      }
      if (message.includes('Only users can')) {
        return 'Please sign in to access this feature.';
      }
      return 'You do not have permission to perform this action.';
    }
    
    // Handle profile visibility errors
    if (message.includes('private') || message.includes('not available')) {
      return 'This profile is not publicly available.';
    }
    
    // Handle not found errors
    if (message.includes('not found')) {
      return 'The requested item could not be found.';
    }
    
    // Handle validation errors
    if (message.includes('cannot be empty')) {
      return 'Please fill in all required fields.';
    }
    
    // Return original message if it's already user-friendly
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
