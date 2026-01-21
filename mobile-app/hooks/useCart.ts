import { useCallback } from 'react';
import { useCartStore } from '@/store';
import { Product } from '@/types';

export function useCart() {
  const {
    items,
    isLoading,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
  } = useCartStore();

  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      addItem(product, quantity);
    },
    [addItem]
  );

  const handleRemoveFromCart = useCallback(
    (productId: string) => {
      removeItem(productId);
    },
    [removeItem]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(productId, quantity);
    },
    [updateQuantity]
  );

  const handleIncrement = useCallback(
    (productId: string) => {
      incrementQuantity(productId);
    },
    [incrementQuantity]
  );

  const handleDecrement = useCallback(
    (productId: string) => {
      decrementQuantity(productId);
    },
    [decrementQuantity]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  return {
    items,
    isLoading,
    itemCount: itemCount(),
    subtotal: subtotal(),
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    increment: handleIncrement,
    decrement: handleDecrement,
    clearCart: handleClearCart,
    getItemQuantity,
    isInCart,
  };
}

export default useCart;
