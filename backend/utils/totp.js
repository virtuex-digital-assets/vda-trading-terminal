/**
 * TOTP (Time-based One-Time Password) utility.
 *
 * Implements RFC 6238 / RFC 4226 using Node.js's built-in `crypto` module —
 * no external dependencies required.
 *
 * Compatible with Google Authenticator, Authy, and any standard TOTP app.
 */

const crypto = require('crypto');

const STEP        = 30;   // seconds per TOTP window
const DIGITS      = 6;    // OTP length
const WINDOW      = 1;    // accept codes from ±1 window (clock drift tolerance)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a cryptographically random base32-encoded TOTP secret.
 * @param {number} [bytes=20]
 * @returns {string} base32 secret (160-bit by default)
 */
function generateSecret(bytes = 20) {
  const buf = crypto.randomBytes(bytes);
  let result = '';
  let bits = 0;
  let value = 0;
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return result;
}

/**
 * Decode a base32 string to a Buffer.
 * @param {string} base32
 * @returns {Buffer}
 */
function base32Decode(base32) {
  const str   = base32.toUpperCase().replace(/=+$/, '');
  let bits    = 0;
  let value   = 0;
  const bytes = [];
  for (const char of str) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base32 character: ${char}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Compute HOTP (counter-based OTP) for the given secret + counter.
 * @param {Buffer} keyBuf
 * @param {number} counter
 * @returns {string} zero-padded DIGITS-length code
 */
function hotp(keyBuf, counter) {
  const counterBuf = Buffer.alloc(8);
  // Write 64-bit big-endian counter (JS safe integer range is adequate)
  counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac   = crypto.createHmac('sha1', keyBuf).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code   = ((hmac[offset] & 0x7f) << 24)
               | (hmac[offset + 1] << 16)
               | (hmac[offset + 2] << 8)
               |  hmac[offset + 3];

  return String(code % Math.pow(10, DIGITS)).padStart(DIGITS, '0');
}

/**
 * Generate the current TOTP for a base32-encoded secret.
 * @param {string} secret  base32 secret
 * @returns {string}
 */
function generateTOTP(secret) {
  const keyBuf  = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / STEP);
  return hotp(keyBuf, counter);
}

/**
 * Verify a TOTP code against a base32 secret.
 * Accepts codes from the current window ± WINDOW steps (clock drift).
 *
 * @param {string} secret  base32 secret
 * @param {string} token   6-digit code supplied by the user
 * @returns {boolean}
 */
function verifyTOTP(secret, token) {
  if (!secret || !token) return false;
  const normalised = String(token).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalised)) return false;

  const keyBuf  = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / STEP);

  for (let delta = -WINDOW; delta <= WINDOW; delta++) {
    if (hotp(keyBuf, counter + delta) === normalised) return true;
  }
  return false;
}

/**
 * Build an otpauth:// URI for QR-code generation.
 * @param {string} secret   base32 secret
 * @param {string} issuer   e.g. 'VDA Trading'
 * @param {string} account  user email or account label
 * @returns {string}
 */
function buildOtpauthUri(secret, issuer, account) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP}`;
}

module.exports = { generateSecret, generateTOTP, verifyTOTP, buildOtpauthUri };
