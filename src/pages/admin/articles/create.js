import dynamic from 'next/dynamic'
import Head from 'next/head'

const AdminArticleForm = dynamic(() => import('../../../components/pages/admin/AdminArticleForm'), { ssr: false })

export default function CreateArticle() {
  return (
    <>
      <Head>
        <title>Create Article - Admin Panel - SUBG QUIZ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminArticleForm />
    </>
  )
}
