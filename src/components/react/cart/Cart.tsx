import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@config/api';
import type { Cart, TimeRemaining, AddItemToCartDto, UpdateCartItemDto } from '../../../types/cart';
import CartTimer from './CartTimer';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

interface CartProps {
  userTikTokId: number;
  storeName: string;
  onCartChange?: (cart: Cart | null) => void;
}

export default function Cart({ userTikTokId, storeName, onCartChange }: CartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserCart();
  }, [userTikTokId, storeName]);

  useEffect(() => {
    if (cart) {
      onCartChange?.(cart);
      startTimeTracking();
    } else {
      onCartChange?.(null);
    }
  }, [cart]);

  const loadUserCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/cart/user/${userTikTokId}?storeName=${encodeURIComponent(storeName)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success && response.data.data) {
        setCart(response.data.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error al cargar el carrito');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const createCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/create`,
        {
          userTikTokId,
          storeName,
          timeoutHours: 48
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Error creando carrito:', error);
      setError('Error al crear el carrito');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (dto: Omit<AddItemToCartDto, 'cartId'>) => {
    if (!cart) {
      await createCart();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add-item`,
        {
          cartId: cart.id,
          ...dto
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        await loadUserCart(); // Recargar el carrito completo
      }
    } catch (error: any) {
      console.error('Error agregando item al carrito:', error);
      setError(error.response?.data?.message || 'Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (dto: UpdateCartItemDto) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update-item`,
        dto,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        await loadUserCart();
      }
    } catch (error: any) {
      console.error('Error actualizando item:', error);
      setError(error.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (cartItemId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/remove-item/${cartItemId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        await loadUserCart();
      }
    } catch (error: any) {
      console.error('Error eliminando item:', error);
      setError(error.response?.data?.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  const extendCartTime = async (additionalHours: number) => {
    if (!cart) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_BASE_URL}/api/cart/extend/${cart.id}`,
        { additionalHours },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        await loadUserCart();
      }
    } catch (error: any) {
      console.error('Error extendiendo tiempo:', error);
      setError(error.response?.data?.message || 'Error al extender tiempo');
    } finally {
      setLoading(false);
    }
  };

  const startTimeTracking = () => {
    if (!cart) return;

    const updateTimeRemaining = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/cart/time-remaining/${cart.id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        if (response.data.success) {
          const timeData = response.data.data;
          setTimeRemaining(timeData);

          if (timeData.expired) {
            await loadUserCart(); // Recargar para ver si el carrito fue marcado como expirado
          }
        }
      } catch (error) {
        console.error('Error obteniendo tiempo restante:', error);
      }
    };

    // Actualizar inmediatamente
    updateTimeRemaining();

    // Actualizar cada 10 segundos
    const interval = setInterval(updateTimeRemaining, 10000);

    return () => clearInterval(interval);
  };

  const processCartNow = async () => {
    if (!cart) return;

    if (confirm('¿Procesar el carrito y realizar el pago ahora?')) {
      try {
        setLoading(true);
        setError(null);

        // Aquí iría la lógica para procesar el pago inmediatamente
        // Por ahora solo simularemos el proceso
        alert('Redirigiendo al proceso de pago...');
        
      } catch (error: any) {
        console.error('Error procesando carrito:', error);
        setError(error.response?.data?.message || 'Error al procesar el carrito');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando baúl...</span>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tu baúl está vacío</h3>
        <p className="text-gray-500 mb-4">
          Agrega productos y tendrás 48 horas para completar tu compra
        </p>
        <button
          onClick={createCart}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Baúl
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Timer del carrito */}
      <CartTimer 
        timeRemaining={timeRemaining}
        onExtendTime={extendCartTime}
        onProcessNow={processCartNow}
      />

      {/* Items del carrito */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">🛒 Tu Baúl ({cart.cartItems.length} productos)</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {cart.cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) => 
                updateCartItem({ cartItemId: item.id, quantity })
              }
              onRemove={() => removeCartItem(item.id)}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Resumen del carrito */}
      <CartSummary 
        cart={cart}
        onProcessCart={processCartNow}
        loading={loading}
      />
    </div>
  );
}