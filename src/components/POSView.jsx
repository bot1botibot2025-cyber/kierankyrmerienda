import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Receipt,
  User,
  Percent,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/calculations';
import { playTapSound, playAddSound, playSuccessChime, playAlertSound } from '../utils/audio';

export function POSView({ 
  menuItems, 
  ingredients, 
  onCompleteOrder, 
  soundEnabled 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [discountType, setDiscountType] = useState('none'); // 'none', 'pwd_senior_20', 'promo_10', 'custom'
  const [customDiscount, setCustomDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash', 'GCash', 'Maya', 'Credit/Utang'
  const [cashTendered, setCashTendered] = useState('');
  const [refNumber, setRefNumber] = useState('');

  // Map of ingredients for instant lookup
  const ingredientsMap = useMemo(() => {
    const map = {};
    ingredients.forEach(ing => {
      map[ing.id] = ing;
    });
    return map;
  }, [ingredients]);

  // Categories list matching Kieran & Kyr's Merienda Menu Flyers
  const categories = ['All', 'Burgers', 'Hotdogs', 'Waffles & Treats', 'French Fries', 'Fruit Soda', 'Coffee Jelly'];

  // Check ingredient stock availability for a menu item
  const checkStockAvailability = (menuItem) => {
    if (!menuItem.recipe || menuItem.recipe.length === 0) return { isAvailable: true, maxPortions: 999 };

    let maxPortions = 999;
    for (const item of menuItem.recipe) {
      const ing = ingredientsMap[item.ingredientId];
      if (!ing || ing.currentStock <= 0) {
        return { isAvailable: false, maxPortions: 0, missingIngredient: ing?.name || 'Missing item' };
      }
      const portionsPossible = Math.floor(ing.currentStock / item.amount);
      if (portionsPossible < maxPortions) {
        maxPortions = portionsPossible;
      }
    }

    return {
      isAvailable: maxPortions > 0,
      maxPortions,
      isLowStock: maxPortions > 0 && maxPortions <= 5
    };
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart actions
  const addToCart = (menuItem) => {
    const stockInfo = checkStockAvailability(menuItem);
    if (!stockInfo.isAvailable) {
      if (soundEnabled) playAlertSound();
      alert(`Cannot add ${menuItem.name}: insufficient ingredients in stock!`);
      return;
    }

    if (soundEnabled) playAddSound();

    setCart(prevCart => {
      const existing = prevCart.find(i => i.menuItemId === menuItem.id);
      if (existing) {
        if (existing.quantity >= stockInfo.maxPortions) {
          if (soundEnabled) playAlertSound();
          alert(`Maximum stock reached for ${menuItem.name} (${stockInfo.maxPortions} available)`);
          return prevCart;
        }
        return prevCart.map(i => i.menuItemId === menuItem.id 
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } 
          : i
        );
      }
      return [
        ...prevCart, 
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          emoji: menuItem.emoji,
          quantity: 1,
          subtotal: menuItem.price
        }
      ];
    });
  };

  const updateQuantity = (menuItemId, change) => {
    if (soundEnabled) playTapSound();
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQty = item.quantity + change;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.price
          };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (menuItemId) => {
    if (soundEnabled) playTapSound();
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Clear all items from current cart?')) {
      if (soundEnabled) playTapSound();
      setCart([]);
      setCashTendered('');
      setCustomerName('');
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  let discountAmount = 0;
  if (discountType === 'pwd_senior_20') {
    discountAmount = subtotal * 0.20;
  } else if (discountType === 'promo_10') {
    discountAmount = subtotal * 0.10;
  } else if (discountType === 'custom') {
    discountAmount = parseFloat(customDiscount) || 0;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Cash change calculation
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = tenderedNum >= totalAmount ? tenderedNum - totalAmount : 0;
  const isShort = paymentMethod === 'Cash' && cashTendered !== '' && tenderedNum < totalAmount;

  // Complete Order
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'Cash' && tenderedNum < totalAmount) {
      if (soundEnabled) playAlertSound();
      alert(`Insufficient cash tendered. Total is ${formatCurrency(totalAmount)}, given was ${formatCurrency(tenderedNum)}.`);
      return;
    }

    if (paymentMethod === 'Credit/Utang' && !customerName.trim()) {
      if (soundEnabled) playAlertSound();
      alert('Please enter customer/suki name for Utang / Credit records.');
      return;
    }

    // Success sound & confetti
    if (soundEnabled) playSuccessChime();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff']
      });
    } catch {
      // ignore
    }

    const orderData = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Suki',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      totalAmount,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? (tenderedNum || totalAmount) : null,
      changeGiven: paymentMethod === 'Cash' ? changeDue : null,
      refNumber: (paymentMethod === 'GCash' || paymentMethod === 'Maya') ? (refNumber || 'N/A') : null,
      status: 'Completed'
    };

    onCompleteOrder(orderData);

    // Reset cart
    setCart([]);
    setCustomerName('');
    setCashTendered('');
    setRefNumber('');
    setDiscountType('none');
    setCustomDiscount('');
  };

  return (
    <div className="pos-layout">
      {/* LEFT COLUMN: Menu Catalog & Categories */}
      <div className="pos-menu-column">
        {/* Search & Category Tabs */}
        <div className="pos-filter-bar luxe-card">
          <div className="pos-search-wrapper">
            <Search size={18} className="pos-search-icon" />
            <input 
              type="text" 
              className="pos-search-input"
              placeholder="Search burgers, hotdogs, coffee jelly, fries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          <div className="pos-category-pills">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playTapSound();
                  setSelectedCategory(cat);
                }}
              >
                {cat === 'All' && '✨ '}
                {cat === 'Burgers' && '🍔 '}
                {cat === 'Hotdogs' && '🌭 '}
                {cat === 'Waffles & Treats' && '🧇 '}
                {cat === 'French Fries' && '🍟 '}
                {cat === 'Fruit Soda' && '🥤 '}
                {cat === 'Coffee Jelly' && '🧋 '}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="pos-menu-grid">
          {filteredMenuItems.map(item => {
            const stockInfo = checkStockAvailability(item);
            const inCart = cart.find(c => c.menuItemId === item.id);

            return (
              <div 
                key={item.id}
                className={`menu-item-card luxe-card ${!stockInfo.isAvailable ? 'out-of-stock' : ''}`}
                onClick={() => stockInfo.isAvailable && addToCart(item)}
              >
                {/* Badge (e.g. Best Seller, Value) */}
                <div className="menu-card-top">
                  <span className="menu-card-emoji">{item.emoji}</span>
                  {item.badge && (
                    <span className="badge badge-gold menu-card-badge">{item.badge}</span>
                  )}
                </div>

                <div className="menu-card-info">
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-desc">{item.description}</p>
                </div>

                <div className="menu-card-bottom">
                  <div className="menu-price-tag mono-num">{formatCurrency(item.price)}</div>
                  
                  {stockInfo.isAvailable ? (
                    <div className="menu-stock-status">
                      {stockInfo.isLowStock ? (
                        <span className="badge badge-red pulse-badge">{stockInfo.maxPortions} left</span>
                      ) : (
                        <span className="text-dim text-xs mono-num">{stockInfo.maxPortions} ready</span>
                      )}
                    </div>
                  ) : (
                    <span className="badge badge-red">Sold Out</span>
                  )}
                </div>

                {/* In Cart Indicator */}
                {inCart && (
                  <div className="card-cart-counter">
                    <span>{inCart.quantity} in order</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart / Order Register */}
      <div className="pos-cart-column luxe-card">
        {/* Cart Header */}
        <div className="cart-header">
          <div>
            <h2 className="cart-title">Current Order</h2>
            <p className="cart-subtitle text-muted">Register #1 • Cashier</p>
          </div>
          {cart.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={clearCart} title="Clear cart">
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>

        {/* Customer Name Input */}
        <div className="customer-input-box">
          <User size={16} className="text-muted" />
          <input 
            type="text" 
            placeholder="Customer / Suki Name (Optional)" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="customer-text-input"
          />
        </div>

        {/* Items List */}
        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">🛒</div>
              <p className="empty-cart-title">Cart is empty</p>
              <p className="empty-cart-desc">Tap on any burger, hotdog, or coffee jelly to build an order.</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.menuItemId} className="cart-item-row">
                  <div className="cart-item-left">
                    <span className="cart-item-emoji">{item.emoji}</span>
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-unit-price mono-num text-muted">{formatCurrency(item.price)} each</div>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    {/* Stepper */}
                    <div className="cart-stepper">
                      <button 
                        className="stepper-btn" 
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="stepper-val mono-num">{item.quantity}</span>
                      <button 
                        className="stepper-btn" 
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="cart-item-subtotal mono-num font-bold">
                      {formatCurrency(item.subtotal)}
                    </div>

                    <button 
                      className="btn-trash-item" 
                      onClick={() => removeFromCart(item.menuItemId)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Discounts Section */}
        {cart.length > 0 && (
          <div className="cart-footer-section">
            {/* Discount selector */}
            <div className="discount-bar">
              <div className="discount-label">
                <Percent size={14} className="text-amber" />
                <span>Discount / Suki:</span>
              </div>
              <div className="discount-options">
                <button 
                  className={`discount-btn ${discountType === 'none' ? 'active' : ''}`}
                  onClick={() => setDiscountType('none')}
                >None</button>
                <button 
                  className={`discount-btn ${discountType === 'pwd_senior_20' ? 'active' : ''}`}
                  onClick={() => setDiscountType('pwd_senior_20')}
                >Senior/PWD (20%)</button>
                <button 
                  className={`discount-btn ${discountType === 'promo_10' ? 'active' : ''}`}
                  onClick={() => setDiscountType('promo_10')}
                >Promo (10%)</button>
                <button 
                  className={`discount-btn ${discountType === 'custom' ? 'active' : ''}`}
                  onClick={() => setDiscountType('custom')}
                >Custom ₱</button>
              </div>
            </div>

            {discountType === 'custom' && (
              <div className="custom-discount-input-row">
                <span className="text-muted text-xs">Enter custom discount amount:</span>
                <input 
                  type="number" 
                  className="input-control" 
                  placeholder="₱ Discount"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  style={{ width: '120px', padding: '6px 10px' }}
                />
              </div>
            )}

            {/* Subtotal & Total Display */}
            <div className="order-summary-box">
              <div className="summary-line">
                <span className="text-muted">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="mono-num">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-line text-danger">
                  <span>Discount Applied</span>
                  <span className="mono-num">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="summary-line grand-total-line">
                <span className="grand-total-label">TOTAL TO PAY:</span>
                <span className="grand-total-amount text-amber mono-num">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-method-tabs">
              <button 
                className={`payment-tab-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playTapSound();
                  setPaymentMethod('Cash');
                }}
              >
                <Banknote size={16} /> Cash
              </button>
              <button 
                className={`payment-tab-btn ${paymentMethod === 'GCash' ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playTapSound();
                  setPaymentMethod('GCash');
                }}
              >
                <Smartphone size={16} /> GCash
              </button>
              <button 
                className={`payment-tab-btn ${paymentMethod === 'Maya' ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playTapSound();
                  setPaymentMethod('Maya');
                }}
              >
                <CreditCard size={16} /> Maya
              </button>
              <button 
                className={`payment-tab-btn ${paymentMethod === 'Credit/Utang' ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playTapSound();
                  setPaymentMethod('Credit/Utang');
                }}
              >
                📝 Utang / Credit
              </button>
            </div>

            {/* Payment Mode Detail Controls */}
            {paymentMethod === 'Cash' && (
              <div className="cash-payment-container">
                {/* Quick Cash Suggestions */}
                <div className="quick-cash-grid">
                  <button 
                    className="quick-cash-btn" 
                    onClick={() => setCashTendered(totalAmount.toString())}
                  >
                    Exact ({formatCurrency(totalAmount)})
                  </button>
                  {[50, 100, 200, 500, 1000].map(amt => (
                    amt >= totalAmount && (
                      <button 
                        key={amt} 
                        className="quick-cash-btn"
                        onClick={() => setCashTendered(amt.toString())}
                      >
                        ₱{amt}
                      </button>
                    )
                  ))}
                </div>

                <div className="cash-tendered-row">
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Cash Received (₱)</label>
                    <input 
                      type="number" 
                      className="input-control font-bold mono-num"
                      placeholder="0.00"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                    />
                  </div>

                  <div className="change-calculated-box">
                    <span className="input-label">Change (Sukli)</span>
                    <div className={`change-display mono-num ${isShort ? 'text-danger' : 'text-emerald'}`}>
                      {isShort 
                        ? `Short: -${formatCurrency(totalAmount - tenderedNum)}` 
                        : formatCurrency(changeDue)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
              <div className="ewallet-ref-box">
                <label className="input-label">E-Wallet Reference Number</label>
                <input 
                  type="text" 
                  className="input-control mono-num"
                  placeholder="e.g. GC-9018471"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'Credit/Utang' && (
              <div className="credit-utang-warning">
                <AlertCircle size={16} className="text-amber" />
                <span>Recorded under suki: <strong>{customerName || 'Please enter customer name'}</strong></span>
              </div>
            )}

            {/* Complete Order Button */}
            <button 
              className="btn btn-emerald btn-lg btn-complete-order"
              onClick={handleCheckout}
              disabled={cart.length === 0 || isShort}
            >
              <CheckCircle2 size={20} />
              <span>Complete Order ({formatCurrency(totalAmount)})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
