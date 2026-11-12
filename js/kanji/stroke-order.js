/** Experimental online-stroke comparison. No OCR, pixels, or character recognition.
 * Match geometry without sequence/direction first, reject ambiguous assignments,
 * then inspect the resulting permutation and oriented trajectories separately.
 * Thresholds are engineering tolerances, not calibrated probabilities.
 */
const POINTS = 32;
const LIMITS = Object.freeze({mean: .11, pair: .19, assignmentGap: .055, directionGap: .04, chord: .035, length: .045});
const unable = (reason, details = {}) => ({status: 'unable', reason, issues: [], ...details});
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function length(stroke) { let value = 0; for (let i = 1; i < stroke.length; i++) value += distance(stroke[i - 1], stroke[i]); return value; }
function valid(strokes) {
  return Array.isArray(strokes) && strokes.length > 0 && strokes.length <= 64 &&
    strokes.every(s => Array.isArray(s) && s.length >= 2 && s.length <= 10000 &&
      s.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)) && length(s) > 1e-8);
}
function resample(stroke) {
  const arc = [0]; for (let i = 1; i < stroke.length; i++) arc.push(arc[i - 1] + distance(stroke[i - 1], stroke[i]));
  let k = 1;
  return Array.from({length: POINTS}, (_, i) => {
    const target = arc.at(-1) * i / (POINTS - 1);
    while (k < arc.length - 1 && arc[k] < target) k++;
    const f = (target - arc[k - 1]) / (arc[k] - arc[k - 1] || 1);
    return [stroke[k - 1][0] + f * (stroke[k][0] - stroke[k - 1][0]), stroke[k - 1][1] + f * (stroke[k][1] - stroke[k - 1][1])];
  });
}
function normalize(strokes) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const s of strokes) for (const [x, y] of s) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  const size = Math.max(right - left, bottom - top);
  if (!Number.isFinite(size) || size < 1e-7) return null;
  return strokes.map(s => resample(s).map(([x, y]) => [(x - (left + right) / 2) / size, (y - (top + bottom) / 2) / size]));
}
function orientedCost(a, b, reverse = false) {
  let mean = 0; for (let i = 0; i < POINTS; i++) mean += distance(a[i], b[reverse ? POINTS - 1 - i : i]);
  const endpoints = (distance(a[0], b[reverse ? POINTS - 1 : 0]) + distance(a.at(-1), b[reverse ? 0 : POINTS - 1])) / 2;
  return .8 * mean / POINTS + .2 * endpoints;
}
// Hungarian minimum-cost bijection. Optional forbidden edge measures an alternative.
function assign(cost, forbidden = null) {
  const n = cost.length, u = Array(n + 1).fill(0), v = [...u], p = [...u], way = [...u];
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0; const min = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true; const i0 = p[j0]; let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const edge = forbidden?.[0] === i0 - 1 && forbidden?.[1] === j - 1 ? 1e6 : cost[i0 - 1][j - 1];
        const cur = edge - u[i0] - v[j]; if (cur < min[j]) { min[j] = cur; way[j] = j0; }
        if (min[j] < delta) { delta = min[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else min[j] -= delta;
      j0 = j1;
    } while (p[j0]);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const mapping = Array(n); for (let j = 1; j <= n; j++) mapping[p[j] - 1] = j - 1;
  return {mapping, total: -v[0]};
}
export function analyzeStrokeOrder(userStrokes, referenceStrokes, {recognized, expected} = {}) {
  if (!recognized) return unable('unrecognized-character');
  if (recognized !== expected) return unable('different-character');
  if (!valid(userStrokes) || !valid(referenceStrokes)) return unable('insufficient-input');
  if (userStrokes.length !== referenceStrokes.length) return unable('stroke-count', {actual: userStrokes.length, expected: referenceStrokes.length});
  const user = normalize(userStrokes), reference = normalize(referenceStrokes); if (!user || !reference) return unable('insufficient-input');
  const oriented = user.map(a => reference.map(b => ({forward: orientedCost(a, b), reverse: orientedCost(a, b, true)})));
  const cost = oriented.map(row => row.map(p => Math.min(p.forward, p.reverse))), best = assign(cost);
  const selected = best.mapping.map((j, i) => cost[i][j]);
  const meanDistance = best.total / user.length, maxDistance = Math.max(...selected);
  if (meanDistance > LIMITS.mean || maxDistance > LIMITS.pair) return unable('geometry', {meanDistance, maxDistance});
  let assignmentGap = Infinity;
  if (user.length > 1) for (let i = 0; i < user.length; i++) assignmentGap = Math.min(assignmentGap, assign(cost, [i, best.mapping[i]]).total - best.total);
  if (assignmentGap < LIMITS.assignmentGap) return unable('ambiguous-matching', {assignmentGap, meanDistance});
  const issues = [], mapping = [];
  for (let i = 0; i < user.length; i++) {
    const j = best.mapping[i], a = user[i], b = reference[j], pair = oriented[i][j];
    const au = [a.at(-1)[0] - a[0][0], a.at(-1)[1] - a[0][1]], br = [b.at(-1)[0] - b[0][0], b.at(-1)[1] - b[0][1]];
    const chordA = Math.hypot(...au), chordB = Math.hypot(...br), ratio = length(a) / length(b);
    if (ratio < .4 || ratio > 2.5) return unable('geometry', {stroke: i + 1});
    const reversed = pair.reverse < pair.forward, cosine = (au[0] * br[0] + au[1] * br[1]) / (chordA * chordB || 1);
    if (Math.min(chordA, chordB) < LIMITS.chord || Math.min(length(a), length(b)) < LIMITS.length ||
        Math.abs(pair.forward - pair.reverse) < LIMITS.directionGap || (reversed ? cosine > -.45 : cosine < .45)) return unable('ambiguous-direction', {stroke: i + 1});
    const match = {userStroke: i + 1, referenceStroke: j + 1, order: i !== j, direction: reversed};
    mapping.push(match); if (match.order || match.direction) issues.push(match);
  }
  return {status: issues.length ? 'review' : 'likely', reason: issues.length ? 'possible-violation' : 'matched', issues, mapping, meanDistance, maxDistance, assignmentGap: Number.isFinite(assignmentGap) ? assignmentGap : null};
}
