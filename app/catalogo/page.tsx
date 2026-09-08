import { createClient } from '@/lib/supabase/server'
import CatalogClient from './CatalogClient'

// Revalidate every 5 minutes
export const revalidate = 300

export default async function CatalogoPage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('order_index')

  // Fetch all active books
  const { data: books } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      author,
      price,
      year,
      stock_type,
      stock_quantity,
      book_images (
        image_url,
        alt_text
      ),
      categories (
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <CatalogClient 
      initialBooks={books || []} 
      categories={categories || []} 
    />
  )
}
