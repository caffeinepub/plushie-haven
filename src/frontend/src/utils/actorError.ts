/**
 * Normalizes backend errors into user-friendly English messages.
 * Handles authorization traps and other common backend errors.
 */
export function normalizeActorError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Handle actor readiness/initialization errors
    if (
      message.includes('Actor not initialized') ||
      message.includes('Actor not available') ||
      message.includes('Still connecting to the server')
    ) {
      return 'Still connecting to the server. Please try again in a moment.';
    }

    // Handle admin claim errors
    if (message.includes('Admin has already been claimed')) {
      return 'Admin access has already been claimed on this canister.';
    }
    
    if (message.includes('already claimed') || message.includes('Admin already exists')) {
      return 'Admin access has already been claimed on this canister.';
    }

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
        return 'Please sign in to perform this action.';
      }
      return 'You are not authorized to perform this action.';
    }

    // Handle profile visibility errors
    if (message.includes('Profile is not public')) {
      return 'This profile is private and cannot be viewed.';
    }

    // Handle validation errors
    if (message.includes('cannot be empty')) {
      return 'Please fill in all required fields.';
    }

    // Handle comment-specific errors
    if (message.includes('Post does not exist')) {
      return 'This post no longer exists.';
    }

    // Handle generic post errors
    if (message.includes('Post not found')) {
      return 'Post not found.';
    }

    // Handle event errors
    if (message.includes('Event not found')) {
      return 'Event not found.';
    }

    if (message.includes('Start time must be before end time')) {
      return 'Event start time must be before end time.';
    }

    // Handle follow errors
    if (message.includes('cannot follow yourself')) {
      return 'You cannot follow yourself.';
    }

    // Return the original message if no specific match
    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}
