import dynamic from 'next/dynamic';
import Seo from '../../../components/Seo';

const AttemptQuizPage = dynamic(() => import('../../../components/pages/AttemptQuizPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AttemptQuiz() {
  return (
    <>
      <Seo title="Attempt Quiz – AajExam" description="Attempt this quiz on AajExam." noIndex={true} />
      <AttemptQuizPage />
    </>
  );
}
