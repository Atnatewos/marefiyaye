/**
 * @file packages/i18n/src/messages/en/auth.js
 *
 * English — Auth namespace.
 * Wrapped in `{ auth: { ... } }`.
 */

const messages = {
  auth: {
    login: {
      title: 'Sign in',
      description: 'Guests and hosts sign in here.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      submit: 'Sign in',
      success: 'Welcome back, {{name}}',
      error: 'Invalid email or password',
    },
    register: {
      title: 'Join Us',
      description: 'Create an account to start booking or hosting.',
      nameLabel: 'Full Name',
      namePlaceholder: 'Abebe Bikila',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Phone Number (Optional)',
      phonePlaceholder: '+251 9XX XXX XXX',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      submit: 'Create Account',
      signInLink: 'Already have an account?',
      signInLinkText: 'Sign in',
      terms: 'By signing up, you agree to our Terms & Privacy.',
      success: 'Account created successfully!',
      error: 'Registration failed',
    },
    admin: {
      title: 'Admin Sign In',
      description: 'Restricted access',
      emailLabel: 'Admin Email',
      emailPlaceholder: 'admin@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      submit: 'Sign in as Admin',
      success: 'Admin session started',
      error: 'Admin sign-in failed',
    },
  },
};

export default messages;