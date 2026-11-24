/**
 * English Locale — Auth Namespace
 * Path: packages/shared/src/i18n/locales/en/auth.js
 * Scope: login, register, password, impersonation, session messages.
 */
export default {
  /* ── Login ── */
  'auth.login.title': 'Log in',
  'auth.login.subtitle': 'Welcome back to MAREFIYAYE',
  'auth.login.emailLabel': 'Email',
  'auth.login.passwordLabel': 'Password',
  'auth.login.submit': 'Log in',
  'auth.login.noAccount': "Don't have an account?",
  'auth.login.signUpLink': 'Sign up',

  /* ── Register ── */
  'auth.register.title': 'Create your account',
  'auth.register.subtitle': 'Join MAREFIYAYE',
  'auth.register.nameLabel': 'Full name',
  'auth.register.emailLabel': 'Email',
  'auth.register.phoneLabel': 'Phone number',
  'auth.register.passwordLabel': 'Password',
  'auth.register.confirmPasswordLabel': 'Confirm password',
  'auth.register.submit': 'Create account',
  'auth.register.hasAccount': 'Already have an account?',
  'auth.register.loginLink': 'Log in',

  /* ── Forgot password (future) ── */
  'auth.forgot.title': 'Reset your password',
  'auth.forgot.subtitle': 'We will help you regain access.',
  'auth.forgot.submit': 'Send reset link',

  /* ── Logout ── */
  'auth.logout.title': 'Log out',
  'auth.logout.confirm': 'Are you sure you want to log out?',

  /* ── Session ── */
  'auth.session.expired': 'Your session has expired. Please log in again.',
  'auth.session.unauthorized': 'You need to log in to continue.',
  'auth.session.forbidden': 'You do not have permission to do that.',

  /* ── Impersonation ── */
  'auth.impersonation.banner': 'You are impersonating {name}',
  'auth.impersonation.stop': 'Stop impersonating',
  'auth.impersonation.started': 'Now impersonating {name}',
  'auth.impersonation.stopped': 'Returned to your admin session',

  /* ── Account states ── */
  'auth.account.suspended.title': 'Account suspended',
  'auth.account.suspended.message':
    'Your account has been suspended. Please contact support.',
  'auth.account.deleted.title': 'Account removed',
  'auth.account.deleted.message': 'This account no longer exists.',

  /* ── Role hints ── */
  'auth.role.guest': 'Guest',
  'auth.role.host': 'Host',
  'auth.role.admin': 'Admin',
  'auth.role.superAdmin': 'Super Admin',

    /* ── Auth UI extras ── */
  'auth.login.forgotPassword': 'Forgot password?',
  'auth.login.forgotPasswordToast': 'Password reset coming soon',
  'auth.login.submitting': 'Logging in…',
  'auth.login.successToast': 'Welcome back',
  'auth.register.submitting': 'Creating account…',
  'auth.register.successToast': 'Account created',
  'auth.register.phoneHelp': "We'll only use this for booking coordination.",
  'auth.register.termsPrefix': 'By creating an account, you agree to our',
  'auth.register.termsLink': 'Terms',
  'auth.register.termsAnd': 'and',
  'auth.register.privacyLink': 'Privacy Policy',
  'auth.register.termsSuffix': '.',
  'auth.layout.back': '← Back',
  'auth.layout.rights': 'Hybrid Stays & Real Estate',
  'auth.layout.step1': 'Join Us',
  'auth.layout.step2': 'Full Name',
  'auth.layout.step3': 'Phone Number (Optional)',
  'auth.login.layoutHeadline': 'Welcome back to Marefiyaye.',
  'auth.login.layoutSub': 'Log in to manage bookings, message hosts, and unlock long-term leases across Ethiopia.',
  'auth.register.layoutHeadline': 'Create your Marefiyaye account.',
  'auth.register.layoutSub': 'Book verified homes across Ethiopia or list your own property in minutes. No broker fees, no hidden charges.',

  'auth.logout.successToast': 'Logged out',
};