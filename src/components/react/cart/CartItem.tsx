import { useState } from 'react';
import type { CartItem as CartItemType } from '../../../types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => Promise<void>;
  onRemove: () => Promise<void>;
  loading: boolean;
}

export default function CartItem({ item, onUpdateQuantity, onRemove, loading }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setQuantity(newQuantity);
    
    if (newQuantity === 0) {
      handleRemove();
      return;
    }

    setUpdating(true);
    try {
      await onUpdateQuantity(newQuantity);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (confirm('¿Eliminar este producto del baúl?')) {
      setUpdating(true);
      try {
        await onRemove();
      } finally {
        setUpdating(false);
      }
    } else {
      setQuantity(item.quantity); // Restaurar cantidad si se cancela
    }
  };

  const isOutOfStock = item.product.stock < quantity;

  return (
    <div className={`p-4 ${updating ? 'opacity-50' : ''} ${isOutOfStock ? 'bg-red-50' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-20 w-20 rounded-lg object-cover"
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.product.name}
          </h3>
          
          {/* Variantes */}
          {item.productVariant && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.productVariant.color && (
                <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
                  Color: {item.productVariant.color.name}
                </span>
              )}
              {item.productVariant.size && (
                <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
                  Talla: {item.productVariant.size.name}
                </span>
              )}
            </div>
          )}

          {/* Stock warning */}
          {isOutOfStock && (
            <div className="mt-1 text-xs text-red-600 font-medium">
              ⚠️ Stock insuficiente (Disponible: {item.product.stock})
            </div>
          )}

          {/* Precio */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Precio unitario:</span>
              <span className="ml-1 font-medium">${parseFloat(item.price).toLocaleString()} COP</span>
            </div>
            
            <div className="text-sm font-bold text-blue-600">
              Subtotal: ${parseFloat(item.subtotal).toLocaleString()} COP
            </div>
          </div>

          {/* Fecha agregada */}
          <div className="mt-1 text-xs text-gray-500">
            Agregado: {new Date(item.addedAt).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Controles de cantidad */}
        <div className="flex-shrink-0 flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={updating || loading || quantity <= 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            
            <input
              type="number"
              min="0"
              max={item.product.stock}
              value={quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value) || 0;
                handleQuantityChange(newQty);
              }}
              disabled={updating || loading}
              className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
            />
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating || loading || quantity >= item.product.stock}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={updating || loading}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
          >
            {updating ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {updating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}