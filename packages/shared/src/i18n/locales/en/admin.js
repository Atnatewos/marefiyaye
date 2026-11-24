/**
 * English Locale — Admin Namespace
 * Path: packages/shared/src/i18n/locales/en/admin.js
 * Scope: admin panel labels, sidebar, settings, moderation actions.
 */
export default {
  /* ── Sidebar ── */
  'admin.sidebar.overview': 'Overview',
  'admin.sidebar.listings': 'Listings',
  'admin.sidebar.bookings': 'Bookings',
  'admin.sidebar.payments': 'Payments',
  'admin.sidebar.users': 'Users',
  'admin.sidebar.hosts': 'Hosts',
  'admin.sidebar.settings': 'Settings',
  'admin.sidebar.i18n': 'Translations',
  'admin.sidebar.banners': 'Banners',
  'admin.sidebar.broadcast': 'Broadcasts',
  'admin.sidebar.auditLog': 'Audit Log',
  'admin.sidebar.bankAccounts': 'Bank Accounts',
  'admin.sidebar.backToSite': 'Back to site',

  /* ── Overview ── */
  'admin.overview.title': 'Admin overview',
  'admin.overview.totalUsers': 'Total users',
  'admin.overview.totalHosts': 'Total hosts',
  'admin.overview.totalListings': 'Listings',
  'admin.overview.pendingApprovals': 'Pending approvals',
  'admin.overview.revenueThisMonth': 'Revenue (this month)',
  'admin.overview.pendingPayments': 'Payments under review',

  /* ── Listings ── */
  'admin.listings.title': 'Listings moderation',
  'admin.listings.approve': 'Approve listing',
  'admin.listings.reject': 'Reject listing',
  'admin.listings.suspend': 'Suspend listing',
  'admin.listings.rejectReasonLabel': 'Rejection reason',
  'admin.listings.approveSuccess': 'Listing approved',
  'admin.listings.rejectSuccess': 'Listing rejected',
  'admin.listings.suspendSuccess': 'Listing suspended',

  /* ── Payments ── */
  'admin.payments.title': 'Payment verification',
  'admin.payments.verify': 'Verify payment',
  'admin.payments.reject': 'Reject payment',
  'admin.payments.viewReceipt': 'View receipt',
  'admin.payments.rejectReasonLabel': 'Rejection reason',
  'admin.payments.verifiedSuccess': 'Payment verified',
  'admin.payments.rejectedSuccess': 'Payment rejected',

  /* ── Users & Hosts ── */
  'admin.users.title': 'Users',
  'admin.users.suspend': 'Suspend user',
  'admin.users.reactivate': 'Reactivate user',
  'admin.users.impersonate': 'Impersonate user',
  'admin.users.impersonateHint': 'Log in as this user to troubleshoot issues',
  'admin.hosts.title': 'Hosts',
  'admin.hosts.verify': 'Verify host',
  'admin.hosts.reject': 'Reject host',

  /* ── Settings ── */
  'admin.settings.title': 'Platform settings',
  'admin.settings.subtitle':
    'Every configurable behavior lives here. Changes apply immediately.',
  'admin.settings.category.general': 'General',
  'admin.settings.category.commission': 'Commission',
  'admin.settings.category.payment': 'Payments',
  'admin.settings.category.features': 'Features',
  'admin.settings.category.theme': 'Theme',
  'admin.settings.category.booking': 'Booking',
  'admin.settings.category.seo': 'SEO',
  'admin.settings.saveSuccess': 'Settings saved',
  'admin.settings.saveError': 'Could not save settings',

  /* ── Bank Accounts ── */
  'admin.bankAccounts.title': 'Bank accounts',
  'admin.bankAccounts.subtitle':
    'Accounts shown to guests during manual bank transfers.',
  'admin.bankAccounts.add': 'Add bank account',
  'admin.bankAccounts.edit': 'Edit account',
  'admin.bankAccounts.delete': 'Delete account',
  'admin.bankAccounts.reorder': 'Drag to reorder',
  'admin.bankAccounts.field.name': 'Display name',
  'admin.bankAccounts.field.provider': 'Provider',
  'admin.bankAccounts.field.accountName': 'Account holder name',
  'admin.bankAccounts.field.accountNumber': 'Account number',
  'admin.bankAccounts.field.instructions': 'Instructions',
  'admin.bankAccounts.field.isActive': 'Active',
  'admin.bankAccounts.field.displayOrder': 'Display order',

  /* ── Banners ── */
  'admin.banners.title': 'Promotional banners',
  'admin.banners.add': 'Add banner',
  'admin.banners.edit': 'Edit banner',
  'admin.banners.delete': 'Delete banner',
  'admin.banners.field.placement': 'Placement',
  'admin.banners.field.messageEn': 'Message (English)',
  'admin.banners.field.messageAm': 'Message (Amharic)',
  'admin.banners.field.linkUrl': 'Link URL',
  'admin.banners.field.linkLabelEn': 'Link label (English)',
  'admin.banners.field.linkLabelAm': 'Link label (Amharic)',
  'admin.banners.field.bgColor': 'Background color',
  'admin.banners.field.fgColor': 'Text color',
  'admin.banners.field.startsAt': 'Start date',
  'admin.banners.field.endsAt': 'End date',
  'admin.banners.field.isActive': 'Active',
  'admin.banners.field.dismissible': 'Dismissible',

  /* ── Broadcasts ── */
  'admin.broadcasts.title': 'Broadcast messages',
  'admin.broadcasts.subtitle':
    'Sticky notices shown to guests, hosts, or everyone.',
  'admin.broadcasts.add': 'New broadcast',
  'admin.broadcasts.edit': 'Edit broadcast',
  'admin.broadcasts.delete': 'Delete broadcast',
  'admin.broadcasts.field.titleEn': 'Title (English)',
  'admin.broadcasts.field.titleAm': 'Title (Amharic)',
  'admin.broadcasts.field.bodyEn': 'Body (English)',
  'admin.broadcasts.field.bodyAm': 'Body (Amharic)',
  'admin.broadcasts.field.audience': 'Audience',
  'admin.broadcasts.field.severity': 'Severity',
  'admin.broadcasts.field.startsAt': 'Start date',
  'admin.broadcasts.field.endsAt': 'End date',
  'admin.broadcasts.field.isActive': 'Active',

  /* ── i18n overrides ── */
  'admin.i18n.title': 'Translation overrides',
  'admin.i18n.subtitle':
    'Override any bundled translation. Saved overrides win at runtime.',
  'admin.i18n.field.lang': 'Language',
  'admin.i18n.field.namespace': 'Namespace',
  'admin.i18n.field.key': 'Key',
  'admin.i18n.field.value': 'Translation',
  'admin.i18n.addOverride': 'Add override',
  'admin.i18n.deleteOverride': 'Delete override',
  'admin.i18n.savedSuccess': 'Override saved',

  /* ── Audit log ── */
  'admin.audit.title': 'Audit log',
  'admin.audit.subtitle': 'Every sensitive admin action is recorded here.',
  'admin.audit.field.actor': 'Actor',
  'admin.audit.field.action': 'Action',
  'admin.audit.field.resource': 'Resource',
  'admin.audit.field.ip': 'IP',
  'admin.audit.field.time': 'Time',

  /* ── Common admin actions ── */
  'admin.action.create': 'Create',
  'admin.action.update': 'Update',
  'admin.action.delete': 'Delete',
  'admin.action.confirm': 'Confirm action',
  'admin.action.cancel': 'Cancel',
  'admin.action.confirmDelete': 'Are you sure? This cannot be undone.',

  /* ── Notifications ── */
  'admin.toast.saved': 'Saved successfully',
  'admin.toast.deleted': 'Deleted',
  'admin.toast.failed': 'Action failed — please retry',

    /* ── Admin overview extra keys ── */
  'admin.overview.subtitle': 'Snapshot of platform activity and pending work.',
  'admin.overview.needsAttention': 'Needs attention',
  'admin.overview.platformStats': 'Platform stats',
  'admin.overview.recentActivity': 'Recent activity',
  'admin.overview.viewAll': 'View all',
  'admin.overview.noActivity': 'No recent activity',
  'admin.overview.pendingHosts': 'Hosts pending verification',

    /* ── Admin moderation ── */
  'admin.listings.title': 'Listings moderation',
  'admin.listings.empty': 'No listings in this filter.',
  'admin.listings.confirmApproveTitle': 'Approve this listing?',
  'admin.listings.confirmApproveDesc': '"{title}" will be publicly visible.',
  'admin.listings.confirmRejectTitle': 'Reject this listing?',
  'admin.listings.confirmRejectDesc': 'The host will be notified to fix it.',
  'admin.listings.confirmSuspendTitle': 'Suspend this listing?',
  'admin.listings.confirmSuspendDesc': 'The listing will be hidden from guests.',
  'admin.listings.rejectTitle': 'Reject listing',
  'admin.listings.suspendTitle': 'Suspend listing',
  'admin.listings.reasonDesc': 'Explain why "{title}" is being rejected.',
  'admin.listings.rejectReasonLabel': 'Rejection reason',
  'admin.listings.approveSuccess': 'Listing approved',
  'admin.listings.rejectSuccess': 'Listing rejected',
  'admin.listings.suspendSuccess': 'Listing suspended',

  'admin.payments.confirmVerifyTitle': 'Verify this payment?',
  'admin.payments.confirmVerifyDesc': '{amount} ETB for booking {code} will be marked as verified.',
  'admin.payments.rejectTitle': 'Reject payment',
  'admin.payments.rejectDesc': 'Rejection reason for booking {code}',
  'admin.payments.rejectReasonLabel': 'Reason',
  'admin.payments.rejectReasonPlaceholder': 'Explain why',
  'admin.payments.empty': 'No payments in this filter.',

  'admin.hosts.confirmVerifyTitle': 'Verify this host?',
  'admin.hosts.confirmVerifyDesc': '{name} will be able to list properties.',
  'admin.hosts.rejectTitle': 'Reject host',
  'admin.hosts.reasonDesc': 'Explain why this host is being rejected.',
  'admin.hosts.rejectReasonLabel': 'Reason',
  'admin.hosts.empty': 'No hosts in this filter.',

  'admin.users.confirmReactivateTitle': 'Reactivate this account?',
  'admin.users.confirmReactivateDesc': '{name} will regain access.',
  'admin.users.suspendTitle': 'Suspend user',
  'admin.users.suspendReasonDesc': 'The user will be logged out and unable to log in.',
  'admin.users.reasonLabel': 'Reason',
  'admin.users.suspendSuccess': 'User suspended',
  'admin.users.reactivateSuccess': 'User reactivated',
};