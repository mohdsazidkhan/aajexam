import { useRouter } from 'next/router';
import { FaUserGraduate, FaTrophy, FaCode, FaChalkboardTeacher, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

export default function AboutAuthor() {
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
        <MobileAppWrapper title="About the Founder">
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

            <div className="min-h-screen ">
                <div className="container mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaUserGraduate className="text-white text-5xl" />
                        </div>
                        <h1 className="text-2xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Mohd Sazid Khan
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                            Founder & CEO, AajExam
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Full-Stack Developer | Educational Technology Expert | UDYAM Registered Entrepreneur
                        </p>
                    </div>

                    {/* About */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-500 rounded-full" />
                            About the Founder
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-md lg:text-xl font-bold leading-relaxed">
                            <p>
                                Mohd Sazid Khan is the founder and driving force behind AajExam, India&apos;s innovative government exam preparation platform. With a strong background in full-stack web development and a passion for educational technology, Sazid has dedicated his career to making quality exam preparation accessible to students across India.
                            </p>
                            <p>
                                As a UDYAM registered entrepreneur, Sazid combines technical expertise with business acumen to create scalable, user-friendly educational solutions. His vision is to democratize access to high-quality government exam preparation resources, ensuring that students from all backgrounds have the tools they need to succeed in competitive examinations.
                            </p>
                            <p>
                                Under his leadership, AajExam has grown to serve thousands of students preparing for SSC, UPSC, Banking, Railway, and other government examinations. The platform&apos;s comprehensive exam preparation system and extensive test database reflect his commitment to structured, effective learning methodologies.
                            </p>
                        </div>
                    </div>

                    {/* Expertise */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-500 rounded-[1.5rem] flex items-center justify-center shadow-duo border-b-4 border-primary-700">
                                <FaCode className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Technical Expertise</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {[
                                { title: 'Full-Stack Development', desc: 'Expert in modern web technologies including React, Next.js, Node.js, Express, and MongoDB. Specializes in building scalable, high-performance web applications.', color: 'bg-primary-500' },
                                { title: 'EdTech Strategy', desc: 'Deep understanding of learning management systems, gamification, and user engagement strategies in educational platforms.', color: 'bg-emerald-500' },
                                { title: 'System Architecture', desc: 'Experienced in designing and implementing robust, secure, and scalable system architectures for educational platforms.', color: 'bg-purple-500' },
                                { title: 'Data Analytics', desc: 'Proficient in implementing analytics systems to track user progress, identify learning patterns, and optimize outcomes.', color: 'bg-primary-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-4 mlgp-8 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all">
                                    <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight flex items-center gap-3">
                                        <div className={`w-2 h-6 ${item.color} rounded-full`} />
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-16 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32" />
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-500 rounded-[1.5rem] flex items-center justify-center shadow-duo border-b-4 border-primary-700">
                                <FaTrophy className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vision & Mission</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                    Vision
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                    To become India&apos;s most trusted and comprehensive government exam preparation platform, empowering millions of students to achieve their career goals in public service through innovative technology and quality educational content.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                    Mission
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                    To provide accessible, affordable, and effective exam preparation resources that combine cutting-edge technology with proven pedagogical methods. We aim to bridge the gap between traditional coaching and modern digital learning.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-16 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-duo border-b-4 border-emerald-700">
                                <FaChalkboardTeacher className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Key Achievements</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {[
                                { title: 'UDYAM Registration', desc: 'Successfully registered AajExam as a formal UDYAM enterprise.', color: 'bg-primary-500' },
                                { title: 'Platform Development', desc: 'Designed and developed the entire AajExam platform from scratch.', color: 'bg-green-500' },
                                { title: 'Content Curation', desc: 'Curated thousands of exam questions across multiple subjects.', color: 'bg-purple-500' },
                                { title: 'User Growth', desc: 'Onboarded thousands of students across India.', color: 'bg-primary-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0 text-white font-black shadow-duo border-b-4 border-black/20`}>
                                        âœ“
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Philosophy */}
                    <div className="bg-slate-950 rounded-[3rem] p-4 md:p-8 lg:p-12 mb-16 border-2 border-b-[12px] border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                        <h2 className="text-xl lg:text-4xl font-black text-white mb-8 uppercase tracking-tight relative z-10">Educational Philosophy</h2>
                        <div className="space-y-6 text-slate-400 text-md lg:text-xl font-bold leading-relaxed relative z-10">
                            <p>
                                Sazid believes that effective exam preparation requires more than just access to questions, it requires a structured, progressive learning path that builds confidence and competence systematically.
                            </p>
                            <p>
                                He advocates for a balanced approach that combines technology-enabled convenience with pedagogically sound learning principles. He personally oversees the editorial process and ensures all content meets rigorous standards.
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Connect with Sazid</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a
                                href="mailto:support@mohdsazidkhan.com"
                                className="flex items-center gap-3 bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all"
                            >
                                <FaEnvelope className="text-xl" />
                                <span>Email</span>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/mohd-sazid-khan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-primary-700 text-white px-6 py-3 rounded-xl hover:bg-primary-800 transition-all"
                            >
                                <FaLinkedin className="text-xl" />
                                <span>LinkedIn</span>
                            </a>
                            <a
                                href="https://github.com/mohdsazidkhan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all"
                            >
                                <FaGithub className="text-xl" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <div className="bg-primary-500 rounded-[3rem] p-4 md:p-8 lg:p-12 border-b-[12px] border-primary-700 shadow-duo-primary">
                            <h2 className="text-2xl lg:text-5xl font-black mb-6 text-white uppercase tracking-tighter">
                                Join Thousands of Successful Students
                            </h2>
                            <p className="text-md md:text-xl lg:text-2xl font-bold mb-10 text-white/90 uppercase tracking-widest text-xs">
                                Start your government exam preparation journey today
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white text-primary-600 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 transition-all shadow-xl active:translate-y-1 active:shadow-none"
                            >
                                Get Started Now
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

