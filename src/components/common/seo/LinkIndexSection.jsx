import Link from '@/components/common/AppLink';

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
export default function LinkIndexSection({ title, intro, groups = [], columns = 'sm:grid-cols-2 xl:grid-cols-3' }) {
  const usable = groups.filter((g) => g?.items?.length > 0);
  if (usable.length === 0) return null;

  return (
    <section className="rounded-3xl px-0 py-4 xl:py-8">
      <h2 className="text-xl xl:text-3xl font-bold text-content-primary mb-3 tracking-tight">
        {title}
      </h2>
      {intro && (
        <p className="text-sm xl:text-base font-medium text-content-secondary leading-relaxed mb-8 max-w-4xl">
          {intro}
        </p>
      )}

      <div className="space-y-8">
        {usable.map((group, gi) => (
          <div key={group.heading || gi}>
            {group.heading && (
              <h3 className="text-sm xl:text-base font-bold text-content-primary mb-4 uppercase tracking-[0.08em]">
                {group.href
                  ? <Link href={group.href} className="hover:text-primary-600 dark:hover:text-primary-600">{group.heading}</Link>
                  : group.heading}
              </h3>
            )}
            <ul className={`grid grid-cols-1 ${columns} gap-2`}>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-2xl border border-border-primary px-4 py-3 hover:border-primary-300 dark:hover:border-primary-700 transition"
                  >
                    <span className="block text-sm font-bold text-content-primary leading-snug line-clamp-2">
                      {item.name}
                    </span>
                    {item.meta && (
                      <span className="block text-xs font-medium text-content-muted mt-1">
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
