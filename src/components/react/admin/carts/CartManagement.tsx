import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';
import { Clock, Eye, Send, RefreshCw, Calendar, User, Package, ShoppingCart, AlertCircle } from 'lucide-react';

interface CartItem {
  id: number;
  quantity: number;
  price: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
  productVariant?: {
    color?: { name: string };
    size?: { name: string };
  };
}

interface Cart {
  id: number;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: string;
  shippingCost: string;
  discountAmount: string;
  expiresAt: string;
  timeoutDays: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
  tiktokUser: {
    id: number;
    name: string;
    email: string;
    phone: string;
    tiktok?: string;
  };
  store: {
    id: number;
    name: string;
  };
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export default function CartManagement() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCartId, setExpandedCartId] = useState<number | null>(null);
  const [timeRemainingMap, setTimeRemainingMap] = useState<Record<number, TimeRemaining>>({});

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await axios.get(`${API_BASE_URL}/api/cart/all?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = res.data.data || res.data;
      setCarts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar carritos:", error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCarts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchCarts();
  }, [statusFilter]);

  // Update time remaining for active carts
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeMap: Record<number, TimeRemaining> = {};
      carts.forEach(cart => {
        if (cart.status === 'ACTIVE') {
          newTimeMap[cart.id] = getTimeRemaining(cart.expiresAt);
        }
      });
      setTimeRemainingMap(newTimeMap);
    }, 1000);

    return () => clearInterval(interval);
  }, [carts]);

  const getTimeRemaining = (expiresAt: string): TimeRemaining => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'EXPIRED': return 'bg-orange-100 text-orange-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'EXPIRED': return 'Expirado';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const handleExtendCart = async (cartId: number) => {
    try {
      const days = prompt('¿Cuántos días adicionales quieres agregar?', '1');
      if (!days || isNaN(Number(days))) return;

      await axios.put(
        `${API_BASE_URL}/api/cart/extend/${cartId}`,
        { additionalDays: Number(days) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchCarts();
      alert(`Carrito extendido por ${days} días adicionales`);
    } catch (error) {
      console.error("Error al extender carrito:", error);
      alert('Error al extender el carrito');
    }
  };

  const handleGeneratePaymentLink = async (cartId: number) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/cart/generate-payment-link`,
        { cartId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const paymentLink = res.data.data.link;
      navigator.clipboard.writeText(paymentLink);
      alert(`Link de pago copiado al portapapeles:\n${paymentLink}`);
    } catch (error) {
      console.error("Error al generar link de pago:", error);
      alert('Error al generar link de pago');
    }
  };

  const formatTimeRemaining = (time: TimeRemaining) => {
    if (time.expired) return <span className="text-red-600 font-bold">Expirado</span>;
    return (
      <span className={`font-mono ${time.days === 0 && time.hours < 2 ? 'text-red-600' : 'text-orange-600'}`}>
        {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
      </span>
    );
  };

  const toggleExpand = (cartId: number) => {
    setExpandedCartId(expandedCartId === cartId ? null : cartId);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-purple-600" />
          Gestión de Carritos
        </h1>
        <div className="text-sm text-gray-600">
          Total: {carts.length} carritos
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar usuario
            </label>
            <input
              type="text"
              placeholder="Nombre, email, teléfono, @tiktok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="EXPIRED">Expirados</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de carritos */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando carritos...</p>
          </div>
        ) : carts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron carritos</p>
          </div>
        ) : (
          carts.map((cart) => (
            <div key={cart.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Header del carrito */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Carrito #{cart.id}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {cart.tiktokUser.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {cart.cartItems.length} producto(s)
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(cart.createdAt).toLocaleDateString('es-CO')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(cart.status)}`}>
                      {getStatusLabel(cart.status)}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${Number(cart.totalAmount).toLocaleString()} COP
                      </div>
                      {cart.status === 'ACTIVE' && timeRemainingMap[cart.id] && (
                        <div className="text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeRemaining(timeRemainingMap[cart.id])}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => toggleExpand(cart.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    {expandedCartId === cart.id ? 'Ocultar' : 'Ver detalles'}
                  </button>

                  {cart.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleExtendCart(cart.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Extender tiempo
                    </button>
                  )}

                  {(cart.status === 'EXPIRED' || cart.status === 'ACTIVE') && (
                    <button
                      onClick={() => handleGeneratePaymentLink(cart.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <Send className="h-4 w-4" />
                      Generar link de pago
                    </button>
                  )}
                </div>
              </div>

              {/* Detalles expandidos */}
              {expandedCartId === cart.id && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del usuario */}
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">👤 Información del Cliente</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Nombre:</span>
                          <span className="ml-2">{cart.tiktokUser.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="ml-2">{cart.tiktokUser.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Teléfono:</span>
                          <span className="ml-2">{cart.tiktokUser.phone}</span>
                        </div>
                        {cart.tiktokUser.tiktok && (
                          <div>
                            <span className="font-medium text-gray-600">TikTok:</span>
                            <span className="ml-2">@{cart.tiktokUser.tiktok}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del carrito */}
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">🛒 Detalles del Carrito</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Subtotal:</span>
                          <span className="ml-2 font-bold">
                            ${(
                              Number(cart.totalAmount) - 
                              Number(cart.shippingCost) + 
                              Number(cart.discountAmount)
                            ).toLocaleString()} COP
                          </span>
                        </div>
                        {Number(cart.discountAmount) > 0 && (
                          <div>
                            <span className="font-medium text-gray-600">Descuento:</span>
                            <span className="ml-2 text-red-600 font-bold">
                              -${Number(cart.discountAmount).toLocaleString()} COP
                            </span>
                          </div>
                        )}
                        {Number(cart.shippingCost) > 0 && (
                          <div>
                            <span className="font-medium text-gray-600">Envío:</span>
                            <span className="ml-2 font-bold">
                              ${Number(cart.shippingCost).toLocaleString()} COP
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2">
                          <span className="font-medium text-gray-600">Total:</span>
                          <span className="ml-2 text-lg font-bold text-green-600">
                            ${Number(cart.totalAmount).toLocaleString()} COP
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Expira:</span>
                          <span className="ml-2">
                            {new Date(cart.expiresAt).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Tiempo límite:</span>
                          <span className="ml-2">{cart.timeoutDays} días</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Productos en el carrito */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">📦 Productos</h4>
                    <div className="space-y-3">
                      {cart.cartItems.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.product.name}</div>
                              <div className="text-sm text-gray-600">
                                {item.productVariant?.color && (
                                  <span>Color: {item.productVariant.color.name} </span>
                                )}
                                {item.productVariant?.size && (
                                  <span>Talla: {item.productVariant.size.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {item.quantity} × ${Number(item.price).toLocaleString()}
                              </div>
                              <div className="text-sm font-bold text-blue-600">
                                ${Number(item.subtotal).toLocaleString()} COP
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}