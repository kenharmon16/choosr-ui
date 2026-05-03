import type { Decision } from '@/types/decision';

/** Plain-text summary for SMS, email, or other share targets (same for host and participants). */
export function formatDecisionResultsForShare(d: Decision): string {
  const lines: string[] = [];
  lines.push(`Choosr — ${d.title}`);
  lines.push('');
  if (d.result?.explanation) {
    lines.push(d.result.explanation);
  }
  lines.push('');
  lines.push('Scores:');
  for (const o of d.options) {
    const n = o.voteCount ?? 0;
    lines.push(`• ${o.label}: ${n} ${n === 1 ? 'vote' : 'votes'}`);
  }
  lines.push('');
  lines.push(`Decision ID: ${d.id}`);
  lines.push('Open Choosr and enter this ID to view the poll.');
  return lines.join('\n');
}
