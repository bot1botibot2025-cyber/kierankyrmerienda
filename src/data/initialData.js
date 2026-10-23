// Initial Data for Kieran & Kyr's Merienda
// Sourced directly from Official Store Menu (Grotto, Zone 1, Capili Compound, CSJDM Bulacan)

export const INITIAL_STORE_SETTINGS = {
  storeName: "Kieran & Kyr's Merienda",
  tagline: "Good Food • Good Mood • Always a Merienda Time!",
  storeAddress: "Grotto, Zone 1, Capili Compound, City of San Jose del Monte, Bulacan",
  contactNumber: "0917-123-4567",
  openingCashFloat: 1000.00, // ₱1,000 petty cash float for change
  currencySymbol: "₱",
  receiptFooterMessage: "Small Bites, Big Happiness! Salamat po sa pagtangkilik! ❤️"
};

export const INITIAL_INGREDIENTS = [
  // --- BREADS & BUNS ---
  {
    id: "ing_burger_bun",
    name: "Burger Buns (Toasted Sesame)",
    category: "Breads & Buns",
    unit: "pcs",
    currentStock: 60,
    minStockThreshold: 20,
    targetStock: 100,
    unitCost: 4.50,
    packageUnit: "Pack of 12 pcs",
    packageCost: 54.00,
    supplier: "Local Bakery / Market"
  },
  {
    id: "ing_hotdog_bun",
    name: "Hotdog Buns (Soft Roll)",
    category: "Breads & Buns",
    unit: "pcs",
    currentStock: 40,
    minStockThreshold: 15,
    targetStock: 80,
    unitCost: 4.00,
    packageUnit: "Pack of 10 pcs",
    packageCost: 40.00,
    supplier: "Local Bakery / Market"
  },
  {
    id: "ing_donut_ring",
    name: "Fluffy Donut Rings (Plain)",
    category: "Breads & Buns",
    unit: "pcs",
    currentStock: 30,
    minStockThreshold: 15,
    targetStock: 50,
    unitCost: 2.50,
    packageUnit: "Tray of 24 pcs",
    packageCost: 60.00,
    supplier: "Bakery Partner"
  },

  // --- MEATS & PROTEINS ---
  {
    id: "ing_beef_patty",
    name: "Seasoned Beef Patty (Standard)",
    category: "Meats & Proteins",
    unit: "pcs",
    currentStock: 55,
    minStockThreshold: 25,
    targetStock: 100,
    unitCost: 7.00,
    packageUnit: "Pack of 10 pcs",
    packageCost: 70.00,
    supplier: "Meat Dealer / Puregold"
  },
  {
    id: "ing_reg_hotdog",
    name: "Classic Red Hotdog (Standard)",
    category: "Meats & Proteins",
    unit: "pcs",
    currentStock: 18, // Low Stock trigger for testing!
    minStockThreshold: 30,
    targetStock: 80,
    unitCost: 7.50,
    packageUnit: "Pack of 20 pcs",
    packageCost: 150.00,
    supplier: "CDO / Purefoods"
  },
  {
    id: "ing_jumbo_hotdog",
    name: "Jumbo Cheese Hotdog (Thick)",
    category: "Meats & Proteins",
    unit: "pcs",
    currentStock: 25,
    minStockThreshold: 15,
    targetStock: 50,
    unitCost: 11.50,
    packageUnit: "Pack of 10 pcs",
    packageCost: 115.00,
    supplier: "Purefoods / Dealer"
  },
  {
    id: "ing_cheese_slice",
    name: "Cheddar Cheese Slices",
    category: "Meats & Proteins",
    unit: "pcs",
    currentStock: 45,
    minStockThreshold: 20,
    targetStock: 80,
    unitCost: 4.00,
    packageUnit: "Pack of 24 slices",
    packageCost: 96.00,
    supplier: "Magnolia / Eden"
  },
  {
    id: "ing_cheese_grated",
    name: "Grated Cheddar Cheese (Shredded)",
    category: "Meats & Proteins",
    unit: "grams",
    currentStock: 400,
    minStockThreshold: 250,
    targetStock: 1000,
    unitCost: 0.16, // ₱160 per 1kg
    packageUnit: "Block of 500g",
    packageCost: 80.00,
    supplier: "Dairy Supplier"
  },
  {
    id: "ing_fries_potato",
    name: "Shoestring French Fries (Frozen)",
    category: "Meats & Proteins",
    unit: "grams",
    currentStock: 1500, // 1.5kg
    minStockThreshold: 1000,
    targetStock: 4000,
    unitCost: 0.13, // ₱130 per 1kg
    packageUnit: "Bag of 1kg (1000g)",
    packageCost: 130.00,
    supplier: "Aviko / Puregold"
  },

  // --- BATTER, WAFFLES & SWEET TOPPINGS ---
  {
    id: "ing_waffle_batter_mix",
    name: "Pancake & Waffle Mix Batter",
    category: "Batter & Sweets",
    unit: "grams",
    currentStock: 2200,
    minStockThreshold: 1000,
    targetStock: 5000,
    unitCost: 0.08,
    packageUnit: "Bag of 1kg (1000g)",
    packageCost: 80.00,
    supplier: "BakeBest / Market"
  },
  {
    id: "ing_butter_cube",
    name: "Salted Butter Portions (Cubes)",
    category: "Batter & Sweets",
    unit: "pcs",
    currentStock: 35,
    minStockThreshold: 15,
    targetStock: 60,
    unitCost: 2.00,
    packageUnit: "Pack of 20 cubes",
    packageCost: 40.00,
    supplier: "Anchor / Dari Creme"
  },
  {
    id: "ing_pancake_syrup",
    name: "Sweet Maple Pancake Syrup",
    category: "Batter & Sweets",
    unit: "ml",
    currentStock: 800,
    minStockThreshold: 400,
    targetStock: 1500,
    unitCost: 0.09,
    packageUnit: "Bottle of 750ml",
    packageCost: 68.00,
    supplier: "Supermarket"
  },
  {
    id: "ing_donut_chocolate_syrup",
    name: "Rich Chocolate Glaze Syrup",
    category: "Batter & Sweets",
    unit: "ml",
    currentStock: 600,
    minStockThreshold: 300,
    targetStock: 1200,
    unitCost: 0.10,
    packageUnit: "Bottle of 500ml",
    packageCost: 50.00,
    supplier: "Bakery Supply"
  },
  {
    id: "ing_donut_strawberry_syrup",
    name: "Sweet Strawberry Glaze Syrup",
    category: "Batter & Sweets",
    unit: "ml",
    currentStock: 500,
    minStockThreshold: 300,
    targetStock: 1200,
    unitCost: 0.10,
    packageUnit: "Bottle of 500ml",
    packageCost: 50.00,
    supplier: "Bakery Supply"
  },
  {
    id: "ing_rainbow_sprinkles",
    name: "Colorful Rainbow Sprinkles",
    category: "Batter & Sweets",
    unit: "grams",
    currentStock: 450,
    minStockThreshold: 200,
    targetStock: 1000,
    unitCost: 0.12,
    packageUnit: "Jar of 250g",
    packageCost: 30.00,
    supplier: "Bakery Supply"
  },

  // --- FRUIT SODA & COFFEE JELLY SUPPLIES ---
  {
    id: "ing_syrup_blueberry",
    name: "Fruit Soda Syrup - Blueberry",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 900,
    minStockThreshold: 400,
    targetStock: 2000,
    unitCost: 0.12,
    packageUnit: "Bottle of 750ml",
    packageCost: 90.00,
    supplier: "Beverage Supply"
  },
  {
    id: "ing_syrup_green_apple",
    name: "Fruit Soda Syrup - Green Apple",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 1100,
    minStockThreshold: 400,
    targetStock: 2000,
    unitCost: 0.12,
    packageUnit: "Bottle of 750ml",
    packageCost: 90.00,
    supplier: "Beverage Supply"
  },
  {
    id: "ing_syrup_lemon",
    name: "Fruit Soda Syrup - Lemon",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 850,
    minStockThreshold: 400,
    targetStock: 2000,
    unitCost: 0.12,
    packageUnit: "Bottle of 750ml",
    packageCost: 90.00,
    supplier: "Beverage Supply"
  },
  {
    id: "ing_syrup_strawberry",
    name: "Fruit Soda Syrup - Strawberry",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 950,
    minStockThreshold: 400,
    targetStock: 2000,
    unitCost: 0.12,
    packageUnit: "Bottle of 750ml",
    packageCost: 90.00,
    supplier: "Beverage Supply"
  },
  {
    id: "ing_soda_water",
    name: "Chilled Soda Water / Sprite Base",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 5000, // 5 Liters
    minStockThreshold: 2000,
    targetStock: 10000,
    unitCost: 0.035, // ₱35 per 1L
    packageUnit: "Bottle of 1.5L",
    packageCost: 52.50,
    supplier: "Beverage Dealer"
  },
  {
    id: "ing_jelly_white_orange",
    name: "Chewy White & Orange Jelly Sinkers",
    category: "Beverages & Drinks",
    unit: "grams",
    currentStock: 1400,
    minStockThreshold: 600,
    targetStock: 3000,
    unitCost: 0.07,
    packageUnit: "Tub of 1kg",
    packageCost: 70.00,
    supplier: "In-house Prep / Sinker Supply"
  },
  {
    id: "ing_coffee_jelly_cubes",
    name: "Fresh Coffee Jelly Cubes (Creamy & Chewy)",
    category: "Beverages & Drinks",
    unit: "grams",
    currentStock: 1800,
    minStockThreshold: 800,
    targetStock: 4000,
    unitCost: 0.05, // ₱50 per 1000g gelatin coffee cubes
    packageUnit: "Batch of 1000g",
    packageCost: 50.00,
    supplier: "In-house Kitchen Prep"
  },
  {
    id: "ing_coffee_jelly_cream",
    name: "Sweetened Cream & Condensed Milk Base",
    category: "Beverages & Drinks",
    unit: "ml",
    currentStock: 2200,
    minStockThreshold: 1000,
    targetStock: 5000,
    unitCost: 0.08,
    packageUnit: "Batch of 1000ml",
    packageCost: 80.00,
    supplier: "Nestle Cream + Condensed Milk"
  },

  // --- SAUCES & SEASONINGS ---
  {
    id: "ing_burger_sauce",
    name: "Special Burger Dressing (Thousand Island)",
    category: "Sauces & Condiments",
    unit: "ml",
    currentStock: 1100,
    minStockThreshold: 400,
    targetStock: 2000,
    unitCost: 0.09,
    packageUnit: "Pouch of 1000ml",
    packageCost: 90.00,
    supplier: "Lady's Choice / Best Foods"
  },
  {
    id: "ing_ketchup",
    name: "Sweet Banana / Tomato Ketchup",
    category: "Sauces & Condiments",
    unit: "ml",
    currentStock: 1600,
    minStockThreshold: 500,
    targetStock: 3000,
    unitCost: 0.06,
    packageUnit: "Gallon of 2000ml",
    packageCost: 120.00,
    supplier: "UFC / Papa Ketchup"
  },
  {
    id: "ing_cheese_sauce",
    name: "Creamy Melted Cheese Sauce",
    category: "Sauces & Condiments",
    unit: "ml",
    currentStock: 600,
    minStockThreshold: 400,
    targetStock: 1500,
    unitCost: 0.12,
    packageUnit: "Pouch of 1000ml",
    packageCost: 120.00,
    supplier: "Cheez Whiz / Supply"
  },
  {
    id: "ing_fries_cheese_powder",
    name: "Cheese Flavoring Powder (Fries)",
    category: "Sauces & Condiments",
    unit: "grams",
    currentStock: 500,
    minStockThreshold: 250,
    targetStock: 1000,
    unitCost: 0.18,
    packageUnit: "Bag of 500g",
    packageCost: 90.00,
    supplier: "Flavor Supply"
  },

  // --- PACKAGING & DISPOSABLES ---
  {
    id: "ing_cup_8oz",
    name: "8oz Clear Cups & Lids",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 50,
    minStockThreshold: 25,
    targetStock: 100,
    unitCost: 1.50,
    packageUnit: "Sleeve of 50 pcs",
    packageCost: 75.00,
    supplier: "Packaging Distributor"
  },
  {
    id: "ing_cup_12oz",
    name: "12oz Clear Cups & Dome Lids",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 45,
    minStockThreshold: 25,
    targetStock: 100,
    unitCost: 2.00,
    packageUnit: "Sleeve of 50 pcs",
    packageCost: 100.00,
    supplier: "Packaging Distributor"
  },
  {
    id: "ing_cup_16oz",
    name: "16oz Clear Cups & Dome Lids",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 40,
    minStockThreshold: 20,
    targetStock: 100,
    unitCost: 2.40,
    packageUnit: "Sleeve of 50 pcs",
    packageCost: 120.00,
    supplier: "Packaging Distributor"
  },
  {
    id: "ing_cup_jelly_small",
    name: "Small Coffee Jelly Cups (₱5 Size)",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 80,
    minStockThreshold: 40,
    targetStock: 150,
    unitCost: 0.70,
    packageUnit: "Pack of 100 pcs",
    packageCost: 70.00,
    supplier: "Packaging Distributor"
  },
  {
    id: "ing_cup_jelly_large",
    name: "Large Coffee Jelly Cups (₱10 Size)",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 75,
    minStockThreshold: 35,
    targetStock: 150,
    unitCost: 1.10,
    packageUnit: "Pack of 100 pcs",
    packageCost: 110.00,
    supplier: "Packaging Distributor"
  },
  {
    id: "ing_burger_wrapper",
    name: "Greaseproof Burger Wrappers",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 120,
    minStockThreshold: 50,
    targetStock: 250,
    unitCost: 0.35,
    packageUnit: "Pack of 100 pcs",
    packageCost: 35.00,
    supplier: "Market General Store"
  },
  {
    id: "ing_hotdog_tray",
    name: "Hotdog Paper Boats / Snack Trays",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 22, // Low stock
    minStockThreshold: 40,
    targetStock: 120,
    unitCost: 0.80,
    packageUnit: "Pack of 50 pcs",
    packageCost: 40.00,
    supplier: "Market General Store"
  },
  {
    id: "ing_bamboo_skewer",
    name: "Bamboo Skewers (Waffle & Hotdog)",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 90,
    minStockThreshold: 30,
    targetStock: 200,
    unitCost: 0.15,
    packageUnit: "Pack of 100 pcs",
    packageCost: 15.00,
    supplier: "Market General Store"
  },
  {
    id: "ing_straws",
    name: "Boba Straws & Mini Spoons",
    category: "Packaging & Disposables",
    unit: "pcs",
    currentStock: 110,
    minStockThreshold: 50,
    targetStock: 200,
    unitCost: 0.40,
    packageUnit: "Pack of 100 pcs",
    packageCost: 40.00,
    supplier: "Packaging Distributor"
  }
];

