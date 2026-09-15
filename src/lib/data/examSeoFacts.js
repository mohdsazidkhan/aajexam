// Per-exam SEO facts (eligibility, age limit, selection process, salary) and
// subject-area labels used to build the Exam Information, Syllabus and FAQ
// sections on the exam hub page (src/pages/govt-exams/exam/[examId].js).
//
// Eligibility/age/salary facts were sourced via web search in September 2026
// and are shown with a "verify before relying on this" note on the page —
// they change with every new notification, so re-check the official source
// before a fresh recruitment cycle rather than trusting this file blindly.
// Keyed by Exam.slug.
export const EXAM_SEO_FACTS = {
  'cil-coal-india-limited': {
    age: '18–30 years as on 30 April 2026 (General/EWS); age relaxation applies for reserved categories',
    qualification: 'BE/B.Tech/B.Sc Engineering/MCA/CS or equivalent (final-year candidates can apply)',
    selection: "Computer Based Test (CBT) only — Paper I (General Knowledge, Reasoning, Numerical Ability, English) and Paper II (Professional Knowledge). No interview.",
    salary: 'Management Trainee, E-1 grade: ₹60,000–₹1,80,000/month',
    subjectAreas: ['General Knowledge & Awareness', 'Reasoning', 'Numerical Ability', 'General English', 'Professional/Technical Knowledge'],
  },
  'central-teacher-eligibility-test': {
    age: 'No fixed minimum beyond completing the qualifying course; no upper age limit; unlimited attempts',
    qualification: 'Senior Secondary (12th) with 50%+ for the Paper 1 track, or graduation for the Paper 2 (Classes 6–8) track, per NCTE norms',
    selection: 'Single MCQ-based test with no negative marking. Paper 1 (Classes 1–5) and Paper 2 (Classes 6–8) — candidates may take either or both.',
    salary: "CTET is a teaching-eligibility qualification, not a recruiting exam, so it has no pay scale of its own. Qualifying marks: 60% (General), 55% (SC/ST/OBC/PwD).",
    subjectAreas: ['Child Development & Pedagogy', 'Mathematics', 'Environmental Studies/Science', 'Social Studies', 'Language I & II'],
  },
  'delhi-police-constable-ssc': {
    age: '18–25 years as on 1 July 2026 (General); OBC up to 28, SC/ST up to 30',
    qualification: 'Class 12 (Senior Secondary) pass from a recognised board; valid LMV driving licence mandatory for male candidates',
    selection: 'Computer-Based Test → Physical Efficiency & Measurement Test (PE&MT) → Document Verification → Medical Examination',
    salary: 'Pay scale not confirmed in our latest search pass — check ssc.gov.in / delhipolice.gov.in for the current pay level before publishing',
    subjectAreas: ['General Knowledge & Current Affairs', 'Reasoning', 'Numerical Ability', 'Computer Fundamentals'],
  },
  'esic-udc-prelims': {
    age: '18–27 years',
    qualification: 'Graduate degree from a recognised university',
    selection: 'Phase I Prelims (qualifying) → Phase II Mains (merit-deciding) → Phase III Computer Skill Test (qualifying)',
    salary: 'Pay Level 4 (7th CPC): ₹25,500–₹81,100 basic; approximate gross in-hand ₹38,000–₹44,000/month with DA and HRA',
    subjectAreas: ['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'],
  },
  'ibps-clerk-prelims': {
    age: '20–28 years as on 1 August 2026',
    qualification: 'Graduation in any discipline (completed by 21 August 2026); basic computer knowledge required',
    selection: 'Preliminary Exam (qualifying) → Main Exam (counts for merit) → Local Language Proficiency Test → Provisional Allotment',
    salary: 'Basic pay ₹24,050, rising to ₹64,480 over service with periodic increments, plus DA/HRA/transport allowance',
    subjectAreas: ['Reasoning Ability', 'Quantitative Aptitude', 'English Language'],
  },
  'ibps-po-probationary-officer-prelims': {
    age: '20–30 years (born between 2 July 1996 and 1 July 2006)',
    qualification: "Bachelor's degree from a recognised university or a Government-approved institution",
    selection: 'Preliminary Exam → Main Exam → Interview',
    salary: 'Basic pay ₹48,480; approximate gross ₹75,000–₹90,000/month depending on posting and allowances',
    subjectAreas: ['Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General/Economy/Banking Awareness (Mains)'],
  },
  'neet-2': {
    age: 'Minimum 17 years as on 31 December of the admission year; no upper age limit; unlimited attempts',
    qualification: 'Class 12 (or appearing) with Physics, Chemistry, Biology/Biotechnology and English; 50% PCB aggregate (General), 40% (OBC/SC/ST), 45% (PwD)',
    selection: 'Single national-level exam — Physics, Chemistry, Biology (50 questions each), +4/−1 marking, 180 minutes — followed by state/AIQ counselling',
    salary: 'Not applicable — NEET is an admission exam for MBBS/BDS/AYUSH courses, not a recruitment exam',
    subjectAreas: ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
  },
  'rrb-group-d': {
    age: '18–33 years generally (some notifications extend the band to 18–36 — check the specific CEN)',
    qualification: '10th pass / ITI / NCVT National Apprenticeship Certificate / Diploma or Degree in Engineering',
    selection: 'Computer-Based Test (CBT) → Physical Efficiency Test (PET/PST) → Document Verification → Medical Examination',
    salary: 'Basic pay ₹18,000/month (7th CPC Level 1); approximate in-hand ₹22,500–₹25,380 with allowances',
    subjectAreas: ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'General Awareness on Current Affairs'],
  },
  'rrb-ntpc': {
    age: 'Undergraduate posts: 18–33 years; Graduate posts: 18–36 years',
    qualification: 'Class 12 pass for undergraduate-level posts; Bachelor’s degree for graduate-level posts',
    selection: 'CBT 1 → CBT 2 → Typing Skill Test (for applicable posts) → Document Verification → Medical Examination',
    salary: '₹19,900–₹21,700/month starting, plus DA, HRA, TA and other railway allowances',
    subjectAreas: ['Mathematics', 'General Intelligence & Reasoning', 'General Awareness'],
  },
  'rssb-computer-instructor': {
    age: '18–40 years as on 1 January 2027; 5–10 years relaxation for Rajasthan-domicile reserved categories',
    qualification: "Senior instructor: M.Tech/M.Sc/MCA; Basic instructor: B.Tech/BCA/PGDCA in Computer Science/IT; working knowledge of Hindi (Devanagari) and Rajasthani culture required",
    selection: 'Offline written exam — two papers of 100 marks each with negative marking — followed by Document Verification, on a merit basis',
    salary: 'Senior Computer Instructor: Pay Matrix Level 10; Basic Computer Instructor: Level 8; approximate in-hand ₹28,000–₹45,000/month',
    subjectAreas: ['Computer Science Fundamentals', 'Programming & Data Structures', 'Rajasthan GK', 'Teaching Aptitude'],
  },
  'rajasthan-police-constable': {
    age: 'General Male 18–24, General Female 18–29; OBC/MBC/SC/ST Men up to 29, Women up to 34; Driver post up to 27',
    qualification: 'Class 12 (Senior Secondary) pass, plus a valid RSSB Senior Secondary-level CET score (40% General/OBC/EWS/MBC, 35% SC/ST)',
    selection: 'Written Exam (OMR) → PET/PST → Proficiency Test → Document Verification → Medical Examination',
    salary: 'Pay Level 5; basic ₹20,800 + 60% DA',
    subjectAreas: ['General Knowledge & Current Affairs', 'Reasoning', 'Numerical Ability', 'General Hindi'],
  },
  'sbi-clerk-prelims': {
    age: '20–28 years as on 1 April 2026 (born between 2 April 1998 and 1 April 2006)',
    qualification: 'Graduation in any discipline from a recognised university; final-year candidates may apply provisionally',
    selection: 'Preliminary Exam → Main Exam → Local Language Test',
    salary: 'Basic pay ₹26,730; approximate in-hand ~₹46,000/month',
    subjectAreas: ['Reasoning Ability', 'Numerical Ability', 'English Language'],
  },
  'ssc-cgl': {
    age: '18–32 years, post-dependent (as on 1 August 2026); OBC +3, SC/ST +5, PwBD up to +15 years',
    qualification: 'Graduation in any discipline; some posts require an additional specific qualification',
    selection: 'Tier I (screening, all posts) → Tier II (final merit)',
    salary: 'Pay Level 4 (₹25,500–₹81,100) up to Pay Level 7 (₹44,900–₹1,42,400), depending on the post',
    subjectAreas: ['General Intelligence & Reasoning', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension'],
  },
  'ssc-chsl-tier-i': {
    age: '18–27 years as on 1 August 2026',
    qualification: 'Class 12 pass by 7 October 2026; DEO/DEO Grade A posts require 12th with Mathematics',
    selection: 'Tier 1 → Tier 2 (includes Skill/Typing Test for specific posts) → Document Verification',
    salary: 'Post-dependent (LDC/JSA/DEO grades) — check the current notification for the exact pay level',
    subjectAreas: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Language'],
  },
  'ssc-cpo-si-delhi-police-capf': {
    age: 'SI (Executive) Delhi Police / SI (GD) CAPF: 20–25 years; SI (Fire) CAPF: 18–30 years (as on 1 August 2026)',
    qualification: "Bachelor's degree in any discipline (SI Exec/GD); Science degree with PCM or a 3-year engineering diploma for SI Fire; valid LMV licence for Delhi Police SI (male)",
    selection: 'Paper I → Physical Standard Test (PST) & Physical Endurance Test (PET) for shortlisted candidates → further stages per notification',
    salary: '₹35,400–₹1,12,400/month pay scale',
    subjectAreas: ['General Intelligence & Reasoning', 'General Knowledge & General Awareness', 'Quantitative Aptitude', 'English Comprehension'],
  },
  'ssc-gd-constable': {
    age: '18–23 years (General) as on 1 January 2026',
    qualification: 'Class 10 (Matriculation) pass from a recognised board',
    selection: 'Computer-Based Test (CBT) → Physical Efficiency Test (PET) → Physical Standard Test (PST) → Medical Examination → Document Verification',
    salary: 'Pay Level 3: ₹21,700–₹69,100/month plus DA, HRA, TA and other allowances',
    subjectAreas: ['General Intelligence & Reasoning', 'General Knowledge & General Awareness', 'Elementary Mathematics', 'English/Hindi'],
  },
  'ssc-mts': {
    age: 'MTS (Dept. of Revenue/CBN): 18–25 years; Havaldar (CBIC): 18–27 years',
    qualification: 'Class 10 (Matriculation) pass from a recognised board',
    selection: 'Computer-Based Examination, plus a Physical Efficiency Test for the Havaldar post only',
    salary: 'Pay Level 1 (7th CPC); in-hand approximately ₹18,000–₹22,000/month depending on posting city',
    subjectAreas: ['General Intelligence & Reasoning', 'Numerical Aptitude', 'General English', 'General Awareness'],
  },
  'ssc-selection-post': {
    age: '18–30 years typically, up to 35 for some posts — SSC sets a distinct bracket per post, so always check the specific vacancy',
    qualification: 'Varies by level: Matriculation, Higher Secondary, or Graduation & above, per the individual post',
    selection: 'Computer-Based Examination (CBE) → Document Verification, merit-based per post/level',
    salary: 'Ranges from Pay Level 1 to Level 7 depending on the specific post applied for',
    subjectAreas: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Language'],
  },
  'ssc-selection-post-higher-secondary-level': {
    age: '18–30 years typically for this level — confirm against the specific post in the active phase notification',
    qualification: 'Class 12 (Higher Secondary / 10+2) pass from a recognised board',
    selection: 'Computer-Based Examination (CBE) → Document Verification',
    salary: 'Pay Level 2–4 range, post-dependent',
    subjectAreas: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Language'],
  },
  'ssc-selection-post-matriculation-level': {
    age: '18–30 years typically for this level — confirm against the specific post in the active phase notification',
    qualification: 'Class 10 (Matriculation) pass from a recognised board',
    selection: 'Computer-Based Examination (CBE) → Document Verification',
    salary: 'Pay Level 1–2 range, post-dependent',
    subjectAreas: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Language'],
  },
  'ssc-stenographer-grade-c-d': {
    age: 'Grade C: 18–30 years; Grade D: 18–27 years',
    qualification: 'Class 12 pass from a recognised board',
    selection: 'Computer-Based Examination → mandatory qualifying Skill Test in stenography (100 wpm Grade C / 80 wpm Grade D dictation, 10 minutes)',
    salary: 'Grade C (Pay Level 6): approx. ₹50,000–₹60,000/month in-hand; Grade D (Pay Level 4): approx. ₹36,000–₹45,000/month in-hand',
    subjectAreas: ['General Intelligence & Reasoning', 'General Awareness', 'English Language & Comprehension'],
  },
  'up-police-constable': {
    age: 'Reported as roughly 18–25 (male) / 18–28 (female) with a one-time 3-year relaxation approved for the 2026 cycle — sources vary, confirm the exact band on upprpb.gov.in',
    qualification: 'Intermediate (Class 12) pass',
    selection: 'Written Exam → Physical Standard/Efficiency Tests → Document Verification',
    salary: 'Basic pay approximately ₹21,700/month, rising to about ₹69,100/month with increments and promotions',
    subjectAreas: ['General Knowledge & Current Affairs', 'General Hindi', 'Numerical & Mental Ability', 'Mental Aptitude/IQ & Reasoning'],
  },
  'upsc-prelims': {
    age: '21–32 years as on 1 August 2026 (General/EWS); OBC up to 35, SC/ST up to 37, PwBD up to 42',
    qualification: 'A degree from a recognised university (final-year candidates may sit the Preliminary exam)',
    selection: 'Preliminary Exam (qualifying, GS + CSAT) → Main Exam (written, merit) → Personality Test/Interview → Medical Standards',
    salary: 'Not applicable at the Prelims stage — pay scale depends on the final service allotted after Mains + Interview',
    subjectAreas: ['General Studies Paper I', 'CSAT (General Studies Paper II)'],
  },
  'haryana-police-constable': {
    age: '18–25 years, with a 3-year relaxation approved by the state government',
    qualification: 'Class 12 pass, including matric-level study of Hindi or Sanskrit',
    selection: 'Shortlisting via HSSC CET score → Physical Measurement Test (PMT, qualifying) → Physical Screening Test (PST, qualifying)',
    salary: '₹21,700–₹69,100/month (Pay Level 3)',
    subjectAreas: ['General Knowledge & Current Affairs', 'Reasoning', 'Numerical Ability', 'Hindi/Sanskrit Language'],
  },
};

export const EXAM_FACTS_SOURCED_DATE = 'September 2026';
