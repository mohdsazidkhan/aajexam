import { NextResponse } from 'next/server';

const facts = [
  "The UPSC Civil Services Exam is considered one of the toughest exams in the world, with a selection rate of less than 0.1%.",
  "SSC CGL receives over 30 lakh applications every year, making it one of India's most competitive exams.",
  "The Indian Constitution is the longest written constitution in the world with 448 articles.",
  "India's first competitive exam for civil services was conducted in 1855 in London.",
  "The RBI was established on April 1, 1935, based on the recommendations of the Hilton Young Commission.",
  "Article 32 of the Indian Constitution is called the 'Heart and Soul' of the Constitution by Dr. B.R. Ambedkar.",
  "The Planning Commission of India was replaced by NITI Aayog on January 1, 2015.",
  "India has the largest postal network in the world with over 1.5 lakh post offices.",
  "The Preamble of the Indian Constitution was inspired by the Constitution of the United States.",
  "The first Five Year Plan of India (1951-1956) was based on the Harrod-Domar model.",
  "The GST (Goods and Services Tax) was implemented in India on July 1, 2017, under the 101st Constitutional Amendment.",
  "The Indian Parliament consists of three parts: the President, the Rajya Sabha, and the Lok Sabha.",
  "Fundamental Rights in the Indian Constitution are borrowed from the Constitution of the United States.",
  "The concept of Directive Principles of State Policy was borrowed from the Irish Constitution.",
  "India's space program ISRO was founded in 1969, and its first satellite Aryabhata was launched in 1975.",
  "The National Education Policy 2020 replaced the 34-year-old National Policy on Education from 1986.",
  "Article 370, which granted special status to Jammu and Kashmir, was abrogated on August 5, 2019.",
  "The Right to Education Act (RTE) was enacted in 2009, making education a fundamental right for children aged 6-14.",
  "India became a republic on January 26, 1950, when the Constitution came into effect.",
  "The Supreme Court of India was established on January 28, 1950, replacing the Federal Court of India.",
  "The Comptroller and Auditor General (CAG) of India is described as the guardian of the public purse.",
  "The first general elections in India were held in 1951-52, making it the largest democratic exercise at that time.",
  "The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942.",
  "The Indian economy is the 5th largest in the world by nominal GDP.",
  "Practice tests and mock exams are proven to improve retention by up to 50% compared to passive reading.",
  "Spaced repetition is one of the most effective study techniques backed by cognitive science.",
  "The Pomodoro Technique — 25 minutes of focused study followed by a 5-minute break — can boost productivity.",
  "Active recall, where you test yourself without looking at notes, strengthens memory more than re-reading.",
  "Studies show that teaching others what you've learned helps you retain 90% of the material.",
  "Regular physical exercise improves cognitive function and memory retention for exam preparation."
];

export async function GET() {
  try {
    // Pick a fact based on the current date so it changes daily
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const factIndex = dayOfYear % facts.length;

    return NextResponse.json({
      success: true,
      data: {
        factOfDay: facts[factIndex],
        date: today.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Daily Dose API Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        factOfDay: "Learn something useful every day.",
        date: new Date().toISOString().split('T')[0]
      }
    });
  }
}
