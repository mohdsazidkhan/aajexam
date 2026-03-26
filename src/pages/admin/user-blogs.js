import dynamic from 'next/dynamic'
import Head from 'next/head'

const AdminUserBlogs = dynamic(() => import('../../components/pages/admin/AdminUserBlogs'), { ssr: false })

export default function AdminUserBlogsPage() {
  return (
    <>
      <Head>
        <title>Admin User Blogs - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminUserBlogs />
    </>
  )
}

