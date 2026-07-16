// Shared email-template builder.
// Used by BOTH the admin API route (to send) and the admin UI (live preview),
// so the platform logo/header/footer are always auto-injected and identical.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
const BRAND_NAME = 'AajExam';
// Duolingo green — the app's primary-500, used everywhere in the admin UI.
const BRAND_COLOR = '#58cc02';   // primary-500
const BRAND_ACCENT = '#46a302';  // primary-600 (subtle gradient end)
const LOGO_URL = `${SITE_URL}/logo.png`;

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Placeholders an admin can type into the subject/heading/content.
// Anything unknown is left alone so a stray {{ }} never silently vanishes.
const TEMPLATE_VARS = ['name', 'email'];
const VAR_FALLBACKS = { name: 'there', email: '' };

/**
 * Replaces {{name}} / {{email}} with a recipient's real values.
 * Substituted values are HTML-escaped, so a user's name can never inject markup.
 *
 * @param {string} text  HTML or plain text containing {{placeholders}}.
 * @param {Object} vars  e.g. { name: 'Asha', email: 'a@b.com' }
 * @param {boolean} [escape=true] Set false when substituting into a plain-text
 *                                context such as the subject line.
 */
function personalize(text, vars = {}, escape = true) {
  return String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (!TEMPLATE_VARS.includes(key)) return match; // unknown -> leave as-is
    const raw = vars[key];
    const value = (raw == null || String(raw).trim() === '') ? VAR_FALLBACKS[key] : String(raw).trim();
    return escape ? escapeHtml(value) : value;
  });
}

/**
 * Wraps user-authored content in a branded shell with the platform logo
 * auto-fetched at the top and a standard footer at the bottom.
 *
 * @param {Object} opts
 * @param {string} [opts.heading]   Big title shown under the logo (plain text).
 * @param {string} [opts.body]      Main content. HTML allowed. In "simple" mode
 *                                  newlines are converted to <br>.
 * @param {boolean} [opts.rawHtml]  If true, `body` is treated as raw HTML and
 *                                  used verbatim (no newline conversion).
 * @param {string} [opts.ctaText]   Optional call-to-action button label.
 * @param {string} [opts.ctaUrl]    Optional call-to-action button URL.
 * @returns {string} Full HTML email.
 */
function buildEmailHtml({ heading = '', body = '', rawHtml = false, ctaText = '', ctaUrl = '' } = {}) {
  const safeHeading = heading ? escapeHtml(heading) : '';
  const bodyHtml = rawHtml ? (body || '') : String(body || '').replace(/\n/g, '<br>');

  const headingBlock = safeHeading
    ? `<h2 style="color: ${BRAND_COLOR}; text-align: center; font-size: 24px; margin: 0 0 18px;">${safeHeading}</h2>`
    : '';

  // background-color first so Outlook (which ignores background-image) still
  // renders a solid brand button; other clients get the gradient.
  const ctaBlock = (ctaText && ctaUrl)
    ? `<div style="text-align: center; margin: 30px 0 10px;">
        <a href="${escapeHtml(ctaUrl)}" style="background-color: ${BRAND_COLOR}; background-image: linear-gradient(to right, ${BRAND_COLOR}, ${BRAND_ACCENT}); color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 18px; font-weight: bold; border-radius: 6px; display: inline-block;">${escapeHtml(ctaText)}</a>
      </div>`
    : '';

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e0e0e0;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${LOGO_URL}" alt="${BRAND_NAME}" width="72" height="72" style="display: inline-block; max-width: 72px; height: auto; border: 0;" />
  </div>
  ${headingBlock}
  <div style="color: #333; font-size: 16px; line-height: 1.6;">
    ${bodyHtml}
  </div>
  ${ctaBlock}
  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #888; font-size: 12px; text-align: center;">
    You are receiving this email because you registered on ${BRAND_NAME}.<br>
    &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
  </p>
</div>
`;
}

module.exports = {
  buildEmailHtml, personalize,
  TEMPLATE_VARS, BRAND_NAME, BRAND_COLOR, BRAND_ACCENT, LOGO_URL, SITE_URL
};
