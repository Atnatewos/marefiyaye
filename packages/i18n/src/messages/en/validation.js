/**
 * @file packages/i18n/src/messages/en/validation.js
 *
 * Auto-generated ES module.
 * Why .js instead of .json:
 *   - Node 24 requires assert { type: 'json' } for .json imports.
 *   - Next.js 14 webpack does not support that assert syntax.
 *   - Converting to .js exports resolves both constraints.
 */

const messages = {
  "errors": {
    "ValidationError": "Please check the form fields and try again.",
    "UnauthorizedError": "Invalid email or password.",
    "ForbiddenError": "You don't have permission to do that.",
    "NotFoundError": "The requested item was not found.",
    "ConflictError": "That action conflicts with current state.",
    "TooManyRequestsError": "Too many requests. Please slow down.",
    "InternalError": "Something went wrong. Please try again.",
    "NetworkError": "Network error — check your connection.",
    "UnknownError": "An unexpected error occurred."
  },
  "forms": {
    "required": "This field is required.",
    "invalidEmail": "Please enter a valid email address.",
    "passwordMin": "Password must be at least 8 characters.",
    "invalidPhone": "Please enter a valid Ethiopian phone number.",
    "invalidDate": "Please enter a valid date."
  }
};

export default messages;
