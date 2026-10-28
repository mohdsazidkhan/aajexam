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
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-12 border border-border-primary relative overflow-hidden">

                        <h2 className="text-xl xl:text-4xl font-bold text-content-primary mb-8 tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-600 rounded-full" />
                            {translate('About the Founder')}
                        </h2>
                        <div className="space-y-6 text-content-secondary text-md xl:text-xl font-bold leading-relaxed">
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
                    </section>

                    {/* Expertise */}
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-12 border border-border-primary">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center border-b-2 border-primary-600">
                                <FaCode className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-bold text-content-primary tracking-tight">{translate('Technical Expertise')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {[
                                { title: 'Full-Stack Development', desc: 'Expert in modern web technologies including React, Next.js, Node.js, Express, and MongoDB. Specializes in building scalable, high-performance web applications.', color: 'bg-primary-600' },
                                { title: 'EdTech Strategy', desc: 'Deep understanding of learning management systems, gamification, and user engagement strategies in educational platforms.', color: 'bg-primary-600' },
                                { title:'System Architecture', desc:'Experienced in designing and implementing robust, secure, and scalable system architectures for educational platforms.', color:'bg-primary-600'},
                                { title: 'Data Analytics', desc: 'Proficient in implementing analytics systems to track user progress, identify learning patterns, and optimize outcomes.', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <article key={idx} className="rounded-3xl p-4 mlgp-8 border border-border-primary hover:border-primary-500/30 transition-all">
                                    <h3 className="text-sm xl:text-xl font-bold text-content-primary mb-3 tracking-tight flex items-center gap-3">
                                        <div className={`w-2 h-6 ${item.color} rounded-full`} />
                                        {translate(item.title)}
                                    </h3>
                                    <p className="text-content-muted font-bold leading-relaxed">{translate(item.desc)}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Vision & Mission */}
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-16 border border-border-primary relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center border-b-2 border-primary-600">
                                <FaTrophy className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-bold text-content-primary tracking-tight">{translate('Vision & Mission')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h3 className="text-sm xl:text-xl font-bold text-content-primary mb-4 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-600 rounded-full" />
                                    {translate('Vision')}
                                </h3>
                                <p className="text-content-secondary text-lg font-bold leading-relaxed">
                                    {translate('To become India\'s most trusted and comprehensive government exam preparation platform, empowering millions of students to achieve their career goals in public service through innovative technology and quality educational content.')}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm xl:text-xl font-bold text-content-primary mb-4 tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-600 rounded-full" />
                                    {translate('Mission')}
                                </h3>
                                <p className="text-content-secondary text-lg font-bold leading-relaxed">
                                    {translate('To provide accessible, affordable, and effective exam preparation resources that combine cutting-edge technology with proven pedagogical methods. We aim to bridge the gap between traditional coaching and modern digital learning.')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Achievements */}
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-16 border border-border-primary">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center border-b-2 border-primary-600">
                                <FaChalkboardTeacher className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-bold text-content-primary tracking-tight">{translate('Key Achievements')}</h2>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {[
                                { title: 'UDYAM Registration', desc: 'Successfully registered AajExam as a formal UDYAM enterprise.', color: 'bg-primary-600' },
                                { title: 'Platform Development', desc: 'Designed and developed the entire AajExam platform from scratch.', color: 'bg-primary-600' },
                                { title:'Content Curation', desc:'Curated thousands of exam questions across multiple subjects.', color:'bg-primary-600'},
                                { title: 'User Growth', desc: 'Onboarded thousands of students across India.', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <section key={idx} className="flex items-start gap-5 p-6 rounded-3xl border border-border-primary">
                                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold border-b-2 border-black/20`}>
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-content-primary mb-1 tracking-tight">{translate(item.title)}</h3>
                                        <p className="text-content-muted font-bold leading-relaxed">{translate(item.desc)}</p>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </section>

                    {/* Philosophy */}
                    <section className="dark:bg-slate-950 p-4 md:p-8 xl:p-10 mb-10 xl:mb-12 ring-1 ring-primary-200 dark:ring-slate-800 relative overflow-hidden" style={{ borderRadius: 16 }}>
                        <h2 className="text-xl xl:text-4xl font-bold text-content-primary mb-6 tracking-tight relative z-10">{translate('Educational Philosophy')}</h2>
                        <div className="space-y-5 text-content-secondary text-base xl:text-lg font-bold leading-relaxed relative z-10">
                            <p>
                                {translate('Sazid believes that effective exam preparation requires more than just access to questions, it requires a structured, progressive learning path that builds confidence and competence systematically.')}
                            </p>
                            <p>
                                {translate('He advocates for a balanced approach that combines technology-enabled convenience with pedagogically sound learning principles. He personally oversees the editorial process and ensures all content meets rigorous standards.')}
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="relative isolate overflow-hidden border border-border-primary p-4 xl:p-8 mb-8 bg-background-surface" style={{ borderRadius: 16 }}>

                        <div className="flex items-center gap-3 mb-5 xl:mb-6">
                            <div className="w-11 h-11 xl:w-12 xl:h-12 text-primary-600 flex items-center justify-center border border-border-primary" style={{ borderRadius: 12 }}>
                                <FaEnvelope className="text-lg xl:text-xl" />
                            </div>
                            <h2 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight">{translate('Connect with Sazid')}</h2>
                        </div>

                        <address className="not-italic grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 pt-4 border-t border-dashed border-border-primary">
                            {[
                                { href: `mailto:${config.CONTACT.EMAIL}`, icon: FaEnvelope, label: translate('Email'), external: false },
                                { href: 'https://www.linkedin.com/in/mohd-sazid-khan', icon: FaLinkedin, label: translate('LinkedIn'), external: true },
                                { href: 'https://github.com/mohdsazidkhan', icon: FaGithub, label: translate('GitHub'), external: true },
                            ].map((c) => (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                    className="group relative flex items-center gap-3 px-4 py-3.5 hover:bg-background-surface border border-border-primary hover:-translate-y-1 transition-all"
                                    style={{ borderRadius: 12 }}
                                >
                                    <span className="w-10 h-10 shrink-0 text-primary-600 flex items-center justify-center transition-transform border border-border-primary" style={{ borderRadius: 10 }}>
                                        <c.icon className="text-xl" />
                                    </span>
                                    <span className="font-bold text-sm xl:text-base text-content-primary">{c.label}</span>
                                    <span className="ml-auto text-primary-600 font-bold group-hover:translate-x-1 transition-transform" aria-hidden="true">&rarr;</span>
                                </a>
                            ))}
                        </address>
                    </section>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <section className="bg-primary-600 rounded-3xl p-4 md:p-8 xl:p-12 border-primary-600">
                            <h2 className="text-2xl xl:text-5xl font-bold mb-6 text-white tracking-tight">
                                {translate('Join Thousands of Successful Students')}
                            </h2>
                            <p className="text-md md:text-xl xl:text-2xl font-bold mb-10 text-white tracking-[0.08em] text-xs">
                                {translate('Start your government exam preparation journey today')}
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-background-surface text-primary-600 px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.08em] text-xs hover:bg-background-surface-secondary transition-all active:translate-y-1"
                            >
                                {translate('Get Started Now')}
                            </button>
                        </section>
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

