// extractListRows.js
//
// The per-employee list endpoints (/{id}/all-loans, /{id}/all-leaves, ...)
// do not all wrap their rows the same way. Depending on the controller a
// response can come back as any of:
//
//   [ ... ]                                   // bare array
//   { status: true, data: [ ... ] }           // the usual envelope
//   { status: true, data: { data: [ ... ] } } // Laravel paginator inside it
//   { status: true, data: { loans: [ ... ] } }// named collection
//   { loans: [ ... ] }                        // named at the top level
//
// Reading `response.data` blindly works for exactly one of those and silently
// renders "No requests available" for the rest — which is why a profile could
// show an empty table while the same records were visible on /loans.
//
// So instead of assuming a shape, walk the payload and return the first array
// we find under a plausible key.

/** Keys that are containers, in the order we should look inside them. */
const GENERIC_KEYS = ['data', 'items', 'results', 'records', 'rows', 'list'];

/** Keys that are never the list itself. */
const IGNORED_KEYS = new Set(['meta', 'links', 'pagination', 'errors']);

/**
 * @param {unknown} payload  Whatever the API returned.
 * @param {string[]} preferredKeys Type-specific keys to try first, e.g.
 *   ['loans'] for the loans tab. Checked before the generic ones so a
 *   response carrying both `loans` and `data` resolves to `loans`.
 * @returns {Array} The rows, or [] when nothing array-like is present.
 */
export function extractListRows(payload, preferredKeys = []) {
  const visited = new WeakSet();

  const walk = (node, depth) => {
    if (!node || depth > 4) return null;
    if (Array.isArray(node)) return node;
    if (typeof node !== 'object') return null;

    if (visited.has(node)) return null;
    visited.add(node);

    for (const key of [...preferredKeys, ...GENERIC_KEYS]) {
      if (IGNORED_KEYS.has(key)) continue;
      if (!(key in node)) continue;

      const found = walk(node[key], depth + 1);
      if (found) return found;
    }

    return null;
  };

  return walk(payload, 0) || [];
}

/**
 * Response keys each request tab might use, beyond the generic `data`.
 * Keyed by the tab id from requestTypes.config.js.
 */
export const REQUEST_LIST_KEYS = {
  leaves: ['leaves', 'all_leaves'],
  'days-off': ['holidays', 'days_off', 'day_offs', 'daysOff'],
  loans: ['loans', 'all_loans'],
  remotely: ['remotely', 'remote_days', 'all_remote_days', 'remote_work'],
  overtimes: ['overtimes', 'over_times', 'all_over_times', 'overtime'],
  'branch-transfers': ['branch_transfers', 'all_branch_transfers', 'branchTransfers'],
  resignations: ['resignations', 'all_resignations'],
};

export default extractListRows;
