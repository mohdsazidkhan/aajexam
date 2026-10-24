import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import PageHero from '@/components/common/ui/PageHero';
import { FaUserGraduate, FaTrophy, FaCode, FaChalkboardTeacher, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import MobileAppWrapper from '../components/common/MobileAppWrapper';
import UnifiedFooter from '../components/common/UnifiedFooter';
import Seo from '../components/common/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';
import config from '../lib/config/appConfig';
import useTranslate from '../hooks/useTranslate';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

export default function AboutAuthor() {
  const { translate } = useTranslate();
    const router = useRouter();

    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Mohd Sazid Khan",
      "url": `${SITE_URL}/about-founder`,
      "image": `${SITE_URL}/logo.png`,
      "jobTitle": "Founder & CEO, AajExam",
      "worksFor": { "@type": "Organization", "name": "AajExam", "url": SITE_URL },
      "sameAs": [
        "https://mohdsazidkhan.com",
        "https://github.com/mohdsazidkhan",
        "https://www.linkedin.com/in/mohdsazidkhan/"
      ]
    };

    return (
        <MobileAppWrapper title={translate('About the Founder')}>
            <Seo
                title="Mohd Sazid Khan – Founder of AajExam | EdTech & Full-Stack Developer"
                description="Meet Mohd Sazid Khan, founder of AajExam. Full-stack developer, UDYAM-registered entrepreneur and educational technology builder making government exam preparation in India accessible and affordable."
                canonical="/about-founder"
                keywords={[
                  'Mohd Sazid Khan',
                  'AajExam founder',
                  'edtech founder India',
                  'full stack developer India',
                  'UDYAM entrepreneur'
                ]}
                schemas={[
                  personSchema,
                  generateBreadcrumbSchema([
                    { name: 'Home', url: '/' },
                    { name: 'About the Founder', url: '/about-founder' }
                  ])
                ]}
            />

            <div className="min-h-screen">
                <div className="container mx-auto pt-3 xl:pt-4">
                    <div className="mb-6 xl:mb-8">
                        <PageHero
                            icon={FaUserGraduate}
                            eyebrow={translate('Founder & CEO, AajExam')}
                            title={translate('Mohd Sazid Khan')}
                            subtitle={translate('Full-Stack Developer | Educational Technology Expert | UDYAM Registered Entrepreneur')}
                        />
                    </div>

                    {/* About */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 xl:p-12 shadow-sm mb-12 border-2 border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <h2 className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-600 rounded-full" />
                            {translate('About the Founder')}
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-md xl:text-xl font-bold leading-relaxed">
                            <p>
                                {translate('Mohd Sazid Khan is the founder and driving force behind AajExam, India\'s innovative government exam preparation platform. With a strong background in full-stack web development and a passion for educational technology, Sazid has dedicated his career to making quality exam preparation accessible to students across India.')}
                            </p>
                            <p>
                                {translate('As a UDYAM registered entrepreneur, Sazid combines technical expertise with business acumen to create scalable, user-friendly educational solutions. His vision is to democratize access to high-quality government exam preparation resources, ensuring that students from all backgrounds have the tools they need to succeed in competitive examinations.')}
                            </p>
                            <p>
                                {translate('Under his leadership, AajExam has grown to serve thousands of students preparing for SSC, UPSC, Banking, Railway, and other government examinations. The platform\'s comprehensive exam preparation system and extensive test database reflect his commitment to structured, effective learning methodologies.')}
                            </p>
                        </div>
                    </div>

                    {/* Expertise */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 xl:p-12 shadow-sm mb-12 border-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center shadow-sm border-b-2 border-primary-600">
                                <FaCode className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{translate('Technical Expertise')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {[
                                { title: 'Full-Stack Development', desc: 'Expert in modern web technologies including React, Next.js, Node.js, Express, and MongoDB. Specializes in building scalable, high-performance web applications.', color: 'bg-primary-600' },
                                { title: 'EdTech Strategy', desc: 'Deep understanding of learning management systems, gamification, and user engagement strategies in educational platforms.', color: 'bg-primary-600' },
                                { title:'System Architecture', desc:'Experienced in designing and implementing robust, secure, and scalable system architectures for educational platforms.', color:'bg-primary-600'},
                                { title: 'Data Analytics', desc: 'Proficient in implementing analytics systems to track user progress, identify learning patterns, and optimize outcomes.', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-4 mlgp-8 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all">
                                    <h3 className="text-sm xl:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight flex items-center gap-3">
                                        <div className={`w-2 h-6 ${item.color} rounded-full`} />
                                        {translate(item.title)}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{translate(item.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 xl:p-12 shadow-sm mb-16 border-2 border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -ml-32 -mb-32" />
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center shadow-sm border-b-2 border-primary-600">
                                <FaTrophy className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{translate('Vision & Mission')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h3 className="text-sm xl:text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-600 rounded-full" />
                                    {translate('Vision')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                    {translate('To become India\'s most trusted and comprehensive government exam preparation platform, empowering millions of students to achieve their career goals in public service through innovative technology and quality educational content.')}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm xl:text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-600 rounded-full" />
                                    {translate('Mission')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                    {translate('To provide accessible, affordable, and effective exam preparation resources that combine cutting-edge technology with proven pedagogical methods. We aim to bridge the gap between traditional coaching and modern digital learning.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 xl:p-12 shadow-sm mb-16 border-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center shadow-sm border-b-2 border-primary-600">
                                <FaChalkboardTeacher className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{translate('Key Achievements')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {[
                                { title: 'UDYAM Registration', desc: 'Successfully registered AajExam as a formal UDYAM enterprise.', color: 'bg-primary-600' },
                                { title: 'Platform Development', desc: 'Designed and developed the entire AajExam platform from scratch.', color: 'bg-primary-600' },
                                { title:'Content Curation', desc:'Curated thousands of exam questions across multiple subjects.', color:'bg-primary-600'},
                                { title: 'User Growth', desc: 'Onboarded thousands of students across India.', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0 text-white font-black shadow-sm border-b-2 border-black/20`}>
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{translate(item.title)}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{translate(item.desc)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Philosophy */}
                    <div className="bg-primary-50 dark:bg-slate-950 p-4 md:p-8 xl:p-10 mb-10 xl:mb-12 ring-1 ring-primary-200 dark:ring-slate-800 shadow-xl relative overflow-hidden" style={{ borderRadius: 16 }}>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        <h2 className="text-xl xl:text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight relative z-10">{translate('Educational Philosophy')}</h2>
                        <div className="space-y-5 text-slate-700 dark:text-slate-400 text-base xl:text-lg font-bold leading-relaxed relative z-10">
                            <p>
                                {translate('Sazid believes that effective exam preparation requires more than just access to questions, it requires a structured, progressive learning path that builds confidence and competence systematically.')}
                            </p>
                            <p>
                                {translate('He advocates for a balanced approach that combines technology-enabled convenience with pedagogically sound learning principles. He personally oversees the editorial process and ensures all content meets rigorous standards.')}
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-4 xl:p-8 mb-8" style={{ borderRadius: 16 }}>
                        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                        <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
                        <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/25 blur-3xl" style={{ borderRadius: '50%' }} />

                        <div className="flex items-center gap-3 mb-5 xl:mb-6">
                            <div className="w-11 h-11 xl:w-12 xl:h-12 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow-lg rotate-[-4deg] flex items-center justify-center" style={{ borderRadius: 12 }}>
                                <FaEnvelope className="text-lg xl:text-xl" />
                            </div>
                            <h2 className="text-xl xl:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{translate('Connect with Sazid')}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 pt-4 border-t border-dashed border-slate-300 dark:border-white/25">
                            {[
                                { href: `mailto:${config.CONTACT.EMAIL}`, icon: FaEnvelope, label: translate('Email'), external: false },
                                { href: 'https://www.linkedin.com/in/mohd-sazid-khan', icon: FaLinkedin, label: translate('LinkedIn'), external: true },
                                { href: 'https://github.com/mohdsazidkhan', icon: FaGithub, label: translate('GitHub'), external: true },
                            ].map((c) => (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                    className="group relative flex items-center gap-3 px-4 py-3.5 bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 hover:-translate-y-1 hover:shadow-lg transition-all"
                                    style={{ borderRadius: 12 }}
                                >
                                    <span className="w-10 h-10 shrink-0 bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center shadow group-hover:rotate-[-4deg] transition-transform" style={{ borderRadius: 10 }}>
                                        <c.icon className="text-xl" />
                                    </span>
                                    <span className="font-black text-sm xl:text-base text-slate-900 dark:text-white">{c.label}</span>
                                    <span className="ml-auto text-primary-600 dark:text-primary-300 font-black group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <div className="bg-primary-600 rounded-[3rem] p-4 md:p-8 xl:p-12 border-b-[12px] border-primary-600 shadow-sm">
                            <h2 className="text-2xl xl:text-5xl font-black mb-6 text-white uppercase tracking-tighter">
                                {translate('Join Thousands of Successful Students')}
                            </h2>
                            <p className="text-md md:text-xl xl:text-2xl font-bold mb-10 text-white/90 uppercase tracking-widest text-xs">
                                {translate('Start your government exam preparation journey today')}
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white text-primary-600 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 transition-all shadow-sm active:translate-y-1 active:shadow-none"
                            >
                                {translate('Get Started Now')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 86400
    };
}

