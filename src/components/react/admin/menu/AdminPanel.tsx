import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@config/api";
import Sidebar from "./Sidebar";
import Products from "../products/Products";
import Categories from "../categories/Categories";
import Sales from "../sales/Sales";
import Coupons from "../coupons/Coupons";
import { ShoppingCart, DollarSign, Users, TrendingUp } from "lucide-react";
import CreateStoreForm from "../../CreateStoreForm";
import StatsCard from "../../StatsCard";
import RecentOrders from "../../RecentOrders";
import SalesChart from "../sales/SalesChart";
import ShippingStatus from "../../ShippingStatus";
import Whatsapp from "../whatsapp/Whatsapp";
import Config from "../config/Config";
import HeaderAdmin from "../../HeaderAdmin";
import TopBar from "./TopBar";
import OrderList from "../orders/OrderList";
import TikTokLive from "../comments/TiktokLive";
import ElectronicInvoices from "../electronic-billing/ElectronicInvoices";
import CartManagement from "../carts/CartManagement";

export default function AdminPanel() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("inicio");
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/stores/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data) {
        setStore(res.data);
        fetchDashboardData(); // 📌 Carga el dashboard solo si hay tienda
      } else {
        setStore(null);
      }
    } catch (error) {
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("📊 Dashboard Data:", res.data); // 🔍 Verifica la respuesta en consola
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  if (loading) return <p className="text-center">Cargando...</p>;

  // 📌 Si NO hay tienda, mostrar el formulario de creación
  if (!store) {
    return <CreateStoreForm onStoreCreated={fetchStoreData} />;
  }

  return (
    <>
    <HeaderAdmin />

    <div className="lg:flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Sidebar */}
      <Sidebar setView={setView} currentView={view} />

      {/* Contenido dinámico */}
      <main className="flex-1 lg:ml-0 overflow-auto flex flex-col">
        {/* Top Bar - Solo en desktop */}
        <div className="hidden lg:block">
          <TopBar currentView={view} storeName={store?.name} setView={setView} />
        </div>
        
        <div className="flex-1 p-6 lg:p-8">
          {view === "inicio" && dashboardData && (
            <>
              {/* Header mejorado - Solo en móvil */}
              <div className="mb-8 lg:mb-6">
                <h1 className="text-3xl lg:text-2xl font-bold text-gray-900 mb-2 lg:hidden">
                  Bienvenido, {store.name}
                </h1>
                <p className="text-lg lg:text-base text-gray-600 lg:hidden">
                  Aquí tienes un resumen de tu tienda
                </p>
                {/* Mensaje de bienvenida simplificado para desktop */}
                <div className="hidden lg:block">
                  <p className="text-gray-600">Resumen general de tu tienda</p>
                </div>
              </div>

              {/* Tarjetas de estadísticas mejoradas */}
              {dashboardData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <StatsCard
                    title="Total Ordenes"
                    value={dashboardData?.totalOrders ?? 0}
                    icon={<ShoppingCart />}
                    change={{
                      value: isFinite(dashboardData?.orderChange)
                        ? dashboardData?.orderChange
                        : 0,
                      type:
                        dashboardData?.orderChange >= 0 ? "increase" : "decrease",
                    }}
                  />
                  <StatsCard
                    title="Total Ventas"
                    value={`$${Number(dashboardData?.totalRevenue) || 0}`}
                    icon={<DollarSign />}
                    change={{
                      value: isFinite(dashboardData?.revenueChange)
                        ? dashboardData?.revenueChange
                        : 0,
                      type:
                        dashboardData?.revenueChange >= 0
                          ? "increase"
                          : "decrease",
                    }}
                  />
                  <StatsCard
                    title="Total Clientes"
                    value={dashboardData?.totalCustomers ?? 0}
                    icon={<Users />}
                    change={{
                      value: isFinite(dashboardData?.customerChange)
                        ? dashboardData?.customerChange
                        : 0,
                      type:
                        dashboardData?.customerChange >= 0
                          ? "increase"
                          : "decrease",
                    }}
                  />
                  <StatsCard
                    title="Tasa de conversión"
                    value={`${Number(dashboardData?.conversionRate) || 0}%`}
                    icon={<TrendingUp />}
                    change={{
                      value: isFinite(dashboardData?.conversionChange)
                        ? dashboardData?.conversionChange
                        : 0,
                      type:
                        dashboardData?.conversionChange >= 0
                          ? "increase"
                          : "decrease",
                    }}
                  />
                </div>
              )}

              {/* Sección de ventas y estado de envíos mejorada */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Resumen de ventas</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Ingresos mensuales y estadísticas de visitantes
                    </p>
                  </div>
                  <SalesChart />
                </div>

                <div className="space-y-6">
                  <ShippingStatus />
                </div>
              </div>

              {/* Pedidos recientes mejorados */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <RecentOrders
                  orders={dashboardData.recentOrders || []}
                  className=""
                />
              </div>
            </>
          )}
          {view === "ordenes" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <OrderList />
            </div>
          )}
          {view === "carritos" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CartManagement />
            </div>
          )}
          {view === "tiktoklive" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TikTokLive />
            </div>
          )}
          {view === "productos" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Products />
            </div>
          )}
          {view === "categorias" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Categories />
            </div>
          )}
          {view === "ventas" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Sales />
            </div>
          )}
          {view === "cupones" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Coupons />
            </div>
          )}
          {view === "whatsapp" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Whatsapp />
            </div>
          )}
          {view === "configuracion" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Config />
            </div>
          )}
          {view === "facturas" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ElectronicInvoices />
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
