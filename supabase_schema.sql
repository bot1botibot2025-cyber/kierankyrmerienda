-- ============================================================
-- KIERAN & KYR'S MERIENDA - SUPABASE DATABASE SCHEMA & SEED
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  emoji TEXT,
  badge TEXT,
  description TEXT,
  recipe JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock_threshold NUMERIC NOT NULL DEFAULT 0,
  target_stock NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  package_unit TEXT,
  package_cost NUMERIC DEFAULT 0,
  supplier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  cash_received NUMERIC,
  change_given NUMERIC,
  ref_number TEXT,
  status TEXT NOT NULL DEFAULT 'Completed',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow Anonymous & Authenticated access for store operations
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow anon public read/write for all POS tables
DROP POLICY IF EXISTS "Public access for products" ON products;
CREATE POLICY "Public access for products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for ingredients" ON ingredients;
CREATE POLICY "Public access for ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for orders" ON orders;
CREATE POLICY "Public access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for expenses" ON expenses;
CREATE POLICY "Public access for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for store_settings" ON store_settings;
CREATE POLICY "Public access for store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA: STORE SETTINGS
-- ============================================================

INSERT INTO store_settings (key, value) VALUES 
('storeName', '"Kieran & Kyr''s Merienda"'::jsonb),
('tagline', '"Good Food • Good Mood • Always a Merienda Time!"'::jsonb),
('storeAddress', '"Grotto, Zone 1, Capili Compound, City of San Jose del Monte, Bulacan"'::jsonb),
('contactNumber', '"0917-123-4567"'::jsonb),
('openingCashFloat', '1000.00'::jsonb),
('currencySymbol', '"₱"'::jsonb),
('receiptFooterMessage', '"Small Bites, Big Happiness! Salamat po sa pagtangkilik! ❤️"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- SEED DATA: OFFICIAL MENU PRODUCTS (From Menu Flyers)
-- ============================================================

INSERT INTO products (id, name, category, price, emoji, badge, description, recipe) VALUES
-- Burgers
('menu_b1t1_burger_regular', 'Buy 1 Take 1 Burger Regular', 'Burgers', 34.00, '🍔', 'Buy 1 Take 1', 'Two classic regular burgers with grilled beef patties and special dressing.', '[{"ingredientId": "ing_burger_bun", "amount": 2}, {"ingredientId": "ing_beef_patty", "amount": 2}, {"ingredientId": "ing_burger_sauce", "amount": 30}, {"ingredientId": "ing_burger_wrapper", "amount": 2}]'::jsonb),
('menu_burger_solo_regular', 'Burger Solo Regular', 'Burgers', 18.00, '🍔', 'Solo Suki', 'Single classic regular burger with beef patty and savory dressing.', '[{"ingredientId": "ing_burger_bun", "amount": 1}, {"ingredientId": "ing_beef_patty", "amount": 1}, {"ingredientId": "ing_burger_sauce", "amount": 15}, {"ingredientId": "ing_burger_wrapper", "amount": 1}]'::jsonb),
('menu_b1t1_cheeseburger', 'Buy 1 Take 1 Cheese Burger', 'Burgers', 44.00, '🍔', 'Buy 1 Take 1', 'Two delicious cheeseburgers topped with melted cheddar cheese slices.', '[{"ingredientId": "ing_burger_bun", "amount": 2}, {"ingredientId": "ing_beef_patty", "amount": 2}, {"ingredientId": "ing_cheese_slice", "amount": 2}, {"ingredientId": "ing_burger_sauce", "amount": 30}, {"ingredientId": "ing_burger_wrapper", "amount": 2}]'::jsonb),
('menu_cheesy_burger_solo', 'Cheesy Burger Solo', 'Burgers', 23.00, '🍔', 'Best Seller', 'Single cheeseburger with golden melted cheddar cheese and dressing.', '[{"ingredientId": "ing_burger_bun", "amount": 1}, {"ingredientId": "ing_beef_patty", "amount": 1}, {"ingredientId": "ing_cheese_slice", "amount": 1}, {"ingredientId": "ing_burger_sauce", "amount": 15}, {"ingredientId": "ing_burger_wrapper", "amount": 1}]'::jsonb),
('menu_burger_overload_solo', 'Burger Overload Solo', 'Burgers', 28.00, '🍔', 'Overload', 'Toasted sesame bun loaded with beef patty, melted cheese, and extra toppings.', '[{"ingredientId": "ing_burger_bun", "amount": 1}, {"ingredientId": "ing_beef_patty", "amount": 1}, {"ingredientId": "ing_cheese_slice", "amount": 1}, {"ingredientId": "ing_cheese_sauce", "amount": 15}, {"ingredientId": "ing_burger_sauce", "amount": 15}, {"ingredientId": "ing_burger_wrapper", "amount": 1}]'::jsonb),

-- Hotdogs
('menu_hotdog_sandwich_regular', 'Hotdog Sandwich Regular', 'Hotdogs', 20.00, '🌭', 'Solo', 'Juicy red hotdog in warm bun drizzled with sweet ketchup and mayo.', '[{"ingredientId": "ing_hotdog_bun", "amount": 1}, {"ingredientId": "ing_reg_hotdog", "amount": 1}, {"ingredientId": "ing_ketchup", "amount": 15}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_b1t1_hotdog_regular', 'Buy 1 Take 1 Hotdog Sandwich Regular', 'Hotdogs', 38.00, '🌭', 'Buy 1 Take 1', 'Two regular hotdog sandwiches with condiments.', '[{"ingredientId": "ing_hotdog_bun", "amount": 2}, {"ingredientId": "ing_reg_hotdog", "amount": 2}, {"ingredientId": "ing_ketchup", "amount": 30}, {"ingredientId": "ing_hotdog_tray", "amount": 2}]'::jsonb),
('menu_hotdog_sandwich_overload', 'Hotdog Sandwich Overload', 'Hotdogs', 28.00, '🌭', 'Overload', 'Hotdog sandwich loaded with shredded cheddar cheese, warm cheese sauce & ketchup.', '[{"ingredientId": "ing_hotdog_bun", "amount": 1}, {"ingredientId": "ing_reg_hotdog", "amount": 1}, {"ingredientId": "ing_cheese_grated", "amount": 20}, {"ingredientId": "ing_cheese_sauce", "amount": 15}, {"ingredientId": "ing_ketchup", "amount": 10}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_hotdog_sandwich_jumbo', 'Hotdog Sandwich Jumbo', 'Hotdogs', 25.00, '🌭', 'Jumbo', 'Thick jumbo hotdog in soft bun with signature sauces.', '[{"ingredientId": "ing_hotdog_bun", "amount": 1}, {"ingredientId": "ing_jumbo_hotdog", "amount": 1}, {"ingredientId": "ing_ketchup", "amount": 15}, {"ingredientId": "ing_cheese_sauce", "amount": 10}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_b1t1_hotdog_jumbo', 'Buy 1 Take 1 Hotdog Jumbo', 'Hotdogs', 48.00, '🌭', 'Buy 1 Take 1', 'Two jumbo hotdog sandwiches with generous sauce drizzle.', '[{"ingredientId": "ing_hotdog_bun", "amount": 2}, {"ingredientId": "ing_jumbo_hotdog", "amount": 2}, {"ingredientId": "ing_ketchup", "amount": 30}, {"ingredientId": "ing_cheese_sauce", "amount": 20}, {"ingredientId": "ing_hotdog_tray", "amount": 2}]'::jsonb),

-- Waffles & Merienda Treats
('menu_pancake_waffle', 'Pancake Waffle', 'Waffles & Treats', 15.00, '🧇', 'Sweet Merienda', 'Golden warm waffle topped with butter cube and sweet pancake syrup.', '[{"ingredientId": "ing_waffle_batter_mix", "amount": 80}, {"ingredientId": "ing_butter_cube", "amount": 1}, {"ingredientId": "ing_pancake_syrup", "amount": 20}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_hotdog_waffle', 'Hotdog Waffle', 'Waffles & Treats', 10.00, '🍢', 'Only ₱10', 'Crispy waffle on a stick wrapped around juicy hotdog with ketchup drizzle.', '[{"ingredientId": "ing_reg_hotdog", "amount": 1}, {"ingredientId": "ing_waffle_batter_mix", "amount": 50}, {"ingredientId": "ing_bamboo_skewer", "amount": 1}, {"ingredientId": "ing_ketchup", "amount": 10}]'::jsonb),
('menu_messy_donut', 'Messy Donut (Choco / Strawberry)', 'Waffles & Treats', 7.00, '🍩', '₱7 Suki Treat', 'Soft donut drizzled with chocolate or strawberry glaze and rainbow sprinkles.', '[{"ingredientId": "ing_donut_ring", "amount": 1}, {"ingredientId": "ing_donut_chocolate_syrup", "amount": 12}, {"ingredientId": "ing_rainbow_sprinkles", "amount": 5}, {"ingredientId": "ing_burger_wrapper", "amount": 1}]'::jsonb),

-- French Fries
('menu_fries_small', 'French Fries - Small', 'French Fries', 15.00, '🍟', 'Small ₱15', 'Crispy fried shoestring potato fries coated in savory cheese powder.', '[{"ingredientId": "ing_fries_potato", "amount": 70}, {"ingredientId": "ing_fries_cheese_powder", "amount": 8}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_fries_medium', 'French Fries - Medium', 'French Fries', 20.00, '🍟', 'Medium ₱20', 'Medium serving of freshly fried cheese flavored potato fries.', '[{"ingredientId": "ing_fries_potato", "amount": 100}, {"ingredientId": "ing_fries_cheese_powder", "amount": 12}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),
('menu_fries_large', 'French Fries - Large', 'French Fries', 25.00, '🍟', 'Large ₱25', 'Large serving of crispy golden potato fries loaded with cheese flavor.', '[{"ingredientId": "ing_fries_potato", "amount": 140}, {"ingredientId": "ing_fries_cheese_powder", "amount": 16}, {"ingredientId": "ing_hotdog_tray", "amount": 1}]'::jsonb),

-- Fruit Soda w/ White & Orange Jelly
('menu_fruit_soda_8oz', 'Fruit Soda 8oz (White & Orange Jelly)', 'Fruit Soda', 15.00, '🥤', '8oz ₱15', 'Refreshing fizzy fruit soda (Blueberry / Green Apple / Lemon / Strawberry) with chewy jellies.', '[{"ingredientId": "ing_cup_8oz", "amount": 1}, {"ingredientId": "ing_straws", "amount": 1}, {"ingredientId": "ing_syrup_blueberry", "amount": 25}, {"ingredientId": "ing_soda_water", "amount": 120}, {"ingredientId": "ing_jelly_white_orange", "amount": 30}]'::jsonb),
('menu_fruit_soda_12oz', 'Fruit Soda 12oz (White & Orange Jelly)', 'Fruit Soda', 25.00, '🥤', '12oz ₱25', 'Fruity refreshing soda with white & orange jelly cubes (Choice of fruit flavors).', '[{"ingredientId": "ing_cup_12oz", "amount": 1}, {"ingredientId": "ing_straws", "amount": 1}, {"ingredientId": "ing_syrup_blueberry", "amount": 35}, {"ingredientId": "ing_soda_water", "amount": 180}, {"ingredientId": "ing_jelly_white_orange", "amount": 45}]'::jsonb),
('menu_fruit_soda_16oz', 'Fruit Soda 16oz (White & Orange Jelly)', 'Fruit Soda', 35.00, '🥤', '16oz ₱35', 'Large 16oz fruit soda packed with chilled soda, fruit syrup, and double chewy jelly sinkers.', '[{"ingredientId": "ing_cup_16oz", "amount": 1}, {"ingredientId": "ing_straws", "amount": 1}, {"ingredientId": "ing_syrup_blueberry", "amount": 50}, {"ingredientId": "ing_soda_water", "amount": 240}, {"ingredientId": "ing_jelly_white_orange", "amount": 60}]'::jsonb),

-- Coffee Jelly
('menu_coffee_jelly_small', 'Coffee Jelly - Small (S)', 'Coffee Jelly', 5.00, '🧋', 'Only ₱5!', 'Creamy, chewy, simply delicious coffee jelly in sweet milk cream blend.', '[{"ingredientId": "ing_cup_jelly_small", "amount": 1}, {"ingredientId": "ing_straws", "amount": 1}, {"ingredientId": "ing_coffee_jelly_cubes", "amount": 45}, {"ingredientId": "ing_coffee_jelly_cream", "amount": 35}]'::jsonb),
('menu_coffee_jelly_large', 'Coffee Jelly - Large (L)', 'Coffee Jelly', 10.00, '🧋', 'Only ₱10!', 'Large cup loaded with chewy coffee jelly cubes in rich sweet cream.', '[{"ingredientId": "ing_cup_jelly_large", "amount": 1}, {"ingredientId": "ing_straws", "amount": 1}, {"ingredientId": "ing_coffee_jelly_cubes", "amount": 90}, {"ingredientId": "ing_coffee_jelly_cream", "amount": 70}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  emoji = EXCLUDED.emoji,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  recipe = EXCLUDED.recipe;

-- ============================================================
-- SEED DATA: RAW INGREDIENTS
-- ============================================================

INSERT INTO ingredients (id, name, category, unit, current_stock, min_stock_threshold, target_stock, unit_cost, package_unit, package_cost, supplier) VALUES
('ing_burger_bun', 'Burger Buns (Toasted Sesame)', 'Breads & Buns', 'pcs', 60, 20, 100, 4.50, 'Pack of 12 pcs', 54.00, 'Local Bakery / Market'),
('ing_hotdog_bun', 'Hotdog Buns (Soft Roll)', 'Breads & Buns', 'pcs', 40, 15, 80, 4.00, 'Pack of 10 pcs', 40.00, 'Local Bakery / Market'),
('ing_donut_ring', 'Fluffy Donut Rings (Plain)', 'Breads & Buns', 'pcs', 30, 15, 50, 2.50, 'Tray of 24 pcs', 60.00, 'Bakery Partner'),
('ing_beef_patty', 'Seasoned Beef Patty (Standard)', 'Meats & Proteins', 'pcs', 55, 25, 100, 7.00, 'Pack of 10 pcs', 70.00, 'Meat Dealer / Puregold'),
('ing_reg_hotdog', 'Classic Red Hotdog (Standard)', 'Meats & Proteins', 'pcs', 18, 30, 80, 7.50, 'Pack of 20 pcs', 150.00, 'CDO / Purefoods'),
('ing_jumbo_hotdog', 'Jumbo Cheese Hotdog (Thick)', 'Meats & Proteins', 'pcs', 25, 15, 50, 11.50, 'Pack of 10 pcs', 115.00, 'Purefoods / Dealer'),
('ing_cheese_slice', 'Cheddar Cheese Slices', 'Meats & Proteins', 'pcs', 45, 20, 80, 4.00, 'Pack of 24 slices', 96.00, 'Magnolia / Eden'),
('ing_cheese_grated', 'Grated Cheddar Cheese (Shredded)', 'Meats & Proteins', 'grams', 400, 250, 1000, 0.16, 'Block of 500g', 80.00, 'Dairy Supplier'),
('ing_fries_potato', 'Shoestring French Fries (Frozen)', 'Meats & Proteins', 'grams', 1500, 1000, 4000, 0.13, 'Bag of 1kg (1000g)', 130.00, 'Aviko / Puregold'),
('ing_waffle_batter_mix', 'Pancake & Waffle Mix Batter', 'Batter & Sweets', 'grams', 2200, 1000, 5000, 0.08, 'Bag of 1kg (1000g)', 80.00, 'BakeBest / Market'),
('ing_butter_cube', 'Salted Butter Portions (Cubes)', 'Batter & Sweets', 'pcs', 35, 15, 60, 2.00, 'Pack of 20 cubes', 40.00, 'Anchor / Dari Creme'),
('ing_pancake_syrup', 'Sweet Maple Pancake Syrup', 'Batter & Sweets', 'ml', 800, 400, 1500, 0.09, 'Bottle of 750ml', 68.00, 'Supermarket'),
('ing_donut_chocolate_syrup', 'Rich Chocolate Glaze Syrup', 'Batter & Sweets', 'ml', 600, 300, 1200, 0.10, 'Bottle of 500ml', 50.00, 'Bakery Supply'),
('ing_donut_strawberry_syrup', 'Sweet Strawberry Glaze Syrup', 'Batter & Sweets', 'ml', 500, 300, 1200, 0.10, 'Bottle of 500ml', 50.00, 'Bakery Supply'),
('ing_rainbow_sprinkles', 'Colorful Rainbow Sprinkles', 'Batter & Sweets', 'grams', 450, 200, 1000, 0.12, 'Jar of 250g', 30.00, 'Bakery Supply'),
('ing_syrup_blueberry', 'Fruit Soda Syrup - Blueberry', 'Beverages & Drinks', 'ml', 900, 400, 2000, 0.12, 'Bottle of 750ml', 90.00, 'Beverage Supply'),
('ing_syrup_green_apple', 'Fruit Soda Syrup - Green Apple', 'Beverages & Drinks', 'ml', 1100, 400, 2000, 0.12, 'Bottle of 750ml', 90.00, 'Beverage Supply'),
('ing_syrup_lemon', 'Fruit Soda Syrup - Lemon', 'Beverages & Drinks', 'ml', 850, 400, 2000, 0.12, 'Bottle of 750ml', 90.00, 'Beverage Supply'),
('ing_syrup_strawberry', 'Fruit Soda Syrup - Strawberry', 'Beverages & Drinks', 'ml', 950, 400, 2000, 0.12, 'Bottle of 750ml', 90.00, 'Beverage Supply'),
('ing_soda_water', 'Chilled Soda Water / Sprite Base', 'Beverages & Drinks', 'ml', 5000, 2000, 10000, 0.035, 'Bottle of 1.5L', 52.50, 'Beverage Dealer'),
('ing_jelly_white_orange', 'Chewy White & Orange Jelly Sinkers', 'Beverages & Drinks', 'grams', 1400, 600, 3000, 0.07, 'Tub of 1kg', 70.00, 'In-house Prep / Sinker Supply'),
('ing_coffee_jelly_cubes', 'Fresh Coffee Jelly Cubes (Creamy & Chewy)', 'Beverages & Drinks', 'grams', 1800, 800, 4000, 0.05, 'Batch of 1000g', 50.00, 'In-house Kitchen Prep'),
('ing_coffee_jelly_cream', 'Sweetened Cream & Condensed Milk Base', 'Beverages & Drinks', 'ml', 2200, 1000, 5000, 0.08, 'Batch of 1000ml', 80.00, 'Nestle Cream + Condensed Milk'),
('ing_burger_sauce', 'Special Burger Dressing (Thousand Island)', 'Sauces & Condiments', 'ml', 1100, 400, 2000, 0.09, 'Pouch of 1000ml', 90.00, 'Lady''s Choice / Best Foods'),
('ing_ketchup', 'Sweet Banana / Tomato Ketchup', 'Sauces & Condiments', 'ml', 1600, 500, 3000, 0.06, 'Gallon of 2000ml', 120.00, 'UFC / Papa Ketchup'),
('ing_cheese_sauce', 'Creamy Melted Cheese Sauce', 'Sauces & Condiments', 'ml', 600, 400, 1500, 0.12, 'Pouch of 1000ml', 120.00, 'Cheez Whiz / Supply'),
('ing_fries_cheese_powder', 'Cheese Flavoring Powder (Fries)', 'Sauces & Condiments', 'grams', 500, 250, 1000, 0.18, 'Bag of 500g', 90.00, 'Flavor Supply'),
('ing_cup_8oz', '8oz Clear Cups & Lids', 'Packaging & Disposables', 'pcs', 50, 25, 100, 1.50, 'Sleeve of 50 pcs', 75.00, 'Packaging Distributor'),
('ing_cup_12oz', '12oz Clear Cups & Dome Lids', 'Packaging & Disposables', 'pcs', 45, 25, 100, 2.00, 'Sleeve of 50 pcs', 100.00, 'Packaging Distributor'),
('ing_cup_16oz', '16oz Clear Cups & Dome Lids', 'Packaging & Disposables', 'pcs', 40, 20, 100, 2.40, 'Sleeve of 50 pcs', 120.00, 'Packaging Distributor'),
('ing_cup_jelly_small', 'Small Coffee Jelly Cups (₱5 Size)', 'Packaging & Disposables', 'pcs', 80, 40, 150, 0.70, 'Pack of 100 pcs', 70.00, 'Packaging Distributor'),
('ing_cup_jelly_large', 'Large Coffee Jelly Cups (₱10 Size)', 'Packaging & Disposables', 'pcs', 75, 35, 150, 1.10, 'Pack of 100 pcs', 110.00, 'Packaging Distributor'),
('ing_burger_wrapper', 'Greaseproof Burger Wrappers', 'Packaging & Disposables', 'pcs', 120, 50, 250, 0.35, 'Pack of 100 pcs', 35.00, 'Market General Store'),
('ing_hotdog_tray', 'Hotdog Paper Boats / Snack Trays', 'Packaging & Disposables', 'pcs', 22, 40, 120, 0.80, 'Pack of 50 pcs', 40.00, 'Market General Store'),
('ing_bamboo_skewer', 'Bamboo Skewers (Waffle & Hotdog)', 'Packaging & Disposables', 'pcs', 90, 30, 200, 0.15, 'Pack of 100 pcs', 15.00, 'Market General Store'),
('ing_straws', 'Boba Straws & Mini Spoons', 'Packaging & Disposables', 'pcs', 110, 50, 200, 0.40, 'Pack of 100 pcs', 40.00, 'Packaging Distributor')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  current_stock = EXCLUDED.current_stock,
  min_stock_threshold = EXCLUDED.min_stock_threshold,
  target_stock = EXCLUDED.target_stock,
  unit_cost = EXCLUDED.unit_cost,
  package_unit = EXCLUDED.package_unit,
  package_cost = EXCLUDED.package_cost,
  supplier = EXCLUDED.supplier;
