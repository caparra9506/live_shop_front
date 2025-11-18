import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

interface Sale {
  id: number;
  totalAmount: string;
  shippingCost?: string;
  discountAmount?: string;
  createdAt: string;
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

interface SalesResponse {
  data: Sale[];
  pagination: PaginationInfo;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchSales(1);
  }, []);

  // Debounce para búsqueda - espera 500ms después de que el usuario deje de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSales(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filtros instantáneos (no necesitan debounce)
  useEffect(() => {
    fetchSales(1);
  }, [startDate, endDate, pagination.limit]);

  const fetchSales = async (page: number = 1, customLimit?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      console.log('🔍 Parámetros enviados al backend ventas:', {
        page: page.toString(),
        limit: (customLimit || pagination.limit).toString(),
        search: searchQuery || 'vacío',
        startDate: startDate || 'vacío',
        endDate: endDate || 'vacío'
      });

      const res = await axios.get(`${API_BASE_URL}/api/sales/me?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Manejar respuesta con paginación o array directo
      if (Array.isArray(res.data)) {
        setSales(res.data);
        setPagination({
          page: 1,
          limit: res.data.length,
          total: res.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      } else if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        const response: SalesResponse = res.data;
        setSales(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 15,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchSales(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchSales(1, newLimit);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando ventas...</p>
      </div>
    </div>
  );

  // Calcular estadísticas
  const totalVentas = sales.reduce((acc, sale) => acc + parseFloat(sale.totalAmount), 0);
  const cantidadVentas = sales.length;
  const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas</h1>
            <p className="text-gray-600 mt-2">Gestiona y visualiza todas tus transacciones</p>
          </div>
          <div className="text-sm text-gray-600">
            Total: {pagination.total} ventas
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ${totalVentas.toLocaleString()} COP
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cantidad de Ventas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {cantidadVentas}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio por Venta</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  ${promedioVenta.toLocaleString()} COP
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="ID venta, producto, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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

        {/* Lista de ventas */}
        <div className="space-y-6">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                {/* Encabezado de la venta */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Venta #{sale.id}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(sale.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        {(sale.shippingCost && parseFloat(sale.shippingCost) > 0) || (sale.discountAmount && parseFloat(sale.discountAmount) > 0) && (
                          <>
                            <div className="text-xs text-gray-500">
                              <span>Productos: ${
                                (parseFloat(sale.totalAmount) 
                                  - (sale.shippingCost ? parseFloat(sale.shippingCost) : 0)
                                  + (sale.discountAmount ? parseFloat(sale.discountAmount) : 0)
                                ).toLocaleString()
                              } COP</span>
                            </div>
                            {sale.discountAmount && parseFloat(sale.discountAmount) > 0 && (
                              <div className="text-xs text-red-500">
                                <span>Descuento: -${parseFloat(sale.discountAmount).toLocaleString()} COP</span>
                              </div>
                            )}
                            {sale.shippingCost && parseFloat(sale.shippingCost) > 0 && (
                              <div className="text-xs text-gray-500">
                                <span>Envío: ${parseFloat(sale.shippingCost).toLocaleString()} COP</span>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-xl font-bold text-blue-600">
                            ${parseFloat(sale.totalAmount).toLocaleString()} COP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className={`grid grid-cols-1 gap-4 pt-4 ${
                    sale.couponUsage ? 'md:grid-cols-4' : 'md:grid-cols-3'
                  }`}>
                    {/* Datos de cupón */}
                    {sale.couponUsage && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-orange-800 mb-2">🎟️ Cupón Aplicado</h4>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">Código:</span> 
                            <span className="ml-1 px-2 py-0.5 bg-orange-200 text-orange-800 rounded font-mono">
                              {sale.couponUsage.coupon.code}
                            </span>
                          </p>
                          <p><span className="font-medium">Descuento:</span> 
                            {sale.couponUsage.coupon.discountType === 'PERCENTAGE' 
                              ? `${sale.couponUsage.coupon.discountValue}%`
                              : `$${sale.couponUsage.coupon.discountValue.toLocaleString()} COP`
                            }
                          </p>
                          {sale.discountAmount && parseFloat(sale.discountAmount) > 0 && (
                            <p><span className="font-medium">Ahorro:</span> 
                              <span className="ml-1 font-bold text-orange-800">
                                -${parseFloat(sale.discountAmount).toLocaleString()} COP
                              </span>
                            </p>
                          )}
                          <p><span className="font-medium">Aplicado:</span> 
                            {new Date(sale.couponUsage.usedAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Datos de pago */}
                    {sale.payment && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">💳 Información de Pago</h4>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">Referencia:</span> {sale.payment.reference}</p>
                          <p><span className="font-medium">Recibo:</span> {sale.payment.receiptNumber}</p>
                          <p><span className="font-medium">Estado:</span> 
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                              sale.payment.estado === 'Aceptada' ? 'bg-green-100 text-green-800' : 
                              sale.payment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {sale.payment.estado || 'Sin estado'}
                            </span>
                          </p>
                          {sale.payment.authorization && (
                            <p><span className="font-medium">Autorización:</span> {sale.payment.authorization}</p>
                          )}
                          {sale.payment.transactionId && (
                            <p><span className="font-medium">ID Transacción:</span> {sale.payment.transactionId}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Datos del comprador */}
                    {sale.saleDetails[0]?.tiktokUser && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">👤 Datos del Comprador</h4>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">Nombre:</span> {sale.saleDetails[0].tiktokUser.name}</p>
                          <p><span className="font-medium">Email:</span> {sale.saleDetails[0].tiktokUser.email}</p>
                          <p><span className="font-medium">Teléfono:</span> {sale.saleDetails[0].tiktokUser.phone}</p>
                          {sale.saleDetails[0].tiktokUser.tiktok && (
                            <p><span className="font-medium">TikTok:</span> @{sale.saleDetails[0].tiktokUser.tiktok}</p>
                          )}
                          {sale.saleDetails[0].tiktokUser.city && (
                            <p><span className="font-medium">Ciudad:</span> {sale.saleDetails[0].tiktokUser.city.name}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Datos de envío */}
                    {sale.shipping && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-800 mb-2">📦 Información de Envío</h4>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">Guía:</span> {sale.shipping.numberGuide}</p>
                          <p><span className="font-medium">Estado:</span> 
                            <span className="ml-1 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                              {sale.shipping.status}
                            </span>
                          </p>
                          {sale.shippingCost && parseFloat(sale.shippingCost) > 0 && (
                            <p><span className="font-medium">Costo:</span> 
                              <span className="ml-1 font-bold text-purple-800">
                                ${parseFloat(sale.shippingCost).toLocaleString()} COP
                              </span>
                            </p>
                          )}
                          <p><span className="font-medium">Fecha:</span> 
                            {new Date(sale.shipping.dateCreate).toLocaleDateString('es-CO')}
                          </p>
                          {sale.shipping.message && (
                            <a 
                              href={sale.shipping.message} 
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
                </div>

                {/* Tabla de productos */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detalles
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sale.saleDetails.map((detail) => (
                        <tr key={detail.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0">
                                <img 
                                  src={detail.product.imageUrl} 
                                  alt={detail.product.name}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {detail.product.name}
                            </div>
                            {detail.productVariant && (
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                {detail.productVariant.color && (
                                  <span className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-1">
                                    Color: {detail.productVariant.color.name}
                                  </span>
                                )}
                                {detail.productVariant.size && (
                                  <span className="inline-block bg-gray-100 px-2 py-0.5 rounded">
                                    Talla: {detail.productVariant.size.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {detail.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ${parseFloat(detail.price).toLocaleString()} COP
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ${(detail.quantity * parseFloat(detail.price)).toLocaleString()} COP
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas con los filtros seleccionados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Prueba ajustando los filtros o verifica si hay ventas registradas.
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {sales.length} de {pagination.total} ventas
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
      </div>
    </div>
  );
}
