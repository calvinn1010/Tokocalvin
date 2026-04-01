import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const isInitialLoad = useRef(true);

  // Load cart from localStorage on app start ONLY (GLOBAL CART)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        console.log('[Cart] Loading from localStorage:', cart);
        setCartItems(cart);
        calculateTotal(cart);
      }
    } catch (error) {
      console.error('[Cart] Failed to load cart:', error);
      localStorage.removeItem('cart');
    }
    isInitialLoad.current = false;
  }, []);

  // Calculate total helper
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + ((item.price_per_day || 0) * (item.quantity || 1));
    }, 0);
    setCartTotal(total);
    return total;
  };

  // Save to localStorage whenever cart changes (GLOBAL CART - NOT AFFECTED BY USER CHANGES)
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    console.log('[Cart] Saving to localStorage:', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    calculateTotal(cartItems);
  }, [cartItems]);

  const addToCart = (instrument) => {
    let success = false;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === instrument.id);
      
      if (existingItem) {
        // Jika item sudah ada, cek stok sebelum menambah quantity
        if (existingItem.quantity >= instrument.stock) {
          alert(`Maksimal stok untuk ${instrument.name} adalah ${instrument.stock}`);
          return prevItems;
        }
        success = true;
        return prevItems.map(item =>
          item.id === instrument.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Tambah item baru ke cart
        if (instrument.stock > 0) {
          success = true;
          return [...prevItems, { ...instrument, quantity: 1 }];
        }
        return prevItems;
      }
    });
    return success;
  };

  const removeFromCart = (instrumentId) => {
    setCartItems((prevItems) =>
      prevItems.filter(item => item.id !== instrumentId)
    );
  };

  const updateQuantity = (instrumentId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(instrumentId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map(item => {
        if (item.id === instrumentId) {
          // Validasi tidak melebihi stok
          const validQuantity = Math.min(quantity, item.stock);
          if (quantity > item.stock) {
            alert(`Maksimal stok tercapai (${item.stock})`);
          }
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const value = {
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemsCount: cartItems.length,
    cartItemsTotalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
