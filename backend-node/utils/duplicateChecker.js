const levenshtein = require('fast-levenshtein');

const SIMILARITY_THRESHOLD = 82;
const SAME_PLAINTIFF_BONUS = 8;
const MAX_CANDIDATES = 50; // max docs to Levenshtein-compare

function normalizeTitle(title = '') {
  return title
    .toLowerCase()
    .replace(/\bversus\b/g, 'v')
    .replace(/\bvs\.?\b/g, 'v')
    .replace(/\bv\.\b/g, 'v')
    .replace(/\bpunjav\b/g, 'punjab')
    .replace(/\bpanjab\b/g, 'punjab')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a = '', b = '') {
  a = normalizeTitle(a);
  b = normalizeTitle(b);
  if (!a || !b) return 0;
  if (a === b) return 100;
  const distance = levenshtein.get(a, b);
  return Math.round((1 - distance / Math.max(a.length, b.length)) * 100);
}

function plaintiff(title = '') {
  return normalizeTitle(title).split(/\bv\b/)[0].trim();
}

async function checkDuplicate(LegalResource, resourceData, excludeId = null) {
  const excludeFilter = excludeId ? { _id: { $ne: excludeId } } : {};

  // STEP 1 — Exact citation match (indexed)
  if (resourceData.citation?.trim()) {
    const existing = await LegalResource.findOne({
      citation: resourceData.citation.trim(),
      ...excludeFilter
    });
    if (existing) {
      existing.matchScore = 100;
      return existing;
    }
  }

  // STEP 2 — Exact external link match (indexed)
  if (resourceData.externalLink?.trim()) {
    const existing = await LegalResource.findOne({
      externalLink: resourceData.externalLink.trim(),
      ...excludeFilter
    });
    if (existing) {
      existing.matchScore = 100;
      return existing;
    }
  }

  // STEP 3 — Text-index candidate retrieval + Levenshtein comparison.
  // The text index on {title, citation, summary} narrows candidates to the
  // most relevant documents so we never load the entire collection into memory.
  if (!resourceData.title) return null;

  // Normalize before searching so "vs." / "versus" / "v." all hit the same candidates.
  const normalizedSearch = normalizeTitle(resourceData.title);

  let candidates;
  try {
    candidates = await LegalResource.find(
      {
        $text: { $search: normalizedSearch },
        ...excludeFilter
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(MAX_CANDIDATES)
      .lean();
  } catch (err) {
    if (err.codeName === 'IndexNotFound' || err.message?.includes('text index')) {
      // Text index not yet built — this is a startup condition only.
      // Log loudly so it's never silently ignored in production.
      console.error('DUPLICATE CHECKER: text index missing on LegalResource — duplicate detection disabled until index is built.', err.message);
      return null;
    }
    // Any other DB error should propagate so the caller gets a 500, not a silent pass.
    throw err;
  }

  const incomingTitle  = normalizeTitle(resourceData.title);
  const incomingParty  = plaintiff(resourceData.title);
  let best = null;
  let bestScore = 0;

  for (const resource of candidates) {
    const existingTitle = normalizeTitle(resource.title);

    if (existingTitle === incomingTitle) {
      resource.matchScore = 100;
      return resource;
    }

    let score = similarity(existingTitle, incomingTitle);

    const existingParty = plaintiff(resource.title);
    if (existingParty && incomingParty && existingParty === incomingParty) {
      score += SAME_PLAINTIFF_BONUS;
    }

    if (score > bestScore) {
      bestScore = score;
      best = resource;
    }
  }

  if (best && bestScore >= SIMILARITY_THRESHOLD) {
    best.matchScore = Math.min(bestScore, 100);
    return best;
  }

  return null;
}

module.exports = { checkDuplicate, normalizeTitle, similarity };
