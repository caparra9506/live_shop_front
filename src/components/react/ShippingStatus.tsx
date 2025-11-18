import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from '@config/api';
import { Package, Clock, Truck, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ShippingData {
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  totalShipments: number;
  avgDeliveryTime: string;
}

interface StatusCardProps {
  title: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  count, 
  total, 
  icon, 
  color, 
  bgColor, 
  description 
}) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{count}</div>
          <div className="text-xs text-gray-500">{percentage}%</div>
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
        {/* Barra de progreso */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.replace('bg-', 'bg-').replace('-100', '-500')} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function ShippingStatus() {
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchShippingStatus();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchShippingStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchShippingStatus = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/shipments/status`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log('📊 Shipping status data:', res.data);
      setShippingData(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error obteniendo estado de envíos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchShippingStatus();
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
          <span className="ml-2 text-gray-600">Cargando estado de envíos...</span>
        </div>
      </div>
    );
  }

  if (!shippingData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No hay datos de envíos disponibles</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Estado de Envíos</h2>
            <p className="text-sm text-gray-600 mt-1">
              Distribución de {shippingData.totalShipments} envíos por estado 99 Envíos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatusCard
            title="Pendientes"
            count={shippingData.pending}
            total={shippingData.totalShipments}
            icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
            color="bg-yellow-100"
            bgColor="bg-yellow-50"
            description="Creada, Admitida, Procesada"
          />
          <StatusCard
            title="En Tránsito"
            count={shippingData.inTransit}
            total={shippingData.totalShipments}
            icon={<Truck className="h-5 w-5 text-blue-600" />}
            color="bg-blue-100"
            bgColor="bg-blue-50"
            description="Centro Acopio, Reparto, etc."
          />
          <StatusCard
            title="Entregados"
            count={shippingData.delivered}
            total={shippingData.totalShipments}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            color="bg-green-100"
            bgColor="bg-green-50"
            description="Entregada, Finalizada"
          />
          <StatusCard
            title="Cancelados"
            count={shippingData.cancelled}
            total={shippingData.totalShipments}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            color="bg-red-100"
            bgColor="bg-red-50"
            description="Devuelta, No entregada, etc."
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{shippingData.totalShipments}</div>
                <div className="text-sm text-gray-600">Total de Envíos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {shippingData.avgDeliveryTime.replace(' days', 'd')}
                </div>
                <div className="text-sm text-gray-600">Tiempo Promedio</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {shippingData.totalShipments > 0 
                    ? Math.round((shippingData.delivered / shippingData.totalShipments) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Tasa de Entrega</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        {shippingData.totalShipments === 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 text-sm font-medium">
                No hay envíos registrados aún. Los datos aparecerán aquí cuando proceses tu primera venta.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
