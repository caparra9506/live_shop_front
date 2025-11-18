import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';

interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

interface Order {
  id: string;
  customer: Customer;
  product: string;
  date: string;
  amount: number;
  shippingStatus: 
    | "GUÍA ADMITIDA" | "GENERADA" | "CREADA" | "RECIBIDA" | "PROCESADA" 
    | "TRANSITO URBANO" | "CENTRO DE ACOPIO" | "TELEMERCADO" | "REENVÍO" | "REPARTO"
    | "ENTREGADA" | "FINALIZADA" 
    | "DEVOLUCIÓN RATIFICADA" | "DEVUELTA" | "CANCELADA" | "NO_ENTREGADA" | "RETENIDA";
}

interface RecentOrdersProps {
  orders?: Order[];
  className?: string;
}

export default function RecentOrders({ orders: initialOrders = [], className = '' }: RecentOrdersProps) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Si no se proporcionan órdenes, se cargan automáticamente
  useEffect(() => {
    if (initialOrders.length === 0) {
      const fetchRecentOrders = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/sales/recent`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          console.log('🔍 Respuesta de recent orders:', res.data);
          // Actualizar las órdenes si se reciben del servidor
          if (res.data && res.data.length > 0) {
            setOrders(res.data);
          }
        } catch (error) {
          console.error("Error fetching recent orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRecentOrders();
    }
  }, [initialOrders.length]);

  return (
    <div className={`p-6 border rounded-lg shadow-md bg-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">📦 Pedidos Recientes</h3>
        {orders.length > 0 && (
          <span className="text-sm text-gray-500">{orders.length} pedidos</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mr-2"></div>
          <span className="text-gray-500">Cargando pedidos recientes...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-600">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Orden</th>
                <th className="p-2 text-left">Cliente</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Monto</th>
                <th className="p-2 text-left">Estado de Envío</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-2 font-medium">#{order.id}</td>
                  <td className="p-2">
                    <div className="group relative">
                      <span className="font-medium text-gray-900">{order.customer.name}</span>
                      <div className="absolute left-0 mt-1 hidden w-64 rounded-lg bg-gray-900 text-white p-3 shadow-lg text-xs group-hover:block z-10">
                        <div className="space-y-1">
                          <div>📞 {order.customer.phone}</div>
                          <div>📧 {order.customer.email}</div>
                          <div>📍 {order.customer.address}, {order.customer.city}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-gray-800">{order.product}</td>
                  <td className="p-2 text-gray-600">
                    {new Date(order.date).toLocaleDateString('es-CO', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </td>
                  <td className="p-2 font-bold text-green-600">
                    ${order.amount.toLocaleString("es-CO")}
                  </td>
                  <td className="p-2">
                    <ShippingBadge status={order.shippingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No hay pedidos recientes</p>
          <p className="text-gray-400 text-sm mt-1">
            Los pedidos aparecerán aquí cuando proceses tu primera venta
          </p>
        </div>
      )}
    </div>
  );
}

// 📌 Componente para mostrar el estado del envío
const ShippingBadge: React.FC<{ status: Order["shippingStatus"] }> = ({
  status,
}) => {
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      // Estados iniciales - Amarillo
      case "GUÍA ADMITIDA":
      case "GENERADA":
      case "CREADA":
      case "RECIBIDA":
      case "PROCESADA":
        return "bg-yellow-100 text-yellow-800 border border-yellow-400";
      // Estados en tránsito - Azul
      case "TRANSITO URBANO":
      case "CENTRO DE ACOPIO":
      case "TELEMERCADO":
      case "REENVÍO":
      case "REPARTO":
        return "bg-blue-100 text-blue-800 border border-blue-400";
      // Estados entregado - Verde
      case "ENTREGADA":
      case "FINALIZADA":
        return "bg-green-100 text-green-800 border border-green-400";
      // Estados cancelado/devuelto - Rojo
      case "DEVOLUCIÓN RATIFICADA":
      case "DEVUELTA":
      case "CANCELADA":
      case "NO_ENTREGADA":
      case "RETENIDA":
        return "bg-red-100 text-red-800 border border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "GUÍA ADMITIDA": return "Guía Admitida";
      case "GENERADA": return "Generada";
      case "CREADA": return "Creada";
      case "RECIBIDA": return "Recibida";
      case "PROCESADA": return "Procesada";
      case "TRANSITO URBANO": return "Tránsito Urbano";
      case "CENTRO DE ACOPIO": return "Centro de Acopio";
      case "TELEMERCADO": return "Telemercadeo";
      case "REENVÍO": return "Reenvío";
      case "REPARTO": return "En Reparto";
      case "ENTREGADA": return "Entregada";
      case "FINALIZADA": return "Finalizada";
      case "DEVOLUCIÓN RATIFICADA": return "Devolución Ratificada";
      case "DEVUELTA": return "Devuelta";
      case "CANCELADA": return "Cancelada";
      case "NO_ENTREGADA": return "No Entregada";
      case "RETENIDA": return "Retenida";
      default: return status;
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};
