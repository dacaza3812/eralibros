import EditBookPageClient from './client'

export default async function EditBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  return <EditBookPageClient bookSlug={resolvedParams.slug} />
}
