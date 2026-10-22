/**
 * @file packages/config/src/integrations/qrcode.js
 *
 * QR code generation configuration.
 *
 * Why this file exists:
 *   - QR codes for bank transfers must be consistent in size and error tolerance.
 *   - Payload templates (what the QR string looks like) differ per payment method.
 *   - Any change to the payload format must be applied everywhere QR is generated.
 *
 * Contract: `apps/api` builds QR images from this config; the frontend only renders
 * the returned data URL.
 */

/**
 * Static QR rendering options passed to the `qrcode` library.
 *
 * size                 – pixel dimension of the generated image
 * margin               – quiet-zone modules around the QR (4 is the QR standard)
 * errorCorrectionLevel – 'M' handles moderate damage; sufficient for screen display
 * colorDark / colorLight – hex colors; white-on-near-black fits both light and dark UI
 */
export const QR_RENDER_OPTIONS = Object.freeze({
  size: 300,
  margin: 4,
  errorCorrectionLevel: 'M',
  colorDark: '#0f172a',
  colorLight: '#ffffff',
});

/**
 * Per-method payload templates.
 *
 * `{account}` and `{amount}` are substituted at generation time.
 * Empty string means "use the plain account number" (no structured payload).
 * Update this file when a bank publishes its QR standard.
 */
export const QR_PAYLOAD_TEMPLATES = Object.freeze({
  CBE: '{account}',
  TELEBIRR: '{account}',
  BOA: '{account}',
  AWASH: '{account}',
});