export const INITIAL_MENU_ITEMS = [
  // ==========================================
  // 1. BURGERS (From Flyer 1)
  // ==========================================
  {
    id: "menu_b1t1_burger_regular",
    name: "Buy 1 Take 1 Burger Regular",
    category: "Burgers",
    price: 34.00,
    emoji: "🍔",
    badge: "Buy 1 Take 1",
    description: "Two classic regular burgers with grilled beef patties and special dressing.",
    recipe: [
      { ingredientId: "ing_burger_bun", amount: 2 },
      { ingredientId: "ing_beef_patty", amount: 2 },
      { ingredientId: "ing_burger_sauce", amount: 30 },
      { ingredientId: "ing_burger_wrapper", amount: 2 }
    ]
  },
  {
    id: "menu_burger_solo_regular",
    name: "Burger Solo Regular",
    category: "Burgers",
    price: 18.00,
    emoji: "🍔",
    badge: "Solo Suki",
    description: "Single classic regular burger with beef patty and savory dressing.",
    recipe: [
      { ingredientId: "ing_burger_bun", amount: 1 },
      { ingredientId: "ing_beef_patty", amount: 1 },
      { ingredientId: "ing_burger_sauce", amount: 15 },
      { ingredientId: "ing_burger_wrapper", amount: 1 }
    ]
  },
  {
    id: "menu_b1t1_cheeseburger",
    name: "Buy 1 Take 1 Cheese Burger",
    category: "Burgers",
    price: 44.00,
    emoji: "🍔",
    badge: "Buy 1 Take 1",
    description: "Two delicious cheeseburgers topped with melted cheddar cheese slices.",
    recipe: [
      { ingredientId: "ing_burger_bun", amount: 2 },
      { ingredientId: "ing_beef_patty", amount: 2 },
      { ingredientId: "ing_cheese_slice", amount: 2 },
      { ingredientId: "ing_burger_sauce", amount: 30 },
      { ingredientId: "ing_burger_wrapper", amount: 2 }
    ]
  },
  {
    id: "menu_cheesy_burger_solo",
    name: "Cheesy Burger Solo",
    category: "Burgers",
    price: 23.00,
    emoji: "🍔",
    badge: "Best Seller",
    description: "Single cheeseburger with golden melted cheddar cheese and dressing.",
    recipe: [
      { ingredientId: "ing_burger_bun", amount: 1 },
      { ingredientId: "ing_beef_patty", amount: 1 },
      { ingredientId: "ing_cheese_slice", amount: 1 },
      { ingredientId: "ing_burger_sauce", amount: 15 },
      { ingredientId: "ing_burger_wrapper", amount: 1 }
    ]
  },
  {
    id: "menu_burger_overload_solo",
    name: "Burger Overload Solo",
    category: "Burgers",
    price: 28.00,
    emoji: "🍔",
    badge: "Overload",
    description: "Toasted sesame bun loaded with beef patty, melted cheese, and extra toppings.",
    recipe: [
      { ingredientId: "ing_burger_bun", amount: 1 },
      { ingredientId: "ing_beef_patty", amount: 1 },
      { ingredientId: "ing_cheese_slice", amount: 1 },
      { ingredientId: "ing_cheese_sauce", amount: 15 },
      { ingredientId: "ing_burger_sauce", amount: 15 },
      { ingredientId: "ing_burger_wrapper", amount: 1 }
    ]
  },

  // ==========================================
  // 2. HOTDOGS (From Flyer 1)
  // ==========================================
  {
    id: "menu_hotdog_sandwich_regular",
    name: "Hotdog Sandwich Regular",
    category: "Hotdogs",
    price: 20.00,
    emoji: "🌭",
    badge: "Solo",
    description: "Juicy red hotdog in warm bun drizzled with sweet ketchup and mayo.",
    recipe: [
      { ingredientId: "ing_hotdog_bun", amount: 1 },
      { ingredientId: "ing_reg_hotdog", amount: 1 },
      { ingredientId: "ing_ketchup", amount: 15 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_b1t1_hotdog_regular",
    name: "Buy 1 Take 1 Hotdog Sandwich Regular",
    category: "Hotdogs",
    price: 38.00,
    emoji: "🌭",
    badge: "Buy 1 Take 1",
    description: "Two regular hotdog sandwiches with condiments.",
    recipe: [
      { ingredientId: "ing_hotdog_bun", amount: 2 },
      { ingredientId: "ing_reg_hotdog", amount: 2 },
      { ingredientId: "ing_ketchup", amount: 30 },
      { ingredientId: "ing_hotdog_tray", amount: 2 }
    ]
  },
  {
    id: "menu_hotdog_sandwich_overload",
    name: "Hotdog Sandwich Overload",
    category: "Hotdogs",
    price: 28.00,
    emoji: "🌭",
    badge: "Overload",
    description: "Hotdog sandwich loaded with shredded cheddar cheese, warm cheese sauce & ketchup.",
    recipe: [
      { ingredientId: "ing_hotdog_bun", amount: 1 },
      { ingredientId: "ing_reg_hotdog", amount: 1 },
      { ingredientId: "ing_cheese_grated", amount: 20 },
      { ingredientId: "ing_cheese_sauce", amount: 15 },
      { ingredientId: "ing_ketchup", amount: 10 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_hotdog_sandwich_jumbo",
    name: "Hotdog Sandwich Jumbo",
    category: "Hotdogs",
    price: 25.00,
    emoji: "🌭",
    badge: "Jumbo",
    description: "Thick jumbo hotdog in soft bun with signature sauces.",
    recipe: [
      { ingredientId: "ing_hotdog_bun", amount: 1 },
      { ingredientId: "ing_jumbo_hotdog", amount: 1 },
      { ingredientId: "ing_ketchup", amount: 15 },
      { ingredientId: "ing_cheese_sauce", amount: 10 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_b1t1_hotdog_jumbo",
    name: "Buy 1 Take 1 Hotdog Jumbo",
    category: "Hotdogs",
    price: 48.00,
    emoji: "🌭",
    badge: "Buy 1 Take 1",
    description: "Two jumbo hotdog sandwiches with generous sauce drizzle.",
    recipe: [
      { ingredientId: "ing_hotdog_bun", amount: 2 },
      { ingredientId: "ing_jumbo_hotdog", amount: 2 },
      { ingredientId: "ing_ketchup", amount: 30 },
      { ingredientId: "ing_cheese_sauce", amount: 20 },
      { ingredientId: "ing_hotdog_tray", amount: 2 }
    ]
  },

  // ==========================================
  // 3. WAFFLES & MERIENDA TREATS (From Flyer 1)
  // ==========================================
  {
    id: "menu_pancake_waffle",
    name: "Pancake Waffle",
    category: "Waffles & Treats",
    price: 15.00,
    emoji: "🧇",
    badge: "Sweet Merienda",
    description: "Golden warm waffle topped with butter cube and sweet pancake syrup.",
    recipe: [
      { ingredientId: "ing_waffle_batter_mix", amount: 80 },
      { ingredientId: "ing_butter_cube", amount: 1 },
      { ingredientId: "ing_pancake_syrup", amount: 20 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_hotdog_waffle",
    name: "Hotdog Waffle",
    category: "Waffles & Treats",
    price: 10.00,
    emoji: "🍢",
    badge: "Only ₱10",
    description: "Crispy waffle on a stick wrapped around juicy hotdog with ketchup drizzle.",
    recipe: [
      { ingredientId: "ing_reg_hotdog", amount: 1 },
      { ingredientId: "ing_waffle_batter_mix", amount: 50 },
      { ingredientId: "ing_bamboo_skewer", amount: 1 },
      { ingredientId: "ing_ketchup", amount: 10 }
    ]
  },
  {
    id: "menu_messy_donut",
    name: "Messy Donut (Choco / Strawberry)",
    category: "Waffles & Treats",
    price: 7.00,
    emoji: "🍩",
    badge: "₱7 Suki Treat",
    description: "Soft donut drizzled with chocolate or strawberry glaze and rainbow sprinkles.",
    recipe: [
      { ingredientId: "ing_donut_ring", amount: 1 },
      { ingredientId: "ing_donut_chocolate_syrup", amount: 12 },
      { ingredientId: "ing_rainbow_sprinkles", amount: 5 },
      { ingredientId: "ing_burger_wrapper", amount: 1 }
    ]
  },

  // ==========================================
  // 4. FRENCH FRIES (From Flyer 1)
  // ==========================================
  {
    id: "menu_fries_small",
    name: "French Fries - Small",
    category: "French Fries",
    price: 15.00,
    emoji: "🍟",
    badge: "Small ₱15",
    description: "Crispy fried shoestring potato fries coated in savory cheese powder.",
    recipe: [
      { ingredientId: "ing_fries_potato", amount: 70 },
      { ingredientId: "ing_fries_cheese_powder", amount: 8 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_fries_medium",
    name: "French Fries - Medium",
    category: "French Fries",
    price: 20.00,
    emoji: "🍟",
    badge: "Medium ₱20",
    description: "Medium serving of freshly fried cheese flavored potato fries.",
    recipe: [
      { ingredientId: "ing_fries_potato", amount: 100 },
      { ingredientId: "ing_fries_cheese_powder", amount: 12 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },
  {
    id: "menu_fries_large",
    name: "French Fries - Large",
    category: "French Fries",
    price: 25.00,
    emoji: "🍟",
    badge: "Large ₱25",
    description: "Large serving of crispy golden potato fries loaded with cheese flavor.",
    recipe: [
      { ingredientId: "ing_fries_potato", amount: 140 },
      { ingredientId: "ing_fries_cheese_powder", amount: 16 },
      { ingredientId: "ing_hotdog_tray", amount: 1 }
    ]
  },

  // ==========================================
  // 5. FRUIT SODA w/ WHITE & ORANGE JELLY (From Flyer 2)
  // Flavors: Blueberry, Green Apple, Lemon, Strawberry
  // ==========================================
  {
    id: "menu_fruit_soda_8oz",
    name: "Fruit Soda 8oz (White & Orange Jelly)",
    category: "Fruit Soda",
    price: 15.00,
    emoji: "🥤",
    badge: "8oz ₱15",
    description: "Refreshing fizzy fruit soda (Blueberry / Green Apple / Lemon / Strawberry) with chewy jellies.",
    recipe: [
      { ingredientId: "ing_cup_8oz", amount: 1 },
      { ingredientId: "ing_straws", amount: 1 },
      { ingredientId: "ing_syrup_blueberry", amount: 25 },
      { ingredientId: "ing_soda_water", amount: 120 },
      { ingredientId: "ing_jelly_white_orange", amount: 30 }
    ]
  },
  {
    id: "menu_fruit_soda_12oz",
    name: "Fruit Soda 12oz (White & Orange Jelly)",
    category: "Fruit Soda",
    price: 25.00,
    emoji: "🥤",
    badge: "12oz ₱25",
    description: "Fruity refreshing soda with white & orange jelly cubes (Choice of fruit flavors).",
    recipe: [
      { ingredientId: "ing_cup_12oz", amount: 1 },
      { ingredientId: "ing_straws", amount: 1 },
      { ingredientId: "ing_syrup_blueberry", amount: 35 },
      { ingredientId: "ing_soda_water", amount: 180 },
      { ingredientId: "ing_jelly_white_orange", amount: 45 }
    ]
  },
  {
    id: "menu_fruit_soda_16oz",
    name: "Fruit Soda 16oz (White & Orange Jelly)",
    category: "Fruit Soda",
    price: 35.00,
    emoji: "🥤",
    badge: "16oz ₱35",
    description: "Large 16oz fruit soda packed with chilled soda, fruit syrup, and double chewy jelly sinkers.",
    recipe: [
      { ingredientId: "ing_cup_16oz", amount: 1 },
      { ingredientId: "ing_straws", amount: 1 },
      { ingredientId: "ing_syrup_blueberry", amount: 50 },
      { ingredientId: "ing_soda_water", amount: 240 },
      { ingredientId: "ing_jelly_white_orange", amount: 60 }
    ]
  },

  // ==========================================
  // 6. COFFEE JELLY (From Flyer 2)
  // Creamy • Chewy • Simply Delicious!
  // ==========================================
  {
    id: "menu_coffee_jelly_small",
    name: "Coffee Jelly - Small (S)",
    category: "Coffee Jelly",
    price: 5.00,
    emoji: "🧋",
    badge: "Only ₱5!",
    description: "Creamy, chewy, simply delicious coffee jelly in sweet milk cream blend.",
    recipe: [
      { ingredientId: "ing_cup_jelly_small", amount: 1 },
      { ingredientId: "ing_straws", amount: 1 },
      { ingredientId: "ing_coffee_jelly_cubes", amount: 45 },
      { ingredientId: "ing_coffee_jelly_cream", amount: 35 }
    ]
  },
  {
    id: "menu_coffee_jelly_large",
    name: "Coffee Jelly - Large (L)",
    category: "Coffee Jelly",
    price: 10.00,
    emoji: "🧋",
    badge: "Only ₱10!",
    description: "Large cup loaded with chewy coffee jelly cubes in rich sweet cream.",
    recipe: [
      { ingredientId: "ing_cup_jelly_large", amount: 1 },
      { ingredientId: "ing_straws", amount: 1 },
      { ingredientId: "ing_coffee_jelly_cubes", amount: 90 },
      { ingredientId: "ing_coffee_jelly_cream", amount: 70 }
    ]
  }
];

export const INITIAL_EXPENSES = [
  {
    id: "exp_2001",
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    category: "Ingredients & Groceries",
    title: "Puregold / Market Meat & Buns Supply",
    amount: 680.00,
    paymentMethod: "Cash from Drawer",
    receiptNo: "PG-10928",
    notes: "Restocked beef patties, regular & jumbo hotdogs, burger buns"
  },
  {
    id: "exp_2002",
    date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    category: "Packaging & Supplies",
    title: "Cups (8oz, 12oz, 16oz), Jelly Cups & Straws",
    amount: 340.00,
    paymentMethod: "Cash from Drawer",
    receiptNo: "DIV-7712",
    notes: "Beverage packaging from San Jose del Monte market"
  },
  {
    id: "exp_2003",
    date: new Date().toISOString().slice(0, 10),
    category: "Ice & Utilities",
    title: "Tube Ice 2 Bags for Fruit Soda & Coffee Jelly",
    amount: 50.00,
    paymentMethod: "Cash from Drawer",
    receiptNo: "ICE-01",
    notes: "Morning opening ice"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-1001",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Ate Michelle",
    items: [
      { menuItemId: "menu_b1t1_burger_regular", name: "Buy 1 Take 1 Burger Regular", price: 34.00, quantity: 1, subtotal: 34.00 },
      { menuItemId: "menu_fries_medium", name: "French Fries - Medium", price: 20.00, quantity: 1, subtotal: 20.00 },
      { menuItemId: "menu_coffee_jelly_large", name: "Coffee Jelly - Large (L)", price: 10.00, quantity: 2, subtotal: 20.00 }
    ],
    subtotal: 74.00,
    discount: 0,
    totalAmount: 74.00,
    paymentMethod: "Cash",
    cashReceived: 100.00,
    changeGiven: 26.00,
    status: "Completed"
  },
  {
    id: "ORD-1002",
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    customerName: "Kuya Ryan",
    items: [
      { menuItemId: "menu_hotdog_sandwich_overload", name: "Hotdog Sandwich Overload", price: 28.00, quantity: 1, subtotal: 28.00 },
      { menuItemId: "menu_fruit_soda_12oz", name: "Fruit Soda 12oz (White & Orange Jelly)", price: 25.00, quantity: 1, subtotal: 25.00 }
    ],
    subtotal: 53.00,
    discount: 0,
    totalAmount: 53.00,
    paymentMethod: "GCash",
    refNumber: "GC-8819241",
    status: "Completed"
  }
];
