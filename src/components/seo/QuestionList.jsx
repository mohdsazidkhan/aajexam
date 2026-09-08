const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Server-rendered question list with solutions.
 *
 * This is the only unique content these pages have. Previously the questions
 * were fetched client-side inside the attempt flow, so a logged-out visitor —
 * and Googlebot — saw nothing but a generated intro, which is why thousands of
 * quiz URLs read as near-duplicates.
 *
 * The answer and explanation sit inside <details> so the page still works as a
 * self-test for a human, while the text remains in the HTML for crawlers.
 *
 * Question text is rendered as plain text (never dangerouslySetInnerHTML) —
 * it is author-supplied content and effectively always plain.
 */
export default function QuestionList({ questions = [], title = 'Questions with solutions', intro }) {
  if (questions.length === 0) return null;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
      <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
        {title}
      </h2>
      {intro && (
        <p className="text-sm lg:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-4xl">
          {intro}
        </p>
      )}

      <ol className="space-y-6 list-none p-0 m-0">
        {questions.map((q, qi) => {
          const correctIndex = (q.options || []).findIndex((o) => o.isCorrect);
          return (
            <li key={q._id || qi} className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
              <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white leading-snug mb-1">
                <span className="text-primary-600 dark:text-primary-400 mr-2">Q{qi + 1}.</span>
                {q.questionText}
              </h3>

              {q.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={q.image} alt={`Figure for question ${qi + 1}`} loading="lazy" decoding="async"
                  className="my-3 max-h-72 w-auto rounded-xl border-2 border-slate-200 dark:border-slate-700" />
              )}

              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
                {(q.options || []).map((opt, oi) => (
                  <li key={opt._id || oi} className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 px-3 py-2">
                    <span className="font-black text-slate-500 dark:text-slate-500 mr-2">{LABELS[oi] || oi + 1}.</span>
                    {opt.text}
                  </li>
                ))}
              </ul>

              {correctIndex > -1 && (
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-primary-700 dark:text-primary-400">
                    Show answer
                  </summary>
                  <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Answer: {LABELS[correctIndex] || correctIndex + 1}. {q.options[correctIndex]?.text}
                  </p>
                  {q.explanation && (
                    <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
