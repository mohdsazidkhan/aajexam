import Link from '@/components/common/AppLink';
import useTranslate from '../../hooks/useTranslate';

const AuthorBio = () => {
  const { translate, rich } = useTranslate();
    return (
        <section className="mt-4 p-4 md:p-5 xl:p-6 bg-background-surface rounded-3xl border border-border-primary relative overflow-hidden group">
            {/* Decorative background */}

            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-4 xl:gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 shrink-0 flex items-center justify-center text-on-primary text-xl xl:text-3xl font-bold border border-white dark:border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                    {translate('S')}
                </div>

                <div className="flex-1 text-center xl:text-left">
                    <h3 className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] mb-2">
                        {translate('Curator Intelligence')}
                    </h3>
                    <p className="text-sm font-bold text-content-secondary mb-3 leading-relaxed max-w-2xl">
                        {rich('Content strictly reviewed and curated by <0>Mohd Sazid Khan</0>, founder of AajExam and educational technology expert with extensive experience in government exam preparation systems.', [(c) => <span className="text-primary-600">{c}</span>])}
                    </p>
                    <Link
                        href="/about-founder"
                        className="inline-flex items-center gap-3 px-5 py-2.5 bg-background-surface text-primary-600 font-bold uppercase tracking-[0.08em] text-[10px] rounded-2xl border border-border-primary hover:bg-background-surface-secondary transition-all active:translate-y-1"
                    >
                        {translate('Meet the Founder')}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AuthorBio;

