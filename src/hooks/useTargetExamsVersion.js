import { useState, useEffect } from 'react';
import { TARGET_EXAMS_EVENT } from '../lib/utils/targetExams';

// Returns a counter that bumps whenever the user saves new target exams.
// Add it to an effect's deps to refetch filtered lists immediately.
export default function useTargetExamsVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const onChange = () => setVersion((v) => v + 1);
    window.addEventListener(TARGET_EXAMS_EVENT, onChange);
    return () => window.removeEventListener(TARGET_EXAMS_EVENT, onChange);
  }, []);
  return version;
}
