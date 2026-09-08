import Link from 'next/link';

/**
 * Server-rendered internal-link index.
 *
 * The interactive listing components on the hub pages (/quizzes, /topics,
 * /subjects, /blog …) fetch their data in `useEffect`, so the HTML Googlebot
 * receives contains a skeleton and zero links — every detail page below them
 * is effectively an orphan discovered only through the sitemap. This section
 * renders the same links server-side so crawlers get a real hierarchy:
 * hub → subject → topic → quiz.
 *
 * @param {string}  title    section heading (rendered as <h2>)
 * @param {string}  intro    optional paragraph under the heading
 * @param {Array}   groups   [{ heading, href, items: [{ href, name, meta }] }]
 * @param {string}  columns  tailwind grid-column classes for the link grid
 */
export default function LinkIndexSection({ title, intro, groups = [], columns = 'sm:grid-cols-2 lg:grid-cols-3' }) {
  const usable = groups.filter((g) => g?.items?.length > 0);
  if (usable.length === 0) return null;

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

      <div className="space-y-8">
        {usable.map((group, gi) => (
          <div key={group.heading || gi}>
            {group.heading && (
              <h3 className="text-sm lg:text-base font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">
                {group.href
                  ? <Link href={group.href} className="hover:text-primary-600 dark:hover:text-primary-400">{group.heading}</Link>
                  : group.heading}
              </h3>
            )}
            <ul className={`grid grid-cols-1 ${columns} gap-2`}>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 hover:border-primary-300 dark:hover:border-primary-700 transition"
                  >
                    <span className="block text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {item.name}
                    </span>
                    {item.meta && (
                      <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {item.meta}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
