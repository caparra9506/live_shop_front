import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

interface Order {
  id: number;
  totalAmount: string;
  shippingCost?: string;
  discountAmount?: string;
  createdAt: string;
  orderType?: 'SALE' | 'CART'; // Tipo de orden
  cartStatus?: string; // Estado del carrito para órdenes en baúl
  expiresAt?: string; // Fecha de expiración para órdenes en baúl
  payment?: {
    id: number;
    reference: string;
    receiptNumber: string;
    amount: number;
    authorization?: string;
    transactionId?: string;
    invoice?: string;
    ticketId?: string;
    estado?: string;
    respuesta?: string;
    transactionDate?: string;
    fechaTransaccion?: string;
    createdAt: string;
  };
  shipping?: {
    id: number;
    numberGuide: string;
    status: string;
    message: string;
    dateCreate: string;
  };
  couponUsage?: {
    id: number;
    usedAt: string;
    coupon: {
      id: number;
      code: string;
      discountType: string;
      discountValue: number;
    };
  };
  saleDetails: {
    id: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      imageUrl: string;
    };
    productVariant?: {
      id: number;
      color?: { name: string };
      size?: { name: string };
    };
    tiktokUser?: {
      name: string;
      email: string;
      phone: string;
      address: string;
      tiktok?: string;
      documentType?: string;
      document?: string;
      personType?: string;
      city?: {
        name: string;
        code: string;
        department?: {
          name: string;
          country?: { name: string };
        };
      };
    };
  }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrdersResponse {
  data: Order[];
  pagination: PaginationInfo;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = async (page: number = 1, customLimit?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      console.log('🔍 Parámetros enviados al backend:', {
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        search: searchTerm || 'vacío',
        status: statusFilter || 'vacío',
        startDate: startDate || 'vacío',
        endDate: endDate || 'vacío'
      });

      const res = await axios.get(`${API_BASE_URL}/api/sales/orders?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Si la respuesta es un array (formato antiguo sin paginación), mantener compatibilidad
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setPagination({
          page: 1,
          limit: res.data.length,
          total: res.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        // Formato nuevo con paginación
        const response: OrdersResponse = res.data;
        setOrders(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        // Fallback en caso de respuesta inesperada
        console.warn('Formato de respuesta inesperado:', res.data);
        setOrders([]);
        setPagination({
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      setOrders([]);
      setPagination({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce para búsqueda - espera 500ms después de que el usuario deje de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filtros instantáneos (no necesitan debounce)
  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, startDate, endDate, pagination.limit]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "IN_CART":
        return "bg-purple-100 text-purple-700";
      // Estados iniciales - Amarillo
      case "GUÍA ADMITIDA":
      case "GENERADA":
      case "CREADA":
      case "RECIBIDA":
      case "PROCESADA":
        return "bg-yellow-100 text-yellow-700";
      // Estados en tránsito - Azul
      case "TRANSITO URBANO":
      case "CENTRO DE ACOPIO":
      case "TELEMERCADO":
      case "REENVÍO":
      case "REPARTO":
        return "bg-blue-100 text-blue-700";
      // Estados entregado - Verde
      case "ENTREGADA":
      case "FINALIZADA":
        return "bg-green-100 text-green-700";
      // Estados cancelado/devuelto - Rojo
      case "DEVOLUCIÓN RATIFICADA":
      case "DEVUELTA":
      case "CANCELADA":
      case "NO_ENTREGADA":
      case "RETENIDA":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "IN_CART": return "En Baúl";
      // Estados iniciales
      case "GUÍA ADMITIDA": return "Guía Admitida";
      case "GENERADA": return "Generada";
      case "CREADA": return "Creada";
      case "RECIBIDA": return "Recibida";
      case "PROCESADA": return "Procesada";
      // Estados en tránsito
      case "TRANSITO URBANO": return "Tránsito Urbano";
      case "CENTRO DE ACOPIO": return "Centro de Acopio";
      case "TELEMERCADO": return "Telemercadeo";
      case "REENVÍO": return "Reenvío";
      case "REPARTO": return "En Reparto";
      // Estados finales exitosos
      case "ENTREGADA": return "Entregada";
      case "FINALIZADA": return "Finalizada";
      // Estados devueltos/cancelados
      case "DEVOLUCIÓN RATIFICADA": return "Devolución Ratificada";
      case "DEVUELTA": return "Devuelta";
      case "CANCELADA": return "Cancelada";
      case "NO_ENTREGADA": return "No Entregada";
      case "RETENIDA": return "Retenida";
      default: return status;
    }
  };

  const handleStatusChange = async (guideNumber: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/shipments/status/${guideNumber}`,
        { status: newStatus},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.shipping?.numberGuide === guideNumber
            ? { ...o, shipping: { ...o.shipping, status: newStatus } }
            : o
        )
      );
      console.log(`✅ Estado actualizado: ${guideNumber} -> ${newStatus}`);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert('Error al actualizar el estado del envío. Por favor intenta de nuevo.');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchOrders(1, newLimit);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Órdenes</h1>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} órdenes
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email, teléfono, producto, guía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="IN_CART">En Baúl</option>
              {/* Estados iniciales */}
              <option value="GUÍA ADMITIDA">Guía Admitida</option>
              <option value="GENERADA">Generada</option>
              <option value="CREADA">Creada</option>
              <option value="RECIBIDA">Recibida</option>
              <option value="PROCESADA">Procesada</option>
              {/* Estados en tránsito */}
              <option value="TRANSITO URBANO">Tránsito Urbano</option>
              <option value="CENTRO DE ACOPIO">Centro de Acopio</option>
              <option value="TELEMERCADO">Telemercadeo</option>
              <option value="REENVÍO">Reenvío</option>
              <option value="REPARTO">En Reparto</option>
              {/* Estados finales */}
              <option value="ENTREGADA">Entregada</option>
              <option value="FINALIZADA">Finalizada</option>
              {/* Estados cancelados */}
              <option value="DEVOLUCIÓN RATIFICADA">Devolución Ratificada</option>
              <option value="DEVUELTA">Devuelta</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="NO_ENTREGADA">No Entregada</option>
              <option value="RETENIDA">Retenida</option>
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Vista desktop: Tabla */}
      <div className="hidden lg:block bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando órdenes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Guía</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td className="p-3 font-medium">
                        {order.orderType === 'CART' ? `BL-${order.id}` : `OR-${order.id}`}
                      </td>
                      <td className="p-3">{order.saleDetails[0]?.tiktokUser?.name || 'N/A'}</td>
                      <td className="p-3">
                        {order.saleDetails?.map(detail => detail.product?.name).join(', ') || 'N/A'}
                      </td>
                      <td className="p-3">{order.saleDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 1}</td>
                      <td className="p-3">
                        {new Date(order.createdAt).toLocaleDateString("es-CO")}
                      </td>
                      <td className="p-3 font-semibold">
                        ${Number(order.totalAmount).toLocaleString("es-CO")}
                      </td>
                      <td className="p-3">
                        {order.shipping?.status === 'IN_CART' || order.orderType === 'CART' ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.shipping?.status || 'IN_CART')}`}>
                            {order.shipping?.status === 'CANCELLED' ? 'Cancelado (Expirado)' : 'En Baúl'}
                          </span>
                        ) : (
                          <select
                            value={order.shipping?.status || 'GUÍA ADMITIDA'}
                            onChange={(e) =>
                              handleStatusChange(order.shipping?.numberGuide || '', e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2 py-1 rounded-full text-xs font-semibold border-none cursor-pointer ${getStatusColor(
                              order.shipping?.status || 'GUÍA ADMITIDA'
                            )}`}
                          >
                            <option value="GUÍA ADMITIDA">Guía Admitida</option>
                            <option value="GENERADA">Generada</option>
                            <option value="TRANSITO URBANO">Tránsito Urbano</option>
                            <option value="CENTRO DE ACOPIO">Centro de Acopio</option>
                            <option value="REPARTO">En Reparto</option>
                            <option value="ENTREGADA">Entregada</option>
                            <option value="FINALIZADA">Finalizada</option>
                            <option value="DEVUELTA">Devuelta</option>
                            <option value="CANCELADA">Cancelada</option>
                          </select>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {order.shipping?.numberGuide || "N/A"}
                        {order.shipping?.message && (
                          <a
                            href={order.shipping.message}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block text-blue-500 underline mt-1 hover:text-blue-700"
                          >
                            Ver Guía
                          </a>
                        )}
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={8} className="px-4 py-6">
                          {/* Resumen de costos */}
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">💰 Desglose de Costos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="font-medium">Productos:</span>
                                <span className="ml-1 font-bold">
                                  ${(
                                    parseFloat(order.totalAmount) 
                                    - (order.shippingCost ? parseFloat(order.shippingCost) : 0)
                                    + (order.discountAmount ? parseFloat(order.discountAmount) : 0)
                                  ).toLocaleString()} COP
                                </span>
                              </div>
                              {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                                <div>
                                  <span className="font-medium">Descuento:</span>
                                  <span className="ml-1 font-bold text-red-600">
                                    -${parseFloat(order.discountAmount).toLocaleString()} COP
                                  </span>
                                </div>
                              )}
                              {order.shippingCost && parseFloat(order.shippingCost) > 0 && (
                                <div>
                                  <span className="font-medium">Envío:</span>
                                  <span className="ml-1 font-bold">
                                    ${parseFloat(order.shippingCost).toLocaleString()} COP
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Total:</span>
                                <span className="ml-1 font-bold text-blue-600">
                                  ${parseFloat(order.totalAmount).toLocaleString()} COP
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Detalles de productos */}
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-green-800 mb-3">🛍️ Productos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {order.saleDetails?.map((detail, index) => (
                                <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                                  <div className="flex items-start gap-3">
                                    {detail.product?.imageUrl && (
                                      <img 
                                        src={detail.product.imageUrl} 
                                        alt={detail.product.name}
                                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-sm font-medium text-gray-900 truncate">
                                        {detail.product?.name || 'Producto sin nombre'}
                                      </h5>
                                      {detail.productVariant && (
                                        <div className="mt-1 space-y-1">
                                          {detail.productVariant.color && (
                                            <p className="text-xs text-gray-600">
                                              Color: <span className="font-medium">{detail.productVariant.color.name}</span>
                                            </p>
                                          )}
                                          {detail.productVariant.size && (
                                            <p className="text-xs text-gray-600">
                                              Talla: <span className="font-medium">{detail.productVariant.size.name}</span>
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      <div className="mt-2 flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Cant: {detail.quantity}</span>
                                        <span className="text-sm font-semibold text-green-600">
                                          ${Number(detail.price).toLocaleString('es-CO')} COP
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className={`grid grid-cols-1 gap-4 ${
                            order.couponUsage ? 'md:grid-cols-4' : 'md:grid-cols-3'
                          }`}>
                            {/* Datos de cupón */}
                            {order.couponUsage && (
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <h4 className="text-sm font-semibold text-orange-800 mb-2">🎟️ Cupón Aplicado</h4>
                                <div className="space-y-1 text-xs">
                                  <p><span className="font-medium">Código:</span> 
                                    <span className="ml-1 px-2 py-0.5 bg-orange-200 text-orange-800 rounded font-mono">
                                      {order.couponUsage.coupon.code}
                                    </span>
                                  </p>
                                  <p><span className="font-medium">Descuento:</span> 
                                    {order.couponUsage.coupon.discountType === 'PERCENTAGE' 
                                      ? `${order.couponUsage.coupon.discountValue}%`
                                      : `$${order.couponUsage.coupon.discountValue.toLocaleString()} COP`
                                    }
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Datos de pago */}
                            {order.payment && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">💳 Información de Pago</h4>
                                <div className="space-y-1 text-xs">
                                  <p><span className="font-medium">Referencia:</span> {order.payment.reference}</p>
                                  <p><span className="font-medium">Recibo:</span> {order.payment.receiptNumber}</p>
                                  <p><span className="font-medium">Estado:</span> 
                                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                      order.payment.estado === 'Aceptada' ? 'bg-green-100 text-green-800' : 
                                      order.payment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {order.payment.estado || 'Sin estado'}
                                    </span>
                                  </p>
                                  {order.payment.authorization && (
                                    <p><span className="font-medium">Autorización:</span> {order.payment.authorization}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Datos del comprador */}
                            {order.saleDetails[0]?.tiktokUser && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h4 className="text-sm font-semibold text-green-800 mb-2">👤 Datos del Comprador</h4>
                                <div className="space-y-1 text-xs">
                                  <p><span className="font-medium">Nombre:</span> {order.saleDetails[0].tiktokUser.name}</p>
                                  <p><span className="font-medium">Email:</span> {order.saleDetails[0].tiktokUser.email}</p>
                                  <p><span className="font-medium">Teléfono:</span> {order.saleDetails[0].tiktokUser.phone}</p>
                                  <p><span className="font-medium">Dirección:</span> {order.saleDetails[0].tiktokUser.address}</p>
                                  {order.saleDetails[0].tiktokUser.city && (
                                    <p><span className="font-medium">Ciudad:</span> {order.saleDetails[0].tiktokUser.city.name}</p>
                                  )}
                                  {order.saleDetails[0].tiktokUser.tiktok && (
                                    <p><span className="font-medium">TikTok:</span> @{order.saleDetails[0].tiktokUser.tiktok}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Datos de envío o información del baúl */}
                            {order.orderType === 'CART' ? (
                              <div className={`p-3 rounded-lg ${order.shipping?.status === 'CANCELLED' ? 'bg-red-50' : 'bg-purple-50'}`}>
                                <h4 className={`text-sm font-semibold mb-2 ${order.shipping?.status === 'CANCELLED' ? 'text-red-800' : 'text-purple-800'}`}>
                                  {order.shipping?.status === 'CANCELLED' ? '❌ Baúl Cancelado' : '🛒 Información del Baúl'}
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <p><span className="font-medium">Estado:</span> 
                                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${order.shipping?.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                      {order.shipping?.status === 'CANCELLED' ? 'Cancelado por expiración' : 'En Baúl (Sin pago)'}
                                    </span>
                                  </p>
                                  {order.expiresAt && (
                                    <p><span className="font-medium">
                                      {order.shipping?.status === 'CANCELLED' ? 'Expiró:' : 'Expira:'}
                                    </span> 
                                      <span className="ml-1 font-bold text-red-600">
                                        {new Date(order.expiresAt).toLocaleDateString('es-CO')} a las {new Date(order.expiresAt).toLocaleTimeString('es-CO')}
                                      </span>
                                    </p>
                                  )}
                                  <p><span className="font-medium">Fecha de creación:</span> 
                                    {new Date(order.createdAt).toLocaleDateString('es-CO')}
                                  </p>
                                  <p className={`font-medium ${order.shipping?.status === 'CANCELLED' ? 'text-red-600' : 'text-purple-600'}`}>
                                    {order.shipping?.status === 'CANCELLED' ? '❌ Cancelado sin pago' : '⚠️ Pendiente de pago'}
                                  </p>
                                </div>
                              </div>
                            ) : order.shipping && (
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <h4 className="text-sm font-semibold text-purple-800 mb-2">📦 Información de Envío</h4>
                                <div className="space-y-1 text-xs">
                                  <p><span className="font-medium">Guía:</span> {order.shipping.numberGuide}</p>
                                  <p><span className="font-medium">Estado:</span> 
                                    <span className="ml-1 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                                      {getStatusLabel(order.shipping.status)}
                                    </span>
                                  </p>
                                  {order.shippingCost && parseFloat(order.shippingCost) > 0 && (
                                    <p><span className="font-medium">Costo:</span> 
                                      <span className="ml-1 font-bold text-purple-800">
                                        ${parseFloat(order.shippingCost).toLocaleString()} COP
                                      </span>
                                    </p>
                                  )}
                                  <p><span className="font-medium">Fecha:</span> 
                                    {new Date(order.shipping.dateCreate).toLocaleDateString('es-CO')}
                                  </p>
                                  {order.shipping.message && (
                                    <a 
                                      href={order.shipping.message} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                      Ver PDF de guía
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vista mobile: Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando órdenes...</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {order.orderType === 'CART' ? `BL-${order.id}` : `OR-${order.id}`}
                  </h3>
                  <p className="text-sm text-gray-600">{order.saleDetails[0]?.tiktokUser?.name || 'N/A'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.shipping?.status || 'PENDING')}`}>
                  {getStatusLabel(order.shipping?.status || 'PENDING')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-600">Producto:</span>
                  <p className="font-medium truncate">{order.saleDetails[0]?.product?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Cantidad:</span>
                  <p className="font-medium">{order.saleDetails?.reduce((sum, detail) => sum + detail.quantity, 0) || 1}</p>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("es-CO")}</p>
                </div>
                <div>
                  <span className="text-gray-600">Monto:</span>
                  <p className="font-semibold text-green-600">${Number(order.totalAmount).toLocaleString("es-CO")}</p>
                </div>
              </div>

              {order.shipping?.numberGuide && (
                <div className="text-sm border-t pt-3">
                  <span className="text-gray-600">Guía:</span>
                  <p className="font-medium">{order.shipping.numberGuide}</p>
                  {order.shipping.message && (
                    <a
                      href={order.shipping.message}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700 text-xs"
                    >
                      Ver Guía
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleExpand(order.id)}
                className="mt-3 w-full p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                {expandedOrderId === order.id ? 'Ocultar detalles' : 'Ver detalles'}
              </button>

              {expandedOrderId === order.id && (
                <div className="mt-3 pt-3 border-t space-y-3 text-sm">
                  {/* Desglose de costos */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💰 Desglose de Costos</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Productos:</span>
                        <span className="font-bold">
                          ${(
                            parseFloat(order.totalAmount) 
                            - (order.shippingCost ? parseFloat(order.shippingCost) : 0)
                            + (order.discountAmount ? parseFloat(order.discountAmount) : 0)
                          ).toLocaleString()} COP
                        </span>
                      </div>
                      {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento:</span>
                          <span className="font-bold text-red-600">
                            -${parseFloat(order.discountAmount).toLocaleString()} COP
                          </span>
                        </div>
                      )}
                      {order.shippingCost && parseFloat(order.shippingCost) > 0 && (
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span className="font-bold">
                            ${parseFloat(order.shippingCost).toLocaleString()} COP
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-blue-600">
                          ${parseFloat(order.totalAmount).toLocaleString()} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de pago */}
                  {order.payment && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">💳 Información de Pago</h4>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium">Estado:</span> 
                          <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                            order.payment.estado === 'Aceptada' ? 'bg-green-100 text-green-800' : 
                            order.payment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.payment.estado || 'Sin estado'}
                          </span>
                        </p>
                        <p><span className="font-medium">Referencia:</span> {order.payment.reference}</p>
                        <p><span className="font-medium">Recibo:</span> {order.payment.receiptNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Información del comprador */}
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p>{order.saleDetails[0]?.tiktokUser?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Teléfono:</span>
                      <p>{order.saleDetails[0]?.tiktokUser?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Dirección:</span>
                      <p>{order.saleDetails[0]?.tiktokUser?.address || 'N/A'}, {order.saleDetails[0]?.tiktokUser?.city?.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Control de estado de envío */}
                  <div className="pt-2">
                    <label className="block font-medium text-gray-700 mb-1">Estado de Envío:</label>
                    {order.shipping?.status === 'IN_CART' || order.orderType === 'CART' ? (
                      <div className={`p-2 text-center rounded ${getStatusColor(order.shipping?.status || 'IN_CART')}`}>
                        {order.shipping?.status === 'CANCELLED' ? 'Cancelado (Expirado)' : 'En Baúl (Sin pago)'}
                      </div>
                    ) : (
                      <select
                        value={order.shipping?.status || 'GUÍA ADMITIDA'}
                        onChange={(e) => handleStatusChange(order.shipping?.numberGuide || '', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="GUÍA ADMITIDA">Guía Admitida</option>
                        <option value="GENERADA">Generada</option>
                        <option value="TRANSITO URBANO">Tránsito Urbano</option>
                        <option value="CENTRO DE ACOPIO">Centro de Acopio</option>
                        <option value="REPARTO">En Reparto</option>
                        <option value="ENTREGADA">Entregada</option>
                        <option value="FINALIZADA">Finalizada</option>
                        <option value="DEVUELTA">Devuelta</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {!loading && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-sm text-gray-600">
              Mostrando {orders.length} de {pagination.total} órdenes
              (Página {pagination.page} de {pagination.totalPages})
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Por página:</label>
              <select
                value={pagination.limit}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const page = Math.max(1, pagination.page - 2) + i;
                if (page > pagination.totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron órdenes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}