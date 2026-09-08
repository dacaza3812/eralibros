-- ============================================
-- SEED DATA FOR TESTING
-- ============================================

-- Insert categories
INSERT INTO categories (id, name, slug, description, order_index, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Literatura Latinoamericana', 'literatura-latinoamericana', 'Obras de autores latinoamericanos', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Ciencia Ficción', 'ciencia-ficcion', 'Novelas de ciencia ficción y fantasía', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Ensayo', 'ensayo', 'Ensayos y no ficción', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Poesía', 'poesia', 'Poesía y verso', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Insert books
INSERT INTO books (id, title, slug, description, author, year, isbn, price, category_id, stock_type, stock_quantity, is_active)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Cien años de soledad',
    'cien-anos-de-soledad',
    'La obra maestra de García Márquez narra la historia de la familia Buendía a lo largo de siete generaciones en el mítico pueblo de Macondo.',
    'Gabriel García Márquez',
    1967,
    '978-0307474278',
    25000,
    '11111111-1111-1111-1111-111111111111',
    'impreso_listo',
    10,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Rayuela',
    'rayuela',
    'La novela innovadora de Cortázar donde el lector puede elegir su propio camino de lectura a través de los capítulos.',
    'Julio Cortázar',
    1963,
    '978-9505119109',
    28000,
    '11111111-1111-1111-1111-111111111111',
    'impreso_listo',
    5,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Ficciones',
    'ficciones',
    'Colección de cuentos que exploran temas metafísicos y laberintos literarios, incluyendo el famoso "El jardín de senderos que se bifurcan".',
    'Jorge Luis Borges',
    1944,
    '978-0802130308',
    22000,
    '11111111-1111-1111-1111-111111111111',
    'impreso_listo',
    8,
    true
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Pedro Páramo',
    'pedro-paramo',
    'Novela en la que Juan Rulfo narra una búsqueda fantasmal en Comala, un pueblo habitado por ánimas.',
    'Juan Rulfo',
    1955,
    '978-8420651865',
    20000,
    '11111111-1111-1111-1111-111111111111',
    'bajo_demanda_48h',
    0,
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Dune',
    'dune',
    'La obra cumbre de la ciencia ficción que narra la lucha por el control del desierto planeta Arrakis y su preciosa especia.',
    'Frank Herbert',
    1965,
    '978-0441172719',
    35000,
    '22222222-2222-2222-2222-222222222222',
    'impreso_listo',
    7,
    true
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Fundación',
    'fundacion',
    'El inicio de la saga que narra el colapso de un imperio galáctico y la fundación de una colonia científica para preservar el conocimiento.',
    'Isaac Asimov',
    1951,
    '978-0553293357',
    24000,
    '22222222-2222-2222-2222-222222222222',
    'impreso_listo',
    12,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'El Aleph',
    'el-aleph',
    'Colección de cuentos que incluye obras maestras como "El Aleph", "La casa de Asterión" y "Emma Zunz".',
    'Jorge Luis Borges',
    1949,
    '978-8420651421',
    21000,
    '11111111-1111-1111-1111-111111111111',
    'bajo_demanda_48h',
    0,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Una educación cristiana',
    'una-educacion-cristiana',
    'Ensayos sobre literatura, cultura y educación en América Latina.',
    'Alfonso Reyes',
    1940,
    '978-9681678345',
    18000,
    '33333333-3333-3333-3333-333333333333',
    'impreso_listo',
    4,
    true
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '20 poemas de amor y una canción desesperada',
    '20-poemas-de-amor',
    'El libro más célebre de poesía amorosa de Pablo Neruda.',
    'Pablo Neruda',
    1924,
    '978-8420601425',
    16000,
    '44444444-4444-4444-4444-444444444444',
    'impreso_listo',
    15,
    true
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Ciudad de las bestias',
    'ciudad-de-las-bestias',
    'Novela de aventuras en la selva amazónica protagonista por Alexander Cold y su abuela.',
    'Isabel Allende',
    2002,
    '978-0060557474',
    26000,
    '11111111-1111-1111-1111-111111111111',
    'bajo_demanda_48h',
    0,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert placeholder images for books (using placeholder.com as image URLs)
-- Note: In production, these would be real Supabase Storage URLs
INSERT INTO book_images (id, book_id, image_url, image_path, order_index, alt_text)
VALUES 
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Cien+a%C3%B1os+de+soledad', '/placeholder/cien-anos.jpg', 0, 'Portada Cien años de soledad'),
  ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Rayuela', '/placeholder/rayuela.jpg', 0, 'Portada Rayuela'),
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Ficciones', '/placeholder/ficciones.jpg', 0, 'Portada Ficciones'),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Pedro+P%C3%A1ramo', '/placeholder/pedro-paramo.jpg', 0, 'Portada Pedro Páramo'),
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Dune', '/placeholder/dune.jpg', 0, 'Portada Dune'),
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Fundaci%C3%B3n', '/placeholder/fundacion.jpg', 0, 'Portada Fundación'),
  ('51515151-5151-5151-5151-515151515151', '55555555-5555-5555-5555-555555555555', 'https://placehold.co/300x400/2c2c2c/ffffff?text=El+Aleph', '/placeholder/el-aleph.jpg', 0, 'Portada El Aleph'),
  ('61616161-6161-6161-6161-616161616161', '66666666-6666-6666-6666-666666666666', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Una+educaci%C3%B3n+cristiana', '/placeholder/educacion-cristiana.jpg', 0, 'Portada Una educación cristiana'),
  ('71717171-7171-7171-7171-717171717171', '77777777-7777-7777-7777-777777777777', 'https://placehold.co/300x400/2c2c2c/ffffff?text=20+poemas+de+amor', '/placeholder/20-poemas.jpg', 0, 'Portada 20 poemas de amor'),
  ('81818181-8181-8181-8181-818181818181', '88888888-8888-8888-8888-888888888888', 'https://placehold.co/300x400/2c2c2c/ffffff?text=Ciudad+de+las+bestias', '/placeholder/ciudad-bestias.jpg', 0, 'Portada Ciudad de las bestias')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DONE! Now you have:
-- - 4 categories
-- - 10 books with different stock types
-- - 10 placeholder images
-- ============================================
