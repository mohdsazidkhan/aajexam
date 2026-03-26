import dynamic from 'next/dynamic'
import Head from 'next/head'

const AdminArticles = dynamic(() => import('../../components/pages/admin/AdminArticles'), { ssr: false })

export default function AdminArticlesPage() {
  return (
    <>
      <Head>
        <title>Admin Articles - SUBG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminArticles />
    </>
  )
}
