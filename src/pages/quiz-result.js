import QuizResultPage from '../components/pages/QuizResult';
import Seo from '../components/Seo';

export default function QuizResult() {
  return (
    <>
      <Seo
        title="Quiz Result - SUBG QUIZ Platform"
        description="View your quiz result and performance summary."
        noIndex={true}
      />
      <QuizResultPage />
    </>
  );
}

