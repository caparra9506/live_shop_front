import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@config/api';

interface ExpiredCartPaymentProps {
  cartId?: string;
  token?: string;
}

export default function ExpiredCartPayment({ cartId, token }: ExpiredCartPaymentProps) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [storeConfig, setStoreConfig] = useState<any>(null);

  useEffect(() => {
    if (cartId && token) {
      loadExpiredCart();
      loadBanks();
    }
  }, [cartId, token]);

  const loadExpiredCart = async () => {
    try {
      setLoading(true);
      
      // Cargar carrito expirado
      const response = await axios.get(
        `${API_BASE_URL}/api/cart/expired/${cartId}`
      );

      if (response.data.success) {
        const cartData = response.data.data;
        setCart(cartData);
        
        // Verificar configuración del baúl
        if (cartData.store?.name) {
          await checkStoreConfig(cartData.store.name);
        }
      } else {
        setError('Carrito no encontrado o enlace inválido');
      }
    } catch (error: any) {
      console.error('Error cargando carrito expirado:', error);
      setError(error.response?.data?.message || 'Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const checkStoreConfig = async (storeName: string) => {
    try {
      const configResponse = await axios.get(
        `${API_BASE_URL}/api/store-config/public/${storeName}`
      );
      
      const config = configResponse.data;
      setStoreConfig(config);
      
      // Si el baúl está deshabilitado, mostrar error específico
      if (!config.cartEnabled) {
        setError('El baúl de compras ya no está disponible para esta tienda. Contacta al vendedor directamente.');
      }
    } catch (error) {
      console.error('Error verificando configuración de tienda:', error);
      // No mostrar error si no se puede obtener la configuración
    }
  };

  const loadBanks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/banks/default`);
      setBanks(response.data.data || []);
    } catch (error) {
      console.error('Error cargando bancos:', error);
    }
  };

  const processPayment = async () => {
    if (!selectedBank) {
      alert('Por favor selecciona un banco');
      return;
    }

    setProcessing(true);

    try {
      // Crear venta desde carrito expirado
      const saleData = {
        cartId: cart.id,
        bankCode: selectedBank,
        expiredCartToken: token
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/sales/from-expired-cart`,
        saleData
      );

      if (response.data.success && response.data.urlBanco) {
        // Redirigir al banco
        window.location.href = response.data.urlBanco;
      } else {
        throw new Error('Error procesando el pago');
      }
    } catch (error: any) {
      console.error('Error procesando pago:', error);
      alert(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Es posible que el enlace haya expirado o sea inválido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-blue-800">⏰ Tu Baúl ha Expirado</h1>
          </div>
          <p className="text-blue-700">
            El tiempo límite de tu baúl venció, pero aún puedes completar tu compra.
            Tus productos siguen reservados y los precios se mantienen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Información del cliente */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">📍 Información de Entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={cart.tiktokUser.name}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={cart.tiktokUser.phone}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={cart.tiktokUser.email}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={cart.tiktokUser.address}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={cart.tiktokUser.city?.name || 'No especificada'}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Selección de banco */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">🏦 Método de Pago</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona tu banco
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona un banco</option>
                  {banks.map((bank: any, index) => (
                    <option key={index} value={bank.bankCode}>
                      {bank.bankName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resumen de la compra */}
          <div className="lg:col-span-5">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">🛒 Productos en tu Baúl</h2>
              <div className="space-y-4">
                {cart.cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      {item.productVariant && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.productVariant.color?.name && `Color: ${item.productVariant.color.name}`}
                          {item.productVariant.size?.name && ` | Talla: ${item.productVariant.size.name}`}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        Cantidad: {item.quantity} × ${parseFloat(item.price).toLocaleString()} COP
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        Subtotal: ${parseFloat(item.subtotal).toLocaleString()} COP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen total */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">💰 Resumen de Pago</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal productos:</span>
                  <span className="font-medium">
                    ${cart.cartItems.reduce((sum: number, item: any) => 
                      sum + parseFloat(item.subtotal), 0
                    ).toLocaleString()} COP
                  </span>
                </div>
                
                {cart.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Costo de envío:</span>
                    <span className="font-medium">${parseFloat(cart.shippingCost).toLocaleString()} COP</span>
                  </div>
                )}

                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="font-medium text-red-600">-${parseFloat(cart.discountAmount).toLocaleString()} COP</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a pagar:</span>
                    <span className="text-blue-600">${parseFloat(cart.totalAmount).toLocaleString()} COP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={processPayment}
              disabled={processing || !selectedBank}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando Pago...
                </div>
              ) : (
                '💳 Proceder al Pago'
              )}
            </button>

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="space-y-1">
                <p>🔒 Pago seguro y encriptado</p>
                <p>📦 Envío procesado inmediatamente</p>
                <p>📧 Confirmación por email</p>
                <p>🕐 Creado: {new Date(cart.createdAt).toLocaleString('es-CO')}</p>
                <p>⏰ Expiró: {new Date(cart.expiresAt).toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}