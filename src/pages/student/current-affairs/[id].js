import { toStudentPath } from '@/lib/utils/appRoutes';
import { getServerSideProps as publicGetServerSideProps } from '../../current-affairs/[id]';

export { default } from '../../current-affairs/[id]';

// Same data as the public page; canonical-slug redirects stay inside /student.
export const getServerSideProps = async (context) => {
  const result = await publicGetServerSideProps(context);
  if (result?.redirect?.destination) {
    result.redirect.destination = toStudentPath(result.redirect.destination);
  }
  return result;
};
