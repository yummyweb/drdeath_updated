const dns = require('dns').promises;
const disposableDomains = require('disposable-email-domains');

const disposableSet = new Set(disposableDomains);

// Returns { ok: true } or { ok: false, reason: string }
async function validateEmail(email) {
  const lower = email.toLowerCase();
  const domain = lower.split('@')[1];

  if (!domain) return { ok: false, reason: 'Invalid email address' };

  // Block known disposable/throwaway providers
  if (disposableSet.has(domain)) {
    return { ok: false, reason: 'Please use a permanent email address, not a temporary one' };
  }

  // Check domain has MX records (actually receives email)
  try {
    const records = await dns.resolveMx(domain);
    if (!records || records.length === 0) {
      return { ok: false, reason: 'Email domain does not appear to receive mail' };
    }
  } catch {
    return { ok: false, reason: 'Email domain could not be verified — please check and try again' };
  }

  return { ok: true };
}

module.exports = { validateEmail };
