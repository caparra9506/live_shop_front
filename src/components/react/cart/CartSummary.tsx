import type { Cart } from '../../../types/cart';

interface CartSummaryProps {
  cart: Cart;
  onProcessCart: () => Promise<void>;
  loading: boolean;
}

export default function CartSummary({ cart, onProcessCart, loading }: CartSummaryProps) {
  const itemsSubtotal = cart.cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const shippingCost = parseFloat(cart.shippingCost) || 0;
  const discountAmount = parseFloat(cart.discountAmount) || 0;
  const totalAmount = parseFloat(cart.totalAmount);

  const totalItems = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const hasStockIssues = cart.cartItems.some(item => 
    item.product.stock < item.quantity
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">📋 Resumen del Baúl</h3>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          <div className="text-sm text-blue-800">Productos</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-green-800">Total COP</div>
        </div>
      </div>

      {/* Desglose de costos */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal productos:</span>
          <span className="font-medium">${itemsSubtotal.toLocaleString()} COP</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Descuento:</span>
            <span className="font-medium text-red-600">-${discountAmount.toLocaleString()} COP</span>
          </div>
        )}

        {shippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Costo de envío:</span>
            <span className="font-medium">${shippingCost.toLocaleString()} COP</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total a pagar:</span>
            <span className="text-blue-600">${totalAmount.toLocaleString()} COP</span>
          </div>
        </div>
      </div>

      {/* Alertas de stock */}
      {hasStockIssues && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-2">
              <h4 className="text-sm font-medium text-red-800">Problemas de Stock</h4>
              <p className="text-sm text-red-700 mt-1">
                Algunos productos no tienen stock suficiente. Ajusta las cantidades antes de procesar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <div className="space-y-1">
          <p>• Los productos se reservan temporalmente en tu baúl</p>
          <p>• Al expirar el tiempo, se procesará automáticamente el pago</p>
          <p>• Puedes extender el tiempo o procesar manualmente</p>
          <p>• Si hay productos sin stock, el baúl se cancelará automáticamente</p>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="mb-6 p-3 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">📍 Información de Entrega</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Cliente:</strong> {cart.tiktokUser.name}</p>
          <p><strong>Email:</strong> {cart.tiktokUser.email}</p>
          <p><strong>Teléfono:</strong> {cart.tiktokUser.phone}</p>
          <p><strong>Tienda:</strong> {cart.store.name}</p>
        </div>
      </div>

      {/* Botón de acción */}
      <button
        onClick={onProcessCart}
        disabled={loading || hasStockIssues || totalItems === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          hasStockIssues || totalItems === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading 
          ? 'Procesando...' 
          : hasStockIssues 
            ? 'Corrige el Stock para Continuar'
            : totalItems === 0
              ? 'Agrega Productos al Baúl'
              : '💳 Procesar Pago Ahora'
        }
      </button>

      {/* Proceso automático */}
      <div className="mt-3 text-center text-xs text-gray-500">
        O espera a que se procese automáticamente al expirar el tiempo
      </div>
    </div>
  );
}