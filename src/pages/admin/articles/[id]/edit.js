import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const AdminArticleForm = dynamic(() => import('../../../../components/pages/admin/AdminArticleForm'), { ssr: false })

export default function EditArticle() {
  const router = useRouter()
  const { id } = router.query

  if (!id) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Edit Article - Admin Panel - AajExam</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminArticleForm articleId={id} />
    </>
  )
}
