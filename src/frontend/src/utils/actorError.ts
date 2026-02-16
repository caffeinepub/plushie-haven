/**
 * Normalizes backend errors into user-friendly English messages.
 * Handles authorization traps, stopped-canister rejections, moderation errors, and other common backend errors.
 */

/**
 * Helper to check if an error is a stopped-canister rejection.
 */
export function isStoppedCanisterError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes('IC0508') ||
      message.includes('is stopped') ||
      (message.includes('reject_code') && message.includes(': 5'))
    );
  }
  return false;
}

/**
 * Sanitizes error messages by removing internal request IDs and low-level diagnostic fragments.
 */
function sanitizeErrorMessage(message: string): string {
  // Remove request IDs (hex patterns like "3818892c9b2074c3...")
  let sanitized = message.replace(/Request ID: [a-f0-9]+/gi, '');
  
  // Remove canister IDs in error context
  sanitized = sanitized.replace(/Canister [a-z0-9-]+ /gi, '');
  
  // Remove HTTP details blocks
  sanitized = sanitized.replace(/HTTP details:[\s\S]*$/i, '');
  
  // Remove reject code details
  sanitized = sanitized.replace(/Reject code: \d+/gi, '');
  sanitized = sanitized.replace(/Error code: IC\d+/gi, '');
  
  // Clean up extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

export function normalizeActorError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Handle stopped-canister replica rejections (IC0508)
    if (isStoppedCanisterError(error)) {
      return 'The service is temporarily unavailable. Please try again later.';
    }
    
    // Handle actor state errors with distinct messages
    if (message === 'ACTOR_CONNECTING') {
      return 'Connecting to the server. Please wait a moment...';
    }
    
    if (message === 'ACTOR_FAILED') {
      return 'Failed to connect to the server. Please try again.';
    }
    
    // Handle legacy actor readiness/initialization errors
    if (
      message.includes('Actor not initialized') ||
      message.includes('Actor not available')
    ) {
      return 'Failed to connect to the server. Please try again.';
    }
    
    if (message.includes('Still connecting to the server')) {
      return 'Connecting to the server. Please wait a moment...';
    }

    // Handle moderation-related errors
    if (message.includes('MODERATION_BLOCK') || message.includes('blocked for violating')) {
      return 'The upload was blocked for violating guidelines.';
    }

    if (message.includes('MODERATION_REVIEW') || message.includes('pending review')) {
      return 'Your post has been submitted and is pending review.';
    }

    if (message.includes('Moderation request not found')) {
      return 'Moderation request not found.';
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
      if (message.includes('Only the author or an admin')) {
        return 'You can only delete your own items.';
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

    // Handle gallery-specific errors
    if (message.includes('Gallery media item not found')) {
      return 'Gallery item not found.';
    }

    // Handle supporter-specific errors
    if (message.includes('Supporter request not found')) {
      return 'Supporter request not found.';
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

    // Handle poll errors
    if (message.includes('Poll does not exist')) {
      return 'This poll no longer exists.';
    }

    if (message.includes('already voted')) {
      return 'You have already voted in this poll.';
    }

    if (message.includes('Voting for this poll has ended')) {
      return 'This poll is closed.';
    }

    // Sanitize and return the original message if no specific match
    return sanitizeErrorMessage(message);
  }

  return 'An unexpected error occurred. Please try again.';
}
