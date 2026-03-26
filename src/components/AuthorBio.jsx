import Link from 'next/link';

const AuthorBio = () => {
    return (
        <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-primary-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                About the Author
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Content reviewed and curated by <strong>Mohd Sazid Khan</strong>,
                founder of AajExam and educational technology expert with extensive
                experience in government exam preparation systems and online learning platforms.
            </p>
            <Link
                href="/about-founder"
                className="text-secondary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
            >
                Learn more about our team →
            </Link>
        </div>
    );
};

export default AuthorBio;
