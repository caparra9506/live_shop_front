"use client";

import toast from "react-hot-toast";
import { Bell, Search, User } from "lucide-react";

export default function HeaderAdmin() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Sesión cerrada correctamente 👋");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm lg:hidden">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-gray-900 text-xl font-bold tracking-tight">
            Live<span className="text-blue-600">Shop</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          <div className="relative">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              <User size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
