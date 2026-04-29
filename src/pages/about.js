import AboutUs from '../components/pages/AboutUs';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema, generateOrganizationSchema } from '../utils/schema';

export default function About() {
  return (
    <>
      <Seo
        title="About AajExam – India's Government Exam Preparation Platform"
        description="AajExam is India's all-in-one government exam preparation platform with verified practice tests, previous year question papers (PYQs) and topic-wise quizzes for SSC, UPSC, Banking, Railway and State PSC exams. Built by educators, for aspirants."
        canonical="/about"
        keywords={[
          'about AajExam',
          'government exam preparation platform',
          'SSC preparation platform',
          'UPSC preparation platform',
          'banking exam practice',
          'railway exam practice',
          'aajexam team'
        ]}
        schemas={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About Us', url: '/about' }
          ])
        ]}
      />
      <AboutUs />
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 86400
  };
}
