-- ============================================
-- ERALIBROS DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  author VARCHAR(255),
  year INTEGER,
  isbn VARCHAR(20),
  price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_type VARCHAR(50) DEFAULT 'impreso_listo' CHECK (stock_type IN ('impreso_listo', 'bajo_demanda_48h')),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book images table
CREATE TABLE IF NOT EXISTS book_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  alt_text VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp requests tracking
CREATE TABLE IF NOT EXISTS whatsapp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  book_title VARCHAR(255),
  message_sent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (global configuration)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
CREATE INDEX IF NOT EXISTS idx_books_is_active ON books(is_active);
CREATE INDEX IF NOT EXISTS idx_books_views_count ON books(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order_index ON categories(order_index);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_book_images_book_id ON book_images(book_id);
CREATE INDEX IF NOT EXISTS idx_book_images_order_index ON book_images(order_index);

CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_book_id ON whatsapp_requests(book_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_clicked_at ON whatsapp_requests(clicked_at DESC);

-- ============================================
-- INITIAL DATA (SETTINGS)
-- ============================================

INSERT INTO settings (key, value, description)
VALUES 
  ('whatsapp_number', '58864240', 'Número de WhatsApp sin + ni espacios'),
  ('whatsapp_message_template', 'Hola, me interesa el libro: {titulo}. ¿Está disponible?', 'Plantilla de mensaje. Usar {titulo} como placeholder'),
  ('site_name', 'Eralibros', 'Nombre del sitio'),
  ('site_description', 'Catálogo de libros impresos y bajo demanda', 'Descripción del sitio')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_requests ENABLE ROW LEVEL SECURITY;

-- PUBLIC POLICIES (Read-only for active items)

-- Public can view active categories
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Public can view active books
CREATE POLICY "Public can view active books" ON books
  FOR SELECT USING (is_active = true);

-- Public can view images of active books
CREATE POLICY "Public can view images of active books" ON book_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_images.book_id 
      AND books.is_active = true
    )
  );

-- Public can create WhatsApp requests (tracking)
CREATE POLICY "Public can insert WhatsApp requests" ON whatsapp_requests
  FOR INSERT WITH CHECK (true);

-- Public can view public settings (WhatsApp number and template)
CREATE POLICY "Public can view public settings" ON settings
  FOR SELECT USING (key IN ('whatsapp_number', 'whatsapp_message_template'));

-- ============================================
-- ADMIN POLICIES (TODO: Configure after auth setup)
-- ============================================

-- NOTE: For now, admin policies are NOT created here.
-- They will be added separately using Supabase Auth roles
-- or by creating a profiles table with role field.

-- For initial setup, you can temporarily disable RLS for admin operations:
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- Or create admin policies after creating the admin user.

-- ============================================
-- TRIGGERS (Optional: Auto-update timestamps)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for categories
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for books
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE categories IS 'Categorías de libros. Un libro pertenece a una categoría.';
COMMENT ON TABLE books IS 'Libros del catálogo con todos sus campos: título, descripción, imágenes, stock.';
COMMENT ON TABLE book_images IS 'Galería de imágenes de cada libro. Múltiples imágenes por libro con orden.';
COMMENT ON TABLE whatsapp_requests IS 'Tracking de clicks en botón WhatsApp de cada libro.';
COMMENT ON TABLE settings IS 'Configuraciones globales del sistema: WhatsApp number, mensaje template, etc.';

COMMENT ON COLUMN books.stock_type IS 'impreso_listo: disponible inmediatamente. bajo_demanda_48h: listo en 48 horas.';
COMMENT ON COLUMN books.views_count IS 'Contador de visualizaciones del libro (para popularidad).';
COMMENT ON COLUMN book_images.order_index IS 'Orden de aparición de la imagen (0 = principal).';

-- ============================================
-- DONE! 
-- ============================================
-- Next steps:
-- 1. Create Storage bucket "books-images" and make it public
-- 2. Create admin user in Authentication
-- 3. Configure admin policies (RLS for admin)
-- 4. Test basic CRUD operations
