import { useState } from 'react';
import { 
  Menu, 
  X, 
  Home,
  Video,
  ShoppingBag,
  MessageCircle,
  Package,
  Tag,
  TrendingUp,
  Gift,
  FileText,
  ShoppingCart
} from 'lucide-react';

export default function Sidebar({ setView, currentView }: { setView: (view: string) => void, currentView: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleMenuClick = (view: string) => {
    setView(view);
    setIsOpen(false); // Cerrar sidebar en mobile después de seleccionar
  };

  const menuItems = [
    { id: 'inicio', label: 'Dashboard', icon: Home },
    { id: 'tiktoklive', label: 'TikTok Live', icon: Video },
    { id: 'ordenes', label: 'Órdenes', icon: ShoppingBag },
    { id: 'carritos', label: 'Carritos', icon: ShoppingCart },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'categorias', label: 'Categorías', icon: Tag },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'cupones', label: 'Cupones', icon: Gift },
    { id: 'facturas', label: 'Facturas', icon: FileText },
  ];

  const getMenuItemClasses = (view: string) => {
    const baseClasses = "flex items-center space-x-3 cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 group";
    if (currentView === view) {
      return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg`;
    }
    return `${baseClasses} hover:bg-gray-800 hover:shadow-md text-gray-300 hover:text-white`;
  };

  return (
    <>
      {/* Botón hamburguesa para mobile */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-3 rounded-xl shadow-lg hover:bg-gray-800 transition-all duration-200"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static 
        top-0 left-0 
        h-full lg:h-screen
        w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transform transition-all duration-300 ease-in-out
        z-40 shadow-xl border-r border-gray-700 flex flex-col
        ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }
      `}>
        <div className="flex-1 flex flex-col p-6">
          {/* Logo/Brand */}
          <div className="mt-8 lg:mt-0 mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LiveShop
            </h2>
            <p className="text-sm text-gray-400 mt-1">Panel de Administración</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className={getMenuItemClasses(item.id)}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <IconComponent 
                    size={18} 
                    className={`${currentView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom section - Natural positioning */}
        <div className="p-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <p>© 2025 LiveShop</p>
            <p className="mt-1 opacity-75">Versión 1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
