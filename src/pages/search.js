import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const SearchPage = dynamic(() => import('../components/pages/SearchPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Search() {
  return (
    <>
      <Seo
        title="Search AajExam – Practice Tests, PYQs, Quizzes & Notes"
        description="Search across AajExam: practice tests, previous year question papers (PYQs), quizzes, notes, current affairs and exam news for SSC, UPSC, Banking, Railway and State PSC exams."
        canonical="/search"
        keywords={[
          'search government exam content',
          'find practice tests',
          'find PYQ',
          'find quiz',
          'aajexam search'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Search', url: '/search' }
        ])}
      />
      <SearchPage />
    </>
  );
}
