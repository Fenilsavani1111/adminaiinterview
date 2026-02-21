import {
  Trophy,
  CheckCircle,
  XCircle,
  BarChart2,
  Medal,
  Percent,
  Users,
  Target,
  Eye,
} from 'lucide-react';
import { Candidate } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Returns the best available score value for a candidate (0-100 range). */
const getScore = (c: Candidate): number =>
  c?.categoryPercentage?.overallPercentage ??
  c?.categoryPercentage?.overallScore ??
  0;

const getBarColor = (score: number) =>
  score >= 90
    ? 'bg-emerald-500'
    : score >= 75
      ? 'bg-blue-500'
      : score >= 60
        ? 'bg-yellow-400'
        : 'bg-orange-400';

const getBadgeColor = (score: number) =>
  score >= 90
    ? 'bg-emerald-100 text-emerald-700'
    : score >= 75
      ? 'bg-blue-100 text-blue-700'
      : score >= 60
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-orange-100 text-orange-700';

const getRecommendationColor = (rec: string) => {
  if (rec?.includes?.('Highly'))
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (rec?.includes?.('Recommended'))
    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (rec?.includes?.('Consider'))
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const getRecBarColor = (rec: string) =>
  rec.includes('Highly')
    ? 'bg-emerald-500'
    : rec.includes('Recommended')
      ? 'bg-blue-500'
      : rec.includes('Consider')
        ? 'bg-amber-400'
        : 'bg-gray-400';

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── props ────────────────────────────────────────────────────────────────────

interface JobInterviewAnalyticsProps {
  candidates: Candidate[];
  onSelectCandidate: (c: Candidate) => void;
}

// ─── component ────────────────────────────────────────────────────────────────

export function JobInterviewAnalytics({
  candidates,
  onSelectCandidate,
}: JobInterviewAnalyticsProps) {
  // Completed candidates (status = completed | under_review)
  const completedCandidates = candidates.filter(
    (c) => c.status === 'completed' || c.status === 'under_review',
  );

  if (completedCandidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <BarChart2 className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">No completed interviews yet</p>
        <p className="text-sm mt-1">
          Analytics will appear here once candidates finish their interviews.
        </p>
      </div>
    );
  }

  // ── Top 10 ──────────────────────────────────────────────────────────────────
  const top10 = [...completedCandidates]
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 10);

  // ── Score distribution ───────────────────────────────────────────────────────
  const scoreBuckets = [
    { label: '90–100%', min: 90, max: 100, color: 'bg-emerald-500' },
    { label: '75–89%', min: 75, max: 89, color: 'bg-blue-500' },
    { label: '60–74%', min: 60, max: 74, color: 'bg-yellow-400' },
    { label: '40–59%', min: 40, max: 59, color: 'bg-orange-400' },
    { label: 'Below 40%', min: 0, max: 39, color: 'bg-red-400' },
  ].map((b) => ({
    ...b,
    count: completedCandidates.filter((c) => {
      const p = getScore(c);
      return p >= b.min && p <= b.max;
    }).length,
  }));
  const maxBucketCount = Math.max(...scoreBuckets.map((b) => b.count), 1);

  const avgPercentage = (
    completedCandidates.reduce((s, c) => s + getScore(c), 0) /
    completedCandidates.length
  ).toFixed(1);

  // ── Status breakdown ─────────────────────────────────────────────────────────
  const completionRate = candidates.length
    ? Math.round((completedCandidates.length / candidates.length) * 100)
    : 0;

  const statusGroups = [
    { label: 'Invited', key: 'pending', color: 'bg-gray-400' },
    { label: 'In Progress', key: 'inprogress', color: 'bg-blue-400' },
    { label: 'Completed', key: 'completed', color: 'bg-emerald-500' },
    { label: 'Under Review', key: 'under_review', color: 'bg-purple-500' },
  ].map((s) => ({
    ...s,
    count: candidates.filter((c) => c.status === s.key).length,
  }));

  // ── Recommendation spread ────────────────────────────────────────────────────
  const recMap: Record<string, number> = {};
  completedCandidates.forEach((c) => {
    const r = c?.recommendations?.recommendation || 'N/A';
    recMap[r] = (recMap[r] ?? 0) + 1;
  });
  const recEntries = Object.entries(recMap).sort((a, b) => b[1] - a[1]);

  const highPerformers = completedCandidates.filter(
    (c) => getScore(c) >= 85,
  ).length;
  const belowSixty = completedCandidates.filter((c) => getScore(c) < 60).length;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── TOP 10 PERFORMERS ──────────────────────────────────────────────── */}
      {top10.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  Top 10 Performers
                </h2>
                <p className="text-yellow-100 text-xs">
                  Ranked by overall interview score
                </p>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Completed: {completedCandidates.length}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {top10.map((candidate, idx) => {
              const score = getScore(candidate);
              const rankColor =
                idx === 0
                  ? 'text-amber-500'
                  : idx === 1
                    ? 'text-slate-400'
                    : idx === 2
                      ? 'text-amber-700'
                      : 'text-gray-400';

              return (
                <div
                  key={candidate.id}
                  onClick={() => onSelectCandidate(candidate)}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <div
                    className={`w-8 text-center font-extrabold text-lg ${rankColor}`}
                  >
                    {idx < 3 ? (
                      <Medal className="h-5 w-5 inline-block" />
                    ) : (
                      `#${idx + 1}`
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials(candidate.name)}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {candidate.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {candidate.email}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-40 hidden md:block">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Score</span>
                      <span className="text-xs font-bold text-gray-800">
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Score badge */}
                  <div
                    className={`text-sm font-bold px-3 py-1 rounded-lg flex-shrink-0 ${getBadgeColor(score)}`}
                  >
                    {score}%
                  </div>

                  {/* Recommendation */}
                  {candidate?.recommendations?.recommendation && (
                    <span
                      className={`hidden lg:inline-flex text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 border ${getRecommendationColor(
                        candidate.recommendations.recommendation,
                      )}`}
                    >
                      {candidate.recommendations.recommendation}
                    </span>
                  )}

                  <Eye className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INTERVIEW ANALYTICS ────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Interview Analytics
          </h2>
          <span className="text-sm text-gray-400">
            • {completedCandidates.length} completed interviews
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <Percent className="h-4 w-4 text-indigo-500" />
              <span>Score Distribution</span>
            </h3>
            <div className="space-y-3">
              {scoreBuckets.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{b.label}</span>
                    <span className="font-semibold text-gray-700">
                      {b.count} candidates
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.color} transition-all duration-500`}
                      style={{ width: `${(b.count / maxBucketCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Avg Score</span>
              <span className="text-lg font-bold text-indigo-600">
                {avgPercentage}%
              </span>
            </div>
          </div>

          {/* Candidate Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Candidate Status</span>
            </h3>

            {/* Completion donut */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray={`${completionRate} ${100 - completionRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {completionRate}%
                  </span>
                  <span className="text-xs text-gray-400">Complete</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {statusGroups.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs text-gray-600">{s.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Spread */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <Target className="h-4 w-4 text-emerald-500" />
              <span>Recommendations</span>
            </h3>

            {recEntries.length === 0 ? (
              <p className="text-xs text-gray-400 text-center mt-8">
                No recommendations yet
              </p>
            ) : (
              <div className="space-y-3">
                {recEntries.map(([rec, count]) => {
                  const pct = Math.round(
                    (count / completedCandidates.length) * 100,
                  );
                  return (
                    <div key={rec}>
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className="text-gray-600 truncate max-w-[140px]"
                          title={rec}
                        >
                          {rec}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getRecBarColor(rec)} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Highlights */}
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-emerald-700">
                  {highPerformers}
                </div>
                <div className="text-xs text-emerald-600">Score ≥85%</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <XCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-600">
                  {belowSixty}
                </div>
                <div className="text-xs text-red-500">Below 60%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
