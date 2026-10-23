// Business logic calculations for KK's Tindahan

// 1. Calculate Food Cost & Margins for a Menu Item based on its Recipe
export function calculateMenuItemCost(menuItem, ingredientsMap) {
  if (!menuItem.recipe || menuItem.recipe.length === 0) return 0;
  
  let totalCost = 0;
  for (const item of menuItem.recipe) {
    const ing = ingredientsMap[item.ingredientId];
    if (ing && ing.unitCost) {
      totalCost += ing.unitCost * item.amount;
    }
  }
  return Number(totalCost.toFixed(2));
}

export function calculateProfitMargin(price, cost) {
  if (!price || price <= 0) return { profit: 0, marginPercent: 0 };
  const profit = price - cost;
  const marginPercent = ((profit / price) * 100);
  return {
    profit: Number(profit.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(1))
  };
}

// 2. Generate the "What We Need to Buy" Shopping List
export function generateShoppingList(ingredients) {
  const needsReorder = [];

  for (const ing of ingredients) {
    // If stock is below or equal to threshold, or below target stock
    const isBelowMin = ing.currentStock <= ing.minStockThreshold;
    const isBelowTarget = ing.currentStock < ing.targetStock;

    if (isBelowMin || isBelowTarget) {
      const deficit = Math.max(0, ing.targetStock - ing.currentStock);
      
      // Parse package quantity if available (e.g., "Pack of 12 pcs" -> 12, "Bag of 1kg" -> 1000)
      let packSize = 1;
      if (ing.packageUnit) {
        const match = ing.packageUnit.match(/\b(\d+)\b/);
        if (match) {
          packSize = parseInt(match[1], 10) || 1;
        }
      }

      // Calculate how many packs/units to purchase
      const packsToBuy = Math.ceil(deficit / (packSize || 1));
      const estTotalCost = packsToBuy * (ing.packageCost || (ing.unitCost * packSize) || 0);

      needsReorder.push({
        ...ing,
        deficit,
        isUrgent: isBelowMin, // True if strictly <= minimum buffer
        packsToBuy,
        estTotalCost: Number(estTotalCost.toFixed(2))
      });
    }
  }

  // Sort: Urgent items first, then by category
  return needsReorder.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return a.category.localeCompare(b.category);
  });
}

// 3. Deduct Ingredients when an Order is Completed
export function deductIngredientsForOrder(orderItems, menuItemsMap, currentIngredients) {
  // Deep clone ingredients array
  const updatedIngredients = currentIngredients.map(ing => ({ ...ing }));
  const ingredientsMap = {};
  updatedIngredients.forEach(ing => {
    ingredientsMap[ing.id] = ing;
  });

  const deductions = []; // Record what was deducted

  for (const cartItem of orderItems) {
    const menuItem = menuItemsMap[cartItem.menuItemId];
    if (menuItem && menuItem.recipe) {
      for (const recipePart of menuItem.recipe) {
        const ing = ingredientsMap[recipePart.ingredientId];
        if (ing) {
          const totalAmountToDeduct = recipePart.amount * cartItem.quantity;
          const oldStock = ing.currentStock;
          ing.currentStock = Math.max(0, Number((ing.currentStock - totalAmountToDeduct).toFixed(2)));
          deductions.push({
            ingredientId: ing.id,
            ingredientName: ing.name,
            amountDeducted: totalAmountToDeduct,
            unit: ing.unit,
            oldStock,
            newStock: ing.currentStock
          });
        }
      }
    }
  }

  return { updatedIngredients, deductions };
}

// 4. Calculate Expected Ingredient Usage for any date range
export function calculateTheoreticalIngredientUsage(orders, menuItemsMap, ingredientsMap) {
  const usageMap = {};

  for (const order of orders) {
    if (order.status === "Cancelled" || order.status === "Refunded") continue;
    for (const item of order.items) {
      const menuItem = menuItemsMap[item.menuItemId];
      if (menuItem && menuItem.recipe) {
        for (const recipeItem of menuItem.recipe) {
          const ingId = recipeItem.ingredientId;
          const totalQty = recipeItem.amount * item.quantity;
          if (!usageMap[ingId]) {
            usageMap[ingId] = {
              ingredientId: ingId,
              ingredientName: ingredientsMap[ingId]?.name || ingId,
              unit: ingredientsMap[ingId]?.unit || "unit",
              unitCost: ingredientsMap[ingId]?.unitCost || 0,
              theoreticalUsage: 0,
              totalCost: 0
            };
          }
          usageMap[ingId].theoreticalUsage += totalQty;
        }
      }
    }
  }

  // Finalize totals
  return Object.values(usageMap).map(u => ({
    ...u,
    theoreticalUsage: Number(u.theoreticalUsage.toFixed(2)),
    totalCost: Number((u.theoreticalUsage * u.unitCost).toFixed(2))
  }));
}

// 5. Cash Drawer Tally & Reconciliation
export function reconcileCashDrawer({
  openingFloat,
  orders,
  expenses,
  actualCashCounted
}) {
  // Cash received from cash orders
  const cashSales = orders
    .filter(o => o.paymentMethod === "Cash" && o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // E-wallet sales (GCash, Maya)
  const gcashSales = orders
    .filter(o => (o.paymentMethod === "GCash" || o.paymentMethod === "Maya") && o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Credit / Utang sales
  const creditSales = orders
    .filter(o => o.paymentMethod === "Credit/Utang" && o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Expenses paid out of Cash Drawer
  const cashExpensesPaid = expenses
    .filter(e => e.paymentMethod === "Cash from Drawer")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Other expenses (GCash or Owner Pocket)
  const otherExpenses = expenses
    .filter(e => e.paymentMethod !== "Cash from Drawer")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalGrossSales = cashSales + gcashSales + creditSales;
  const totalExpenses = cashExpensesPaid + otherExpenses;

  // Expected Cash in the register
  const expectedCashInDrawer = Number((openingFloat + cashSales - cashExpensesPaid).toFixed(2));
  
  // Over / Short calculation if actual count is provided
  const hasCounted = actualCashCounted !== null && actualCashCounted !== undefined && actualCashCounted !== "";
  const actualNum = hasCounted ? parseFloat(actualCashCounted) || 0 : null;
  const variance = hasCounted ? Number((actualNum - expectedCashInDrawer).toFixed(2)) : null;

  return {
    openingFloat,
    cashSales,
    gcashSales,
    creditSales,
    totalGrossSales,
    cashExpensesPaid,
    otherExpenses,
    totalExpenses,
    expectedCashInDrawer,
    actualCashCounted: actualNum,
    variance, // Positive = Over (+), Negative = Short (-), Zero = Balanced
    netStoreProfit: Number((totalGrossSales - totalExpenses).toFixed(2))
  };
}

// Format Philippine Peso Currency
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₱0.00";
  return "₱" + Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
