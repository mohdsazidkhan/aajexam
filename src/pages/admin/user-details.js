// The old "User Details" list is merged into /admin/students (one place to view, edit and manage every student).
export default function UserDetailsRedirect() {
  return null;
}

export async function getServerSideProps() {
  return { redirect: { destination: '/admin/students', permanent: false } };
}
