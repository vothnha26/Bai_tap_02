import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cart.service';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data || { items: [], totalAmount: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart || { items: [], totalAmount: 0 });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await cartService.updateQuantity(productId, quantity);
      setCart(updatedCart || { items: [], totalAmount: 0 });
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart || { items: [], totalAmount: 0 });
    } catch (err) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart || { items: [], totalAmount: 0 });
    } catch (err) {
      setError(err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    itemCount: (cart && Array.isArray(cart.items) ? cart.items : []).reduce((total, item) => total + (item.quantity || 0), 0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
