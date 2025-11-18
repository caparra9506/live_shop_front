import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TopBarProps {
  currentView: string;
  storeName?: string;
  setView?: (view: string) => void;
}

export default function TopBar({ currentView, storeName, setView }: TopBarProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Sesión cerrada correctamente 👋");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleConfigClick = () => {
    if (setView) {
      setView('configuracion');
      setIsProfileOpen(false); // Cerrar el dropdown
    }
  };

  const getPageTitle = (view: string) => {
    const titles: { [key: string]: string } = {
      inicio: 'Dashboard',
      tiktoklive: 'TikTok Live',
      ordenes: 'Gestión de Órdenes',
      whatsapp: 'WhatsApp Marketing',
      productos: 'Gestión de Productos',
      categorias: 'Categorías',
      ventas: 'Reportes de Ventas',
      cupones: 'Cupones y Descuentos',
      configuracion: 'Configuración',
      facturas: 'Facturas Electrónicas'
    };
    return titles[view] || 'Dashboard';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    { id: 1, title: 'Nueva orden recibida', message: 'Orden #1234 por $125.000', time: '5 min', type: 'order', icon: '🛒', color: 'text-green-600' },
    { id: 2, title: 'Pago confirmado', message: 'Orden #1233 pago procesado', time: '12 min', type: 'payment', icon: '💰', color: 'text-blue-600' },
    { id: 3, title: 'Producto agotado', message: 'iPhone 15 Pro sin stock', time: '1 h', type: 'inventory', icon: '⚠️', color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left section - Page title and breadcrumb */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(currentView)}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>LiveShop</span>
            <span>/</span>
            <span className="text-blue-600">{getPageTitle(currentView)}</span>
          </div>
        </div>
      </div>

      {/* Center section - Empty space for better layout */}
      <div className="flex-1"></div>

      {/* Right section - Actions and user */}
      <div className="flex items-center space-x-4">

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {mockNotifications.length}
            </span>
          </button>

          {/* Notifications dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{notification.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`font-medium text-sm ${notification.color}`}>{notification.title}</p>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{storeName || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{storeName || 'Admin'}</p>
                    <p className="text-sm text-gray-500">admin@liveshop.com</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">Mi Perfil</span>
                </button>
                <button 
                  onClick={handleConfigClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">Configuración</span>
                </button>
              </div>
              
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}