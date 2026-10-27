// "Rank based on" options of the All India / State / City Rank pages. The key is what the page sends
// as ?sort=; unknown values fall back to total time spent (the original ordering).
export const RANK_SORT_KEYS = ['time', 'attempts', 'correct', 'score', 'accuracy', 'avg'];

// Labels of the "Rank Based on" dropdown (student pages translate them; admin pages show them as is).
export const RANK_SORT_OPTIONS = [
  { value: 'time', label: 'Time Spent' },
  { value: 'attempts', label: 'Exams' },
  { value: 'correct', label: 'Correct' },
  { value: 'score', label: 'Score' },
  { value: 'accuracy', label: 'Accuracy' },
  { value: 'avg', label: 'Avg Score' },
];

export const normalizeRankSort = (value) => (RANK_SORT_KEYS.includes(value) ? value : 'time');

// Field of the rows built by the ranking aggregations / shaped entries.
const ROW_FIELD = { time: 'totalTimeSpent', attempts: 'totalExams', correct: 'totalCorrect', score: 'totalScore', accuracy: 'avgAccuracy', avg: 'avgAccuracy' };
// Field of the precomputed LeaderboardStat rows.
const STAT_FIELD = { time: 'totalTime', attempts: 'n', correct: 'totalCorrect', score: 'totalScore', accuracy: 'avgAccuracy', avg: 'avgPercentage' };

// Chosen metric first, then the default chain (time, attempts, accuracy, score, id) as tie-breakers.
// `tieBreak` is the default sort of the caller, in its own field names.
const build = (field, tieBreak) => {
    const out = { [field]: -1 };
    for (const [k, v] of Object.entries(tieBreak)) if (!(k in out)) out[k] = v;
    return out;
};

export const rowSort = (sort) => build(ROW_FIELD[normalizeRankSort(sort)], { totalTimeSpent: -1, totalExams: -1, avgAccuracy: -1, totalScore: -1, _id: 1 });
export const statSort = (sort) => build(STAT_FIELD[normalizeRankSort(sort)], { totalTime: -1, n: -1, avgAccuracy: -1, totalScore: -1, user: 1 });
