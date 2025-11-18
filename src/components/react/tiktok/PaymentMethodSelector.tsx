import { useState, useEffect } from 'react';

interface PaymentMethodSelectorProps {
  onPayNow: () => void;
  onAddToCart: () => void;
  loadingSale: boolean;
  disabledPayNow: boolean;
  disabledAddToCart: boolean;
  cartTimeoutDays: number;
  cartEnabled?: boolean;
}

export default function PaymentMethodSelector({ 
  onPayNow, 
  onAddToCart, 
  loadingSale, 
  disabledPayNow,
  disabledAddToCart,
  cartTimeoutDays,
  cartEnabled = true
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'immediate' | 'cart' | null>(null);

  // Si el carrito no está habilitado, seleccionar automáticamente pago inmediato
  useEffect(() => {
    if (!cartEnabled && selectedMethod !== 'immediate') {
      setSelectedMethod('immediate');
    }
  }, [cartEnabled]);

  const handleMethodSelect = (method: 'immediate' | 'cart') => {
    setSelectedMethod(method);
  };

  const handleConfirm = () => {
    if (selectedMethod === 'immediate' && !disabledPayNow) {
      onPayNow();
    } else if (selectedMethod === 'cart' && !disabledAddToCart) {
      onAddToCart();
    }
  };

  const isButtonDisabled = () => {
    if (!selectedMethod || loadingSale) return true;
    if (selectedMethod === 'immediate') return disabledPayNow;
    if (selectedMethod === 'cart') return disabledAddToCart;
    return false;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">
        {cartEnabled ? '🛒 ¿Cómo deseas proceder?' : '💳 Finalizar Compra'}
      </h3>
      
      {/* Opciones de método */}
      <div className="space-y-3">
        {/* Pago Inmediato */}
        <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
          selectedMethod === 'immediate' 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="immediate"
            className="sr-only"
            onChange={() => handleMethodSelect('immediate')}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedMethod === 'immediate' 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300'
              }`}>
                {selectedMethod === 'immediate' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">💳 Pagar Inmediatamente</h4>
                <p className="text-sm text-gray-600">Proceso de pago instantáneo</p>
              </div>
            </div>
          </div>
        </label>

        {/* Agregar al Baúl - Solo mostrar si está habilitado */}
        {cartEnabled && (
          <label className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'cart' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cart"
              className="sr-only"
              onChange={() => handleMethodSelect('cart')}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedMethod === 'cart' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === 'cart' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">🛒 Agregar al Baúl</h4>
                  <p className="text-sm text-gray-600">Tienes {cartTimeoutDays} días para decidir</p>
                </div>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Información adicional según la selección */}
      {selectedMethod && (
        <div className={`p-3 rounded-lg text-sm ${
          selectedMethod === 'immediate' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
        }`}>
          {selectedMethod === 'immediate' ? (
            <p className="text-center">
              <span className="font-medium">🚀 Pago Inmediato:</span> Serás redirigido a la pasarela de pago y recibirás la guía por WhatsApp.
            </p>
          ) : (
            <p className="text-center">
              <span className="font-medium">⏰ Baúl de Compras:</span> Los productos se reservan por {cartTimeoutDays} días. Recibirás el link de pago cuando expire el tiempo.
            </p>
          )}
        </div>
      )}

      {/* Botón de confirmación */}
      <button
        className={`w-full py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          !selectedMethod 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : selectedMethod === 'immediate'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        onClick={handleConfirm}
        disabled={isButtonDisabled()}
      >
        {loadingSale ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        ) : !selectedMethod ? (
          'Selecciona una opción'
        ) : selectedMethod === 'immediate' ? (
          disabledPayNow ? '⚠️ Selecciona envío y banco' : '💳 Proceder al Pago'
        ) : (
          disabledAddToCart ? '⚠️ Completar información requerida' : `🛒 Agregar al Baúl (${cartTimeoutDays} días)`
        )}
      </button>
    </div>
  );
}