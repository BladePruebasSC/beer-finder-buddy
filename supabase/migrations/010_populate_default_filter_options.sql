-- Poblar la tabla filter_options con los valores por defecto

-- Estilos
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('IPA', 'style', 'IPA', '🍺', true),
  ('Stout', 'style', 'Stout', '⚫', true),
  ('Lager', 'style', 'Lager', '✨', true),
  ('Amber Ale', 'style', 'Amber Ale', '🟠', true),
  ('Wheat Beer', 'style', 'Wheat Beer', '🌾', true),
  ('Session IPA', 'style', 'Session IPA', '🍃', true),
  ('Porter', 'style', 'Porter', '🟤', true),
  ('Hazy IPA', 'style', 'Hazy IPA', '☁️', true),
  ('Belgian Blonde', 'style', 'Belgian Blonde', '👑', true),
  ('Red Ale', 'style', 'Red Ale', '🔴', true),
  ('Pilsner', 'style', 'Pilsner', '🌟', true),
  ('Milk Stout', 'style', 'Milk Stout', '🥛', true)
ON CONFLICT (id) DO NOTHING;

-- Colores
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('Rubio', 'color', 'Rubio', '💛', true),
  ('Dorado', 'color', 'Dorado', '🟡', true),
  ('Ámbar', 'color', 'Ámbar', '🟠', true),
  ('Rojo cobrizo', 'color', 'Rojo', '🔴', true),
  ('Marrón oscuro', 'color', 'Marrón', '🟤', true),
  ('Negro', 'color', 'Negro', '⚫', true),
  ('Turbio', 'color', 'Turbio', '☁️', true)
ON CONFLICT (id) DO NOTHING;

-- Sabores
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('Cítrico', 'flavor', 'Cítrico', '🍋', true),
  ('Tropical', 'flavor', 'Tropical', '🥥', true),
  ('Amargo', 'flavor', 'Amargo', '🌿', true),
  ('Chocolate', 'flavor', 'Chocolate', '🍫', true),
  ('Café', 'flavor', 'Café', '☕', true),
  ('Caramelo', 'flavor', 'Caramelo', '🍯', true),
  ('Malta', 'flavor', 'Malta', '🌾', true),
  ('Frutal', 'flavor', 'Frutal', '🍓', true),
  ('Especiado', 'flavor', 'Especiado', '🌶️', true),
  ('Tostado', 'flavor', 'Tostado', '🔥', true),
  ('Suave', 'flavor', 'Suave', '💫', true),
  ('Refrescante', 'flavor', 'Refrescante', '❄️', true)
ON CONFLICT (id) DO NOTHING;

-- Intensidad (Strength)
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('light', 'strength', 'Ligera (< 5% ABV)', '🪶', true),
  ('medium', 'strength', 'Media (5-6.5% ABV)', '⚖️', true),
  ('strong', 'strength', 'Fuerte (> 6.5% ABV)', '💪', true)
ON CONFLICT (id) DO NOTHING;

-- Amargor (Bitterness)
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('low', 'bitterness', 'Bajo (< 30 IBU)', '😊', true),
  ('medium', 'bitterness', 'Medio (30-50 IBU)', '😐', true),
  ('high', 'bitterness', 'Alto (> 50 IBU)', '😤', true)
ON CONFLICT (id) DO NOTHING;

-- Orígenes
INSERT INTO filter_options (id, category, label, icon, is_default) VALUES
  ('República Dominicana', 'origin', 'República Dominicana', '🇩🇴', true),
  ('Estados Unidos', 'origin', 'Estados Unidos', '🇺🇸', true),
  ('México', 'origin', 'México', '🇲🇽', true),
  ('Alemania', 'origin', 'Alemania', '🇩🇪', true),
  ('Bélgica', 'origin', 'Bélgica', '🇧🇪', true),
  ('Reino Unido', 'origin', 'Reino Unido', '🇬🇧', true),
  ('República Checa', 'origin', 'República Checa', '🇨🇿', true),
  ('Irlanda', 'origin', 'Irlanda', '🇮🇪', true),
  ('Países Bajos', 'origin', 'Países Bajos', '🇳🇱', true),
  ('España', 'origin', 'España', '🇪🇸', true),
  ('Colombia', 'origin', 'Colombia', '🇨🇴', true),
  ('Brasil', 'origin', 'Brasil', '🇧🇷', true),
  ('Argentina', 'origin', 'Argentina', '🇦🇷', true),
  ('Chile', 'origin', 'Chile', '🇨🇱', true),
  ('Japón', 'origin', 'Japón', '🇯🇵', true)
ON CONFLICT (id) DO NOTHING;

