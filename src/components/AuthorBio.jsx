import Link from 'next/link';

const AuthorBio = () => {
    return (
        <div className="mt-12 p-4 md:p-8 lg:p-12 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-2xl relative overflow-hidden group">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-24 lg:w-48 h-24 lg:h-48 bg-primary-500/5 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none group-hover:bg-primary-500/10 transition-colors" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-primary-500 shrink-0 flex items-center justify-center text-white text-xl lg:text-3xl font-black shadow-duo-primary border-4 border-white dark:border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                    S
                </div>

                <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] mb-4">
                        Curator Intelligence
                    </h3>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl">
                        Content strictly reviewed and curated by <span className="text-primary-700 dark:text-primary-500">Mohd Sazid Khan</span>,
                        founder of AajExam and educational technology expert with extensive
                        experience in government exam preparation systems.
                    </p>
                    <Link
                        href="/about-founder"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-slate-900 text-primary-700 dark:text-primary-500 font-black uppercase tracking-widest text-[10px] rounded-2xl border-2 border-b-4 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:translate-y-1 shadow-sm"
                    >
                        Meet the Founder<span className="text-xl leading-none">â†’</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthorBio;

